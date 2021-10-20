import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Snackbar, Theme } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import { useAuth } from "../../../../hooks";

// function TransitionDown(props: TransitionProps) {
//   return <Slide {...props} direction="down" />;
// }

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    anchorOriginTopCenter: {
      top: "75px",
      "& .MuiSnackbarContent-root": {
        backgroundColor: theme.palette.secondary.main,
        color: "white",
      },
    },
  })
);

const PublicKeyBanner = (): React.ReactElement => {
  const history = useHistory();
  const classes = useStyles();
  const [opened, setOpened] = useState(false);
  const [alertText, setAlertText] = useState("");
  const { checkPublicKey } = useAuth();

  useEffect(() => {
    let unmounted = false;

    const checkKey = async () => {
      const getResult = await checkPublicKey();
      if (!getResult.success) {
        if (!unmounted) {
          setAlertText(getResult.data);
          setOpened(true);
        }
      }
    };

    checkKey();

    return () => {
      unmounted = true;
    };
  }, []);

  const vertical = "top";
  const horizontal = "center";
  const messageInfo = "snaxBar";
  const handleClose = () => {
    setOpened(false);
    history.push(`/profile`);
  };
  return (
    <Snackbar
      key={messageInfo}
      open={opened}
      autoHideDuration={2000}
      anchorOrigin={{ vertical, horizontal }}
      classes={{
        anchorOriginTopCenter: classes.anchorOriginTopCenter,
      }}
      onClose={handleClose}
      message={alertText}
    />
  );
};

export default PublicKeyBanner;
