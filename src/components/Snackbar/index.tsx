import { Snackbar as MUISnackbar } from "@mui/material";
import React from "react";
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { useDispatch, useSelector } from "react-redux";
import {
  selectShowSnackbar,
  selectSnackbarType,
  selectSnackbarMessage,
} from "./slice/selectors";
import { useSnackbarSlice } from "./slice";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Snackbar = (): React.ReactElement => {
  const dispatch = useDispatch();
  const showSnackbar = useSelector(selectShowSnackbar);
  const message = useSelector(selectSnackbarMessage);
  const type = useSelector(selectSnackbarType);
  const { actions } = useSnackbarSlice();
  return (
    <MUISnackbar
      autoHideDuration={2000}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={showSnackbar}
      onClose={() => dispatch(actions.hideSnackbar())}
    >
      <Alert severity={type === "success" ? "success" : "error"}>
        {message}
      </Alert>
    </MUISnackbar>
  );
};

export default Snackbar;
