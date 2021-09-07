import React, { useState, useRef, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Slide,
  Dialog,
  ListItemText,
  ListItem,
  List,
  Divider,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Contacts, CheckRounded, Delete, Close } from "@material-ui/icons";
import UserContext from "../../context/user";
import { db, timestamp } from "../../firebase";
import getDocId from "../../hooks/get-doc-id";
import firebase from "firebase";
import getUser from "../../hooks/get-user";
import getPhotoUrl from "../../hooks/get-photoUrl";
const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog() {
  const history = useHistory();
  const [recievedRequests, setRecievedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const docId = useRef();
  const [confirmedRequests, setConfirmedRequests] = useState([]);
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    console.log(
      "%c Recieved Requests ",
      "background-color:red",
      recievedRequests
    );
  }, [recievedRequests]);

  useEffect(() => {
    console.log("%c Sent Requests ", "background-color:red", sentRequests);
  }, [sentRequests]);

  useEffect(() => {
    console.log("%c Contacts ", "background-color:red", confirmedRequests);
  }, [confirmedRequests]);

  useEffect(() => {
    db.collection("users")
      .doc(user.uid)
      .collection("confirmedRequests")
      .onSnapshot((x) => {
        setConfirmedRequests(
          x.docs.map((req) => {
            return {
              username: req.data().username,
              photoUrl: req.data().photoUrl,
              timestamp: req.data().timestamp,
              contact: req.id,
            };
          })
        );
      });
  }, []);

  useEffect(() => {
    db.collection("users")
      .doc(user.uid)
      .collection("requestsSent")
      .onSnapshot((x) => {
        setSentRequests(
          x.docs.map((req) => {
            return {
              status: req.data().status,
              photoUrl: req.data().photoUrl,
              timestamp: req.data().timestamp,
              reciever: req.id,
            };
          })
        );
      });
  }, []);

  useEffect(() => {
    console.log("%c USE EFECT RUNNIN", "background-color:black;color:white");
    //set recieved requests
    db.collection("users")
      .doc(user.uid)
      .collection("requestsRecieved")
      .onSnapshot((x) => {
        setRecievedRequests(
          x.docs.map((req) => {
            return {
              status: req.data().status,
              photoUrl: req.data().photoUrl,
              timestamp: req.data().timestamp,
              sender: req.id,
            };
          })
        );
      });
  }, [user]);

  const handleConfirmChat = async (data) => {
    const sender = data.sender;
    const senderPhotoUrl = data.photoUrl;
    console.log("USER", user);
    const senderDocId = await getDocId(data.sender);
    const senderDetails = data;
    //update in recievers database
    await db
      .collection("users")
      .doc(user.uid)
      .collection("requestsRecieved")
      .doc(sender)
      .update({
        status: "accepted",
      });
    //update in senders database
    await db
      .collection("users")
      .doc(senderDocId)
      .collection("requestsSent")
      .doc(user.email)
      .update({
        status: "accepted",
      });
    console.log(sender, senderDetails.displayName, user.uid, senderPhotoUrl);
    //add to newConfirmedRequess recievers database collection
    await db
      .collection("users")
      .doc(user.uid)
      .collection("confirmedRequests")
      .doc(sender)
      .set({
        contact: sender,
        username: sender,
        timestamp,
        photoUrl: senderPhotoUrl,
      });
    //add to newConfirmedRequess senders database collection
    await db
      .collection("users")
      .doc(senderDocId)
      .collection("confirmedRequests")
      .doc(user.email)
      .set({
        contact: user.email,
        username: user.displayName,
        timestamp,
        photoUrl: user.photoURL,
      });
  };

  const addNewRoom = async (contact) => {
    console.log(contact, user.email);
    const checkRoomExists = await db
      .collection("chatRooms")
      .where("members", "array-contains", user.email)
      .get()
      .then((x) => {
        if (!x.empty) {
          var chatFound = false;
          x.docs.forEach((f) => {
            console.log(f);
            if (f.data().members.includes(contact)) {
              //room already exists , redirect the user to that room id
              chatFound = true;
              console.log(
                "%c Room already existing...Redirecting",
                "background-color:green",
                f.id
              );
              history.push("/chats/" + f.id);
              setOpen(false);
            }
          });
          if (!chatFound) {
            console.log("%c Adding room ", "background-color:green");
            db.collection("chatRooms")
              .add({
                members: [user.email, contact],
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then((x) => {
                console.log("room created", x);
                history.push("/chats/" + x.id);
                setOpen(false);
              });
          }
        } else {
          //brand new user has no rooms so make him a new one
          console.log(
            "%c Adding room for the first time",
            "background-color:green"
          );
          db.collection("chatRooms")
            .add({
              members: [user.email, contact],
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then((x) => {
              console.log("room created", x);
              history.push("/chats/" + x.id);
              setOpen(false);
            });
        }
      });
  };

  function ConfirmedRequests({ username, contact, timestamp, photoUrl }) {
    const date = new Date(timestamp?.toDate()).toDateString();
    return (
      <List>
        <ListItem
          button
          onClick={() => {
            addNewRoom(contact);
          }}
        >
          <Avatar src={photoUrl} className="md:mx-4 mr-2" />
          <ListItemText primary={username} secondary={contact} />
          <ListItemText primary="Accepted on" secondary={date} />
        </ListItem>
        <Divider />
      </List>
    );
  }

  function RequestsRecieved({ data }) {
    return (
      <List>
        <ListItem button>
          <Avatar src={data.photoUrl} className="md:mx-4 mr-2" />
          <ListItemText primary={data.sender} secondary={data.status} />
          <IconButton onClick={() => handleConfirmChat(data)}>
            <CheckRounded style={{ color: "green" }} />
          </IconButton>
          <IconButton aria-label="delete">
            <Delete color="secondary" />
          </IconButton>
        </ListItem>
        <Divider />
      </List>
    );
  }

  function RequestsSent({ id, reciever, status, timestamp, photoUrl }) {
    return (
      <List>
        <ListItem button>
          <Avatar src={photoUrl} className="md:mx-4 mr-2" />
          <ListItemText primary={reciever} secondary={status} />
        </ListItem>
        <Divider />
      </List>
    );
  }

  return (
    <React.Fragment>
      <Contacts variant="outlined" color="primary" onClick={handleClickOpen} />
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Grid container>
          <Grid item xs={12} sm={7} border={1}>
            <ListItem style={{ margin: "1.2rem 0" }}>
              <Typography variant="h4" className={classes.title}>
                Contacts
              </Typography>
            </ListItem>
            {confirmedRequests?.map((m, i) => (
              <ConfirmedRequests
                username={m.username}
                contact={m.contact}
                timestamp={m.timestamp}
                photoUrl={m.photoUrl}
                key={i}
              />
            ))}
            {recievedRequests.length === 0 && (
              <ListItem className="mt-4  border-b-2">
                <h1 className="py-2 text-2xl font-light text-gray-500">
                  No requests yet
                </h1>{" "}
              </ListItem>
            )}
          </Grid>
          {/* //new contact list grid */}
          <Grid xs={12} sm={5}>
            <Grid item>
              <ListItem className="mt-4  border-b-2">
                <Typography variant="h4">Recieved chat requests</Typography>
              </ListItem>
              {recievedRequests?.map((m, i) => {
                if (m.status === "pending") {
                  return <RequestsRecieved data={m} key={i} />;
                }
              })}
              {!recievedRequests.every((x) => x.status === "pending") && (
                <ListItem className="mt-4  border-b-2">
                  <h1 className="py-2 text-2xl font-light text-gray-500">
                    No requests recieved yet
                  </h1>
                </ListItem>
              )}
            </Grid>
            <Grid item>
              <ListItem className="mt-4 border-b-2">
                <Typography variant="h4">Your sent requests</Typography>
              </ListItem>
              {sentRequests?.map((m, i) => (
                <RequestsSent
                  reciever={m.reciever}
                  timestamp={m.timestamp}
                  photoUrl={m.photoUrl}
                  status={m.status}
                  key={i}
                />
              ))}
              {sentRequests.length === 0 && (
                <ListItem>
                  <h1 className="py-2 text-2xl font-light text-gray-500">
                    No requests yet
                  </h1>
                </ListItem>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
    </React.Fragment>
  );
}
