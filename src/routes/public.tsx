/* eslint-disable react/jsx-props-no-spreading */
import React, { Suspense } from "react";
import { Route } from "react-router-dom";
import { Backdrop, CircularProgress, Theme } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import RouteCompProps from "./routeCompProps";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: theme.palette.primary.main,
    },
  })
);
const PublicRoutes: React.FC<RouteCompProps> = (
  params: RouteCompProps
): React.ReactElement => {
  const { component: Component, ...rest } = params;
  const classes = useStyles();

  return (
    <Route
      {...rest}
      render={(props) => {
        return (
          <Suspense
            fallback={
              <Backdrop className={classes.backdrop} open={Boolean(true)}>
                <CircularProgress color="primary" />
              </Backdrop>
            }
          >
            <Component {...props} />
          </Suspense>
        );
      }}
    />
  );
};

export default PublicRoutes;
