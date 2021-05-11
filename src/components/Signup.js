import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import usernameExists from "../hooks/does-username-exist";
import firebase from "firebase";
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  image: {
    backgroundImage: "url(https://source.unsplash.com/random)",
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignInSide() {
  const classes = useStyles();
  const history = useHistory();
  console.log("history", history);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    document.title = "Login ";
  }, []);
  const handleSignup = async (event) => {
    event.preventDefault();
    const doesUsernameExists = await usernameExists(email);
    if (doesUsernameExists === 0) {
      console.log("%c User addinn", "background: #222; color: red");

      try {
        const createdUserResult = await auth.createUserWithEmailAndPassword(
          email,
          password
        );
        await db.collection("users").add({
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          userId: createdUserResult.user.uid,
          photoURL: createdUserResult.user.photoURL,
        });
      } catch (err) {
        setError(err.message);
        setEmail("");
      }
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setError("That username is already taken, please try another!");

      console.log("%c User already existing", "background: #222; color: red");
    }
  };

  const googleSignup = async () => {
    console.log("GOOGE LOGIN");
    const createdUserResult = await auth.signInWithPopup(provider);
    console.log("USER created result", createdUserResult);

    const doesUsernameExists = await usernameExists(
      createdUserResult.user.email
    );
    if (doesUsernameExists === 0) {
      console.log("%c Adding new user ", "background: #222; color: red");
      await db
        .collection("users")
        .doc(createdUserResult.user.uid)
        .set({
          userId: createdUserResult.user.uid,
          username: createdUserResult.user.displayName.toLowerCase(),
          email: createdUserResult.user.email.toLowerCase(),
          dateCreated: Date.now(),
        })
        .catch((err) => {
          setUsername("");
          setError(err.message);
          alert(error);
        });
    } else {
      setError(error.message);
      console.log("%c User already existing", "background: #222; color: red");
    }
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Signup
          </Typography>
          {error && (
            <p className="text-xs mb-2 text-center text-red-500">{error}</p>
          )}
          <form className={classes.form} onSubmit={handleSignup} method="post">
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign Up
            </Button>
            <Grid container>
              <Grid item xs>
                {"Signup with "}
                <span
                  onClick={googleSignup}
                  className="font-bold text-red-600 cursor-pointer"
                >
                  Google
                </span>
              </Grid>
              <Grid item>
                <Link to="/login" variant="body2">
                  {"Already having an account? Login"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}
