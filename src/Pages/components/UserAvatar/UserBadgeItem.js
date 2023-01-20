import { CloseIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import React from "react";

const UserBadgeItem = (props) => {
  const { user, handleDelete } = props;
  return (
    <Box
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      backgroundColor="purple"
      color="white"
      w="fit-content"
      cursor="pointer"
    >
      {user.name}
      <CloseIcon pl={1} onClick={() => handleDelete(user)} />
    </Box>
  );
};

export default UserBadgeItem;
