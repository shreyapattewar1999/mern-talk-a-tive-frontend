import { Stack, Skeleton } from "@chakra-ui/react";
import React from "react";

const ChatLoading = () => {
  return (
    <div>
      {/* this is used to show shimmer effect while list of chats is getting loaded */}
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    </div>
  );
};

export default ChatLoading;
