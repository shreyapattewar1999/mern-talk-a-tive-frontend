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
    </div>
  );
}

export default App;
