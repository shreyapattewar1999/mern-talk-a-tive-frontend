import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

import ProfileModal from "../Miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";

import { ChatState } from "../../../Context/ChatProvider";
import { getSender, getSenderEntireInfo } from "../../Config/ChatLogics";
import { Input } from "@chakra-ui/react";

import "../styles.css";

import {
  IconButton,
  Text,
  Box,
  Spinner,
  useToast,
  MenuButton,
  Button,
  MenuItem,
  MenuList,
  Menu,
} from "@chakra-ui/react";
import { ArrowBackIcon, DeleteIcon } from "@chakra-ui/icons";
import { AiOutlineMore, AiOutlineUpload } from "react-icons/ai";
import InputEmoji from "react-input-emoji";
import Lottie from "react-lottie";
import animationData from "../../../animations/typing.json";

import { Socket_ENDPOINT } from "../../../Utility/constants";
// ENDPOINT: server endpoint

var socket, selectedChatCompare;

const SingleChat = (props) => {
  const { user, selectedChat, setSelectedChat, notification } = ChatState();

  const { fetchChatAgain, setFetchChatAgain } = props;

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [alreadyPresentNotifications, setAlreadyPresentNotifications] =
    useState(new Set());

  const hiddenInputButton = useRef(null);
  let toast = useToast();

  const [showImageUploadSpinner, setShowImageUploadSpinner] = useState(false);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    socket = io(Socket_ENDPOINT);
    // here we are emiting logged user data to socket named "setup"
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });

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

  const handleClearMessages = async () => {
    if (!selectedChat) {
      return;
    }
    try {
      let text;
      if (!selectedChat.isGroupChat) {
        text = `Are you sure you want to delete chat with ${getSender(
          user,
          selectedChat.users
        )} ?`;
      } else {
        text = `Are you sure you want to delete messages of ${selectedChat?.chatName} ?`;
      }

      if (window.confirm(text) === true) {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        await axios.delete(
          `/api/message/clearMessages/${selectedChat._id}`,
          config
        );
        setMessages([]);
        toast({
          title: "Messages are deleted!",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } catch {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  const sendMessage = async (
    newMessageContent,
    isImage = false,
    imagePath = "",
    imagePublicId = ""
  ) => {
    socket.emit("stop typing", selectedChat._id);

    // on pressing Enter key, message should get send
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      let dataToBeSent = {
        chatId: selectedChat._id,
        content: newMessageContent,
        isImage,
      };
      if (isImage) {
        dataToBeSent = {
          ...dataToBeSent,
          imagePath: imagePath,
          imagePublicId: imagePublicId,
        };
      } else {
        if (newMessageContent.trim().length === 0) {
          return;
        }
      }

      setNewMessage("");

      const { data } = await axios.post("/api/message", dataToBeSent, config);
      socket.emit("new message", data.createdMessage);
      setMessages([...messages, data.createdMessage]);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const typingHandler = (e) => {
    if (!e) {
      socket?.emit("stop typing", selectedChat._id);
      return;
    }
    setNewMessage(e);

    // typing indicator logic
    if (!socketConnected) {
      return;
    }
    if (!typing) {
      setTyping(true);
      socket?.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket?.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const postImage = (pic) => {
    if (pic === undefined) {
      return;
    }
    if (pic.size > 2000000) {
      toast({
        title: "Please select image of size less than 2mb",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
    }
    if (pic.type === "image/jpeg" || pic.type === "image/png") {
      setShowImageUploadSpinner(true);
      toast({
        title: "Please wait, image is being uploaded",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dikosnerx");
      fetch("https://api.cloudinary.com/v1_1/dikosnerx/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then(async (data) => {
          console.log(data);
          sendMessage("", true, data.url.toString(), data.public_id);
          setShowImageUploadSpinner(false);
        })
        .catch((err) => {
          setShowImageUploadSpinner(false);
        });
    }
  };
  // whenever selected chat changes, fetch messages again
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    // here we are emiting logged user data to socket named "setup"
    socket.on("message received", async (newMessageReceived) => {
      // selectedChat._id !== selectedChatCompare._id ==> this refers to if opened chat
      //  and message received from chat are different
      // like currently opened chat is with Shreya and message is received from different group
      // then in this situation we need to give notification

      if (
        !selectedChatCompare ||
        (selectedChatCompare &&
          selectedChatCompare._id !== newMessageReceived.chat._id)
      ) {
        if (!notification.includes(newMessageReceived)) {
          setFetchChatAgain(!fetchChatAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
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
            {!selectedChat.isGroupChat && (
              <Menu>
                <MenuButton as={Button} style={{ marginLeft: "auto" }}>
                  <AiOutlineMore style={{ fontSize: "28px" }} />
                </MenuButton>
                <MenuList style={{ fontSize: "16px" }}>
                  <MenuItem icon={<DeleteIcon />} onClick={handleClearMessages}>
                    Delete messages for
                    {selectedChat.isGroupChat ? " everyone" : " both"}
                  </MenuItem>
                </MenuList>
              </Menu>
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
                  <ScrollableChat
                    messages={messages}
                    setMessages={setMessages}
                  />
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
                {showImageUploadSpinner ? (
                  <Spinner w={5} h={10} alignSelf="center" margin="auto" />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: "2%",
                    }}
                  >
                    <InputEmoji
                      value={newMessage}
                      onChange={typingHandler}
                      cleanOnEnter
                      onEnter={() => sendMessage(newMessage)}
                      placeholder="Type a message"
                    />
                    <Input
                      type="file"
                      p={1.5}
                      accept="image/*"
                      ref={hiddenInputButton}
                      style={{ display: "none" }}
                      onChange={(event) => postImage(event.target.files[0])}
                    ></Input>
                    <Button
                      style={{ fontSize: "x-large" }}
                      onClick={(e) => {
                        e.preventDefault();
                        hiddenInputButton.current.click();
                      }}
                    >
                      <AiOutlineUpload />
                    </Button>
                  </div>
                )}
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
