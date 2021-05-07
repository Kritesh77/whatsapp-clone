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
  const [error, setError] = useState("");
  const isInValid = password === "" || email === "";
  // console.log("form is in valid ?", isInValid);
  useEffect(() => {
    document.title = "Login ";
  }, []);
  const handleSignin = async (event) => {
    event.preventDefault();
    await auth.signInWithEmailAndPassword(email, password).catch((error) => {
      setPassword("");
      //   setError(error.message);
      console.log(error.message);
    });
  };

  const googleLogin = async () => {
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
        .add({
          userId: createdUserResult.user.uid,
          username: createdUserResult.user.displayName.toLowerCase(),
          email: createdUserResult.user.email.toLowerCase(),
          dateCreated: Date.now(),
        })
        .catch((error) => alert(error.message));
    } else {
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
            Sign in
          </Typography>
          <Typography component="h4" variant="h6">
            {error && { error }}
          </Typography>
          <form className={classes.form} onSubmit={handleSignin} method="post">
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
              Sign In
            </Button>

            <h1>
              Login with
              <span
                onClick={googleLogin}
                className="font-bold text-red-600 cursor-pointer"
              >
                Google
              </span>
            </h1>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}
