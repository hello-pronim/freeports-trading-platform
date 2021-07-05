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
  TextField,
  Typography,
} from "@material-ui/core";

import { useProfileSlice } from "./slice";
import { selectProfile } from "./slice/selectors";
import { keyPairType } from "./slice/types";

import { open, listKeys, close } from "../../util/keyStore/keystore";
import {
  createDataUrlFromByteArray,
  escapeHTML,
  generateAndSaveKeyPair,
  importPrivateKeyFromFile,
} from "../../util/keyStore/functions";
import defaultAvatar from "../../assets/images/profile.jpg";
import { Vault } from "../../vault";

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
}));

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
  const [key, setKey] = useState("");
  const [passphrase, setPassPhrase] = useState("");
  const [importKeyPassword, setImportKeyPassword] = useState("");
  const [keyList, setKeyList] = useState<
    Array<{
      publicKey: CryptoKey | null;
      privateKey: CryptoKey | null;
      name: string;
      spki: ArrayBuffer;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    if (keyList[0] && keyList[0].privateKey) {
      const vault = new Vault(keyList[0].privateKey, keyList[0].spki);

      const getToken = async () => {
        const results = await vault.authenticate();
      };

      getToken();
    }
  }, [keyList]);
  useEffect(() => {
    dispatch(actions.getProfile());

    const getKeyList = async () => {
      await open();
      await listKeys()
        .then((list) => {
          console.log("list ", list);
          const storedKeyList: Array<keyPairType> = [];
          list.forEach((item: { id: number; value: keyPairType }) =>
            storedKeyList.push(item.value)
          );
          setKeyList(storedKeyList);
        })
        .catch((err) => {
          alert(`Could not list keys: ${err.message}`);
        });

      await close();
    };

    getKeyList();
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

  const onKeyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setKey(value);
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

  const addToKeyList = (savedObject: any) => {
    const newList = [...keyList];

    newList.push(savedObject);
    setKeyList(newList);
  };

  const onCreateCertificate = async () => {
    setLoading(true);

    const results = await generateAndSaveKeyPair(key, passphrase);

    addToKeyList(results);

    setLoading(false);
    setCreateDialogOpen(false);
  };

  const onImportKey = async () => {
    setLoading(true);

    if (importedFile !== null) {
      const results = await importPrivateKeyFromFile(
        importedFile,
        importKeyPassword
      );
      addToKeyList(results);

      setLoading(false);
      setImportKeyDialogOpen(false);
    }
  };

  const onDownload = (name: string, dataUrl: string) => {
    const link = document.createElement("a");
    link.download = `${name}.publickey`;
    link.href = dataUrl;
    link.click();
  };

  const onResetPassword = () => {
    console.log(currentPassword, newPassword, confirmNewPassword);
  };

  const onCurrentPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setCurrentPassword(value);
  };

  const onNewPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setNewPassword(value);
  };

  const onConfirmNewPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setConfirmNewPassword(value);
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                className={classes.cardHeader}
                title="Certificate"
                action={
                  keyList.length > 0 ? (
                    keyList.map((listItem: any) => {
                      const dataUrl = createDataUrlFromByteArray(
                        new Uint8Array(listItem.spki)
                      );
                      const name = escapeHTML(listItem.name);
                      return (
                        <Button
                          key={name}
                          onClick={() => onDownload(name, dataUrl)}
                          color="primary"
                          variant="contained"
                        >
                          Download
                        </Button>
                      );
                    })
                  ) : (
                    <>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={handleCreateDialogOpen}
                      >
                        Create Certificate
                      </Button>
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
            <Card>
              <CardHeader title="Reset Password" />
              <Divider />
              <CardContent>
                <Grid container alignItems="flex-start" spacing={2}>
                  <Grid item xs={12}>
                    <Grid container>
                      <Grid item sm={12} md={6}>
                        <Grid container spacing={3}>
                          <Grid item sm={12}>
                            <TextField
                              onChange={onCurrentPasswordChange}
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
                            <TextField
                              onChange={onNewPasswordChange}
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
                            <TextField
                              onChange={onConfirmNewPasswordChange}
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
                  <Button
                    onClick={onResetPassword}
                    color="primary"
                    variant="contained"
                    type="submit"
                  >
                    Reset
                  </Button>
                </Grid>
              </CardActions>
            </Card>
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
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="key"
                    label="Key name"
                    variant="outlined"
                    fullWidth
                    value={key}
                    onChange={onKeyChange}
                  />
                </Grid>
              </Grid>
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
      </Container>
    </div>
  );
};

export default Profile;
