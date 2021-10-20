import React, { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
} from "@mui/material/styles";
// import { Theme } from '@mui/material/styles';
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

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

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

  const themeLight = createTheme({
    palette: {
      primary: {
        main: "#006BDE",
      },
      secondary: {
        main: "#6D6E70",
      },
      mode: "light",
    },
  });
  const themeDark = createTheme({
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
      mode: "dark",
    },
  });

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme === "light" ? themeLight : themeDark}>
        <CssBaseline />
        <Routes />
        <Snackbar />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
