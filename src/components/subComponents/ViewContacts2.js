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
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  var myDocId, cc;
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);
  const [confirmedContacts, setConfirmedContacts] = useState([]);
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
    console.log("use effect runnin ");
    db.collection("users")
      .doc(user.uid)
      .collection("chatRequests")
      .onSnapshot((snap) => {
        setContacts(
          snap.docs.map((doc) => {
            console.log(doc.data().status);
            if (doc.data().status === "pending") {
              return {
                id: doc.id,
                status: doc.data().status,
                timestamp: doc.data().timestamp,
                photoURL: doc.data().photoURL,
              };
            }
          })
        );
        setConfirmedContacts(
          snap.docs.map((doc) => {
            console.log(doc.data().status);
            if (doc.data().status === "confirmed") {
              return {
                id: doc.id,
                status: doc.data().status,
                timestamp: doc.data().timestamp,
                photoURL: doc.data().photoURL,
              };
            } else {
              return null;
            }
          })
        );
        // snap.forEach((x) => console.log("SNAPX", x.data()));
      });
  }, [db]);
  console.log("CONTACTS", confirmedContacts);
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
  function PendingRequests({ id, status, time, photoURL }) {
    return (
      <List>
        <ListItem button>
          <div className="h-10 w-10 rounded-full overflow-hidden border mx-4">
            <img src={photoURL} alt="" className="object-contain" />
          </div>
          <ListItemText primary={id} secondary={status} />
          <IconButton>
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
            {confirmedContacts.map((m) => (
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
          <Grid item xs={12} sm={6}>
            <ListItem style={{ margin: "1.2rem 0" }}>
              <Typography variant="h4" className={classes.title}>
                New chat request
              </Typography>
            </ListItem>
            {contacts.map((m) => (
              <PendingRequests
                id={m.id}
                key={m.id}
                status={m.status}
                time={m.timestamp}
                photoURL={m.photoURL}
              />
            ))}
          </Grid>
        </Grid>
      </Dialog>
    </>
  );
}
