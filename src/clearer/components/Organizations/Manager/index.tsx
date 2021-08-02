/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
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
  sendResetPasswordEmail
} from "../../../../services/clearerUsersService";

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
}));

interface managerType {
  id: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
}

const Manager = (props: any): React.ReactElement => {
  const classes = useStyle();
  const { getOrganizedManager } = useOrganization();
  const [organizerStatus, setOrganizerStatus] = useState(true);
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

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      const managerData = await getOrganizedManager(orgId, managerId);

      if (!mounted) {
        setManager({
          id: managerData.id,
          nickname: managerData.nickname,
          email: managerData.email,
          phone: managerData.phone,
          avatar: managerData.avatar,
        });
        if (managerData.suspended === "undefined") {
          setOrganizerStatus(true);
        } else {
          setOrganizerStatus(!managerData.suspended);
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

  const onHandleStatus = async (event: React.ChangeEvent<any>) => {
    const { value } = event.target;
    setOrganizerStatus(value);
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

  const Alert = (props: AlertProps) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
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
            <Typography variant="body2">Delete permanently</Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <Divider />
      <AccordionDetails>
        <Grid container spacing={1} xs={12}>
          <Grid item container justify="center" xs={12}>
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
          <Grid item container direction="row" spacing={2} xs={12}>
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
            <Grid item xs={12} container alignItems="center" direction="row">
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="demo-simple-select-outlined-label">
                  Status
                </InputLabel>
                <Select
                  value={organizerStatus}
                  onChange={onHandleStatus}
                  label="Status"
                >
                  <MenuItem value="true" selected>
                    Active
                  </MenuItem>
                  <MenuItem value="false">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </AccordionDetails>
      <Divider />
      <AccordionActions>
        <Grid item container xs={12} justify="space-between">
          <div className={classes.progressButtonWrapper}>
            <Button color="primary" onClick={handleSendResetPasswordLink}>
              Send Reset Password Link
            </Button>
            {sendingEmail && (
              <CircularProgress size={24} className={classes.progressButton} />
            )}
          </div>
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
              <CircularProgress size={24} className={classes.progressButton} />
            )}
          </div>
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
      </AccordionActions>
    </Accordion>
  );
};

export default Manager;
