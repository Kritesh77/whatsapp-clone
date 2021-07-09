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
import LoadingOverlay from "react-loading-overlay";
import getDocId from "../../hooks/get-doc-id";
import usernameExists from "../../hooks/does-username-exist";
import getPhotoUrl from "../../hooks/get-photoUrl";
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
  const [processing, setProcessing] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
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

  const addNewChatRequest = async (myDocId) => {
    const recieversDocId = await getDocId(newChatEmail);
    const recieverPhotoUrl = await getPhotoUrl(newChatEmail);

    //add to requests sent to this user(myDocId)
    await db
      .collection("users")
      .doc(myDocId)
      .collection("requestsSent")
      .doc(newChatEmail)
      .set({
        reciever: newChatEmail,
        status: "pending",
        photoUrl: recieverPhotoUrl,
        type: "sent",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        setMessage("Chat request has been sent,wait for confirmation");
        console.log("chat request sent");
      })
      .catch((error) => {
        setError(error.message);
      });
    //add to reciever to the newChatEmail
    await db
      .collection("users")
      .doc(recieversDocId)
      .collection("requestsRecieved")
      .doc(user.email)
      .set({
        sender: user.email,
        status: "pending",
        photoUrl: user.photoURL,
        type: "requested",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(console.log("Chat request sent to reciever database"))
      .catch((error) => {
        setError(error.message);
      });
  };
  const checkConfirmedRequest = async (myDocId) => {
    var requestData = false;
    const checkRequest = await db
      .collection("users")
      .doc(myDocId)
      .collection("requestsSent")
      .doc(newChatEmail)
      .get()
      .catch((err) => {
        setError(err.message);
        console.error("err", err);
      });
    console.log(checkRequest);
    return checkRequest;
  };
  const requestNewChat = async () => {
    setProcessing(true);
    setError("");
    setMessage("");
    if (validateEmail(newChatEmail)) {
      const isuserAvailable = await usernameExists(newChatEmail);
      console.log(isuserAvailable); //check is given email is available or not
      if (isuserAvailable) {
        const myDocId = await getDocId(user.email);
        const requestStatus = await checkConfirmedRequest(myDocId); //check if request is already sent or not
        console.log("check req  ", requestStatus);
        if (!requestStatus.exists) {
          const addNewRequest = await addNewChatRequest(myDocId); //add new chat request
        } else {
          if (requestStatus.data().status === "pending")
            setError("Request already pending");
          else if (requestStatus.data().status === "accepted")
            setMessage(
              "Request already accepted. Find user in your contacts and start chatting..."
            );
          else setError("Request declined by the ");
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
        <LoadingOverlay active={processing} spinner text="Processing...">
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

            {error && (
              <p className="text-sm text-red-500 text-right">{error}</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={requestNewChat} color="primary">
              Add
            </Button>
          </DialogActions>
        </LoadingOverlay>
      </Dialog>
    </div>
  );
}
