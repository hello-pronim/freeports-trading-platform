import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../slice/selectors";
import reduxActions from "../store/actions";
import {
  getClearerRoles,
  addNewRole,
  modifyRole,
  deleteRole,
  getClearerPermissions,
} from "../services/roleService";

const { clearError, setError } = reduxActions;
interface RoleType {
  id: string;
  name: string;
  permissions: Array<string>;
  vaultGroupId: string;
  vaultType?: string;
}

function useRole(): any {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  const createNewRole = async (
    roleName: string,
    vaultType: string,
    clearerOrganizationId: string
  ) => {
    dispatch(clearError());
    let vaultUserId = currentUser?.vaultUserId;
    if (vaultType === "organization") {
      vaultUserId = currentUser?.vaultOrgUserId;
    }
    const newRole = await addNewRole(
      roleName,
      vaultType,
      clearerOrganizationId,
      vaultUserId as string
    )
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(setError(err));
      });

    return newRole;
  };
  const updateRole = async (
    id: string, 
    newRole: RoleType, 
    oldPermissions: string[],
    clearerOrganizationId: string,
  ) => {
    dispatch(clearError());
    const newRoleId = await modifyRole(
      id,
      newRole,
      oldPermissions,
      clearerOrganizationId
    )
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(setError(err));
        return err;
      });

    return newRoleId;
  };
  const removeRole = async (
    role: RoleType,
    clearerOrganizationId: string,
  ) => {
    dispatch(clearError());
    const oldRoleId = await deleteRole(role, clearerOrganizationId)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(setError(err));
        return err;
      });

    return oldRoleId;
  };
  const retrieveRoles = async () => {
    dispatch(clearError());
    const roles = await getClearerRoles()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(setError(err));
      });

    return roles;
  };
  const retrievePermissions = async () => {
    dispatch(clearError());
    const roles = await getClearerPermissions()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(setError(err));
      });

    return roles;
  };

  return {
    createNewRole,
    updateRole,
    removeRole,
    retrieveRoles,
    retrievePermissions,
  };
}

export default useRole;
