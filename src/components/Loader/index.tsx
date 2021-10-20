import { CircularProgress, Grid } from "@mui/material";
import React from "react";

// DON't use makeStyles here as this will be loaded before the ThemeProvider

const Loader = (): React.ReactElement => {
  return (
    <Grid container justifyContent="center">
      <CircularProgress />
    </Grid>
  );
};

export default Loader;
