import axios from "../util/axios";
import vault from "../vault";
import Organization from "../types/Organization";

const retrieveOrganizations = (): Promise<Array<any>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const retrieveOrganization = (id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${id}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const retrieveOrganizationManagers = (id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${id}/manager`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const retrieveOrganizationManager = (
  organizerId: string,
  managerid: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizerId}/manager/${managerid}`)
      .then((res) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createOrganizationManager = (
  organizationId: string,
  nickname: string,
  email: string,
  password: string,
  phone: string,
  avatar: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/manager`, {
        nickname,
        email,
        password,
        phone,
        avatar,
      })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const updateOrganizationManager = (
  organizerId: string,
  managerId: string,
  nickname: string,
  email: string,
  phone: string,
  avatar: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .patch(`/organization/${organizerId}/manager/${managerId}`, {
        nickname,
        email,
        phone,
        avatar,
      })
      .then((res) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const createOrganization = async (organization: Organization): Promise<any> => {
  const vaultRequest = await vault.createOrganization();
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization`, {
        ...organization,
        vaultRequest,
      })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const updateOrganization = (
  organization: string,
  createdAt: Date,
  name: string,
  logo: string,
  commissionOrganization: string,
  commissionClearer: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .patch(`/organization/${organization}`, {
        name,
        createdAt,
        logo,
        commissionOrganization,
        commissionClearer,
      })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.repsonse);
      });
  });
};

const suspendOrganizationManager = (
  organizerId: string,
  managerId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .put(`/organization/${organizerId}/manager/${managerId}/suspend`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const resumeOrganizationManager = (
  organizerId: string,
  managerId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .put(`/organization/${organizerId}/manager/${managerId}/resume`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

export {
  retrieveOrganizations as default,
  retrieveOrganizations,
  retrieveOrganization,
  createOrganization,
  updateOrganization,
  retrieveOrganizationManagers,
  retrieveOrganizationManager,
  createOrganizationManager,
  updateOrganizationManager,
  suspendOrganizationManager,
  resumeOrganizationManager,
};
