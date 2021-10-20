/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
// import libs
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Redirect, Switch } from "react-router-dom";
import { Theme } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

// import components
import routes from "./routes";
import { useGlobalSlice } from "../../slice";
import { selectTheme } from "../../slice/selectors";
import PrivateRoute from "../../routes/private";
import PublicRoute from "../../routes/public";
import Header from "../components/Header";
import NotificationCenter from "../../components/NotificationCenter";
import CertificationBanner from "../../components/CertificationBanner";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    main: {
      padding: theme.spacing(4),
    },
  })
);
const Routes = (): React.ReactElement => {
  const classes = useStyles();
  const { actions: globalActions } = useGlobalSlice();
  const theme = useSelector(selectTheme);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const handleNotificationDrawerOpen = () => {
    setNotificationDrawerOpen(!notificationDrawerOpen);
  };

  const headerProps = {
    notificationDrawerOpen,
    handleNotificationDrawerOpen,
  };
  const drawerProps = {
    notificationDrawerOpen,
    handleNotificationDrawerOpen,
  };

  return (
    <div>
      <Router>
        <>
          <Header {...headerProps} />
          <main
            className={`${classes.main} ${
              theme === "dark" ? "theme-dark" : "theme-light"
            }`}
          >
            <Switch>
              {routes.map((route, i) => {
                if (route.auth) {
                  return <PrivateRoute key={i} {...route} />;
                }
                // if (error.errorType !== "") return <Redirect to="/error" />;
                return <PublicRoute key={i} {...route} />;
              })}
              <Redirect to="/dashboard" />
            </Switch>
          </main>
          <NotificationCenter {...drawerProps} />
          <CertificationBanner />
        </>
      </Router>
    </div>
  );
};

export default Routes;
