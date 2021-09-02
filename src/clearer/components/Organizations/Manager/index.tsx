/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { useOrganization } from "../../../../hooks";
import {
  sendResetPasswordEmail,
  createVaultUser,
} from "../../../../services/clearerUsersService";
import { selectUser } from "../../../../slice/selectors";
import vault from "../../../../vault";
import { userPublicKeyStatus } from "../../../../util/constants";
import { generateCertificationEmojis } from "../../../../util/sas";

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  selectStyle: {
    width: "250px",
    fontWeight: "initial",
    marginLeft: 15,
  },
  managerName: {
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 15,
  },
  profileImageContainer: {
    position: "relative",
    width: 150,
    height: 150,
    margin: 20,
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
    textAlign: "center",
  },
  emojiIcon: {
    fontSize: "24px",
  },
  emojiName: {
    textTransform: "uppercase",
    fontSize: "12px",
  },
}));

interface managerType {
  id: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
}

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const Manager = (props: any): React.ReactElement => {
  const classes = useStyle();
  const { getManager, suspendManager, resumeManager, getOrganization } =
    useOrganization();
  const [suspended, setSuspended] = useState(true);
  const [manager, setManager] = useState({
    id: "string",
    nickname: "string",
    email: "string",
    phone: "string",
    avatar: "/assets/user4.png",
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [submitResponse, setSubmitResponse] = useState({
    type: "success",
    message: "",
  });
  const { orgId, managerId, managerUpdating, onHandleManagerUpdate } = props;
  const currentUser = useSelector(selectUser);
  const [viewAddToVault, setViewAddToVault] = useState(false);
  const [addingVaultUser, setAddingVaultUser] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [managerInfo, setManagerInfo] = useState<any>(null);
  const [publicKeyEmojisDialog, setPublicKeyEmojisDialog] = useState(false);
  const [publicKeyEmojis, setPublicKeyEmojis] = useState<any>([]);

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      const managerData = await getManager(orgId, managerId);
      setManagerInfo(managerData);
      setViewAddToVault(
        currentUser &&
          currentUser.vaultUserId &&
          currentUser.publicKey &&
          currentUser.publicKey.status === userPublicKeyStatus.approved &&
          managerData.publicKey &&
          managerData.publicKey.status === userPublicKeyStatus.requesting &&
          !managerData.vaultUserId
      );
      if (!mounted) {
        setManager({
          id: managerData.id,
          nickname: managerData.nickname,
          email: managerData.email,
          phone: managerData.phone,
          avatar: managerData.avatar,
        });
        if (managerData.suspended === "undefined") {
          setSuspended(false);
        } else {
          setSuspended(managerData.suspended);
        }
      }
    };

    init();
    return () => {
      mounted = true;
    };
  }, []);

  const onHandleName = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    const newManager = { ...manager };
    newManager.nickname = value;
    setManager(newManager);
  };

  const onHandleEmail = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    const newManager = { ...manager };
    newManager.email = value;
    setManager(newManager);
  };

  const onHandlePhone = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    const newManager = { ...manager };
    newManager.phone = value;
    setManager(newManager);
  };

  const updateSubmit = async () => {
    onHandleManagerUpdate(manager);
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (files && files.length) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const newManager = { ...manager };
        newManager.avatar = event.target.result;
        setManager(newManager);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSendResetPasswordLink = async () => {
    if (managerId) {
      setSendingEmail(true);
      await sendResetPasswordEmail(managerId)
        .then((data) => {
          setSubmitResponse({
            type: "success",
            message: "Successfully sent reset password email",
          });
        })
        .catch((err) => {
          setSubmitResponse({
            type: "error",
            message: err.message,
          });
        });
      setSendingEmail(false);
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const onClickSuspend = async (event: any) => {
    event.stopPropagation();
    setUpdatingStatus(true);
    if (suspended) {
      const res = await resumeManager(orgId, managerId);
      if (res) {
        setSubmitResponse({
          type: "success",
          message: "Manager reactivated",
        });
        setSuspended(false);
        setUpdatingStatus(false);
      } else {
        setSubmitResponse({
          type: "error",
          message: "Failed, try again",
        });
        setUpdatingStatus(false);
      }
    } else {
      const res = await suspendManager(orgId, managerId);
      if (res) {
        setSubmitResponse({
          type: "success",
          message: "Manager suspended",
        });
        setSuspended(true);
        setUpdatingStatus(false);
      } else {
        setSubmitResponse({
          type: "error",
          message: "Failed, try again",
        });
        setUpdatingStatus(false);
      }
    }
    setShowAlert(true);
  };

  const onClickAddVaultUser = async () => {
    if (managerInfo.id && managerInfo.publicKey) {
      setAddingVaultUser(true);
      const organization = await getOrganization(orgId);
      console.log(organization);
      const vaultRequest = await vault.createOrganizationManager(
        organization.vaultOrganizationId,
        managerInfo.publicKey.key
      );
      await createVaultUser(managerInfo.id, vaultRequest)
        .then(() => {
          setSubmitResponse({
            type: "success",
            message: "Successfully added vault user",
          });
          setViewAddToVault(false);
          setPublicKeyEmojisDialog(false);
        })
        .catch((err) => {
          setSubmitResponse({
            type: "error",
            message: err.message,
          });
        });
      setAddingVaultUser(false);
      setShowAlert(true);
    }
  };

  const onViewPublicKey = () => {
    const emojis = generateCertificationEmojis(managerInfo.publicKey.key);

    setPublicKeyEmojis(emojis);
    setPublicKeyEmojisDialog(true);
  };

  return (
    <Accordion style={{ width: "100%" }}>
      <AccordionSummary
        style={{ flexDirection: "row-reverse" }}
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <Grid
              container
              direction="row"
              alignItems="center"
              justify="flex-start"
              spacing={2}
            >
              <Grid item>
                <Avatar alt="john" src={manager.avatar} />
              </Grid>
              <Grid item>
                <Typography variant="h6">{manager.nickname}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            {!suspended && (
              <Button
                onClick={onClickSuspend}
                color="primary"
                className="btn-disable"
                disabled={updatingStatus}
              >
                Disable
              </Button>
            )}
            {suspended && (
              <Button
                onClick={onClickSuspend}
                color="primary"
                disabled={updatingStatus}
              >
                Activate
              </Button>
            )}
            {updatingStatus && (
              <CircularProgress size={24} className={classes.progressButton} />
            )}
          </Grid>
        </Grid>
      </AccordionSummary>
      <Divider />
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="center">
              <div className={classes.profileImageContainer}>
                <Avatar
                  src={manager.avatar}
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
          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField
                label="Nick Name"
                variant="outlined"
                value={manager.nickname}
                onChange={onHandleName}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <TextField
                label="Email"
                variant="outlined"
                value={manager.email}
                onChange={onHandleEmail}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <TextField
                label="Phone"
                variant="outlined"
                value={manager.phone}
                onChange={onHandlePhone}
              />
            </FormControl>
          </Grid>
        </Grid>
      </AccordionDetails>
      <Divider />
      <AccordionActions>
        <Grid container justify="space-between">
          {viewAddToVault && (
            <Grid item>
              <Button color="primary" onClick={onViewPublicKey}>
                Add to Vault
              </Button>
            </Grid>
          )}
          <Grid item>
            <div className={classes.progressButtonWrapper}>
              <Button
                color="primary"
                onClick={handleSendResetPasswordLink}
                disabled={sendingEmail}
              >
                Send Reset Password
              </Button>
              {sendingEmail && (
                <CircularProgress
                  size={24}
                  className={classes.progressButton}
                />
              )}
            </div>
          </Grid>
          <Grid item>
            <div className={classes.progressButtonWrapper}>
              <Button
                variant="contained"
                color="primary"
                onClick={updateSubmit}
                disabled={managerUpdating}
              >
                Save Changes
              </Button>
              {managerUpdating && (
                <CircularProgress
                  size={24}
                  className={classes.progressButton}
                />
              )}
            </div>
          </Grid>
        </Grid>
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
        <Dialog
          open={publicKeyEmojisDialog}
          onClose={() => setPublicKeyEmojisDialog(false)}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Approve public key</DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container>
              <Grid item xs={12}>
                {publicKeyEmojis.map((emoji: any) => {
                  return (
                    <div className={classes.emojiBlock} key={emoji}>
                      <div className={classes.emojiIcon}>{emoji[0]}</div>
                      <div className={classes.emojiName}>{emoji[1]}</div>
                    </div>
                  );
                })}
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button
              onClick={() => setPublicKeyEmojisDialog(false)}
              color="secondary"
              variant="contained"
            >
              Close
            </Button>
            <div className={classes.progressButtonWrapper}>
              <Button
                onClick={onClickAddVaultUser}
                color="primary"
                variant="contained"
                disabled={addingVaultUser}
              >
                Approve
              </Button>
              {addingVaultUser && (
                <CircularProgress
                  size={24}
                  className={classes.progressButton}
                />
              )}
            </div>
          </DialogActions>
        </Dialog>
      </AccordionActions>
    </Accordion>
  );
};

export default Manager;
