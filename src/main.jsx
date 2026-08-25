import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { getStoredTheme, applyTheme } from "./theme.js";

applyTheme(getStoredTheme());

createRoot(document.getElementById("root")).render(<App />);
