import React, { useEffect, useState, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { auth, provider, db } from "../firebase";

import { useStateValue } from "./StateProvider.js";
export default function Login() {
  const history = useHistory();
  console.log("history", history);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isInValid = password === "" || username === "";
  // console.log("form is in valid ?", isInValid);
  useEffect(() => {
    document.title = "Login ";
  }, []);
  const googleLogin = async () => {
    const createdUserResult = await auth.signInWithPopup(provider);
    const checkUser = await db
      .collection("users")
      .where("email", "==", createdUserResult.user.email)
      .get();
    console.log(checkUser.docs.length);
    if (checkUser.docs.length === 0) {
      console.log("%c Adding new user ", "background: #222; color: red");
      await db
        .collection("users")
        .add({
          userId: createdUserResult.user.uid,
          username: createdUserResult.user.displayName.toLowerCase(),
          email: createdUserResult.user.email.toLowerCase(),
          dateCreated: Date.now(),
        })
        .catch((error) => alert(error.message));
    } else {
      console.log("%c User already existing", "background: #222; color: red");
    }
  };

  return (
    <div className="container flex mx-auto max-w-screen-md items-center h-screen">
      <div className="flex w-3/5">
        <img
          src="https://www.sendible.com/hs-fs/hubfs/Imported_Blog_Media/ig-ads-7-article.png?width=800&height=800&name=ig-ads-7-article.png"
          alt="iPhone with Instagram app"
        />
      </div>
      <div className=" w-2/5 bg-white flex-col flex ">
        <div className="flex w-full justify-center">
          <img
            className="mt-2 w-1/2 mb-4"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1024px-Instagram_logo.svg.png"
            alt=""
          />
        </div>
        {error && (
          <p className="text-xs mb-2 text-center text-red-500">{error}</p>
        )}
        <form method="post">
          <input
            type="text"
            aria-label="Enter your email address"
            name="username"
            id="username"
            placeholder="Username"
            className="text-sm w-full mr-3 py-5 px-4 h-2 border rounded mb-2 "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            value={password}
            name="password"
            placeholder="Password"
            id="password"
            className="text-sm w-full mr-3 py-5 px-4 h-2 border rounded mb-2 "
            onChange={({ target }) => setPassword(target.value)}
          />
          <input
            type="submit"
            value="Login"
            className={`text-white font-bold  rounded w-full bg-blue-500 py-1 ${
              isInValid && "cursor-not-allowed opacity-50"
            }`}
          />
        </form>
        <div className="border rounded bg-white mt-4 px-3 py-2 ">
          <button onClick={signIn}>Signin with Google</button>
        </div>
      </div>
    </div>
  );
}
