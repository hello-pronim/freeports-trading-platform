import axios from "../util/axios";

interface LoginParamsType {
  email: string;
  password: string;
}
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

const login = (credentials: LoginParamsType): Promise<LoginResponseType> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/auth/login`, credentials)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const qrCodeGen = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post("/auth/2fa/generate")
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

export { login as default, login, qrCodeGen };