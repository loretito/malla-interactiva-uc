import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { CourseProvider } from "./context/CourseProvider.jsx";
import { applyRelationColorVars } from "./utils/relation-colors";

applyRelationColorVars();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CourseProvider>
      <App />
    </CourseProvider>
  </React.StrictMode>
);
