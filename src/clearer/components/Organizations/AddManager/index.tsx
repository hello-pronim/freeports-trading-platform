/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from "react";
import { useParams, useHistory } from "react-router";
import { Form } from "react-final-form";
import { TextField, Select } from "mui-rff";
import arrayMutators from "final-form-arrays";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  FormControl,
  makeStyles,
  Snackbar,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import { useOrganization } from "../../../../hooks";

const useStyle = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  profileImageContainer: {
    position: "relative",
    width: 200,
    height: 200,
    margin: "auto",
    "&:hover, &:focus": {
      "& $profileImage": {
        opacity: 0.5,
      },
    },
  },
  profileImage: {
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  profileFileInput: {
    opacity: 0,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    cursor: "pointer",
  },
}));

const validate = (values: any) => {
  const errors: {
    nickname?: string;
    email?: string;
    password?: string;
    phone?: string;
  } = {};
  if (!values.nickname) {
    errors.nickname = "This Field Required";
  }
  if (!values.email) {
    errors.email = "This Field Required";
  }
  if (!values.phone) {
    errors.phone = "This Field Required";
  }
  return errors;
};

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const AddManager = (): React.ReactElement => {
  const classes = useStyle();
  const history = useHistory();
  const { addManager } = useOrganization();
  const { organizationId }: any = useParams();
  const [managerAvatar, setManagerAvatar] = useState("");
  const [submitResponse, setSubmitResponse] = useState({
    type: "success",
    message: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = React.useRef<number>();

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (files && files.length) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setManagerAvatar(event.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    setShowAlert(false);
    setSubmitResponse({ type: "", message: "" });
    const additional = await addManager(
      organizationId,
      values.nickname,
      values.email,
      values.phone,
      managerAvatar
    )
      .then((res: any) => {
        setSubmitResponse({
          type: "success",
          message: "Manager has been created successfully.",
        });
        setShowAlert(true);
        timer.current = window.setTimeout(() => {
          setLoading(false);
          history.push(`/organizations/edit/${organizationId}`);
        }, 2000);
      })
      .catch((err: any) => {
        setLoading(false);
        setSubmitResponse({
          type: "error",
          message: err.message,
        });
        setShowAlert(true);
      });
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Form
          onSubmit={onSubmit}
          initialValues={{
            nickname: "",
            email: "",
            phone: "",
          }}
          mutators={{
            ...arrayMutators,
          }}
          validate={validate}
          render={({
            handleSubmit,
            form: {
              mutators: { push, pop },
            },
            values,
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              <Card>
                <CardHeader title="Add New Manager" />
                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid item xs={6}>
                      <Grid container>
                        <Grid item xs={12}>
                          <FormControl
                            fullWidth
                            className={classes.margin}
                            variant="outlined"
                          >
                            <TextField
                              required
                              id="outlined-adornment-amount"
                              label="Manager name"
                              name="nickname"
                              variant="outlined"
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <FormControl
                                fullWidth
                                className={classes.margin}
                                variant="outlined"
                              >
                                <TextField
                                  required
                                  id="outlined-adornment-amount"
                                  label="Email"
                                  name="email"
                                  variant="outlined"
                                />
                              </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                              <FormControl
                                fullWidth
                                className={classes.margin}
                                variant="outlined"
                              >
                                <TextField
                                  required
                                  id="outlined-adornment-amount"
                                  label="Phone"
                                  name="phone"
                                  variant="outlined"
                                />
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={6}>
                      <Grid container justify="center" alignItems="center">
                        <div className={classes.profileImageContainer}>
                          <Avatar
                            src={managerAvatar}
                            alt="Avatar"
                            className={classes.profileImage}
                          />
                          <input
                            type="file"
                            name="avatar"
                            className={classes.profileFileInput}
                            onChange={onAvatarChange}
                          />
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
                <Divider />
                <CardActions>
                  <Grid item container xs={12} justify="flex-end">
                    <Button variant="contained" color="primary" type="submit">
                      Submit
                    </Button>
                  </Grid>
                </CardActions>
              </Card>
            </form>
          )}
        />

        <Snackbar
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={showAlert}
          onClose={handleAlertClose}
        >
          <Alert
            onClose={handleAlertClose}
            severity={submitResponse.type === "success" ? "success" : "error"}
          >
            {submitResponse.message}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default AddManager;
