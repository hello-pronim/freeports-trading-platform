/* eslint-disable no-console */
import axios from "axios";
import Lockr from "lockr";

import reduxActions from "../store/auth/actions";
import reduxGlobalActions from "../store/global/actions";

const { authLogout } = reduxActions;
const { clearError, setError } = reduxGlobalActions;

const API_URL = process.env.REACT_APP_API_URL;
const PUBLIC_REQUEST_KEY = "public-request";

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common.Accept = "application/json";
axios.defaults.headers.common.Accept = "application/json";
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

axios.interceptors.request.use(
  (config: any) => {
    const jwtToken = Lockr.get("ACCESS_TOKEN");

    // window.store.dispatch(clearError());

    if (jwtToken) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    if (!jwtToken && !config.headers[PUBLIC_REQUEST_KEY]) {
      window.store.dispatch(authLogout());
      return config;
    }

    return config;
  },
  (error) => {
    // Do something with request error here
    // notification.error({
    //   message: "Error",
    // });
    Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    window.store.dispatch(setError(error.response.data));
    if (error.response.status === 401) {
      const jwtToken = Lockr.get("ACCESS_TOKEN");
      const authStep = Lockr.get("AUTH_STEP");

      if (jwtToken && authStep === "passed") {
        window.store.dispatch(authLogout());
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
