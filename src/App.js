import React from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { useBeforeUnload } from "react-router-dom";
import { Socket_ENDPOINT } from "../src/Utility/constants";
import { GoogleOAuthProvider } from "@react-oauth/google";
import io from "socket.io-client";

import ChatProvider from "./Context/ChatProvider";
var socket;

function App() {
  socket = io(Socket_ENDPOINT);

  useBeforeUnload(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    socket.emit("logout-current-user", userInfo?._id);
    localStorage.removeItem("userInfo");
  });

  return (
    <div className="App">
      <GoogleOAuthProvider clientId="640177302186-pa4lpso589ap5ealh7hp0pvmoa7eg7is.apps.googleusercontent.com">
        <ChatProvider>
          <Outlet />
        </ChatProvider>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;

// TODO:
// 1: Error Boundary
// 2. Use Route Error
// 3. remove duplicate code --> TODOs in some components
// 4. Add testing
// 5. Check if setIncomingUser is required in ProfileModal and SideDrawer component, can we use setUser only
