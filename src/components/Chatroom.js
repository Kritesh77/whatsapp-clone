import React, { useState, useEffect, useContext } from "react";
import {
  MoreVert,
  InsertEmoticon,
  Chat,
  AccountCircle,
  Navigation,
  ArrowBackRounded,
  ExitToApp,
} from "@material-ui/icons";
import { Link, useParams } from "react-router-dom";
import { IconButton } from "@material-ui/core";
import { db, auth } from "../firebase";
import UserContext from "../context/user";
import firebase from "firebase";
function Message({ name, message, timestamp, userMessage }) {
  const date = new Date(timestamp?.toDate()).toUTCString();
  return (
    <>
      <div
        className={`${
          userMessage && "chat_right bg-green-300"
        } px-2 py-1 block chatbox_message_container justify-end items-end bg-white rounded-xl mb-1 relative`}
      >
        <span className="text-red-600 font-bold text-sm ">{name}</span>
        <p className=" mr-12 break-full whitespace-pre">{message}</p>
        <span className="message_time text-xs text-gray-700 text-right ">
          {date}
        </span>
      </div>
      <br />
    </>
  );
}
function Chatroom() {
  const [roomName, setroomName] = useState("");
  const { user } = useContext(UserContext);
  const [chatMessage, setchatMessage] = useState([]);
  const { chatId } = useParams();
  const [input, setInput] = useState("");
  console.log("USERDISPLAYNAME", user.displayName);

  const handleMessage = (e) => {
    e.preventDefault();
    db.collection("chatContacts").doc(chatId).collection("messages").add({
      message: input,
      name: user.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setInput("");
  };
  useEffect(() => {
    console.log("USE EFFECT RUNNIN");
    if (chatId) {
      db.collection("chatContacts")
        .doc(chatId)
        .onSnapshot((snap) => {
          console.log("SNAP ROOMNAME", snap);
          setroomName(snap.data().name);
        });
      db.collection("chatContacts")
        .doc(chatId)
        .collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          const xxx = snapshot.docs.map((doc) => doc.data());
          setchatMessage(xxx);
          console.log("XXX", xxx);
        });

      console.log("CHAY MESSAGE", chatMessage);
    }
  }, [chatId]);
  return (
    <div className="flex-1 w-2/3 chatroom_container flex-col  h-full border flex">
      <div
        className="flex w-full items-center bg-gray-200 py-2 px-4"
        id="chatroom_header"
      >
        <ArrowBackRounded className={`text-gray-700 h-8`} />
        <div className="h-10 w-10 rounded-full overflow-hidden ml-4">
          <img src={user.photoURL} alt="" className="object-contain" />
        </div>
        <div className="flex-1 mx-4">
          <p className="font-bold"> {roomName}</p>
          <p className="font-light text-xs text-gray-700 ">
            Member 1,Member 2,Member 3
          </p>
        </div>
        <IconButton onClick={() => auth.signOut()}>
          <ExitToApp />
        </IconButton>
      </div>
      {/* chat box */}
      <div className="py-8 overflow-y-scroll  overflow-x-hidden flex-1 bg-gradient-to-r from-gray-400 to-gray-200  px-4">
        {chatMessage.map((m) => {
          let userMessage = false;
          user.displayName === m.name
            ? (userMessage = true)
            : (userMessage = false);
          return (
            <Message
              name={m.name}
              message={m.message}
              timestamp={m.timestamp}
              userMessage={userMessage}
            />
          );
        })}
      </div>
      <div
        className=" bg-gray-200 p-2 flex items-center"
        id="chatroom_messagebox"
      >
        <IconButton>
          <InsertEmoticon />
        </IconButton>
        <div className="inline-block rounded-full flex-1 mx-2 bg-white ">
          <form action="" onSubmit={handleMessage}>
            <input
              type="text"
              name=""
              value={input}
              onChange={(c) => setInput(c.target.value)}
              className="w-full border rounded-full py-2 px-4 "
              placeholder="Type a message"
              id=""
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chatroom;
