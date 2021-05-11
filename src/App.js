import React, { useState, Suspense, useEffect } from "react";
import Sidebar from "./components/Sidebar.js";
import Chatroom from "./components/Chatroom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ViewContacts from "./components/ViewContacts";
import "./app.css";
import useAuthListener from "./hooks/on-auth-change.js";
import UserContext from "./context/user.js";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useStateValue } from "./components/StateProvider.js";
export default function App() {
  // const [user, setUser] = useState(null);
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
  console.log("isMobile IF :", isMobile);

  const { user } = useAuthListener();
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
              <Route path="/contacts" component={ViewContacts} />
              <Route path="/" component={Chatroom} />
            </Switch>
          </Suspense>
        </Router>
      )}
    </UserContext.Provider>
  );
}
