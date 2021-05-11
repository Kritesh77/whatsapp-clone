import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import UserContext from "../context/user";
import { Contacts, Search } from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import { Avatar } from "@material-ui/core";
import { db } from "../firebase";
import AddChat from "./subComponents/AddChat";
import ViewContact2 from "./subComponents/ViewContacts2";

function SidebarContacts({ id, name, addNewChat }) {
  const [seed, setSeed] = useState("");
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 5000));
  }, []);
  const createChat = () => {
    const newChat = prompt("Enter new chat name");
    if (newChat) {
      db.collection("chatContacts").add({
        name: newChat,
      });
    }
  };

  return !addNewChat ? (
    <Link to={`/chats/${id}`}>
      <div className="mx-4 py-2 flex border-b-2 items-center">
        <div className="">
          <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
        </div>
        <div className="px-4">
          <h1 className="font-bold inline-block text-lg ">{name}</h1>
          <p className="text-gray-800">This is my chat message</p>
        </div>
      </div>
    </Link>
  ) : (
    <div className="mx-4 py-2 border-b-2" onClick={createChat}>
      <h1 className="font-bold inline-block text-2xl cursor-pointer ml-2 text-lg text-bold">
        Create new chat
      </h1>
    </div>
  );
}

function Sidebar() {
  const { user } = useContext(UserContext);
  const [chats, setChats] = useState([]);
  useEffect(() => {
    const unsubscribe = db.collection("chatContacts").onSnapshot((snap) => {
      setChats(
        snap.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
      // console.log(chats);
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
          {/* <Link to="/contacts"> */}
          <IconButton>
            {/* <Contacts onClick={}/> */}
            <ViewContact2 />
          </IconButton>
          {/* </Link> */}
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
        <SidebarContacts addNewChat />
        {chats.map((c) => {
          return <SidebarContacts key={c.id} id={c.id} name={c.data.name} />;
        })}
      </div>
    </div>
  );
}

export default Sidebar;
