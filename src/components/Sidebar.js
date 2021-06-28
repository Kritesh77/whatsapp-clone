import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../context/user";
import { Search } from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import { Avatar } from "@material-ui/core";
import { db } from "../firebase";
import AddChat from "./subComponents/AddChat";
import ViewContact2 from "./subComponents/ViewContacts2";
import getUser from "../hooks/get-user";
import Skeleton from "react-loading-skeleton";

function SidebarContacts({ id, name }) {
  const [seed, setSeed] = useState("");
  const [username, setUsername] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const userDetails = getUser(name).then((data) => {
      setUsername(data.username);
      setPhotoUrl(data.photoURL);
      // setLoading(false);
    });
  }, []);
  useEffect(() => {
    console.log(username);
  }, [username]);
  return !loading ? (
    <Link to={`/chats/${id}`}>
      <div className="mx-4 py-2 flex border-b-2 items-center">
        <div className="">
          <Avatar src={photoUrl} />
        </div>
        <div className="px-4">
          <h1 className="font-bold inline-block text-lg ">{username}</h1>
          <p className="text-gray-800">This is my chat message</p>
        </div>
      </div>
    </Link>
  ) : (
    <div classname="flex">
      <Skeleton className=" flex-1">
        <Skeleton circle={true} height={40} width={40} className="w-1/4 flex" />
      </Skeleton>
    </div>
  );
}

export default function Sidebar() {
  const { user } = useContext(UserContext);
  const [chats, setChats] = useState([]);
  useEffect(() => {
    console.log(chats);
  }, [chats]);
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
    <div className="flex-col w-full flex sm:w-1/3">
      <div
        className="flex w-full items-center justify-between bg-gray-200 py-2"
        id="sidebar_header"
      >
        <div className="h-10 w-10 rounded-full overflow-hidden ml-4">
          <img src={user.photoURL} alt="" className="object-contain" />
        </div>

        <div className="flex">
          <AddChat />
          <IconButton>
            <ViewContact2 />
          </IconButton>
        </div>
      </div>
      <div className=" bg-gray-100">
        <div className="flex items-center bg-white justify-center  px-4 mx-4 my-2 rounded-full">
          <Search />
          <input
            type="text"
            placeholder="Search for a chat..."
            className=" w-full py-2 ml-1"
          />
        </div>
      </div>
      <div className="w-full overflow-y-scroll " id="contact_container">
        {chats.map((c) => {
          return <SidebarContacts key={c.id} id={c.id} name={c.members} />;
        })}
      </div>
    </div>
  );
}
