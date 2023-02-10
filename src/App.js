import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";
import EmailVerify from "./Pages/components/Authentication/EmailVerify";
import ForgotPassword from "./Pages/components/Authentication/ForgotPassword";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<HomePage />} />

        <Route
          exact
          path="/user/:email/forgotpassword"
          element={<ForgotPassword />}
        />
        <Route
          exact
          path="/user/:id/verify/:timestamp"
          element={<EmailVerify />}
        />

        <Route exact path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
