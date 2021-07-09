import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../context/user";
import { Search } from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import { Avatar } from "@material-ui/core";
import { db } from "../firebase";
import ViewContact2 from "./subComponents/ViewContacts2";
import getUser from "../hooks/get-user";
import Skeleton from "react-loading-skeleton";
import AddChat from "./subComponents/AddChat";

function SidebarContacts({ id, name }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [messageId, setMessageId] = useState();
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
      .where("sender", "==", name)
      .onSnapshot((snap) => {
        console.log(snap.docs[snap.docs.length - 1]?.data().message);
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
        const date = new Date(x.lastSeen?.toDate());
        const dateToday = new Date().getDate();
        if (date.getDate() === dateToday) {
          setLastSeen("Today");
        } else {
          setLastSeen(date.getDate() + " / " + date.getMonth());
        }
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
          <p className="text-gray-600 text-sm font-light">
            This is my chat message
          </p>
        </div>
        <div className="flex flex-col h-full items-center justify-between">
          <p className="text-xs text-gray-800">{lastSeen}</p>
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

export default function Sidebar() {
  const { user } = useContext(UserContext);
  const [chats, setChats] = useState([]);
  useEffect(() => {
    const unsubscribe = db
      .collection("chatRooms")
      .where("members", "array-contains", user.email)
      .onSnapshot((snap) => {
        setChats(
          snap.docs.map((doc) => ({
            id: doc.id,
            members:
              doc.data().members[
                doc.data().members.length -
                  doc.data().members.findIndex((x) => x === user.email) -
                  1
              ],
          }))
        );
      });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex-col w-full flex sm:w-1/3 bg-gray-100">
      <div
        className="flex w-full items-center justify-between py-3 bg-white"
        id="sidebar_header"
      >
        <div className="h-10 w-10 rounded-full overflow-hidden ml-4">
          <img src={user.photoURL} alt="" className="object-contain" />
        </div>
        <div className="flex mr-4">
          <AddChat />
          <IconButton>
            <ViewContact2 />
          </IconButton>
        </div>
      </div>
      <div
        className="w-full h-full flex-1 overflow-y-scroll gray"
        id="contact_container"
      >
        {chats.map((c) => {
          return <SidebarContacts key={c.id} id={c.id} name={c.members} />;
        })}
      </div>
    </div>
  );
  function SearchBar() {
    return (
      <div className="">
        <div className="flex items-center bg-white justify-center  px-4 mx-4 my-2 rounded-full">
          <Search />
          <input
            type="text"
            placeholder="Search for a chat..."
            className=" w-full py-2 ml-1"
          />
        </div>
      </div>
    );
  }
}
