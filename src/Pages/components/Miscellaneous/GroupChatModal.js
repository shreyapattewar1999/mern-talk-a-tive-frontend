import React, { useEffect, useState, useRef } from "react";
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
  const initialRef = useRef(null);

  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleGroup = (usersToBeAdded) => {
    const isUserAlreadyPresent = selectedUsers.find(
      (c) => c._id === usersToBeAdded._id
    );
    if (isUserAlreadyPresent) {
      toast({
        title: "This user is already added!, Please select another user",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, usersToBeAdded]);
  };

  const getSearchSuggestions = async () => {
    if (!search) {
      setSearchResult([]);
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
      // console.log(data);
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

  const openModal = () => {
    setSearch("");
    setSearchResult([]);
    setGroupChatName("");
    setSelectedUsers([]);
    onOpen();
  };

  // Debouncing
  useEffect(() => {
    const timer = setTimeout(() => getSearchSuggestions(), 200);
    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <>
      {/* here props.children is button to Start Group Chat which is when clicked onOpen function of modal popup gets called and modal popup gets opened */}
      <span onClick={openModal}>{props.children}</span>

      {/* initialFocusRef={initialRef} => this is used to focus first input box for chat name as soon as modal is opened */}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        initialFocusRef={initialRef}
      >
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
                  ref={initialRef}
                  placeholder="Chat Name"
                  mb={3}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Input
                  placeholder="Enter name of members "
                  mb={1}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </FormControl>
              <div style={{ display: "flex" }}>
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleDelete={handleDelete}
                    isVisible={true}
                  />
                ))}
              </div>
              {loading && searchResult.length !== 0 ? (
                <Spinner size="lg" />
              ) : (
                searchResult
                  ?.slice(0, 4)
                  .map((currentUser) => (
                    <UserListItem
                      key={currentUser._id}
                      currentUser={currentUser}
                      handleFunction={() => handleGroup(currentUser)}
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
