import React, { useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

import { useDispatch, useSelector } from "react-redux";
import Routes from "./routes";

import auth from "../store/auth/reducer";
import Snackbar from "../components/Snackbar";
import { useTheme } from "../hooks";
import { useInjectReducer } from "../util/redux-injectors";

import "./App.css";
import "./Custom.css";
import authActions from "../store/auth/actions";
import { useGlobalSlice } from "../slice";
import { selectTheme } from "../slice/selectors";

const App = (): React.ReactElement => {
  useInjectReducer({ key: "auth", reducer: auth });

  const dispatch = useDispatch();
  const { authCheck } = authActions;
  const { actions } = useGlobalSlice();
  const theme = useSelector(selectTheme);

  dispatch(authCheck());

  useEffect(() => {
    dispatch(actions.getCurrentClearerUser());
  }, []);

  const themeLight = createMuiTheme({
    palette: {
      primary: {
        main: "#006BDE",
      },
      secondary: {
        main: "#6D6E70",
      },
      type: "light",
    },
  });
  const themeDark = createMuiTheme({
    palette: {
      background: {
        default: "#1D1E3C",
        paper: "#303655",
      },
      primary: {
        main: "#006BDE",
      },
      secondary: {
        main: "#303655",
      },
      info: {
        main: "#599de9",
      },
      type: "dark",
    },
  });

  return (
    <MuiThemeProvider theme={theme === "light" ? themeLight : themeDark}>
      <CssBaseline />
      <Routes />
      <Snackbar />
    </MuiThemeProvider>
  );
};

export default App;
