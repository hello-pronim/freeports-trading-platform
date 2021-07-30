import PaginatedResponse from "../types/PaginatedResponse";
import { ResourceCreatedResponse } from "../types/ResourceCreatedResponse";
import User from "../types/User";
import axios from "../util/axios";
import { VaultRequestDto } from "./vaultService";

const getClearerUsers = (search?: string): Promise<PaginatedResponse<User>> => {
  console.log("Get clearer user s", search);
  return new Promise((resolve, reject) => {
    axios
      .get(`/user${search ? `?search=${search}` : ""}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        console.error(err);
        return reject(err.response.data);
      });
  });
};

const createClearerUser = (user: User): Promise<ResourceCreatedResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/user`, user)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getClearerUser = (id: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/user/${id}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const updateClearerUser = (id: string, user: Partial<User>): Promise<User> => {
  return new Promise((resolve, reject) => {
    axios
      .patch(`/user/${id}`, user)
      .then((res: any) => {
        console.log(" user update response ", res.data);

        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const suspendClearerUser = (id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .put(`/user/${id}/suspend`)
      .then((res: any) => {
        console.log(" user update response ", res.data);

        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const resumeClearerUser = (id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .put(`/user/${id}/resume`)
      .then((res: any) => {
        console.log(" user update response ", res.data);

        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createVaultUser = (
  id: string,
  vaultRequest: VaultRequestDto
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/user/${id}/vault-user`, { vaultRequest })
      .then((res: any) => {
        console.log(" user update response ", res.data);

        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const sendResetPasswordEmail = (userId:string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/user/${userId}/email-resetpassword`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

export {
  createClearerUser,
  getClearerUsers as default,
  getClearerUser,
  updateClearerUser,
  suspendClearerUser,
  resumeClearerUser,
  createVaultUser,
  sendResetPasswordEmail
};
