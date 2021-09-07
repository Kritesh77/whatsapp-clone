import React, { useContext } from "react";
import { IconButton } from "@material-ui/core";
import { InsertEmoticon } from "@material-ui/icons";
import { db, timestamp } from "../../firebase";
import UserContext from "../../context/user";
import ChatIdContext from "../../context/chatId";

export default function ChatInput() {
  const { user } = useContext(UserContext);
  const { chatId } = useContext(ChatIdContext);
  console.log("chatid", chatId);
  const handleMessage = (e) => {
    e.preventDefault();
    var input = document.getElementById("chat-message");
    db.collection("chatRooms")
      .doc(chatId)
      .collection("messages")
      .add({
        message: input.value,
        name: user.displayName,
        timestamp,
        seen: false,
        sender: user.email,
      })
      .then((input.value = null))
      .then(console.log("messagesent"));
  };

  return (
    <div
      className=" bg-white p-2 flex items-center rounded-lg bottom-0 mx-4 right-0 shadow-lg"
      id="chatroom_messagebox"
    >
      <IconButton>
        <InsertEmoticon />
      </IconButton>
      <div className="inline-block rounded-full flex-1 mx-2 bg-white ">
        <form action="" onSubmit={handleMessage}>
          <input
            type="text"
            className="w-full rounded-full py-2 px-4"
            placeholder="Type a message"
            id="chat-message"
          />
        </form>
      </div>
    </div>
  );
}
