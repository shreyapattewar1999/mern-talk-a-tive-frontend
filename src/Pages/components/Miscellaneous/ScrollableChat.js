import React, { useState } from "react";
import axios from "axios";

import { ChatState } from "../../../Context/ChatProvider";
import ScrollableFeed from "react-scrollable-feed";

import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isSameUser,
} from "../../Config/ChatLogics";

import {
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  useToast,
  Box,
  FormControl,
  Input,
  Button,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import "../../../../src/App.css";
import { AiOutlineEllipsis, AiOutlineEdit } from "react-icons/ai";
import { ENDPOINT } from "../../../Utility/constants";

const ScrollableChat = (props) => {
  const { user } = ChatState();
  const { messages, setMessages } = props;
  let toast = useToast();
  const [showEditForm, setShowEditForm] = useState(false);
  const [editMsgText, setEditMsgText] = useState("");
  /* We are using npm package react-scrollable-feed  */

  // useEffect(() => {
  //   console.log(messages);
  // }, [messages]);

  //   if there are bunch of messages by a sender,
  //    profile message is displayed only once at the last message in bulk
  const getTime = (currentTime) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const time = new Date(currentTime);
    const today = new Date();
    let date;
    if (
      time.getDate() === today.getDate() &&
      time.getMonth() === today.getMonth() &&
      time.getFullYear() === today.getFullYear()
    ) {
      date = "Today";
    } else if (
      time.getMonth() === today.getMonth() &&
      time.getFullYear() === today.getFullYear() &&
      today.getDate() - time.getDate() === 1
    ) {
      date = "Yesterday";
    } else {
      date = time.getDate() + " " + monthNames[time.getMonth()];
    }
    return date + " " + time.getHours() + ":" + time.getMinutes();
  };

  const deleteMessage = async (messageToBeDeleted) => {
    if (!messageToBeDeleted) {
      return;
    }
    try {
      let text =
        "If you delete this message, it will disappear for everybody. Do you still want to proceed?";
      if (window.confirm(text) === true) {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        await axios.delete(
          `${ENDPOINT}/api/message/delete/${messageToBeDeleted._id}`,
          config
        );
        // fetchMessages();
        const updatedMessages = messages.filter(
          (m) => m._id !== messageToBeDeleted._id
        );
        setMessages(updatedMessages);
        toast({
          title: "Messages is deleted!",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "bottom",
        });
      }
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

  const editMessage = async (currentMessage) => {
    if (
      !currentMessage ||
      editMsgText === "" ||
      editMsgText === currentMessage.content
    ) {
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(
        `${ENDPOINT}/api/message/edit/${currentMessage._id}`,
        {
          newMessageText: editMsgText,
        },
        config
      );
      messages.forEach((m) => {
        if (m._id === currentMessage._id) {
          m.content = editMsgText;
        }
      });
      setMessages([...messages]);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
    setEditMsgText("");

    setShowEditForm(false);
    currentMessage.editing = false;
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((currentMessage, index) => (
          <div key={currentMessage._id} style={{ display: "flex" }}>
            {(isSameSender(messages, currentMessage, index, user._id) ||
              isLastMessage(messages, index, user._id)) && (
              <>
                <Tooltip
                  label={currentMessage.sender.name}
                  placement="bottom-start"
                >
                  <Avatar
                    mt={3}
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={currentMessage.sender.name}
                    src={currentMessage.sender?.profile_pic}
                  ></Avatar>
                </Tooltip>
              </>
            )}

            {currentMessage.sender._id === user._id &&
            showEditForm &&
            currentMessage?.editing ? (
              <div
                style={{
                  marginRight: `${
                    currentMessage.sender._id === user._id ? "10px" : ""
                  }`,
                  borderRadius: "20px",
                  borderColor: "black",
                  backgroundColor: "white",
                  padding: "10px 15px",
                  // maxWidth: "75%",
                  width: "300px",
                  marginLeft: isSameSenderMargin(
                    messages,
                    currentMessage,
                    index,
                    user._id
                  ),
                  marginTop: isSameUser(messages, currentMessage, index)
                    ? 3
                    : 10,
                }}
              >
                <FormControl>
                  <Input
                    type="text"
                    value={editMsgText}
                    placeholder="Type a message"
                    autoFocus
                    onChange={(e) => {
                      e.preventDefault();
                      setEditMsgText(e.target.value);
                    }}
                    name="messageEdit"
                  />
                  <Button
                    mt={4}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowEditForm(false);
                      currentMessage.editing = false;
                      // setAllowRerender(index);
                    }}
                  >
                    Cancel
                  </Button>{" "}
                  <Button
                    mt={4}
                    colorScheme="teal"
                    onClick={(e) => {
                      e.preventDefault();
                      editMessage(currentMessage);
                    }}
                  >
                    Save
                  </Button>{" "}
                </FormControl>
              </div>
            ) : (
              <Box
                style={{
                  backgroundColor: `${
                    currentMessage.sender._id === user._id
                      ? "#BEE3F8"
                      : "#B9F5D0"
                  }`,
                  marginRight: `${
                    currentMessage.sender._id === user._id ? "10px" : ""
                  }`,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                  marginLeft: isSameSenderMargin(
                    messages,
                    currentMessage,
                    index,
                    user._id
                  ),
                  marginTop: isSameUser(messages, currentMessage, index)
                    ? 3
                    : 10,
                }}
              >
                {currentMessage.sender._id === user._id ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {currentMessage?.isImage ? (
                        <div className="img-container">
                          <img
                            src={currentMessage?.imageInformation?.imagePath}
                            alt="not available"
                            height="200px"
                            width="200px"
                            onClick={() => console.log("clicked on image")}
                          />
                        </div>
                      ) : (
                        <span style={{ whiteSpace: "normal", width: "200px" }}>
                          {currentMessage.content}
                        </span>
                      )}
                      <Menu>
                        <MenuButton
                          style={{ alignItems: "flex-start", marginLeft: "2%" }}
                        >
                          <AiOutlineEllipsis style={{ fontSize: "28px" }} />
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            icon={<DeleteIcon />}
                            className="special"
                            onClick={(e) => {
                              e.preventDefault();
                              deleteMessage(currentMessage);
                            }}
                          >
                            Delete Message
                          </MenuItem>
                          {!currentMessage?.isImage && (
                            <MenuItem
                              icon={<AiOutlineEdit />}
                              className="special"
                              onClick={(e) => {
                                e.preventDefault();
                                if (showEditForm) {
                                  toast({
                                    title:
                                      "You are already editing some message, please click on Save or Cancel Button",
                                    status: "error",
                                    duration: 5000,
                                    isClosable: true,
                                    position: "bottom-left",
                                  });
                                  return;
                                }
                                // setShowEditForm(false);
                                currentMessage.editing = true;
                                setEditMsgText(currentMessage.content);
                                setShowEditForm(true);
                              }}
                            >
                              Edit Message
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    </div>
                  </>
                ) : currentMessage.isImage ? (
                  <div className="img-container">
                    <img
                      src={currentMessage?.imageInformation?.imagePath}
                      alt="not available"
                      height="200px"
                      width="200px"
                      onClick={() => console.log("clicked on image")}
                    />
                  </div>
                ) : (
                  <span style={{ width: "200px" }}>
                    {currentMessage.content}
                  </span>
                )}
                {currentMessage.sender._id !== user._id && <br />}
                <span style={{ color: "#646566", fontSize: "small" }}>
                  {getTime(currentMessage?.updatedAt)}
                </span>
              </Box>
            )}
          </div>
        ))}
    </ScrollableFeed>
  );
};
export default ScrollableChat;
