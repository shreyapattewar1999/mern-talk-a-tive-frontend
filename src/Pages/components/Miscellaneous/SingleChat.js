import { IconButton, Text, Box, Spinner, useToast } from "@chakra-ui/react";
import InputEmoji from "react-input-emoji";

import React, { useState, useEffect } from "react";
import { ChatState } from "../../../Context/ChatProvider";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderEntireInfo } from "../../Config/ChatLogics";
import ProfileModal from "../Miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import axios from "axios";
import "../styles.css";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../../../animations/typing.json";

const ENDPOINT = "http://localhost:5000";
// ENDPOINT: server endpoint

var socket, selectedChatCompare;

const SingleChat = (props) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  const { fetchChatAgain, setFetchChatAgain } = props;

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  let toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    // here we are emiting logged user data to socket named "setup"
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      // we are creating new room, and we are giving room ID as selectedChat._id
      socket.emit("join chat", selectedChat._id);

      console.log(messages);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    socket.emit("stop typing", selectedChat._id);

    // on pressing Enter key, message should get send
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      const dataToBeSent = { chatId: selectedChat._id, content: newMessage };

      setNewMessage("");

      const { data } = await axios.post("/api/message", dataToBeSent, config);
      console.log(data.createdMessage);
      socket.emit("new message", data.createdMessage);
      setMessages([...messages, data.createdMessage]);
      console.log(data);
      console.log(messages);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      console.log(error);
    }
  };

  const typingHandler = (e) => {
    if (!e) {
      socket.emit("stop typing", selectedChat._id);
      return;
    }
    setNewMessage(e);

    // typing indicator logic
    if (!socketConnected) {
      return;
    }
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // whenever selected chat changes, fetch messages again
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    // here we are emiting logged user data to socket named "setup"
    socket.on("message received", (newMessageReceived) => {
      // selectedChat._id !== selectedChatCompare._id ==> this refers to if opened chat
      //  and message received from chat are different
      // like currently opened chat is with Shreya and message is received from different group
      // then in this situation we need to give notification
      // console.log(newMessageReceived);

      if (
        !selectedChatCompare ||
        (selectedChatCompare &&
          selectedChatCompare._id !== newMessageReceived.chat._id)
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchChatAgain(!fetchChatAgain);
        }
      } else {
        // console.log("setting up messages array");
        setMessages([...messages, newMessageReceived]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            ></IconButton>
            {!selectedChat?.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal
                  user={getSenderEntireInfo(user, selectedChat.users)}
                ></ProfileModal>
              </>
            ) : (
              <>
                {selectedChat?.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchChatAgain={fetchChatAgain}
                  setFetchChatAgain={setFetchChatAgain}
                  fetchMessages={fetchMessages}
                ></UpdateGroupChatModal>
              </>
            )}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <>
                {/* We can also give styles using styles.css as mentioned in below line */}
                <div className="messages">
                  {/* We are using npm package react-scrollable-feed  */}
                  <ScrollableChat messages={messages} />
                </div>

                {isTyping && (
                  <div>
                    <Lottie
                      width={70}
                      style={{ marginBottom: 15, marginLeft: 0 }}
                      options={defaultOptions}
                    />
                  </div>
                )}

                {/* Read documentation about InputEmoji : https://www.npmjs.com/package/react-input-emoji  */}
                {/* NPM Package used: react-input-emoji */}
                <InputEmoji
                  value={newMessage}
                  onChange={typingHandler}
                  cleanOnEnter
                  onEnter={sendMessage}
                  placeholder="Type a message"
                />
              </>
            )}
          </Box>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Select user to start chatting
          </Text>
        </div>
      )}
    </>
  );
};

export default SingleChat;
