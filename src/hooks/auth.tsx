import { shallowEqual, useDispatch, useSelector } from "react-redux";

import reduxActions from "../store/actions";
import { login, qrCodeGen, otpCheck, publicKey } from "../services/authService";
import { globalActions as actions } from "../slice";

const {
  authLogin,
  authLoginSuccess,
  authLoginFailed,
  authLogout,
  authOTPCheck,
  authOTPCheckSuccess,
  authOTPCheckFailed,
} = reduxActions;
function useAuth(): any {
  const { clearError, setError } = actions;
  const dispatch = useDispatch();

  const { authStep, isAuthenticated, isOTPDefined, loading, error } =
    useSelector(
      (state: any) => ({
        authStep: state.auth.authStep,
        isAuthenticated: state.auth.isAuthenticated,
        isOTPDefined: state.auth.isOTPDefined,
        loading: state.auth.loading,
        error: state.global.error,
      }),
      shallowEqual
    );

  const signIn = async (credentials: any) => {
    dispatch(authLogin());
    dispatch(clearError());

    await login(credentials)
      .then((data) => {
        if (process.env.REACT_APP_INTERFACE === "CLEARER") {
          if (data.user.organization) {
            dispatch(
              setError({
                errorType: "NOT FOUND",
                message: "User doesn't exist",
              })
            );
            dispatch(authLoginFailed());
          } else dispatch(authLoginSuccess(data));
        } else if (process.env.REACT_APP_INTERFACE === "ORGANIZATION") {
          if (data.user.organization) {
            dispatch(authLoginSuccess(data));
          } else {
            dispatch(
              setError({
                errorType: "NOT FOUND",
                message: "User doesn't exist",
              })
            );
            dispatch(authLoginFailed());
          }
        }
      })
      .catch((err) => {
        dispatch(setError(err));
        dispatch(authLoginFailed());
      });
  };

  const signOut = () => {
    dispatch(authLogout());
  };

  const generateQRCode = async () => {
    let qrCode = "";

    await qrCodeGen()
      .then((data) => {
        qrCode = data;
      })
      .catch((err) => {
        dispatch(setError(err));
      });

    return qrCode;
  };

  const checkOTP = async (password: string) => {
    dispatch(authOTPCheck());
    dispatch(clearError());

    await otpCheck(password)
      .then((data) => {
        dispatch(authOTPCheckSuccess(data));
        dispatch(actions.setCurrentUser(data.user));
      })
      .catch((err) => {
        dispatch(setError(err));
        dispatch(authOTPCheckFailed());
      });
  };

  const checkPublicKey = async () => {
    const result: {
      success?: boolean;
      data?: any;
    } = {};

    await publicKey()
      .then((data) => {
        if (!data) {
          result.success = false;
          result.data = "You don't have any key yet";
        } else {
          result.success = true;
          result.data = data;
        }
      })
      .catch((err) => {
        dispatch(setError(err));
      });
    return result;
  };

  return {
    authStep,
    isAuthenticated,
    isOTPDefined,
    loading,
    error,
    signIn,
    signOut,
    setError,
    generateQRCode,
    checkOTP,
    checkPublicKey,
  };
}

export default useAuth;
