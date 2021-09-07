import React, { useEffect, useState, useContext } from "react";
import Message from "./ChatMessage";
import { db } from "../../firebase";
import UserContext from "../../context/user";
import ChatIdContext from "../../context/chatId";
export default function ChatContainer() {
  const [loading, setLoading] = useState(true);
  const [chatMessage, setchatMessage] = useState([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const { user } = useContext(UserContext);
  const { chatId } = useContext(ChatIdContext);
  useEffect(() => {
    setLoading(true);
    setPhotoUrl("");
    const unsubscribe = db
      .collection("chatRooms")
      .doc(chatId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) => {
        setchatMessage(snapshot.docs.map((doc) => doc.data()));
        // console.log("chat messages set", snapshot);
        setLoading(false);
      });
    return () => {
      unsubscribe();
    };
  }, [chatId]);
  return !loading ? (
    <div className="gray py-8 overflow-y-scroll overflow-x-hidden flex-1 md:px-4 pl-2 w-full">
      {chatMessage.map((m, id) => {
        let userMessage = false;
        user.displayName === m.name
          ? (userMessage = true)
          : (userMessage = false);
        return (
          <Message
            name={m.name}
            key={id}
            message={m.message}
            timestamp={m.timestamp}
            userMessage={userMessage}
            photoUrl={photoUrl}
            user={user}
          />
        );
      })}
    </div>
  ) : (
    <div className="gray py-8 overflow-y-scroll overflow-x-hidden flex-1 px-4"></div>
  );
}
