export const getSender = (loggedUser, users) => {
  if (!loggedUser || !users) {
    return;
  }
  return users[0]._id === loggedUser._id ? users[1]?.name : users[0]?.name;
};

export const getSenderEntireInfo = (loggedUser, users) => {
  if (!loggedUser || !users) {
    return;
  }
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isSameSender = (
  allMessages,
  currentMessage,
  indexOfCurrentMessage,
  loggedUserId
) => {
  return (
    indexOfCurrentMessage + 1 < allMessages.length &&
    allMessages[indexOfCurrentMessage + 1].sender &&
    (allMessages[indexOfCurrentMessage + 1].sender._id !==
      currentMessage.sender._id ||
      allMessages[indexOfCurrentMessage + 1].sender._id === undefined) &&
    allMessages[indexOfCurrentMessage].sender._id !== loggedUserId
  );

  // We want to show profile picture of sender in chatbox only at the end of last message in bulk
  // like if another sender has sent 5 consecutive messages, profile pic should be shown along with 5th last message

  // also we dont want to show profile picture of logged in user(that is myself), hence last consition is added
  // allMessages[indexOfCurrentMessage].sender._id !== loggedUser._id
};

export const isLastMessage = (allMessages, currentIndex, loggedUserId) => {
  const n = allMessages.length;
  return (
    currentIndex === n - 1 &&
    allMessages[n - 1].sender._id &&
    allMessages[n - 1].sender._id !== loggedUserId
  );
};
// function above checks if its last message by opposite sender,
// Condition 1 => currentIndex === n - 1 =>  hence first index is compared with size of allMessages array
// Condition 2 => allMessages[n - 1].sender._id => next whether last message exists or not
// Condition 3 => allMessages[n - 1].sender._id !== loggedUserId => and here checking last message is from opposite sender or not (i.e. not from logged in user )

export const isSameSenderMargin = (
  allMessages,
  currentMessage,
  currentIndex,
  loggedUserId
) => {
  const n = allMessages.length;
  if (
    currentIndex + 1 < n &&
    allMessages[currentIndex + 1].sender._id === currentMessage.sender._id &&
    currentMessage.sender._id !== loggedUserId
  ) {
    return 33;
  } else if (
    (currentIndex + 1 < n &&
      allMessages[currentIndex + 1].sender._id !== currentMessage.sender._id &&
      currentMessage.sender._id !== loggedUserId) ||
    (currentIndex === n - 1 && currentMessage.sender._id !== loggedUserId)
  ) {
    return 0;
  } else return "auto";
};

export const isSameUser = (allMessages, currentMessage, currentIndex) => {
  return (
    currentIndex > 0 &&
    allMessages[currentIndex - 1].sender._id === currentMessage.sender._id
  );
};

export const checkCurrentUserOnline = (allOnlineUsers, currentUserId) => {
  const isExist = allOnlineUsers.find((uid) => uid === currentUserId);
  if (isExist) {
    return true;
  }
  return false;
};
