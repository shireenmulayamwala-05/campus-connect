import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import UserProvider from "../context/UserContext.jsx";
import AppProvider from "../context/AppContext.jsx";
import NotificationProvider from "../context/NotificationProvider.jsx";

createRoot(document.getElementById("root")).render(
  <AppProvider>
    <UserProvider>
      <NotificationProvider>
        <BrowserRouter>
          <App />
          <ToastContainer />
        </BrowserRouter>
      </NotificationProvider>
    </UserProvider>
  </AppProvider>
);
