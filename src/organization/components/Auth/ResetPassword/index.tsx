import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import { 
  Avatar,
  Box,
  CircularProgress,
  Container, 
  CssBaseline,
  Button,
  Typography
} from "@material-ui/core";
import { Form } from "react-final-form";
import { TextField } from "mui-rff";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { useParams, useHistory } from "react-router";
import { resetPassword } from "../../../../services/authService";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    color: "white",
    backgroundColor: theme.palette.primary.main,
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

const validate = (values: any) => {
  const errors: { [key: string]: string } = {};

  if (!values.password) {
    errors.password = "This Field Required";
  }

  if (!values.confirmpassword) {
    errors.confirmpassword = "This Field Required";
  }

  if (values.password !== values.confirmpassword) {
    errors.confirmpassword = "Password doesn't match.";
  }

  return errors;
};

const Copyright = (): React.ReactElement => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      Copyright © {process.env.REACT_APP_NAME} {new Date().getFullYear()}.
    </Typography>
  );
};

const ResetPassword = (): React.ReactElement => {
  const history = useHistory();
  const classes = useStyles();
  
  const { userId, token }: any = useParams();

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOnSubmit = async (values: any) => {
    setLoading(true);
    await resetPassword(userId, {
      password: values.password,
      token
    })
      .then((data) => {
        history.push(`/signin`);
      })
      .catch((err) => {
        if (err && err.errorType !== "") {
          setErrorMessage(err.message);
        }
      });
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Your Password
        </Typography>
        <Form
          onSubmit={handleOnSubmit}
          validate={validate}
          render={({
            handleSubmit
          }) => (
            <form onSubmit={handleSubmit} noValidate className={classes.form}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="confirmpassword"
                label="Confirm Password"
                type="password"
                id="confirmpassword"
              />
              {errorMessage !== "" ? (
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
                  Reset
                </Button>
                {loading && (
                  <CircularProgress size={24} className={classes.progressButton} />
                )}
              </div>
            </form>
          )}
        />
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

// CoWorkerForm.defaultProps = defaultProps;
export default ResetPassword;
