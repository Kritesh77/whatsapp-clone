import React, { useState, useEffect, useContext, useMemo } from "react";
import UserContext from "../context/user";
import { Search } from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import { db } from "../firebase";
import ViewContact2 from "./subComponents/ViewContacts2";
import AddChat from "./subComponents/AddChat";
import SidebarContacts from "./subComponents/SidebarContacts";

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

    return () => unsubscribe();
  }, [db]);

  return (
    <div
      style={{ width: "100vw" }}
      className="flex-col flex bg-gradient-to-tr from-gray-100 to-gray-300"
    >
      <div
        className="flex w-full items-center justify-between py-3 bg-white shadow-sm"
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
        className="w-full h-full flex-1 overflow-y-scroll"
        id="contact_container"
      >
        {chats.length ? (
          chats.map((c) => {
            return <SidebarContacts key={c.id} id={c.id} name={c.members} />;
          })
        ) : (
          <div className="gray h-full w-full flex justify-end items-start relative">
            <h1 className="text-5xl tracking-widest leading-snug  self-center md:text-6xl text-gray-200 z-10 md:w-1/2 p-12 text-center md:text-right text-shadow">
              Add a new chat to start conversing
            </h1>
            <img
              src={process.env.PUBLIC_URL + "/bg.jpg"}
              className="h-full w-full object-cover absolute top-0 left-0 z-0"
            />
          </div>
        )}
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
