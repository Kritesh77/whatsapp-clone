import React from "react";
import Sidebar from "./Sidebar.js";
import Chatroom from "./Chatroom";
function Dashboard() {
  return (
    <div className="bg-green-500 w-screen h-screen">
      <div className="container bg-white w-full h-full shadow-md flex">
        <Sidebar />
        <Chatroom />
      </div>
    </div>
  );
}

export default Dashboard;
