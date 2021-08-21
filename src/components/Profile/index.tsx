/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  makeStyles,
  Snackbar,
  TextField,
  Typography,
  Tooltip,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { Form } from "react-final-form";
import { TextField as MuiTextField } from "mui-rff";
import { useProfileSlice } from "./slice";
import { selectProfile } from "./slice/selectors";

import {
  open,
  close,
  clearKey,
  saveKey
} from "../../util/keyStore/keystore";
import {
  generateKeyPair,
  importPrivateKeyFromFile,
  publicKeyToString,
} from "../../util/keyStore/functions";
import defaultAvatar from "../../assets/images/profile.jpg";
import { updatePassword } from "../../services/authService";
import { generateCertificationEmojis } from "../../util/sas";
import { selectKeyList, selectRemoteKey } from "../../slice/selectors";
import { globalActions } from "../../slice";
import { addPublicKey, revokeKey } from "../../services/profileService";
import { userPublicKeyStatus } from "../../util/constants";
import { useAuth } from "../../hooks";

const useStyles = makeStyles((theme) => ({
  saveBtn: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  profileImageContainer: {
    position: "relative",
    width: 200,
    height: 200,
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
  fileInput: {
    opacity: 0,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    cursor: "pointer",
  },
  cardHeader: {
    "& .MuiCardHeader-action": {
      marginTop: 0,
      "& button": {
        margin: "0 10px",
      },
    },
  },
  hiddenFileInput: {
    display: "none",
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
  emojiBlock: {
    display: "inline-block",
    margin: theme.spacing(1),
    textAlign: "center"
  },
  emojiIcon: {
    fontSize: "24px"
  },
  emojiName: {
    textTransform: "uppercase",
    fontSize: "12px"
  }
}));

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const validate = (values: any) => {
  const errors: { [key: string]: string } = {};

  if (!values.currentPassword) {
    errors.currentPassword = "This Field Required";
  }

  if (!values.newPassword) {
    errors.newPassword = "This Field Required";
  }

  if (!values.confirmNewPassword) {
    errors.confirmNewPassword = "This Field Required";
  }

  if (values.newPassword !== values.confirmNewPassword) {
    errors.confirmNewPassword = "Password doesn't match.";
  }

  return errors;
};

const Profile = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { actions } = useProfileSlice();
  const { profile } = useSelector(selectProfile);
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importKeyDialogOpen, setImportKeyDialogOpen] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const keyfileRef = useRef<HTMLInputElement | null>(null);
  const [passphrase, setPassPhrase] = useState("");
  const [importKeyPassword, setImportKeyPassword] = useState("");
  const keyList = useSelector(selectKeyList);
  const remoteKey = useSelector(selectRemoteKey);
  const [loading, setLoading] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [submitResponse, setSubmitResponse] = useState({
    type: "success",
    message: "",
  });
  const [emojisDialogOpen, setEmojisDialogOpen] = useState(false);
  const [certificationEmojis, setCertificationEmojis] = useState<any>([]);
  const [revokeKeyDlgOpen, setRevokeKeyDlgOpen] = useState(false);
  const { checkPublicKey } = useAuth();

  useEffect(() => {
    dispatch(actions.getProfile());
  }, []);

  useEffect(() => {
    if (importedFile !== null) {
      setImportKeyDialogOpen(true);
    }
  }, [importedFile]);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (files && files.length) {
      setAvatar(URL.createObjectURL(files[0]));
    }
  };

  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleImportFileDialogOpen = () => {
    if (keyfileRef.current !== null) keyfileRef.current.click();
  };

  const onFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (files && files.length) {
      setImportedFile(files[0]);
    }
  };

  const handleImportKeyDialogClose = () => {
    setImportKeyDialogOpen(false);
  };

  const onPassPhraseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setPassPhrase(value);
  };

  const onImportKeyPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setImportKeyPassword(value);
  };

  const addCertification = async (cert: any, saveToServer: boolean) => {
    await saveKey(cert.publicKey, cert.privateKey, cert.name);
    
    const newList = [...keyList];
    newList.push(cert);

    if(saveToServer) {
      const keyString = await publicKeyToString(cert.publicKey);
      await addPublicKey(keyString, cert.name);

      let newRemoteKey = null;
      const res = await checkPublicKey();
      if(res.success) {
        newRemoteKey = res.data;
      }

      dispatch(globalActions.setCertification({
        keyList: newList, 
        remoteKey: newRemoteKey
      }));
    } else {
      dispatch(globalActions.setKeyList(newList));
    }
  }

  const onCreateCertificate = async () => {
    setLoading(true);

    const results = await generateKeyPair('public_key', passphrase);
    await addCertification(results, true);

    setLoading(false);
    setCreateDialogOpen(false);
  };

  const onImportKey = async () => {
    if (importedFile !== null) {
      setLoading(true);

      const results = await importPrivateKeyFromFile(
        importedFile,
        importKeyPassword
      );
      const saveToServer = remoteKey && remoteKey.status === userPublicKeyStatus.approved;
      await addCertification(results, !saveToServer);

      setLoading(false);
      setImportKeyDialogOpen(false);
    }
  };

  const onResetPassword = async (values: any) => {
    setUpdatingPassword(true);
    await updatePassword(profile.id, {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    })
    .then((data) => {
      if(data) {
        setSubmitResponse({
          type: "success",
          message: "Successfully reset your password!",
        });
      } else {
        setSubmitResponse({
          type: "error",
          message: "Failed to reset password.",
        });
      }
    })
    .catch((err) => {
      setSubmitResponse({
        type: "error",
        message: err.message,
      });
    });
    setUpdatingPassword(false);
    setShowAlert(true);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const onViewCertification = async (listItem: any) => {
    const keyString = await publicKeyToString(listItem.publicKey);
    const emojis = generateCertificationEmojis(keyString);
    setCertificationEmojis(emojis);
    setEmojisDialogOpen(true);
  }

  const onClearCertificate = async () => {
    await open();
    const res = await clearKey();
    await close();
    if(res === true) {
      dispatch(globalActions.setKeyList([]));
    } else {
      setSubmitResponse({
        type: "error",
        message: res,
      });
      setShowAlert(true);
    }
  }

  const onRevokeKey = async () => {
    setLoading(true);
    await revokeKey()
    .then((data) => {
      const newRemoteKey = {...remoteKey};

      newRemoteKey.status = userPublicKeyStatus.revoking;
      dispatch(globalActions.setRemoteKey(newRemoteKey));
    })
    .catch((err) => {
      console.info('REV', err);
      setSubmitResponse({
        type: "error",
        message: "Sorry, Failed to revoke your certificate.",
      });
    })
    .finally(() => {
      setRevokeKeyDlgOpen(false);
    });
    setLoading(false);
  };

  const handleRevokeKey = () => {
    setRevokeKeyDlgOpen(true);
  };

  const onCloseRevokeKeyDlg = () => {
    setRevokeKeyDlgOpen(false);
  }

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                className={classes.cardHeader}
                title={`Certificate (status: ${remoteKey ? remoteKey.status : 'empty'})`}
                action={
                  <>
                    {
                      keyList.length ? (
                        keyList.map((listItem: any) => {
                          return (
                            <React.Fragment key={listItem}>
                              <Button
                                onClick={() => onViewCertification(listItem)}
                                color="primary"
                                variant="contained"
                              >
                                View
                              </Button>
                              <Tooltip title="Clear from browser" placement="top" arrow>
                                <Button
                                  onClick={() => onClearCertificate()}
                                  color="primary"
                                  variant="contained"
                                >
                                  Clear
                                </Button>
                              </Tooltip>
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <>
                          {
                            (!remoteKey || remoteKey.status === userPublicKeyStatus.requesting)
                            && (
                              <Button
                                color="primary"
                                variant="contained"
                                onClick={handleCreateDialogOpen}
                              >
                                Create Certificate
                              </Button>
                            )
                          }
                          <Button
                            color="primary"
                            variant="contained"
                            onClick={handleImportFileDialogOpen}
                          >
                            Import Key
                          </Button>
                          <input
                            ref={keyfileRef}
                            type="file"
                            id="keyfile"
                            name="keyfile"
                            className={classes.hiddenFileInput}
                            onChange={onFileImport}
                          />
                        </>
                      )
                    }
                    {
                      (remoteKey && remoteKey.status === userPublicKeyStatus.approved)
                      && (
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={handleRevokeKey}
                        >
                          Revoke
                        </Button>  
                      )
                    }
                  </>
                }
              />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Personal Info" />
              <Divider />
              <CardContent>
                <Grid container alignItems="flex-start" spacing={2}>
                  <Grid item sm={12} md={6}>
                    <Grid container spacing={3}>
                      <Grid item sm={12}>
                        <TextField
                          InputProps={{ readOnly: true }}
                          id="nickname"
                          name="nickname"
                          label="Nickname"
                          variant="outlined"
                          value={profile.nickname}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                      <Grid item sm={12} md={6}>
                        <TextField
                          InputProps={{ readOnly: true }}
                          id="email"
                          name="email"
                          label="Email"
                          variant="outlined"
                          value={profile.email}
                          fullWidth
                        />
                      </Grid>
                      <Grid item sm={12} md={6}>
                        <TextField
                          InputProps={{ readOnly: true }}
                          label="Phone"
                          name="phone"
                          id="phone"
                          variant="outlined"
                          value={profile.phone}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                      <Grid item sm={12}>
                        <TextField
                          InputProps={{ readOnly: true }}
                          id="jobTitle"
                          name="jobTitle"
                          label="Job Title"
                          variant="outlined"
                          value={profile.jobTitle}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item sm={12} md={6}>
                    <Grid container alignItems="center" justify="center">
                      <div className={classes.profileImageContainer}>
                        <Avatar
                          src={avatar}
                          alt="Avatar"
                          className={classes.profileImage}
                        />
                        <input
                          type="file"
                          name="avatar"
                          className={classes.fileInput}
                          onChange={onAvatarChange}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Form
              onSubmit={onResetPassword}
              validate={validate}
              render={({
                handleSubmit
              }) => (
                <form onSubmit={handleSubmit} noValidate>
                  <Card>
                    <CardHeader title="Password update" />
                    <Divider />
                    <CardContent>
                      <Grid container alignItems="flex-start" spacing={2}>
                        <Grid item xs={12}>
                          <Grid container>
                            <Grid item sm={12} md={6}>
                              <Grid container spacing={3}>
                                <Grid item sm={12}>
                                  <MuiTextField
                                    required
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    label="Current Password"
                                    variant="outlined"
                                    fullWidth
                                  />
                                </Grid>
                              </Grid>
                              <Grid container spacing={3}>
                                <Grid item sm={12}>
                                  <MuiTextField
                                    required
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    label="New Password"
                                    variant="outlined"
                                    fullWidth
                                  />
                                </Grid>
                              </Grid>
                              <Grid container spacing={3}>
                                <Grid item sm={12}>
                                  <MuiTextField
                                    required
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    type="password"
                                    label="Confirm New Password"
                                    variant="outlined"
                                    fullWidth
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Grid container direction="row-reverse">
                        <div className={classes.progressButtonWrapper}>
                          <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={updatingPassword}
                          >
                            Reset
                          </Button>
                          {updatingPassword && (
                            <CircularProgress
                              size={24}
                              className={classes.progressButton}
                            />
                          )}
                        </div>
                      </Grid>
                    </CardActions>
                  </Card>
                </form>
              )}
            />
          </Grid>
          <Dialog
            open={createDialogOpen}
            onClose={handleCreateDialogClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Create Certificate</DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    required
                    margin="dense"
                    id="passphrase"
                    name="passphrase"
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={passphrase}
                    onChange={onPassPhraseChange}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions>
              <Button onClick={handleCreateDialogClose} variant="contained">
                Cancel
              </Button>
              <div className={classes.progressButtonWrapper}>
                <Button
                  onClick={onCreateCertificate}
                  color="primary"
                  variant="contained"
                  disabled={loading}
                >
                  Create
                </Button>
                {loading && (
                  <CircularProgress
                    size={24}
                    className={classes.progressButton}
                  />
                )}
              </div>
            </DialogActions>
          </Dialog>
          <Dialog
            open={importKeyDialogOpen}
            onClose={handleImportKeyDialogClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Enter Password</DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    required
                    margin="dense"
                    id="passphrase"
                    name="passphrase"
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={importKeyPassword}
                    onChange={onImportKeyPasswordChange}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions>
              <Button onClick={handleImportKeyDialogClose} variant="contained">
                Cancel
              </Button>
              <div className={classes.progressButtonWrapper}>
                <Button
                  onClick={onImportKey}
                  color="primary"
                  variant="contained"
                  disabled={loading}
                >
                  Import Key
                </Button>
                {loading && (
                  <CircularProgress
                    size={24}
                    className={classes.progressButton}
                  />
                )}
              </div>
            </DialogActions>
          </Dialog>
        </Grid>
        <Snackbar
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={showAlert}
          onClose={handleAlertClose}
        >
          <Alert
            onClose={handleAlertClose}
            severity={
              submitResponse.type === "success" ? "success" : "error"
            }
          >
            {submitResponse.message}
          </Alert>
        </Snackbar>
        <Dialog
            open={emojisDialogOpen}
            onClose={() => setEmojisDialogOpen(false)}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Certification</DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container>
                <Grid item xs={12}>
                  {certificationEmojis.map((emoji: any) => {
                    return (
                      <div className={classes.emojiBlock} key={emoji}>
                        <div className={classes.emojiIcon}>
                            { emoji[0] }
                        </div>
                        <div className={classes.emojiName}>
                            { emoji[1] }
                        </div>
                      </div>
                    )
                  })}
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions>
              <Button 
                onClick={() => setEmojisDialogOpen(false)}
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={revokeKeyDlgOpen}
            onClose={onCloseRevokeKeyDlg}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Revoke Certificate</DialogTitle>
            <Divider />
            <DialogContent>
              You are about to rekove your certificate.
            </DialogContent>
            <DialogActions>
              <Button onClick={onCloseRevokeKeyDlg} variant="contained">
                Cancel
              </Button>
              <div className={classes.progressButtonWrapper}>
                <Button
                  onClick={onRevokeKey}
                  color="primary"
                  variant="contained"
                  disabled={loading}
                >
                  Revoke
                </Button>
                {loading && (
                  <CircularProgress
                    size={24}
                    className={classes.progressButton}
                  />
                )}
              </div>
            </DialogActions>
          </Dialog>
      </Container>
    </div>
  );
};

export default Profile;
