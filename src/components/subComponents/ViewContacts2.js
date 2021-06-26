import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  Avatar,
  Slide,
  Dialog,
  ListItemText,
  ListItem,
  List,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  Contacts,
  CheckRounded,
  CancelRounded,
  Delete,
  Close,
} from "@material-ui/icons";
import { createMuiTheme } from "@material-ui/core/styles";
import UserContext from "../../context/user";
import { db } from "../../firebase";

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
  var confirmedContactsMap, pendingRequestsMap, awaitedRequestsMap;
  const [pendingRequests, setpendingRequests] = useState([]);
  const [awaitedRequests, setAwaitedRequests] = useState([]);
  const [confirmedContacts, setConfirmedContacts] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const getMyDocId = async () => {
    const getMyDocId = await db
      .collection("users")
      .where("email", "==", user.email)
      .get()
      .then((x) => {
        x.forEach((y) => {
          console.log(y.data());
        });
        // console.log(x.docs);
      })
      .catch((err) => {
        setError(err.message);
        console.error("error in getMyDocId", err);
      });
  };
  // getMyDocId();
  useEffect(() => {
    setpendingRequests([]);
    setConfirmedContacts([]);
    setAwaitedRequests([]);
    console.log("use effect runnin ");
    var contactSnapshot = db
      .collection("chatRequests") //sent requests
      .where("sender", "==", user.email);

    var pendingSnapshot = db
      .collection("chatRequests")
      .where("reciever", "==", user.email);

    var confirmedSnapshot = db
      .collection("chatRequests")
      .where("status", "==", "confirmed");

    confirmedSnapshot.onSnapshot((snap) => {
      snap.docs.map((doc) => {
        console.log(doc.data().status);
        if (
          doc.data().sender === user.email ||
          doc.data().reciever === user.email
        ) {
          let newContact = {
            id: doc.id,
            reciever: doc.data().reciever,
            sender: doc.data().sender,
            status: doc.data().status,
            timestamp: doc.data().timestamp,
            photoURL: doc.data().photoURL,
          };
          console.log(
            "%c  before",
            "background: #222; color: red",
            awaitedRequests
          );
          setConfirmedContacts((prevState) => [...prevState, newContact]);
          console.log(
            "%c  after",
            "background: #222; color: red",
            awaitedRequests
          );
        } else if (doc.data().status === "confirmed") {
        }
      });
    });
    contactSnapshot.onSnapshot((snap) => {
      snap.docs.map((doc) => {
        console.log(doc.data().status);
        if (doc.data().status === "pending") {
          let newContact = {
            id: doc.id,
            reciever: doc.data().reciever,
            status: doc.data().status,
            timestamp: doc.data().timestamp,
            photoURL: doc.data().photoURL,
          };
          console.log(
            "%c  before",
            "background: #222; color: red",
            awaitedRequests
          );
          setAwaitedRequests((prevState) => [...prevState, newContact]);
          console.log(
            "%c  after",
            "background: #222; color: red",
            awaitedRequests
          );
        } else if (doc.data().status === "confirmed") {
        }
      });
    });

    pendingSnapshot.onSnapshot((snap) => {
      snap.docs.map((doc) => {
        console.log(doc.data().status);
        if (doc.data().status === "pending") {
          let newContact = {
            id: doc.id,
            sender: doc.data().sender,
            status: doc.data().status,
            timestamp: doc.data().timestamp,
            photoURL: doc.data().photoURL,
          };
          console.log(
            "%c  before",
            "background: #222; color: red",
            pendingRequests
          );
          setpendingRequests((prevState) => [...prevState, newContact]);
          console.log(
            "%c  after",
            "background: #222; color: red",
            pendingRequests
          );
        } else if (doc.data().status === "confirmed") {
        }
      });
    });
  }, [db]);
  // console.log(
  //   "%c setPEnding request",
  //   "background: #222; color: red",
  //   pendingRequests
  // );

  const handleConfirmChat = async (docId) => {
    console.log(docId);
    await db
      .collection("chatRequests")
      .doc(docId)
      .update({
        status: "confirmed",
      })
      .then((x) => {
        console.log("confirm success");
      })
      .catch((err) => {
        console.error(err.message);
      });
      // await db.collection("chatRooms").add({
      //   member1:
      // })
  };
  console.log("pendingRequests", pendingRequests);
  // console.log("awaitedRequests", awaitedRequests);
  // console.log("confirmedContacts", confirmedContacts);
  function ConfirmedContacts({ id, status, time, photoURL }) {
    return (
      <List>
        <ListItem button>
          <div className="h-10 w-10 rounded-full overflow-hidden border mx-4">
            <img src={photoURL} alt="" className="object-contain " />
          </div>
          <ListItemText primary={id} secondary={status} />
        </ListItem>
        <Divider />
      </List>
    );
  }

  function PendingRequests({ id, sender, status, time, photoURL }) {
    return (
      <List>
        <ListItem button>
          <div className="h-10 w-10 rounded-full overflow-hidden border mx-4">
            <img src={photoURL} alt="" className="object-contain" />
          </div>
          <ListItemText primary={sender} secondary={status} />
          <IconButton onClick={() => handleConfirmChat(id)}>
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

  function AwaitedRequests({ id, reciever, status, time, photoURL }) {
    return (
      <List>
        <ListItem button>
          <div className="h-10 w-10 rounded-full overflow-hidden border mx-4">
            <img src={photoURL} alt="" className="object-contain" />
          </div>
          <ListItemText primary={reciever} secondary={status} />
        </ListItem>
        <Divider />
      </List>
    );
  }

  return (
    <>
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
          <Grid item xs={12} sm={6} border={1}>
            <ListItem style={{ margin: "1.2rem 0" }}>
              <Typography variant="h4" className={classes.title}>
                Contacts
              </Typography>
            </ListItem>
            {confirmedContacts?.map((m) => (
              <ConfirmedContacts
                id={m.id}
                key={m.id}
                status={m.status}
                time={m.timestamp}
                photoURL={m.photoURL}
              />
            ))}
          </Grid>
          {/* //new contact list grid */}
          <Grid xs={12} sm={6}>
            <Grid item>
              <ListItem style={{ margin: "1.2rem 0" }}>
                <Typography variant="h4" className={classes.title}>
                  New chat request
                </Typography>
              </ListItem>
              {pendingRequests?.map((m) => (
                <PendingRequests
                  sender={m.sender}
                  id={m.id}
                  key={m.id}
                  status={m.status}
                  time={m.timestamp}
                  photoURL={m.photoURL}
                />
              ))}
            </Grid>
            <Grid item>
              <ListItem style={{ margin: "1.2rem 0" }}>
                <Typography variant="h4" className={classes.title}>
                  Your awaited requests
                </Typography>
              </ListItem>
              {awaitedRequests?.map((m) => (
                <AwaitedRequests
                  reciever={m.reciever}
                  id={m.id}
                  key={m.id}
                  status={m.status}
                  time={m.timestamp}
                  photoURL={m.photoURL}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
    </>
  );
}
