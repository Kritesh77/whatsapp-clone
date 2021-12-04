import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@material-ui/core";
import Skeleton from "react-loading-skeleton";
import getUser from "hooks/get-user";
import { db } from "firebase.js";
export default function SidebarContacts({ id, name }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [lastMessageDate, setLastMessageDate] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  useEffect(() => {
    getUser(name).then((data) => {
      setUsername(data.username);
      setPhotoUrl(data.photoURL);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const last = db
      .collection("chatRooms")
      .doc(id)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .onSnapshot((snap) => {
        setLastMessage(snap.docs[0].data().message);
        const date = new Date(snap.docs[0].data().timestamp?.toDate());
        console.log("DATE", date);
        const dateToday = new Date().getDate();
        if (date.getDate() === dateToday) {
          setLastMessageDate("Today");
        } else {
          setLastMessageDate(date.getDate() + " / " + date.getMonth());
        }
      });
    return () => last();
  }, []);

  useEffect(() => {
    const docId = db
      .collection("users")
      .where("email", "==", name)
      .onSnapshot((snap) => {
        var x = snap.docs[0].data();
        setIsOnline(x.isOnline);
      });
    return () => docId();
  }, []);

  return !loading ? (
    <Link to={`/chats/${id}`}>
      <div className="mx-4 my-3 py-5 px-4 flex items-center bg-white rounded-md">
        <div className="relative">
          <Avatar src={photoUrl} className="relative"></Avatar>
          <div
            className={`${isOnline && "bg-green-400"} ${
              !isOnline && "bg-gray-400"
            }  online-dot`}
          />
        </div>
        <div className="px-4 flex-1">
          <h1 className="font-md inline-block text-lg capitalize text-gray-800">
            {username}
          </h1>
          <p className="text-gray-600 text-sm font-light">{lastMessage}</p>
        </div>
        <div className="flex flex-col h-full items-center justify-between">
          <p className="text-xs text-gray-800">{lastMessageDate}</p>
          <div className="bg-red-400 rounded-full h-5 w-5 mt-2 self-end flex items-center justify-center">
            <p className="text-white text-xs">4</p>
          </div>
        </div>
      </div>
    </Link>
  ) : (
    <div className="mx-4 my-3 py-5 px-4 flex items-center bg-white rounded-md">
      <div className="relative">
        <Skeleton circle={true} height={40} width={40} />
      </div>
      <div className="px-4 flex-1">
        <Skeleton width={`50%`} />
        <p className="text-gray-600 text-sm font-light">
          <Skeleton />
        </p>
      </div>
      <div className="flex flex-col h-full items-center justify-between">
        <Skeleton />
      </div>
    </div>
  );
}
