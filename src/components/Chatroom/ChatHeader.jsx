import React, { useState, useEffect, useContext } from "react";
import { Avatar } from "@material-ui/core";
import Skeleton from "react-loading-skeleton";
import { db, auth, timestamp } from "../../firebase";
import { IconButton } from "@material-ui/core";
import { ExitToApp, ArrowBack } from "@material-ui/icons";
import getUser from "../../hooks/get-user";
import { useHistory } from "react-router-dom";
import ChatIdContext from "../../context/chatId";
import { Link } from "react-router-dom";
import UserDetails from "../../hooks/get-userDetails";
import useResize from "../../hooks/useResize";
export default function ChatHeader({ user }) {
  const { chatId } = useContext(ChatIdContext);
  var [loading, setLoading] = useState(true);
  const [reciever, setReciever] = useState("");
  const isMobile = useResize();
  useEffect(() => {
    if (chatId) {
      db.collection("chatRooms")
        .doc(chatId)
        .get()
        .then((x) => {
          x.data()?.members.forEach((y) => {
            if (y !== user.email) {
              getUser(y)
                .then((z) => {
                  setReciever(z.email);
                })
                .then(console.log("chat name and image set"));
            }
          });
        });
    }
  }, [db, chatId]);

  var { photoUrl, isOnline, lastSeen, username, loading } =
    UserDetails(reciever);
  const history = useHistory();

  return !loading ? (
    <div className="flex w-full items-center bg-white py-3 px-4 shadow-md">
      {isMobile && (
        <Link to="/">
          <ArrowBack />
        </Link>
      )}
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
