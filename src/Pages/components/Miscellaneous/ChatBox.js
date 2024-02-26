import { Box } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { ChatState } from "../../../Context/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = (props) => {
  const { selectedChat } = ChatState();
  const { fetchChatAgain, setFetchChatAgain } = props;

  useEffect(() => {
    console.log("Chatbox page called");
  }, []);

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDirection="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
      boxShadow="xl"
    >
      <SingleChat
        fetchChatAgain={fetchChatAgain}
        setFetchChatAgain={setFetchChatAgain}
      ></SingleChat>
    </Box>
  );
};

export default ChatBox;
