import React, { useState } from "react";
import {
  MoreVert,
  InsertEmoticon,
  Chat,
  AccountCircle,
  Navigation,
} from "@material-ui/icons";
import { IconButton } from "@material-ui/core";

function Chatroom() {
  const user = {};
  const [chatMessage, setchatMessage] = useState("");
  const handleMessage = (e) => {
    e.preventDefault();
    console.log(chatMessage);
  };
  return (
    <div className="flex-1 w-2/3 chatroom_container flex-col  h-full border flex">
      <div
        className="flex w-full items-center bg-gray-200 py-2 px-4"
        id="chatroom_header"
      >
        <AccountCircle />
        <div className="flex-1 mx-4">
          <p className="font-bold"> Username</p>
          <p className="font-light text-xs text-gray-700 ">
            Member 1,Member 2,Member 3
          </p>
        </div>
        <IconButton>
          <MoreVert />
        </IconButton>
      </div>
      {/* chat box */}
      <div className="py-8 overflow-y-scroll  overflow-x-hidden flex-1  bg-green-400  px-4">
        <div className="chatbox_message_container  relative w-min bg-white rounded-xl px-2 py-1">
          <span className="text-red-600 font-bold text-sm ">Username</span>
          <p className=" mr-12 break-full whitespace-pre">asdsadsadasdas</p>
          <span className="message_time text-xs text-gray-700 text-right absolute ">
            3:00pm
          </span>
        </div>
        <br />
        <div
          className={`${
            user && "chat_right bg-green-500"
          } px-2 py-1 block chatbox_message_container justify-end items-end bg-white rounded-xl mb-1 relative`}
        >
          <p className=" mr-12">h1</p>
          <span className="message_time text-xs text-gray-700 text-right absolute ">
            3:00pm
          </span>
        </div>
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
              value={chatMessage}
              onChange={(c) => setchatMessage(c.target.value)}
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
