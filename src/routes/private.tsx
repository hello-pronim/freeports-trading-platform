/* eslint-disable react/jsx-props-no-spreading */
import React, { Suspense } from "react";
import { Route, Redirect } from "react-router-dom";
import { Backdrop, CircularProgress, Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import PublicKeyBanner from "../organization/components/Auth/PublicKey";

import { useAuth } from "../hooks";
import RouteCompProps from "./routeCompProps";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: theme.palette.primary.main,
    },
  })
);
const PrivateRoute: React.FC<RouteCompProps> = ({
  component: Component,
  ...rest
}: RouteCompProps) => {
  const { isAuthenticated } = useAuth();
  const classes = useStyles();
  const certified = rest as any;
  return (
    <Route
      {...rest}
      render={(props: any) => {
        return (
          <Suspense
            fallback={
              <Backdrop className={classes.backdrop} open={Boolean(true)}>
                <CircularProgress color="primary" />
              </Backdrop>
            }
          >
            {isAuthenticated ? (
              <>
                <Component {...props} />
                {/* {certified.certificate ? <PublicKeyBanner /> : <></>} */}
              </>
            ) : (
              <Redirect
                to={{
                  pathname: "/signin",
                  state: { from: props.location },
                }}
              />
            )}
          </Suspense>
        );
      }}
    />
  );
};

export default PrivateRoute;
