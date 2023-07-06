import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  IconButton,
  useToast,
  Box,
  FormControl,
  Input,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
import axios from "axios";

const UpdateGroupChatModal = (props) => {
  const { selectedChat, user, setChat, setSelectedChat } = ChatState();

  const { fetchChatAgain, setFetchChatAgain, fetchMessages } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  const [groupChatName, setGroupChatName] = useState(selectedChat.chatName);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleRemoveUser = async (userToBeRemoved) => {
    // here user --> logged in user

    if (
      selectedChat.groupAdmin._id !== user._id &&
      user._id !== userToBeRemoved._id
    ) {
      toast({
        title: "Ooppsss! Only admins can remove someone",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/group/remove",
        {
          chatId: selectedChat._id,
          userId: userToBeRemoved._id,
        },
        config
      );

      // if user(logged in user) has left the group, he should not see the same chat

      if (userToBeRemoved._id === user._id) {
        setSelectedChat();
        toast({
          title: `${userToBeRemoved.name} left the group`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      } else {
        setSelectedChat(data.updatedChat);
        toast({
          title: `${userToBeRemoved.name} is removed from the group`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
      setFetchChatAgain(!fetchChatAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Internal server error !!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      // console.log(error);
      setLoading(false);
    }
  };

  const handleDelete = (usersToBeDeleted) => {
    setSelectedUsers(
      selectedUsers.filter((u) => u._id !== usersToBeDeleted._id)
    );
  };

  const handleAddUser = async (userToBeAdded) => {
    const isUserToBeAddedExist = selectedChat?.users.find(
      (u) => u._id === userToBeAdded._id
    );
    if (isUserToBeAddedExist) {
      toast({
        title: userToBeAdded.name + " is already member of group",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    // here user --> logged in user

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Ooppsss! Only admins can add someone",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/chat/group/add",
        {
          chatId: selectedChat._id,
          userId: userToBeAdded._id,
        },
        config
      );

      setSelectedChat(data.updatedChat);
      setFetchChatAgain(!fetchChatAgain);
      toast({
        title: `${userToBeAdded.name} is added to the group`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    } catch (error) {
      toast({
        title: "Internal server error !!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      console.log(error);
      setLoading(false);
    }
    // setSelectedUsers([...selectedUsers, userToBeAdded]);
  };

  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }

    if (groupChatName === selectedChat.chatName) {
      toast({
        title: "Please enter different name than previous one",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }
    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/group/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data.updatedChat);

      setFetchChatAgain(!fetchChatAgain); //this causes modal popup to close
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Internal server error !!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setRenameLoading(false);
    }
  };

  const getSearchSuggestions = async () => {
    if (!search) {
      return;
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
        title: "Failed to load chat !!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      // console.log(error);
      setLoading(false);

      return;
    }
  };

  // Debouncing
  useEffect(() => {
    const timer = setTimeout(() => getSearchSuggestions(), 200);
    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const closeModal = async () => {
    if (groupChatName !== selectedChat.chatName) {
      if (
        window.confirm(
          "You have not saved the updated group name, Would you like to save changes?"
        )
      ) {
        await handleRename();
      }
    }
    setIsModalOpen(false);
    onClose();
  };
  const openModal = () => {
    setGroupChatName(selectedChat.chatName);
    setSearch("");
    setSearchResult([]);
    setIsModalOpen(true);
    onOpen();
  };

  return (
    <>
      <Tooltip label="View/Update Group Info" placement="bottom-start">
        <IconButton
          display={{ base: "flex" }}
          style={{ marginLeft: "1%" }}
          icon={<ViewIcon />}
          variant="outline"
          colorScheme="black"
          onClick={openModal}
        />
      </Tooltip>

      {isModalOpen && (
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          isCentered
          closeOnOverlayClick={false}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="35px"
              fontFamily="Work sans"
              display="flex"
              justifyContent="center"
            >
              {selectedChat.chatName}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column">
              <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                {console.log(selectedChat.groupAdmin._id)}
                {selectedChat.users.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleDelete={handleRemoveUser}
                    isVisible={
                      selectedChat.groupAdmin._id !== u._id &&
                      user._id === selectedChat.groupAdmin._id
                    }
                    backgroundColor={
                      u._id === selectedChat.groupAdmin._id ? "red" : "purple"
                    }
                  />
                ))}
              </Box>
              <FormControl display="flex">
                <Input
                  placeholder="Enter Chat Name"
                  mb={3}
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button
                  variant="solid"
                  colorScheme="teal"
                  ml={1}
                  isLoading={renameLoading}
                  onClick={handleRename}
                >
                  Update
                </Button>
              </FormControl>
              {user._id === selectedChat.groupAdmin._id && (
                <FormControl>
                  <Input
                    placeholder="Enter name of members "
                    mb={1}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </FormControl>
              )}
              <div>
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>

              <div>
                {loading ? (
                  <Spinner size="lg" />
                ) : (
                  searchResult
                    ?.slice(0, 4)
                    .map((user) => (
                      <UserListItem
                        key={user._id}
                        currentUser={user}
                        handleFunction={() => handleAddUser(user)}
                      ></UserListItem>
                    ))
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="red"
                mr={3}
                onClick={() => handleRemoveUser(user)}
              >
                Leave Group
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default UpdateGroupChatModal;
