import axios from "../util/axios";
import vault, { VaultPermissions } from "../vault";
import { PermissionOwnerType } from "../vault/enum/permission-owner-type";
import { VaultAssetType } from "../vault/enum/asset-type";

interface RoleType {
  id?: string;
  name: string;
  permissions: Array<string>;
  vaultGroupId?: string;
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

const addNewRole = async (
  name: string,
  vaultUserId: string
): Promise<any> => {
  await vault.authenticate();

  const vaultCreateGroupRequest = await vault.createGroup();
  const response = await vault.sendRequest(vaultCreateGroupRequest);
  const vaultGroupId = response.group.id;

  const request = await vault.grantPermissionToAsset(
    VaultAssetType.GROUP,
    vaultGroupId,
    PermissionOwnerType.user,
    vaultUserId,
    VaultPermissions.AddRemoveUser
  );
  await vault.sendRequest(request);

  return new Promise((resolve, reject) => {
    axios
      .post(`/role`, {
        name,
        vaultGroupId,
      })
      .then((res: any) => {
        return resolve({...res.data, vaultGroupId});
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const modifyRole = async (
  id: string,
  name: string,
  permissions: Array<string>,
  oldPermissions: Array<string>,
  vaultGroupId: string,
): Promise<string> => {
  await vault.authenticate();

  const vaultRevokePermissionRequest = await vault.revokePermissions(
    PermissionOwnerType.group, 
    vaultGroupId, 
    oldPermissions
  );

  const vaultGrantPermissionRequest = await vault.grantPermissions(
    PermissionOwnerType.group, 
    vaultGroupId, 
    permissions
  );

  return new Promise((resolve, reject) => {
    axios
      .patch(`/role/${id}`, {
        name,
        permissions,
        vaultRevokePermissionRequest,
        vaultGrantPermissionRequest,
      })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const deleteRole = async (
  id: string, 
  vaultGroupId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/role/${id}`)
      .then(async (res: any) => {
        const request = await vault.deleteGroup(vaultGroupId);
        await vault.sendRequest(request);
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
      .post(`/user/${userId}/role`, { roles })
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

const createOrgRole = async (
  organizationId: string,
  roleName: string,
  vaultUserId: string
): Promise<any> => {
  await vault.authenticate();
  
  const vaultCreateGroupRequest = await vault.createGroup(true);
  const response = await vault.sendRequest(vaultCreateGroupRequest);
  const vaultGroupId = response.group.id;

  const request = await vault.grantPermissionToAsset(
    VaultAssetType.GROUP,
    vaultGroupId,
    PermissionOwnerType.user,
    vaultUserId,
    VaultPermissions.AddRemoveUser,
    true
  );
  await vault.sendRequest(request);
  
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/role`, {
        name: roleName,
        vaultGroupId,
      })
      .then((res: any) => {
        return resolve({...res.data, vaultGroupId});
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const updateOrgRole = async (
  organizationId: string,
  roleId: string,
  vaultGroupId: string,
  oldPermissions: Array<string>,
  role: RoleType,
): Promise<string> => {
  await vault.authenticate();
  
  const vaultRevokePermissionRequest = await vault.revokePermissions(
    PermissionOwnerType.group, 
    vaultGroupId, 
    oldPermissions,
    true
  );

  const vaultGrantPermissionRequest = await vault.grantPermissions(
    PermissionOwnerType.group, 
    vaultGroupId, 
    role.permissions,
    true
  );
  
  return new Promise((resolve, reject) => {
    axios
      .patch(
        `/organization/${organizationId}/role/${roleId}`, 
        {
          ...role,
          vaultRevokePermissionRequest,
          vaultGrantPermissionRequest,
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

const removeOrgRole = (
  organizationId: string,
  roleId: string,
  vaultGroupId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/organization/${organizationId}/role/${roleId}`)
      .then(async (res: any) => {
        const request = await vault.deleteGroup(vaultGroupId, true);
        await vault.sendRequest(request);
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const assignOrgRolesToUser = (
  organizationId: string,
  userId: string,
  roles: string[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/user/${userId}/role/assign`, {
        roles,
      })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const updateOrgRolesToUser = (
  organizationId: string,
  userId: string,
  roles: string[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/user/${userId}/role`, { roles })
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

const createMultiDeskRole = async (
  organizationId: string,
  roleName: string,
  vaultUserId: string,
): Promise<any> => {
  await vault.authenticate();

  const vaultCreateGroupRequest = await vault.createGroup(true);
  const response = await vault.sendRequest(vaultCreateGroupRequest);
  const vaultGroupId = response.group.id;

  const request = await vault.grantPermissionToAsset(
    VaultAssetType.GROUP,
    vaultGroupId,
    PermissionOwnerType.user,
    vaultUserId,
    VaultPermissions.AddRemoveUser,
    true
  );
  await vault.sendRequest(request);
  
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/multidesk/role`, {
        name: roleName,
        vaultGroupId,
      })
      .then((res: any) => {
        return resolve({...res.data, vaultGroupId});
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const updateMultiDeskRole = async (
  organizationId: string,
  roleId: string,
  vaultGroupId: string,
  oldPermissions: Array<string>,
  role: RoleType,
): Promise<string> => {
  await vault.authenticate();

  const vaultRevokePermissionRequest = await vault.revokePermissions(
    PermissionOwnerType.group, 
    vaultGroupId, 
    oldPermissions,
    true
  );

  const vaultGrantPermissionRequest = await vault.grantPermissions(
    PermissionOwnerType.group, 
    vaultGroupId, 
    role.permissions,
    true
  );

  return new Promise((resolve, reject) => {
    axios
      .patch(
        `/organization/${organizationId}/multidesk/role/${roleId}`, 
        {
          ...role,
          vaultRevokePermissionRequest,
          vaultGrantPermissionRequest,
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

const removeMultiDeskRole = (
  organizationId: string,
  roleId: string,
  vaultGroupId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/organization/${organizationId}/multidesk/role/${roleId}`)
      .then(async (res: any) => {
        const request = await vault.deleteGroup(vaultGroupId, true);
        await vault.sendRequest(request);
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const assignMultiDeskRolesToUser = (
  organizationId: string,
  userId: string,
  roles: Array<{ role: string; desks: string[] }>
): Promise<{ role: string; desks: string[] }> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/multidesk/user/${userId}/role/assign`,
        {
          roles,
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

const updateMultiDeskRolesToUser = (
  organizationId: string,
  userId: string,
  roles: Array<{ role: string; desks: string[] }>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/multidesk/user/${userId}/role`,
        roles
      )
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

const createDeskRole = async (
  organizationId: string,
  deskId: string,
  roleName: string,
  vaultUserId: string,
): Promise<any> => {
  await vault.authenticate();

  const vaultCreateGroupRequest = await vault.createGroup(true);
  const response = await vault.sendRequest(vaultCreateGroupRequest);
  const vaultGroupId = response.group.id;

  const request = await vault.grantPermissionToAsset(
    VaultAssetType.GROUP,
    vaultGroupId,
    PermissionOwnerType.user,
    vaultUserId,
    VaultPermissions.AddRemoveUser,
    true
  );
  await vault.sendRequest(request);
  
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/desk/${deskId}/role`, {
        name: roleName,
        vaultGroupId,
      })
      .then((res: any) => {
        return resolve({...res.data, vaultGroupId});
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const updateDeskRole = async (
  organizationId: string,
  deskId: string,
  roleId: string,
  vaultGroupId: string,
  oldPermissions: Array<string>,
  role: RoleType,
): Promise<string> => {
  await vault.authenticate();

  const vaultRevokePermissionRequest = await vault.revokePermissions(
    PermissionOwnerType.group, 
    vaultGroupId, 
    oldPermissions,
    true
  );

  const vaultGrantPermissionRequest = await vault.grantPermissions(
    PermissionOwnerType.group, 
    vaultGroupId, 
    role.permissions,
    true
  );

  return new Promise((resolve, reject) => {
    axios
      .patch(
        `/organization/${organizationId}/desk/${deskId}/role/${roleId}`,
        {
          ...role,
          vaultRevokePermissionRequest,
          vaultGrantPermissionRequest,
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

const removeDeskRole = (
  organizationId: string,
  deskId: string,
  roleId: string,
  vaultGroupId: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/organization/${organizationId}/desk/${deskId}/role/${roleId}`)
      .then(async (res: any) => {
        const request = await vault.deleteGroup(vaultGroupId, true);
        await vault.sendRequest(request);
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const assignDeskRolesToUser = (
  organizationId: string,
  deskId: string,
  userId: string,
  roles: string[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/desk/${deskId}/user/${userId}/role/assign`,
        {
          roles,
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

const updateDeskRolesToUser = (
  organizationId: string,
  deskId: string,
  userId: string,
  roles: string[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/desk/${deskId}/user/${userId}/role`,
        {
          roles,
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
  updateOrgRole,
  removeOrgRole,
  assignOrgRolesToUser,
  updateOrgRolesToUser,
  getAllOrgPermissions,
  getAllMultiDeskRoles,
  createMultiDeskRole,
  updateMultiDeskRole,
  removeMultiDeskRole,
  assignMultiDeskRolesToUser,
  updateMultiDeskRolesToUser,
  getAllMultiDeskPermissions,
  getAllDeskRoles,
  createDeskRole,
  updateDeskRole,
  removeDeskRole,
  assignDeskRolesToUser,
  updateDeskRolesToUser,
  getAllDeskPermissions,
};
