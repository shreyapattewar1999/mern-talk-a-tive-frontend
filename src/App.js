import React from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { useBeforeUnload } from "react-router-dom";
import { Socket_ENDPOINT } from "../src/Utility/constants";
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
      <ChatProvider>
        <Outlet />
      </ChatProvider>
    </div>
  );
}

export default App;
