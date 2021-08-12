import PaginatedResponse from "../types/PaginatedResponse";
import { ResourceCreatedResponse } from "../types/ResourceCreatedResponse";
import User from "../types/User";
import axios from "../util/axios";
import { VaultRequestDto } from "./vaultService";

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

const updateOrgUser = (
  organizationId: string,
  id: string,
  user: Partial<User>
): Promise<User> => {
  return new Promise((resolve, reject) => {
    axios
      .patch(`/organization/${organizationId}/user/${id}`, user)
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
  id: string,
  vaultRequest: VaultRequestDto
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/user/${id}/vault-user`, { vaultRequest })
      .then((res: any) => {
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
  sendResetPasswordEmail,
};
