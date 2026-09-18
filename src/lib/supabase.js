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

export async function lightBeacon({ activity = null, place = null, started_at = null, expires_at = null, circle_id = null } = {}) {
  const start = started_at || new Date().toISOString();
  const expires = expires_at ||
    new Date(new Date(start).getTime() + BEACON_HOURS * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("beacons")
    .insert({ activity, place, started_at: start, expires_at: expires, circle_id: circle_id || null })
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

/* ---------------- responses: "I'm in" and tap-back ---------------- */

export async function respond(beaconId, status /* 'in' | 'maybe' */) {
  const { data: me } = await supabase.auth.getUser();
  const { error } = await supabase.from("beacon_joins")
    .upsert({ beacon_id: beaconId, user_id: me.user.id, status });
  if (error) throw error;
}

export async function unrespond(beaconId) {
  const { data: me } = await supabase.auth.getUser();
  const { error } = await supabase.from("beacon_joins")
    .delete().eq("beacon_id", beaconId).eq("user_id", me.user.id);
  if (error) throw error;
}

/* ---------------- circles: the group light ---------------- */

export async function myCircles() {
  const { data, error } = await supabase.from("circles").select("id, name");
  if (error) throw error;
  return data || [];
}

export async function createCircle(name) {
  const { data: me } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("circles")
    .insert({ name, owner_id: me.user.id }).select().single();
  if (error) throw error;
  await supabase.from("circle_members").insert({ circle_id: data.id, user_id: me.user.id });
  return data;
}

/* ---------------- recap ---------------- */

export async function lastRecap() {
  const { data, error } = await supabase.rpc("last_recap");
  if (error) throw error;
  return data?.[0] || null;
}

/* ---------------- the map: live location ---------------- */

export async function updateMyLocation({ lat, lng, status = null, ghost = false }) {
  const { data: me } = await supabase.auth.getUser();
  const { error } = await supabase.from("locations").upsert({
    user_id: me.user.id, lat, lng, status, ghost, updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function setGhost(ghost) {
  const { data: me } = await supabase.auth.getUser();
  const { error } = await supabase.from("locations").update({ ghost }).eq("user_id", me.user.id);
  if (error) throw error;
}

export async function friendsOnMap() {
  const { data, error } = await supabase.rpc("friends_on_map");
  if (error) throw error;
  return data || [];
}

export async function myFriendsSharing() {
  const { data, error } = await supabase.rpc("my_friends_sharing");
  if (error) throw error;
  return data || [];
}

export async function setShareWith(friendId, share) {
  const { data: me } = await supabase.auth.getUser();
  const { error } = await supabase.from("friendships")
    .update({ share_location: share })
    .eq("user_id", me.user.id).eq("friend_id", friendId);
  if (error) throw error;
}

export function onLocationChange(handler) {
  const ch = supabase.channel("locations-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "locations" }, () => handler())
    .subscribe();
  return () => supabase.removeChannel(ch);
}

/* ---------------- friends: add by number, requests ---------------- */
const rpc = async (fn, args) => { const { data, error } = await supabase.rpc(fn, args); if (error) throw error; return data; };
export const findByPhone  = (phone)  => rpc("find_by_phone", { p: phone }).then(r => r?.[0] || null);
export const requestFriend = (id)    => rpc("request_friend", { target: id });
export const acceptFriend  = (id)    => rpc("accept_friend", { requester: id });
export const removeFriend  = (id)    => rpc("remove_friend", { other: id });
export const myRequests    = ()      => rpc("my_requests").then(r => r || []);
export const myFriends     = ()      => rpc("my_friends").then(r => r || []);
export const myPending     = ()      => rpc("my_pending").then(r => r || []);
