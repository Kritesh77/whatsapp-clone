import { useEffect, useState, useContext } from "react";
import { auth, firebaseConfig } from "../firebase.js";
import firebase from "firebase";
export default function useAuthListener() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("authUser"))
  );
  useEffect(() => {
    const listener = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        localStorage.setItem("authUser", JSON.stringify(authUser));
        setUser(authUser);
        console.log("Auth Listener User If", authUser);
      } else {
        setUser(null);
        localStorage.removeItem("authUser");
        console.log("Auth Listener User If", authUser);
      }
    });
    return () => listener();
  }, [firebase]);
  return { user };
}
