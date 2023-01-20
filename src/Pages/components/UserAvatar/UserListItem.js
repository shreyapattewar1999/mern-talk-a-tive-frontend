import React from "react";

import { Box, Avatar, Text } from "@chakra-ui/react";

const UserListItem = (props) => {
  const { currentUser, handleFunction } = props;
  return (
    <div>
      <Box
        onClick={handleFunction}
        cursor="pointer"
        bg="#E8E8E8"
        _hover={{
          background: "#38B2AC",
          color: "white",
        }}
        color="black"
        px={3}
        py={2}
        mb={2}
        borderRadius="lg"
      >
        <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
          <Avatar
            mr={2}
            size="sm"
            cursor="pointer"
            name={currentUser.name}
            src={currentUser.pic}
          />
          <Box>
            <Text>{currentUser.name}</Text>
            <Text fontSize="xs">
              <b>Email : </b>
              {currentUser.email}
            </Text>
          </Box>
        </div>
      </Box>
    </div>
  );
};

export default UserListItem;
