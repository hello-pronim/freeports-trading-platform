import PaginatedResponse from "../types/PaginatedResponse";
import { ResourceCreatedResponse } from "../types/ResourceCreatedResponse";
import User from "../types/User";
import Clearer from "../types/Clearer";
import axios from "../util/axios";
import { VaultRequestDto } from "./vaultService";
import vault from "../vault";

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

const updateClearerUser = async (
  id: string,
  user: Partial<User>,
  vaultUserId: string,
  oldVaultGroup: string[],
  newVaultGroup: string[]
): Promise<User> => {
  await vault.authenticate();
  
  const removeFromGroupRequests = await vault.removeUserFromMultipleGroup(
    vaultUserId,
    oldVaultGroup
  );
  const addToGroupRequests = await vault.addUserToMultipleGroup(
    vaultUserId,
    newVaultGroup
  );

  return new Promise((resolve, reject) => {
    axios
      .patch(`/user/${id}`, {
        ...user,
        removeFromGroupRequests,
        addToGroupRequests,
      })
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
  vaultRequest: VaultRequestDto,
  createOrgUserRequest: VaultRequestDto | null = null,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/user/${id}/public-key/approve`, { 
        vaultRequest, 
        createOrgUserRequest
      })
      .then((res: any) => {
        console.log(" user update response ", res.data);

        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const removeVaultUser = (
  id: string,
  vaultRequest: VaultRequestDto
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/user/${id}/public-key/revoke`, { vaultRequest })
      .then((res: any) => {
        console.log(" user update response ", res.data);

        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const sendResetPasswordEmail = (userId: string): Promise<any> => {
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

const resetOTP = (userId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/user/${userId}/reset-otp`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getClearerSettings = (): Promise<Clearer> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/settings`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const updateClearerSettings = async (settings: Clearer): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/settings`, settings)
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
  removeVaultUser,
  sendResetPasswordEmail,
  resetOTP,
  getClearerSettings,
  updateClearerSettings,
};
