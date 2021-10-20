/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Icon,
  IconButton,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Lock from "@mui/icons-material/Lock";
import { Form, Field } from "react-final-form";

import { useRole } from "../../../hooks";
import vault, { VaultPermissions } from "../../../vault";
import { PermissionOwnerType } from "../../../vault/enum/permission-owner-type";
import { VaultAssetType } from "../../../vault/enum/asset-type";
import { selectUser } from "../../../slice/selectors";
import Permission from "../../../types/Permission";
import { snackbarActions } from "../../../components/Snackbar/slice";

export interface RoleType {
  id: string;
  name: string;
  permissions: Array<string>;
  vaultGroupId?: string;
}

interface LockPermissionsType {
  addRemoveUser: Array<string>;
  createDeleteRuleTree: Array<string>;
  getRuleTrees: Array<string>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    roleName: {
      fontSize: theme.typography.pxToRem(16),
      fontWeight: "bold",
    },
    roleDescription: {
      fontSize: theme.typography.pxToRem(16),
      color: theme.palette.text.secondary,
    },
    permissionContainer: {
      padding: theme.spacing(2),
    },
    permissionDetails: {
      padding: "0px",
      maxHeight: "60px",
    },
    permissionName: {
      fontWeight: "bold",
      marginBottom: "10px",
    },
    checkboxLabel: {
      margin: "0px",
    },
    progressButtonWrapper: {
      margin: theme.spacing(1),
      position: "relative",
    },
    progressButton: {
      color: theme.palette.primary.main,
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
    addButton: {
      fontWeight: "bold",
      padding: 0,
    },
    column: {
      flexBasis: "20%",
    },
    link: {
      color: theme.palette.primary.main,
      textDecoration: "none",
      cursor: "pointer",
    },
    roleNameInput: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
  })
);
const Roles = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { retrieveRoles, retrievePermissions, updateRole, removeRole } =
    useRole();
  const [roles, setRoles] = useState([] as any[]);
  const [permissionGroups, setPermissionGroups] = useState([] as any[]);
  const [removing, setRemoving] = useState(false);
  const [saving, setSaving] = useState(false);
  const currentUser = useSelector(selectUser);
  const [lockModalView, setLockModalView] = useState(false);
  const [lockModalProcessing, setLockModalProcessing] = useState(false);
  const [lockingRole, setLockingRole] = useState({
    name: "",
    vaultGroupId: "",
  });
  const [lockPermissions, setLockPermissions] = useState<LockPermissionsType>({
    addRemoveUser: [],
    createDeleteRuleTree: [],
    getRuleTrees: [],
  });
  const [roleNameEditable, setRoleNameEditable] = useState<Array<boolean>>([
    false,
  ]);

  useEffect(() => {
    let unmounted = false;

    const init = async () => {
      const rolesList = await retrieveRoles();
      const permissionList = await retrievePermissions();

      if (!unmounted) {
        setRoles(rolesList);
        setPermissionGroups(permissionList);
      }
    };

    init();

    return () => {
      unmounted = true;
    };
  }, []);

  const onPermissionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    roleId: string
  ) => {
    const { name, checked } = event.target;

    const newRoles = roles.map((role: RoleType) => {
      if (role.id === roleId) {
        if (checked) role.permissions.push(name);
        else {
          for (let i = 0; i < role.permissions.length; i += 1) {
            if (role.permissions[i] === name) {
              role.permissions.splice(i, 1);
              break;
            }
          }
        }
      }
      return role;
    });

    setRoles(newRoles);
  };

  const onRoleNameChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    roleId: string
  ) => {
    const { value } = event.target;
    const newRoles = roles.map((role: RoleType) => {
      const newRole = { ...role };
      if (newRole.id === roleId) {
        newRole.name = value;
      }
      return newRole;
    });
    setRoles(newRoles);
  };

  const onRoleSave = async (roleId: string) => {
    const newRole = roles.filter((role: RoleType) => role.id === roleId)[0];
    const oldRoles = await retrieveRoles();
    const oldPermissions = oldRoles.find(
      (role: RoleType) => role.id === roleId
    ).permissions;

    setSaving(true);

    const response = await updateRole(roleId, newRole, oldPermissions);
    if (response.errorType) {
      if (Array.isArray(response.message)) {
        dispatch(
          snackbarActions.showSnackbar({
            message:
              response.message[0].constraints[
                Object.keys(response.message[0].constraints)[0]
              ],
            type: "error",
          })
        );
      } else {
        dispatch(
          snackbarActions.showSnackbar({
            message: response.message,
            type: "error",
          })
        );
      }
    } else {
      dispatch(
        snackbarActions.showSnackbar({
          message: "Role has been updated successfully",
          type: "success",
        })
      );
    }
    setSaving(false);

    let temp = [...roleNameEditable];
    temp = [false];
    setRoleNameEditable(temp);
  };

  const onRoleRemove = async (roleId: string, vaultGroupId: string) => {
    // const newRoles = roles.filter((role: any) => role.id !== roleId);
    setRemoving(true);
    const response = await removeRole(roleId, vaultGroupId);
    if (response.errorType) {
      dispatch(
        snackbarActions.showSnackbar({
          message: response.message,
          type: "error",
        })
      );
    } else {
      dispatch(
        snackbarActions.showSnackbar({
          message: "Role has been removed successfully",
          type: "success",
        })
      );
      const newRoles = roles.filter((role) => role.id !== roleId);
      setRoles(newRoles);
    }
    setRemoving(false);
  };

  const handleNewRoleClick = () => {
    history.push("/roles/add");
  };

  const openLockModal = async (role: any) => {
    setLockingRole(role);
    try {
      const request = await vault.getAssetPermissions(
        VaultAssetType.GROUP,
        role.vaultGroupId
      );
      const assetPermissions = await vault.sendRequest(request);

      const addRemoveUser: string[] = [];
      const createDeleteRuleTree: string[] = [];
      const getRuleTrees: string[] = [];
      assetPermissions.groupPermissions.forEach((x: any) => {
        switch (x.permissionType) {
          case VaultPermissions.AddRemoveUser:
            addRemoveUser.push(x.groupId);
            break;
          case VaultPermissions.CreateDeleteRuleTree:
            createDeleteRuleTree.push(x.groupId);
            break;
          case VaultPermissions.GetRuleTrees:
            getRuleTrees.push(x.groupId);
            break;
          default:
            break;
        }
      });
      setLockPermissions({
        addRemoveUser,
        createDeleteRuleTree,
        getRuleTrees,
      });
      setLockModalView(true);
    } catch (error: any) {
      dispatch(
        snackbarActions.showSnackbar({
          message: error.message,
          type: "error",
        })
      );
    }
  };

  const handleLockPermission = async (values: any) => {
    setLockModalProcessing(true);
    try {
      const addRemoveUserOld = [...lockPermissions.addRemoveUser];
      const addRemoveUserNew: string[] = [];
      values.addRemoveUser.forEach((x: string) => {
        const index = addRemoveUserOld.indexOf(x);
        if (index !== -1) {
          addRemoveUserOld.splice(index, 1);
        } else {
          addRemoveUserNew.push(x);
        }
      });
      await vault.authenticate();
      await Promise.all(
        addRemoveUserOld.map(async (vaultGroupId: string) => {
          const request = await vault.revokePermissionFromAsset(
            VaultAssetType.GROUP,
            lockingRole.vaultGroupId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.AddRemoveUser
          );
          await vault.sendRequest(request);
        })
      );
      await Promise.all(
        addRemoveUserNew.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.GROUP,
            lockingRole.vaultGroupId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.AddRemoveUser
          );
          await vault.sendRequest(request);
        })
      );

      const createDeleteRuleTreeOld = [...lockPermissions.createDeleteRuleTree];
      const createDeleteRuleTreeNew: string[] = [];
      values.createDeleteRuleTree.forEach((x: string) => {
        const index = createDeleteRuleTreeOld.indexOf(x);
        if (index !== -1) {
          createDeleteRuleTreeOld.splice(index, 1);
        } else {
          createDeleteRuleTreeNew.push(x);
        }
      });
      await Promise.all(
        createDeleteRuleTreeOld.map(async (vaultGroupId: string) => {
          const request = await vault.revokePermissionFromAsset(
            VaultAssetType.GROUP,
            lockingRole.vaultGroupId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.CreateDeleteRuleTree
          );
          await vault.sendRequest(request);
        })
      );
      await Promise.all(
        createDeleteRuleTreeNew.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.GROUP,
            lockingRole.vaultGroupId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.CreateDeleteRuleTree
          );
          await vault.sendRequest(request);
        })
      );

      const getRuleTreesOld = [...lockPermissions.getRuleTrees];
      const getRuleTreesNew: string[] = [];
      values.getRuleTrees.forEach((x: string) => {
        const index = getRuleTreesOld.indexOf(x);
        if (index !== -1) {
          getRuleTreesOld.splice(index, 1);
        } else {
          getRuleTreesNew.push(x);
        }
      });
      await Promise.all(
        getRuleTreesOld.map(async (vaultGroupId: string) => {
          const request = await vault.revokePermissionFromAsset(
            VaultAssetType.GROUP,
            lockingRole.vaultGroupId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.GetRuleTrees
          );
          await vault.sendRequest(request);
        })
      );
      await Promise.all(
        getRuleTreesNew.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.GROUP,
            lockingRole.vaultGroupId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.GetRuleTrees
          );
          await vault.sendRequest(request);
        })
      );

      dispatch(
        snackbarActions.showSnackbar({
          message: "Role has been updated successfully",
          type: "success",
        })
      );
      setLockModalView(false);
    } catch (error: any) {
      dispatch(
        snackbarActions.showSnackbar({
          message: error.message,
          type: "error",
        })
      );
    }
    setLockModalProcessing(false);
  };

  const handleRoleNameEditClick = (e: any, index: number) => {
    const temp = [...roleNameEditable];
    temp[index] = true;
    setRoleNameEditable(temp);
  };

  const handleRoleNameConfirmClick = (
    e: any,
    index: number,
    roleId: string
  ) => {
    const temp = [...roleNameEditable];
    temp[index] = false;
    setRoleNameEditable(temp);

    onRoleSave(roleId);
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="h5">Roles</Typography>
              </Grid>
              <Grid item>
                <IconButton
                  className={classes.addButton}
                  color="primary"
                  onClick={handleNewRoleClick}
                  size="large"
                >
                  <Icon fontSize="large">add_circle</Icon>
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {roles.length > 0 ? (
              <Grid container spacing={1}>
                {roles
                  .filter((role: RoleType) => role.name !== "_default")
                  .map((role: RoleType, index: number) => (
                    <Grid item xs={12} key={role.id}>
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1c-content"
                        >
                          <Grid
                            container
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Grid item>
                              {!roleNameEditable[index] ? (
                                <Grid container alignItems="center" spacing={2}>
                                  <Grid item>
                                    <Typography className={classes.roleName}>
                                      {role.name}
                                    </Typography>
                                  </Grid>
                                  <Grid item>
                                    <IconButton
                                      color="primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoleNameEditClick(e, index);
                                      }}
                                      size="large"
                                    >
                                      <EditOutlinedIcon />
                                    </IconButton>
                                  </Grid>
                                </Grid>
                              ) : (
                                <Grid container alignItems="center" spacing={2}>
                                  <Grid item>
                                    <TextField
                                      variant="outlined"
                                      size="small"
                                      label="Role Name"
                                      value={role.name}
                                      onChange={(e) =>
                                        onRoleNameChange(e, role.id)
                                      }
                                    />
                                  </Grid>
                                  <Grid item>
                                    <IconButton
                                      color="primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoleNameConfirmClick(
                                          e,
                                          index,
                                          role.id
                                        );
                                      }}
                                      size="large"
                                    >
                                      <CheckIcon />
                                    </IconButton>
                                  </Grid>
                                </Grid>
                              )}
                            </Grid>
                            <Grid item>
                              <IconButton
                                style={{ padding: 0 }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openLockModal(role);
                                }}
                                disabled={
                                  !vault.checkUserLockUsability(currentUser)
                                }
                                size="large"
                              >
                                <Lock fontSize="medium" />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </AccordionSummary>
                        <div>
                          {permissionGroups.map(
                            (permissionGroup: Permission) => (
                              <FormGroup
                                key={permissionGroup.name}
                                className={`permission-container ${classes.permissionContainer}`}
                              >
                                {permissionGroup.description ? (
                                  <Tooltip
                                    title={permissionGroup.description}
                                    placement="top-start"
                                    arrow
                                  >
                                    <FormLabel
                                      component="legend"
                                      className={`${classes.permissionName} ${classes.link}`}
                                    >
                                      {permissionGroup.name}
                                    </FormLabel>
                                  </Tooltip>
                                ) : (
                                  <FormLabel
                                    component="legend"
                                    className={classes.permissionName}
                                  >
                                    {permissionGroup.name}
                                  </FormLabel>
                                )}
                                {permissionGroup.description}
                                <AccordionDetails
                                  className={classes.permissionDetails}
                                >
                                  {permissionGroup.permissions.map(
                                    (permission: {
                                      name: string;
                                      code: string;
                                      description?: string;
                                      dependsOn?: string[];
                                    }) => (
                                      <div
                                        key={permission.code}
                                        className={classes.column}
                                      >
                                        <FormControlLabel
                                          className={classes.checkboxLabel}
                                          control={
                                            <Checkbox
                                              color="primary"
                                              name={permission.code}
                                              checked={Boolean(
                                                role.permissions.includes(
                                                  permission.code
                                                )
                                              )}
                                              onChange={(e) =>
                                                onPermissionChange(e, role.id)
                                              }
                                            />
                                          }
                                          label={
                                            permission.description ? (
                                              <Tooltip
                                                title={permission.description}
                                                placement="top-start"
                                                arrow
                                              >
                                                <Typography
                                                  variant="body2"
                                                  className={classes.link}
                                                >
                                                  {permission.name}
                                                </Typography>
                                              </Tooltip>
                                            ) : (
                                              <Typography variant="body2">
                                                {permission.name}
                                              </Typography>
                                            )
                                          }
                                        />
                                      </div>
                                    )
                                  )}
                                </AccordionDetails>
                              </FormGroup>
                            )
                          )}
                        </div>
                        <Divider />
                        <AccordionActions>
                          <div className={classes.progressButtonWrapper}>
                            <Button
                              variant="contained"
                              size="small"
                              disabled={removing}
                              onClick={() =>
                                onRoleRemove(
                                  role.id,
                                  role.vaultGroupId as string
                                )
                              }
                            >
                              Remove
                            </Button>
                            {removing && (
                              <CircularProgress
                                size={24}
                                className={classes.progressButton}
                              />
                            )}
                          </div>
                          <div className={classes.progressButtonWrapper}>
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={() => onRoleSave(role.id)}
                              disabled={saving}
                            >
                              Save
                            </Button>
                            {saving && (
                              <CircularProgress
                                size={24}
                                className={classes.progressButton}
                              />
                            )}
                          </div>
                        </AccordionActions>
                      </Accordion>
                    </Grid>
                  ))}
              </Grid>
            ) : (
              <></>
            )}
          </Grid>
        </Grid>
        <Dialog
          open={lockModalView}
          onClose={() => {
            setLockModalView(false);
          }}
          aria-labelledby="form-dialog-title"
        >
          <Form
            onSubmit={handleLockPermission}
            initialValues={lockPermissions}
            render={({ handleSubmit }) => (
              <form onSubmit={handleSubmit} noValidate>
                <DialogTitle id="form-dialog-title">
                  {`Permission of ${lockingRole.name}`}
                </DialogTitle>
                <Divider />
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormGroup className={classes.permissionContainer}>
                        <FormLabel
                          component="legend"
                          className={classes.permissionName}
                        >
                          Assign Users (AddRemoveUser)
                        </FormLabel>
                        <Grid container>
                          {roles.map((x) => (
                            <Grid item key={x.vaultGroupId} xs={2}>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                  <Field
                                    name="addRemoveUser[]"
                                    component="input"
                                    type="checkbox"
                                    value={x.vaultGroupId}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography variant="body1">
                                    {x.name}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>
                      </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                      <FormGroup className={classes.permissionContainer}>
                        <FormLabel
                          component="legend"
                          className={classes.permissionName}
                        >
                          Create Rules (CreateDeleteRuleTree)
                        </FormLabel>
                        <Grid container>
                          {roles.map((x) => (
                            <Grid item key={x.vaultGroupId} xs={2}>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                  <Field
                                    name="createDeleteRuleTree[]"
                                    component="input"
                                    type="checkbox"
                                    value={x.vaultGroupId}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography variant="body1">
                                    {x.name}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>
                      </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                      <FormGroup className={classes.permissionContainer}>
                        <FormLabel
                          component="legend"
                          className={classes.permissionName}
                        >
                          Display Rules (GetRuleTrees)
                        </FormLabel>
                        <Grid container>
                          {roles.map((x) => (
                            <Grid item key={x.vaultGroupId} xs={2}>
                              <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                  <Field
                                    name="getRuleTrees[]"
                                    component="input"
                                    type="checkbox"
                                    value={x.vaultGroupId}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography variant="body1">
                                    {x.name}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>
                      </FormGroup>
                    </Grid>
                  </Grid>
                </DialogContent>
                <Divider />
                <DialogActions>
                  <Button
                    onClick={() => {
                      setLockModalView(false);
                    }}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <div className={classes.progressButtonWrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={lockModalProcessing}
                    >
                      Save
                    </Button>
                    {lockModalProcessing && (
                      <CircularProgress
                        size={24}
                        className={classes.progressButton}
                      />
                    )}
                  </div>
                </DialogActions>
              </form>
            )}
          />
        </Dialog>
      </Container>
    </div>
  );
};

export default Roles;
