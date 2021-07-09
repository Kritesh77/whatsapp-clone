import React, { useState, Suspense, useEffect } from "react";
import Sidebar from "./components/Sidebar.js";
import Chatroom from "./components/Chatroom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./app.css";
import { db, timestamp } from "./firebase";
import useAuthListener from "./hooks/on-auth-change.js";
import UserContext from "./context/user.js";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
export default function App() {
  // const [user, setUser] = useState(null);
  const { user } = useAuthListener();
  const [isMobile, setIsMobile] = useState();
  useEffect(() => {
    let windowWidth;
    const handleResize = () => {
      window.innerWidth <= "768" ? setIsMobile(true) : setIsMobile(false);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      if (user) {
        db.collection("users")
          .doc(user.uid)
          .update({
            isOnline: false,
            lastSeen: timestamp,
          })
          .then(console.log("user set OFFLINE in authUser"));
      }
    });
  }, []);
  console.log("isMobile IF :", isMobile);

  return (
    <UserContext.Provider value={{ user }}>
      {!user ? (
        <Router>
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
          </Switch>
        </Router>
      ) : (
        <Router>
          <Suspense fallback={<p>Loading...</p>}>
            <Sidebar />
            <Switch>
              <Route path="/chats/:chatId" component={Chatroom} />
              <Route path="/" component={Chatroom} />
            </Switch>
          </Suspense>
        </Router>
      )}
    </UserContext.Provider>
  );
}
