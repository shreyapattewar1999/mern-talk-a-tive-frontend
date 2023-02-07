import {
  Tooltip,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Avatar,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  DrawerHeader,
  Input,
  useDisclosure,
  Box,
  Spinner,
  useToast,
  Circle,
} from "@chakra-ui/react";

import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { ChatState } from "../../../Context/ChatProvider";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../Miscellaneous/ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../Config/ChatLogics";
import NotificationBadge, { Effect } from "react-notification-badge";

const SideDrawer = () => {
  const [search, setsearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const [showAvatar, setShowAvatar] = useState(false);
  const [modifiedNotification, setModifiedNotification] = useState([]);

  const {
    user,
    selectedChat,
    chats,
    setChats,
    setSelectedChat,
    notification,
    setNotification,
    setuser,
  } = ChatState();

  let toast = useToast();
  let navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };
  const { isOpen, onOpen, onClose } = useDisclosure();

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (chats && !chats?.chat.find((c) => c._id === data.chat._id)) {
        chats.chat.unshift(data.chat);
        // setChats([data.chat, ...chats.chat]);
        setChats({ ...chats });
      }

      setSelectedChat(data.chat);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error occured !!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      console.log(error);
      return;
    }
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error occured !!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }
  };

  const setIncomingUser = (newUser) => {
    setuser(newUser);
  };
  const groupNotifications = () => {
    if (!notification) return;
    const result = {};
    notification?.forEach((currentValue, index) => {
      const key = currentValue?.chat?._id;
      if (key === selectedChat?._id) {
        removeNotificationHandler(currentValue, index);
      } else {
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(currentValue);
      }
    });
    const temp = [];
    for (var key in result) {
      if (result.hasOwnProperty(key)) {
        temp.push(result[key]);
      }
    }
    setModifiedNotification(temp);
  };

  const getNotificationsCount = () => {
    let count = 0;
    modifiedNotification.forEach((element) => {
      count += element.length;
    });
    return count;
  };
  useEffect(() => {
    if (!notification) return;
    groupNotifications();
  }, [notification]);

  const removeNotificationHandler = async (eachNotification, index) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setSelectedChat(eachNotification[0]?.chat);
      modifiedNotification.splice(index, 1);
      setModifiedNotification(modifiedNotification);
      if (eachNotification[0]?.chat?._id) {
        const { data } = await axios.put(
          "/api/message/notification/remove",
          {
            chatId: eachNotification[0]?.chat?._id,
            isGroupChat: eachNotification[0]?.chat.isGroupChat,
          },
          config
        );
      }
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

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "white",
          width: "100%",
          padding: "5px 10px 5px 10px",
          borderWidth: "5px",
        }}
      >
        <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" placeholder="Enter name" onClick={onOpen}>
            <FaSearch />
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Talk-A-Tive
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={getNotificationsCount()}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {/* {console.log(notification)} */}
              {!notification.length && "No new messages"}

              {modifiedNotification.map((eachNotification, index) => (
                <MenuItem
                  // key={eachNotification._id}
                  key={index}
                  onClick={() => {
                    removeNotificationHandler(eachNotification, index);
                  }}
                >
                  <Circle size="25px" bg="red" color="white" mr={2}>
                    {eachNotification.length}
                  </Circle>
                  {eachNotification.length === 1 ? "message " : "messages "}
                  {eachNotification[0].chat.isGroupChat
                    ? `in ${eachNotification[0].chat.chatName}`
                    : `from ${getSender(user, eachNotification[0].chat.users)}`}
                  {eachNotification[0].chat.isGroupChat && (
                    <Tooltip label="Group Chat">
                      <Circle size="20px" bg="green" color="white" ml={2}>
                        G
                      </Circle>
                    </Tooltip>
                  )}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              {!showAvatar && (
                <Avatar
                  size="sm"
                  cursor="pointer"
                  name={user.name}
                  src={user?.profile_pic}
                ></Avatar>
              )}
            </MenuButton>
            <MenuList>
              <ProfileModal
                user={user}
                setIncomingUser={setIncomingUser}
                setShowAvatar={setShowAvatar}
              >
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Search Users</DrawerHeader>

          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Type here..."
                mr={2}
                value={search}
                onChange={(e) => setsearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  currentUser={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
