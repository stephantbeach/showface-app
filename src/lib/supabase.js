import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If the keys aren't set, the app runs in demo mode with mock data.
export const isConfigured = Boolean(url && key);
export const supabase = isConfigured ? createClient(url, key) : null;

export const BEACON_HOURS = 4;

/* ---------------- auth: phone number + SMS code ---------------- */

export async function sendCode(phone) {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyCode(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/* ---------------- profile ---------------- */

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function saveProfile(userId, fields) {
  const { error } = await supabase.from("profiles").update(fields).eq("id", userId);
  if (error) throw error;
}

/* ---------------- the beacon ---------------- */
// One tap writes one row that expires by itself.

export async function lightBeacon({ activity = null, place = null, started_at = null, expires_at = null } = {}) {
  const start = started_at || new Date().toISOString();
  const expires = expires_at ||
    new Date(new Date(start).getTime() + BEACON_HOURS * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("beacons")
    .insert({ activity, place, started_at: start, expires_at: expires })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyBeacon(userId) {
  const { data, error } = await supabase
    .from("beacons")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("started_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

// Optional early off-switch. The beacon expires on its own regardless.
export async function killMyBeacon(userId) {
  const { error } = await supabase
    .from("beacons")
    .delete()
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString());
  if (error) throw error;
}

/* ---------------- friends ---------------- */

export async function friendsOut() {
  const { data, error } = await supabase.rpc("friends_out");
  if (error) throw error;
  return data || [];
}

export async function myFriends() {
  const { data, error } = await supabase
    .from("friendships")
    .select("status, friend:profiles!friendships_friend_id_fkey(id, name, handle)")
    .eq("status", "accepted");
  if (error) throw error;
  return data || [];
}

// Both directions, so a friendship is mutual once accepted.
export async function addFriend(friendId) {
  const { data: me } = await supabase.auth.getUser();
  const uid = me?.user?.id;
  const { error } = await supabase.from("friendships").insert([
    { user_id: uid, friend_id: friendId, status: "accepted" },
    { user_id: friendId, friend_id: uid, status: "accepted" },
  ]);
  if (error) throw error;
}

/* ---------------- realtime: a friend just went live ---------------- */

export function onFriendLive(handler) {
  const channel = supabase
    .channel("beacons-live")
    .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "beacons" },
        (payload) => handler(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}
