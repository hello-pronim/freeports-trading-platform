import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  CssBaseline,
  FormControlLabel,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import * as dotenv from "dotenv";

import useAuth from "../../../hooks";

dotenv.config();

const Copyright = (): React.ReactElement => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      Copyright © {process.env.REACT_APP_NAME} {new Date().getFullYear()}.
    </Typography>
  );
};
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
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
  progressButtonWrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  progressButton: {
    color: theme.palette.primary.main,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));
const SignIn = (): React.ReactElement => {
  const { authStep, signIn, loading, error } = useAuth();
  const classes = useStyles();
  const [formInput, setFormInput] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleLoginSubmit = (e: any) => {
    e.preventDefault();

    signIn(formInput);
  };
  const handleInput = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;

    setFormInput({ ...formInput, [name]: value });
  };

  useEffect(() => {
    if (error.errorType !== "") {
      setErrorMessage(error.message);
    }
  }, [error]);

  if (authStep === "otp") {
    return <Redirect to="/signin-otp" />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} onSubmit={handleLoginSubmit}>
          <TextField
            autoFocus
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            onChange={handleInput}
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
            onChange={handleInput}
          />
          {error !== "" ? (
            <Typography component="p" variant="caption" color="error">
              {errorMessage}
            </Typography>
          ) : (
            <></>
          )}
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <div className={classes.progressButtonWrapper}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={loading}
            >
              Sign In
            </Button>
            {loading && (
              <CircularProgress size={24} className={classes.progressButton} />
            )}
          </div>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default SignIn;
