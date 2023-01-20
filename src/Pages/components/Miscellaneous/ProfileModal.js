import React from "react";
import { ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  ModalBody,
  Image,
  Text,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";

const ProfileModal = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user = props.user;
  return (
    <>
      {props.children ? (
        <span onClick={onOpen}>{props.children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        ></IconButton>
      )}

      <Modal size="lg" isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader>
            <div
              style={{
                fontFamily: "Work Sans",
                fontSize: "30px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {user.name}
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
              <Image
                borderRadius="full"
                boxSize="150px"
                src={user?.profile_pic}
                alt={user.name}
              ></Image>
              <br />
              <Text fontSize="20px">{user.email}</Text>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
