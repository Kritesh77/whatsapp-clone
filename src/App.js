import React, { useState, Suspense, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Chatroom from "./components/Chatroom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./app.css";
import { db, timestamp } from "./firebase";
import useAuthListener from "./hooks/on-auth-change.js";
import UserContext from "./context/user.js";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import MobileSidebar from "./components/MobileSidebar";
import useResize from "./hooks/useResize.js";
export default function App() {
  // const [user, setUser] = useState(null);
  const { user } = useAuthListener();
  let isMobile = useResize();

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
              {isMobile ? (
                <Route path="/" component={MobileSidebar} />
              ) : (
                <Route path="/" component={Chatroom} />
              )}
            </Switch>
          </Suspense>
        </Router>
      )}
    </UserContext.Provider>
  );
}
