import React, { useState, useEffect } from "react";
import { ChatState } from "../../../Context/ChatProvider";
import {
  useToast,
  Stack,
  Text,
  Avatar,
  HStack,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { Box, Button } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import GroupChatModal from "./GroupChatModal";
import ChatLoading from "./ChatLoading";
import {
  getSender,
  getSenderEntireInfo,
  checkCurrentUserOnline,
} from "../../Config/ChatLogics";
import { groupIcon } from "../../../Utility/constants";
import io from "socket.io-client";

import { Socket_ENDPOINT } from "../../../Utility/constants";
var socket;
// Socket_ENDPOINT: server Socket_ENDPOINT
const MyChats = (props) => {
  const [loggedUser, setLoggedUser] = useState();
  const {
    user,
    selectedChat,
    chats,
    setChats,
    setSelectedChat,
    setNotification,
  } = ChatState();
  let toast = useToast();

  const [onlineUserList, setOnlineUsersList] = useState([]);

  const { fetchChatAgain, setFetchChatAgain } = props;

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        "/api/message/notification/fetch",
        config
      );
      let notificationsForCurentUser = [];

      // when we add any message/notification to DB, it is added for all the users in that chat
      // so when we fetch notifications from DB,
      // for example chat has 2 users X and Y and sender is X,
      // and now logged in user is X, then when we fetch notifications it has all notifications
      // But on UI, we should show only those notifications for which logged in user X is not same as sender X
      // Means we should only show RECEIVED notifications and not messages that logged in user has only sent
      data?.notifications.forEach((currentNotification) => {
        if (currentNotification.sender._id !== user._id) {
          notificationsForCurentUser.push(currentNotification);
        }
      });

      setNotification([...notificationsForCurentUser]);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the notifications",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    socket = io(Socket_ENDPOINT);
    console.log("my chats page called");
    // here we are emiting logged user data to socket named "setup"
    socket.emit("user loggedin", user);
    socket.on("get-online-users", (onlineUsers) => {
      setOnlineUsersList(onlineUsers);
    });
  }, []);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchNotifications();

    fetchChats();
  }, [fetchChatAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      boxShadow="xl"
    >
      <div
        style={{
          padding: 3,
          fontFamily: "Work sans",
          fontSize: "28px",
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            borderColor="#00A3C4"
            variant="outline"
          >
            Start Group Chat
          </Button>
        </GroupChatModal>
      </div>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        // h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats.chat ? (
          <Stack overflowY="auto">
            {chats?.chat.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                // color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                boxShadow="md"
              >
                <HStack>
                  {/* if user has not uploaded any profile picture then Avatar should be displayed with initials of user name */}
                  {/* we have not provided facility to upload group profile picture, hence for group profile avtar default avtar is shown which also indicates particular listed chat is Group chat */}
                  <Avatar
                    size="sm"
                    cursor="pointer"
                    name={
                      !chat.isGroupChat ? getSender(loggedUser, chat.users) : ""
                    }
                    src={
                      chat.isGroupChat
                        ? groupIcon
                        : getSenderEntireInfo(loggedUser, chat.users) &&
                          getSenderEntireInfo(loggedUser, chat.users)
                            ?.profile_pic
                    }
                  ></Avatar>

                  <VStack align="stretch">
                    <Text as="b">
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </Text>
                    {chat.lastMessage && (
                      <Text fontSize="sm" style={{ marginTop: "0px" }}>
                        {chat.lastMessage?.sender?.name.split(" ")[0]} :{" "}
                        {chat.lastMessage.content.length > 50
                          ? chat.lastMessage.content.substring(0, 51) + "..."
                          : chat.lastMessage.content}
                      </Text>
                    )}
                  </VStack>
                  {!chat.isGroupChat &&
                    checkCurrentUserOnline(
                      onlineUserList,
                      getSenderEntireInfo(loggedUser, chat.users)?._id
                    ) && (
                      <div
                        style={{
                          height: "8px",
                          width: "8px",
                          backgroundColor: "#29bf11",
                          borderRadius: "50%",
                          display: "inline-block",
                          marginLeft: "auto",
                        }}
                      ></div>
                    )}
                </HStack>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
