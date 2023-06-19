import React from "react";
import { Outlet } from "react-router-dom";
import "./App.css";

import ChatProvider from "./Context/ChatProvider";

function App() {
  return (
    <div className="App">
      <ChatProvider>
        <Outlet />
      </ChatProvider>
      {/* <RouterProvider router={routingConfiguration} /> */}
      {/* <Routes>
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
        <Route exact path="/" element={<HomePage />} />
      </Routes> */}
    </div>
  );
}

export default App;
