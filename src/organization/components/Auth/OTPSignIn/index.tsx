import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

import { useAuth } from "../../../../hooks";

const Copyright = (): React.ReactElement => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      Copyright © {process.env.REACT_APP_NAME}
      {new Date().getFullYear()}.
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
  qrCode: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
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
const OTPSignIn = (): React.ReactElement => {
  const {
    authStep,
    isAuthenticated,
    isOTPDefined,
    loading,
    error,
    generateQRCode,
    checkOTP,
  } = useAuth();
  const classes = useStyles();
  const [OTPassword, setOTPassword] = useState("");
  const [qrCode, setQRCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInput = (e: {
    target: {
      name: string;
      value: string;
    };
  }) => {
    const { value } = e.target;

    setOTPassword(value);
  };

  const handleOTPSubmit = (e: any) => {
    e.preventDefault();

    checkOTP(OTPassword);
  };

  useEffect(() => {
    let unmounted = false;

    const getQRCode = async () => {
      if (!isOTPDefined) {
        let qrImg = "";
        const qr = await generateQRCode();

        qrImg = `data:image/png;base64,${qr}`;
        if (!unmounted) setQRCode(qrImg);
      }
    };

    getQRCode();

    return () => {
      unmounted = true;
    };
  }, [isOTPDefined]);

  useEffect(() => {
    if (error && error.errorType !== "") {
      setErrorMessage(error.message);
    }
  }, [error]);

  if (authStep === "login") {
    return <Redirect to="/signin" />;
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {!isOTPDefined ? (
          <>
            <Typography component="h1" variant="subtitle1" align="center">
              Scan this QR Code image with any Google Authenticator compatible
              program
            </Typography>
            <div className={classes.qrCode}>
              <img src={qrCode} alt="QR Code" />
            </div>
          </>
        ) : (
          <></>
        )}
        <form className={classes.form} onSubmit={handleOTPSubmit}>
          {isOTPDefined ? (
            <Typography component="h1" variant="subtitle1" align="center">
              Input OTP code from any Google Authenticator compatible program
            </Typography>
          ) : (
            <></>
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="code"
            label="Confirm the OTP code"
            type="password"
            id="code"
            onChange={handleInput}
          />
          {error !== "" ? (
            <Typography component="p" variant="caption" color="error">
              {errorMessage}
            </Typography>
          ) : (
            <></>
          )}
          <div className={classes.progressButtonWrapper}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={loading}
            >
              Submit
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

export default OTPSignIn;
