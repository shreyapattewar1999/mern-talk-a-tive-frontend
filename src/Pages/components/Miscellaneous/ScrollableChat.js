import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isSameUser,
} from "../../Config/ChatLogics";
import { ChatState } from "../../../Context/ChatProvider";
import { Tooltip, Avatar } from "@chakra-ui/react";

const ScrollableChat = (props) => {
  const { user } = ChatState();

  const { messages } = props;
  /* We are using npm package react-scrollable-feed  */

  // useEffect(() => {
  //   console.log(messages);
  // }, [messages]);

  //   if there are bunch of messages by a sender,
  //    profile message is displayed only once at the last message in bulk
  const getTime = (currentTime) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const time = new Date(currentTime);
    const today = new Date();
    let date;
    if (
      time.getDate() === today.getDate() &&
      time.getMonth() === today.getMonth() &&
      time.getFullYear() === today.getFullYear()
    ) {
      date = "Today";
    } else if (
      time.getMonth() === today.getMonth() &&
      time.getFullYear() === today.getFullYear() &&
      today.getDate() - time.getDate() === 1
    ) {
      date = "Yesterday";
    } else {
      date = time.getDate() + " " + monthNames[time.getMonth()];
    }
    return date + " " + time.getHours() + ":" + time.getMinutes();
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((currentMessage, index) => (
          <div key={currentMessage._id} style={{ display: "flex" }}>
            {(isSameSender(messages, currentMessage, index, user._id) ||
              isLastMessage(messages, index, user._id)) && (
              <>
                <Tooltip
                  label={currentMessage.sender.name}
                  placement="bottom-start"
                >
                  <Avatar
                    mt={3}
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={currentMessage.sender.name}
                    src={currentMessage.sender?.profile_pic}
                  ></Avatar>
                </Tooltip>
              </>
            )}
            <span
              style={{
                backgroundColor: `${
                  currentMessage.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginRight: `${
                  currentMessage.sender._id === user._id ? "10px" : ""
                }`,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                marginLeft: isSameSenderMargin(
                  messages,
                  currentMessage,
                  index,
                  user._id
                ),
                marginTop: isSameUser(messages, currentMessage, index) ? 3 : 10,
              }}
            >
              {currentMessage.content}
              <br />
              <span style={{ color: "#646566", fontSize: "small" }}>
                {getTime(currentMessage?.updatedAt)}
              </span>
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
