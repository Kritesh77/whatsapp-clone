import React, { useState, useEffect, useContext } from "react";
import { InsertEmoticon, ExitToApp } from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import getUser from "../hooks/get-user";
import { IconButton } from "@material-ui/core";
import { db, auth, timestamp } from "../firebase";
import UserContext from "../context/user";
import { Avatar } from "@material-ui/core";
import firebase from "firebase";
import Skeleton from "react-loading-skeleton";

export default function Chatroom() {
  const history = useHistory();
  const { user } = useContext(UserContext);
  const [chatMessage, setchatMessage] = useState([]);
  const { chatId } = useParams();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (chatId) {
      db.collection("chatRooms")
        .doc(chatId)
        .get()
        .then((x) => {
          x.data()?.members.forEach((y) => {
            if (y !== user.email) {
              getUser(y)
                .then((z) => {
                  setUsername(z.username);
                  setEmail(z.email);
                  setPhotoUrl(z.photoURL);
                })
                .then(console.log("chat name and image set"));
            }
          });
        });
    }
  }, [db, chatId]);

  useEffect(() => {
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

  const handleMessage = (e) => {
    e.preventDefault();
    var input = document.getElementById("chat-message");
    db.collection("chatRooms")
      .doc(chatId)
      .collection("messages")
      .add({
        message: input.value,
        name: user.displayName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        seen: false,
        sender: user.email,
      })
      .then((input.value = null));
  };

  return (
    <>
      {chatId ? (
        <div className="flex-1 w-2/3 chatroom_container flex-col  h-full  flex relative pb-4 gray">
          <ChatHeader />
          <ChatContainer />
          <div
            className=" bg-white p-2 flex items-center rounded-lg bottom-0 mx-4 right-0 "
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
        </div>
      ) : (
        <div className="gray h-full w-full flex justify-end items-start px-12 py-8">
          <h1 className="text-6xl ">New chat</h1>
        </div>
      )}
    </>
  );

  function ChatHeader() {
    useEffect(() => {
      const docId = db
        .collection("users")
        .where("email", "==", email)
        .onSnapshot((snap) => {
          var x = snap.docs[0].data();
          setIsOnline(x.isOnline);
          const date = new Date(x.lastSeen?.toDate());
          const dateToday = new Date().getDate();
          if (date.getDate() === dateToday) {
            setLastSeen("today");
          } else {
            setLastSeen(
              (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) +
                ":" +
                date.getMinutes() +
                (date.getHours() > 12 ? "PM" : "AM")
            );
          }
        });
      return () => docId();
    }, []);
    return !loading ? (
      <div className="flex w-full items-center bg-white py-3 px-4">
        <div className="ml-4 relative">
          <Avatar src={photoUrl} className="relative"></Avatar>
          <div
            className={`${isOnline && "bg-green-400"} ${
              !isOnline && "bg-gray-400"
            }  online-dot`}
          />
        </div>
        <div className="flex-1 mx-4">
          <p className="font-bold capitalize text-gray-800"> {username}</p>
          {isOnline ? (
            <p className="text-xs text-gray-700">Active now</p>
          ) : (
            <p className="text-xs text-gray-700">Last Seen {lastSeen}</p>
          )}
        </div>
        <IconButton
          onClick={() => {
            db.collection("users")
              .doc(user.uid)
              .update({
                isOnline: false,
                lastSeen: timestamp,
              })
              .then(() => {
                console.log("user setOFFLINE");
                auth.signOut();
                history.push("/");
              });
          }}
        >
          <ExitToApp />
        </IconButton>
      </div>
    ) : (
      <div className="flex w-full items-center bg-white py-3 px-4">
        <div className="rounded-full overflow-hidden ml-4">
          <Skeleton circle={true} height={40} width={40} />
        </div>
        <div className="flex-1 mx-4">
          <div className="w-1/2">
            <Skeleton width={`50%`} />
          </div>
          <div className="w-1/4">
            <Skeleton width={`50%`} />
          </div>
        </div>
      </div>
    );
  }
  function ChatContainer() {
    return !loading ? (
      <div className="gray py-8 overflow-y-scroll overflow-x-hidden flex-1 px-4">
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
    ) : (
      <div className="gray py-8 overflow-y-scroll overflow-x-hidden flex-1 px-4"></div>
    );
  }
  function Message({ message, timestamp, userMessage }) {
    const date = new Date(timestamp?.toDate());
    var finalTime =
      (date.getHours() % 12 || 12) +
      ":" +
      date.getMinutes() +
      " " +
      (date.getHours() >= 12 ? "PM" : "AM");
    var currentTime = new Date().getMinutes();

    return (
      <>
        <div
          className={`${
            userMessage && "flex-row-reverse"
          } my-4 flex text-gray-700`}
        >
          <div className="h-8 w-8 rounded-full overflow-hidden mx-4">
            <img
              src={userMessage ? user.photoURL : photoUrl}
              className="object-contain"
            />
          </div>
          <div
            className={`${
              userMessage && " bg-green-300 rounded-br-none chat-blue"
            } ${
              !userMessage && "rounded-tl-none chat-gray"
            } text-sm chatbox_message_container rounded-xl relative`}
          >
            <p className=" mr-12 break-full whitespace-pre">{message}</p>
          </div>
          <p className="text-xs self-center px-4">{finalTime}</p>
        </div>
      </>
    );
  }
}
