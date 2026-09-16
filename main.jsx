import React from "react";
import { createRoot } from "react-dom/client";
import ShowFace from "./ShowFace.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ShowFace />
  </React.StrictMode>
);
