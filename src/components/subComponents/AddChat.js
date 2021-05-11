import React, { useState, useContext } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import { Chat } from "@material-ui/icons";
import validator from "validator";
import { db } from "../../firebase";
import UserContext from "../../context/user";
import firebase from "firebase";
export default function AddChat() {
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState("");
  const [error, setError] = useState("");
  const [addButton, setAddButton] = useState(true);
  const [message, setMessage] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [processing, setProcessing] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const getPhotoURL = () => {
    db.collection("users")
      .where("email", "==", newChatEmail)
      .get()
      .then((photo) => {
        // console.log(photo.docs[0].data());
        setPhotoURL(photo.docs[0].data().photoURL);
      })
      .catch((err) => {
        console.error("PHOTO URL ERROR", err);
      });
  };
  const validateEmail = (email) => {
    if (validator.isEmail(email)) {
      setError("");
      return true;
    } else {
      setError("Enter valid Email!");
      return false;
    }
  };
  const userAvailable = async () => {
    const isEmailAvailable = await db
      .collection("users")
      .where("email", "==", newChatEmail)
      .get()
      .catch((err) => {
        setError(err.message);
        console.error("error in userAvailable", err);
      });
    return isEmailAvailable.docs.length;
    //returns 0 if unavailable 1 if available
  };
  const getMyDocId = async () => {
    const getMyDocId = await db
      .collection("users")
      .where("email", "==", user.email)
      .get()
      .catch((err) => {
        setError(err.message);
        console.error("error in getMyDocId", err);
      });
    return getMyDocId.docs[0].id;
  };
  const addNewChatRequest = async (myDocId) => {
    getPhotoURL();
    console.log(photoURL);
    await db
      .collection("users")
      .doc(myDocId)
      .collection("chatRequests")
      .doc(newChatEmail)
      .set({
        email: newChatEmail,
        status: "pending",
        type: "requested",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        photoURL: photoURL,
      })
      .then((msg) => {
        setMessage("Chat request has been sent,wait for confirmation");
        console.log("chat request sent", msg);
      })
      .catch((error) => {
        setError(error.message);
      });
  };
  const checkPendingRequest = async (myDocId) => {
    const checkRequest = await db
      .collection("users")
      .doc(myDocId)
      .collection("chatRequests")
      .where("email", "==", newChatEmail)
      .get()
      .catch((err) => {
        setError(err.message);
        console.error("err", err);
      });
    return checkRequest;
  };
  const requestNewChat = async () => {
    setProcessing(true);
    setError("");
    setMessage("");
    if (validateEmail(newChatEmail)) {
      const isuserAvailable = await userAvailable();
      console.log(isuserAvailable); //check is given email is available or not
      if (isuserAvailable) {
        const myDocId = await getMyDocId();
        console.log("MY DOC ID", myDocId);
        const requestStatus = await checkPendingRequest(myDocId); //check if request is already sent or not
        if (requestStatus.empty) {
          const addNewRequest = await addNewChatRequest(myDocId); //add new chat request
        } else {
          //check if chat status is pending or accepted
          requestStatus.forEach((x) => {
            x.data().status === "pending"
              ? setError("Request already pending")
              : setError("Request already accepted find it in your chat box");
          });
        }
      } else {
        console.log("user unavailable");
        setError("User unavailable");
      }
    }
    setProcessing(false);
  };
  return (
    <div>
      <IconButton onClick={handleClickOpen}>
        <Chat />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add new contact</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add new contact by entering their email. The contact will be added
            when they confirm your request
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            value={newChatEmail}
            onChange={(e) => setNewChatEmail(e.target.value)}
            fullWidth
          />

          {message && (
            <p className="text-sm text-green-500 text-left">{message}</p>
          )}

          {error && <p className="text-sm text-red-500 text-right">{error}</p>}
        </DialogContent>
        {!processing && (
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={requestNewChat} color="primary">
              Add
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
}
