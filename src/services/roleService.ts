import axios from "../util/axios";

interface RoleType {
  id: string;
  name: string;
  permissions: Array<string>;
}
interface PermissionType {
  name: string;
  permissions: Array<{ code: string; name: string }>;
}

const getClearerRoles = (): Promise<Array<RoleType>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/role`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const addNewRole = (
  name: string,
  permissions: Array<string>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/role`, {
        name,
        permissions,
      })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const modifyRole = (
  id: string,
  name: string,
  permissions: Array<string>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .patch(`/role/${id}`, {
        name,
        permissions,
      })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const deleteRole = (id: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/role/${id}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getClearerPermissions = (): Promise<Array<PermissionType>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/permission/`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const assignClearerRolesToUser = (
  userId: string,
  roles: string[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/user/${userId}/role/assign`, { roles })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const updateClearerRolesToUser = (
  userId: string,
  roles: string[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .patch(`/user/${userId}/role`, { roles })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getAllOrgRoles = (organizationId: string): Promise<Array<RoleType>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizationId}/role`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createOrgRole = (
  organizationId: string,
  role: {
    name: string;
    permissions: Array<string>;
  }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/role`, role)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const deleteOrgRole = (
  organizationId: string,
  roleId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/organization/${organizationId}/role/${roleId}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getAllOrgPermissions = (
  organizationId: string
): Promise<Array<PermissionType>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizationId}/permission`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getAllMultiDeskRoles = (
  organizationId: string
): Promise<Array<RoleType>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizationId}/multidesk/role`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getAllMultiDeskPermissions = (
  organizationId: string,
  deskId?: string
): Promise<Array<PermissionType>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizationId}/desk/${deskId}/permission`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getAllDeskRoles = (organizationId: string): Promise<Array<RoleType>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizationId}/deskrole`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getAllDeskPermissions = (
  organizationId: string,
  deskId?: string
): Promise<Array<PermissionType>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizationId}/desk/${deskId}/permission`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

export {
  getClearerRoles as default,
  addNewRole,
  modifyRole,
  deleteRole,
  getClearerRoles,
  getClearerPermissions,
  assignClearerRolesToUser,
  updateClearerRolesToUser,
  getAllOrgRoles,
  createOrgRole,
  deleteOrgRole,
  getAllOrgPermissions,
  getAllMultiDeskRoles,
  getAllMultiDeskPermissions,
  getAllDeskRoles,
  getAllDeskPermissions,
};
