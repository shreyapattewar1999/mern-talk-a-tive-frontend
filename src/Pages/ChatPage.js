import React, { useState } from "react";
import MyChats from "./components/Miscellaneous/MyChats";
import ChatBox from "./components/Miscellaneous/ChatBox";
import SideDrawer from "./components/Miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchChatAgain, setFetchChatAgain] = useState(false);

  return (
    <>
      <div style={{ width: "100%" }}>
        {user && <SideDrawer></SideDrawer>}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            height: "91.5vh",
            padding: "10px",
          }}
        >
          {user && (
            <MyChats
              fetchChatAgain={fetchChatAgain}
              setFetchChatAgain={setFetchChatAgain}
            ></MyChats>
          )}
          {user && (
            <ChatBox
              fetchChatAgain={fetchChatAgain}
              setFetchChatAgain={setFetchChatAgain}
            ></ChatBox>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
