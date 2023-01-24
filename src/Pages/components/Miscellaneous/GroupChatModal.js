import React, { useState } from "react";
import {
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  useToast,
  FormControl,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { ChatState } from "../../../Context/ChatProvider";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";

const GroupChatModal = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleGroup = (usersToBeAdded) => {
    if (selectedUsers.includes(usersToBeAdded)) {
      toast({
        title: "User already added!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, usersToBeAdded]);
  };

  const handleSearch = async (query) => {
    if (!query) {
      return;
    }
    setSearch(query);

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
      // console.log(data);
    } catch (error) {
      toast({
        title: "Failed to load chat !!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      console.log(error);
      setLoading(false);

      return;
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || !searchResult) {
      toast({
        title: "Please fill all the details !!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      chats.chat.unshift(data.groupChat);
      setChats({ ...chats });
      onClose();
      toast({
        title: "New group chat created !!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } catch (error) {}
  };

  const handleDelete = (usersToBeDeleted) => {
    setSelectedUsers(
      selectedUsers.filter((u) => u._id !== usersToBeDeleted._id)
    );
  };

  return (
    <>
      <span onClick={onOpen}>{props.children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="25px" fontFamily="Work Sans">
            <div style={{ display: "flex", justifyContent: "center" }}>
              Create Group Chat
            </div>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                // alignItems: "center",
              }}
            >
              <FormControl>
                <Input
                  placeholder="Chat Name"
                  mb={3}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Input
                  placeholder="Enter name of members "
                  mb={1}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </FormControl>
              <div style={{ display: "flex" }}>
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>
              {loading ? (
                <Spinner size="lg" />
              ) : (
                searchResult
                  ?.slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      key={user._id}
                      currentUser={user}
                      handleFunction={() => handleGroup(user)}
                    ></UserListItem>
                  ))
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
