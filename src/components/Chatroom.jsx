import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../context/user";
import ScrollableFeed from "react-scrollable-feed";
import ChatHeader from "./Chatroom/ChatHeader";
import ChatIdContext from "../context/chatId";
import ChatInput from "./Chatroom/ChatInput";
import ChatContainer from "./Chatroom/ChatContainer";

export default function Chatroom() {
  const { user } = useContext(UserContext);
  const { chatId } = useParams();

  return (
    <>
      {chatId?.length ? (
        <ChatIdContext.Provider value={{ chatId }}>
          <div className=" flex-1 w-2/3 chatroom_container flex-col  h-full  flex relative pb-4 gray">
            <ChatHeader user={user} />
            <ScrollableFeed>
              <ChatContainer />
            </ScrollableFeed>
            <ChatInput />
          </div>
        </ChatIdContext.Provider>
      ) : (
        <div className="gray h-full w-full flex justify-end items-start relative">
          <h1 className="text-5xl self-center md:text-6xl text-gray-200 z-10 md:w-1/2 p-12 text-center md:text-right text-shadow">
            Add a new chat to start conversing
          </h1>
          <img
            src={process.env.PUBLIC_URL + "/bg.jpg"}
            className="h-full w-full object-cover absolute top-0 left-0 z-0"
          />
        </div>
      )}
    </>
  );
}
