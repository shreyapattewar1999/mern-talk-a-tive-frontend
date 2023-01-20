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

  const {
    user,
    selectedChat,
    chats,
    setChats,
    setSelectedChat,
    notification,
    setNotification,
  } = ChatState();

  let toast = useToast();
  let navigate = useNavigate();
  let modifiedNotifications = [];

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

  const groupBy = (arr, key) => {
    return arr.reduce((result, currentValue) => {
      // This is how the above code in multiple line
      if (!result[currentValue[key]]) {
        result[currentValue[key]] = [];
      }
      result[currentValue[key]].push(currentValue);
    }, {});
  };

  const getCount = (arr) => {
    const newArray = [];
    arr.forEach((element) => {
      newArray.push({ ...element, count: element.length });
    });
    return newArray;
  };

  useEffect(() => {
    const groupedNotifications = groupBy(notification, "chatId");
    modifiedNotifications = getCount(groupedNotifications);
  }, [notification]);

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
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No new messages"}
              {notification.map((eachNotification) => (
                <MenuItem
                  key={eachNotification._id}
                  onClick={() => {
                    setSelectedChat(eachNotification.chat);
                    setNotification(
                      notification.filter((n) => n !== eachNotification)
                    );
                  }}
                >
                  {eachNotification.chat.isGroupChat
                    ? `New Message in ${eachNotification.chat.chatName}`
                    : `New message from ${getSender(
                        user,
                        eachNotification.chat.users
                      )}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user?.profile_pic}
              ></Avatar>
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
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
