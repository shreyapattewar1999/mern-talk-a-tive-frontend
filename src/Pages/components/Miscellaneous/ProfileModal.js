import React, { useState } from "react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../../Context/ChatProvider";
import axios from "axios";

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  Text,
  IconButton,
  useDisclosure,
  Avatar,
  useToast,
  FormControl,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { FaPencilAlt } from "react-icons/fa";
import { ENDPOINT } from "../../../Utility/constants";

const ProfileModal = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  let incomingUser = props.user;
  const { setIncomingUser, setShowAvatar } = props;
  const [picture, setPicture] = useState(null);
  const [picturePublicId, setPicturePublicId] = useState();
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user, setuser } = ChatState();
  const [showModifyPic, setShowModifyPic] = useState(false);

  const postDetails = (pic) => {
    setLoading(true);
    if (pic === undefined) {
      toast({
        title: "Please upload an image",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (pic.type === "image/jpeg" || pic.type === "image/png") {
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dikosnerx");
      fetch("https://api.cloudinary.com/v1_1/dikosnerx/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPicture(data.url.toString());
          setPicturePublicId(data.public_id);
          setLoading(false);
        })
        .catch((err) => {
          // console.log(err);
          setLoading(false);
        });
    }
  };

  const updateProfilePic = async () => {
    setLoading(true);
    const reqBody = {
      loggeduser_id: user?._id,
      profilePic: picture,
      profile_pic_public_id: picturePublicId,
    };
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        ENDPOINT + "/api/user/updatepicture",
        reqBody,
        config
      );
      toast({
        title: "Profile picture has been updated",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      if (data) {
        const updatedUserDetailsWithPic = {
          ...user,
          profile_pic: data?.profile_pic,
          profile_pic_public_id: data?.profile_pic_public_id,
        };
        localStorage.setItem(
          "userInfo",
          JSON.stringify(updatedUserDetailsWithPic)
        );

        // setuser({ profile_pic: data.profile_pic });
        // incomingUser = { ...user };
        setIncomingUser(updatedUserDetailsWithPic);
      }
      setLoading(false);
      setShowModifyPic(false);
    } catch (error) {
      toast({
        title: "Error occured !!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);

      return;
    }
  };

  const deleteProfilePic = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.delete(
        ENDPOINT + "/api/user/deletepicture",
        config
      );
      if (data.isProfilePictureDeleted) {
        toast({
          title: "Profile picture has been deleted",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setShowAvatar(true);
        const updatedUserDetails = {
          ...user,
          profile_pic: null,
          profile_pic_public_id: null,
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedUserDetails));
        setTimeout(() => {
          setShowAvatar(false);
        }, 500);
        // setuser({ profile_pic: data.profile_pic });
        // incomingUser = { ...user };
        setIncomingUser(updatedUserDetails);
        setLoading(false);
        setShowModifyPic(false);
      } else {
        toast({
          title:
            "Error occured. Profile picture cannot be deleted at this moment. Please try after some time",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error occured",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };
  return (
    <>
      {props.children ? (
        <span onClick={onOpen}>{props.children}</span>
      ) : (
        <Tooltip label="View Profile" placement="bottom-start">
          <IconButton
            display={{ base: "flex" }}
            icon={<ViewIcon />}
            style={{ marginLeft: "1%" }}
            onClick={onOpen}
            variant="outline"
            colorScheme="black"
          ></IconButton>
        </Tooltip>
      )}

      <Modal size="lg" isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        {/* h="60%" for ModalContent */}
        <ModalContent>
          <ModalHeader>
            <div
              style={{
                fontFamily: "Work Sans",
                fontSize: "30px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {incomingUser.name}
            </div>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ position: "relative" }}>
                {incomingUser?.profile_pic ? (
                  <>
                    <Image
                      borderRadius="full"
                      boxSize="150px"
                      src={incomingUser?.profile_pic}
                      alt={incomingUser.name}
                    ></Image>
                  </>
                ) : (
                  <>
                    <Avatar
                      size="xl"
                      name={incomingUser.name}
                      src={incomingUser?.profile_pic}
                    >
                      {/* <AvatarBadge boxSize="1.20em">
                      <IconButton
                        style={{
                          borderRadius: "40px solid black",
                          color: "black",
                          fontSize: "20px",
                        }}
                        aria-label="Search database"
                        icon={<FaPencilAlt />}
                        onClick={() => setShowModifyPic(!showModifyPic)}
                      />
                    </AvatarBadge> */}
                    </Avatar>
                  </>
                )}
                {user._id === incomingUser._id && (
                  <Tooltip label="Edit Profile Picture">
                    <IconButton
                      style={{
                        borderRadius: "40px",
                        border: "0.5px solid black",
                        color: "black",
                        fontSize: "20px",
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        backgroundColor: showModifyPic ? "#66e0ff" : "",
                      }}
                      aria-label="Edit Profile Picture"
                      icon={<FaPencilAlt />}
                      onClick={() => setShowModifyPic(!showModifyPic)}
                    ></IconButton>
                  </Tooltip>
                )}
              </div>
              <br />

              <Text fontSize="20px">{incomingUser?.email}</Text>
              <br />

              {user._id === incomingUser._id && showModifyPic && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  // hidden={user._id !== incomingUser._id || showModifyPic}
                >
                  <FormControl
                    id="profilePic"
                    style={{ height: "auto", whiteSpace: "normal" }}
                  >
                    <Input
                      type="file"
                      p={1.5}
                      accept="image/*"
                      placeholder="Enter your name"
                      onChange={(e) => postDetails(e.target.files[0])}
                    ></Input>
                  </FormControl>
                  <Button
                    style={{
                      marginLeft: "10px",
                      height: "auto",
                      padding: "4px",
                      whiteSpace: "normal",
                    }}
                    colorScheme="green"
                    onClick={updateProfilePic}
                    disabled={loading}
                    // isLoading={loading}
                  >
                    Update Profile Picture
                  </Button>
                  <Tooltip label="Delete Profile Photo">
                    <IconButton
                      fontSize="25px"
                      style={{ marginLeft: "5px" }}
                      disabled={!incomingUser?.profile_pic}
                      icon={<DeleteIcon />}
                      onClick={() => deleteProfilePic()}
                    ></IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
