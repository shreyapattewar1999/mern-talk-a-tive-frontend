import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ChatContext = createContext("");

const ChatProvider = (props) => {
  let navigate = useNavigate();
  const [user, setuser] = useState();
  // this refers to logged in user details across application
  // this object is most of the times used to provide token to api request

  const [selectedChat, setSelectedChat] = useState(null);
  // this is used to highlight selected chat in chats list --> MyChats Component
  // if chat is selected then chatbox display is set to flex --> ChatBox Component
  // if particular chat is opened and there are notifications for that particular chat only, then notifications should be removed --> this is done in SideDrawer Component

  const [chats, setChats] = useState([]);
  // for list of chats
  // this list is updated
  // when new group chat is created through GroupChatModal component
  // when new private chat is created through Sidedrawer component

  const [notification, setNotification] = useState([]);
  // to display notification indicator in header --> Sidedrawer component
  // if there is new message is received from X and currently chatbox of X is open then, received message notifcation should be deleted --> this is done in SingleChat Component
  const location = useLocation();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const isForgotPasswordRoute =
      location.pathname.indexOf("forgotpassword") === -1;

    const isEmailVerifyRoute = location.pathname.indexOf("verify") === -1;
    setuser(userInfo);
    if (!userInfo && isForgotPasswordRoute && isEmailVerifyRoute) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setuser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
