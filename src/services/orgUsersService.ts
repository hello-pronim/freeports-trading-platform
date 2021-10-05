import PaginatedResponse from "../types/PaginatedResponse";
import { ResourceCreatedResponse } from "../types/ResourceCreatedResponse";
import User from "../types/User";
import axios from "../util/axios";
import { VaultRequestDto } from "./vaultService";
import vault from "../vault";

const getOrgUsers = (
  organizationId: string,
  search?: string
): Promise<PaginatedResponse<User>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/user${
          search ? `?search=${search}` : ""
        }`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createOrgUser = (
  organizationId: string,
  user: User
): Promise<ResourceCreatedResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/user`, user)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getOrgUser = (organizationId: string, userId: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizationId}/user/${userId}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const updateOrgUser = async (
  organizationId: string,
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
      .patch(`/organization/${organizationId}/user/${id}`, {
        ...user,
        removeFromGroupRequests,
        addToGroupRequests,
      })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const suspendOrgUser = (organizationId: string, id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .put(`/organization/${organizationId}/user/${id}/suspend`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const resumeOrgUser = (organizationId: string, id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .put(`/organization/${organizationId}/user/${id}/resume`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createVaultUser = (
  organizationId: string,
  userId: string,
  vaultRequest: VaultRequestDto
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/user/${userId}/public-key/approve`,
        {
          vaultRequest,
        }
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const removeVaultUser = (
  organizationId: string,
  id: string,
  vaultRequest: VaultRequestDto
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/user/${id}/public-key/revoke`, {
        vaultRequest,
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

export {
  getOrgUsers as default,
  getOrgUsers,
  createOrgUser,
  getOrgUser,
  updateOrgUser,
  suspendOrgUser,
  resumeOrgUser,
  createVaultUser,
  removeVaultUser,
  sendResetPasswordEmail,
};
