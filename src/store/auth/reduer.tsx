import Lockr from "lockr";

import axios from "../../util/axios";
import ReduxAction from "../redux-action";
import {
  AUTH_CHECK,
  AUTH_LOGIN,
  AUTH_LOGIN_SUCCESS,
  AUTH_OTP_CHECK,
  AUTH_OTP_CHECK_SUCCESS,
  AUTH_ERROR,
  AUTH_LOGOUT,
  AUTH_REFRESH_TOKEN,
} from "./action-types";

const initialState = {
  authStep: "login",
  isAuthenticated: false,
  isOTPDefined: false,
  loading: false,
  error: "",
};
interface LoginUserResponseType {
  id: string;
  nickname: string;
  email: string;
}
interface LoginTokenResponseType {
  tokenType: string;
  accessToken: string;
  accessTokenExpires: string;
  refreshToken: string;
  refreshTokenExpires: string;
}
interface LoginResponseType {
  user: LoginUserResponseType;
  token: LoginTokenResponseType;
  isOTPDefined: boolean;
}

function login(state: any, payload: any) {
  const { accessToken } = payload.token;

  Lockr.set("AUTH_STEP", "otp");
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  return {
    ...state,
    authStep: "otp",
    isOTPDefined: payload.isOTPDefined,
  };
}

function setIdentity(data: LoginResponseType) {
  Lockr.set("AUTH_TOKEN", data.token.accessToken);
  Lockr.set("USER_DATA", {
    id: data.user.id,
    email: data.user.email,
    nickname: data.user.nickname,
  });
}

function checkOTP(state: any, payload: any) {
  return {
    ...state,
    isAuthenticated: true,
  };
}

function checkAuth(state: any) {
  const newState = {
    ...state,
    authStep: !!Lockr.get("AUTH_STEP"),
    isAuthenticated:
      !!Lockr.get("AUTH_TOKEN") && Lockr.get("AUTH_STEP") === "passed",
  };

  if (state.isAuthenticated) {
    const bearer = `Bearer ${Lockr.get("ACCESS_TOKEN")}`;
    axios.defaults.headers.common.Authorization = bearer;
  }

  return newState;
}

function logout(state: any) {
  Lockr.rm("AUTH_STEP");
  Lockr.rm("ACCESS_TOKEN");
  Lockr.rm("USER_DATA");

  return {
    ...state,
    authStep: "login",
    isAuthenticated: false,
  };
}

const reducer = (
  state = initialState,
  { type, payload = null }: ReduxAction
): typeof initialState => {
  switch (type) {
    case AUTH_LOGIN:
      return {
        ...state,
        loading: true,
        error: "",
      };
    case AUTH_LOGIN_SUCCESS:
      setIdentity(payload);
      return {
        ...login(state, payload),
        loading: false,
      };
    case AUTH_OTP_CHECK:
      return {
        ...state,
        loading: true,
        error: "",
      };
    case AUTH_OTP_CHECK_SUCCESS:
      return {
        ...checkOTP(state, payload),
        loading: false,
      };
    case AUTH_ERROR:
      return {
        ...state,
        error: payload,
      };
    case AUTH_REFRESH_TOKEN:
      return login(state, payload);
    case AUTH_CHECK:
      return checkAuth(state);
    case AUTH_LOGOUT:
      return logout(state);
    default:
      return state;
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAuth = (state: any): boolean => state.auth.isAuthenticated;

export default reducer;
