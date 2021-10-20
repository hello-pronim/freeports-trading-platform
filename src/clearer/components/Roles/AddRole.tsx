/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Field } from "react-final-form";
import { TextField } from "mui-rff";

import { useRole } from "../../../hooks";
import { selectUser } from "../../../slice/selectors";
import vault, { VaultPermissions } from "../../../vault";
import { PermissionOwnerType } from "../../../vault/enum/permission-owner-type";
import { VaultAssetType } from "../../../vault/enum/asset-type";
import Permission from "../../../types/Permission";
import { snackbarActions } from "../../../components/Snackbar/slice";
import permissions from "../../../hooks/permissions";

interface RoleType {
  name: string;
  permissions: Array<string>;
}

const validate = (values: any) => {
  const errors: Partial<RoleType> = {};

  if (!values.name) {
    errors.name = "This Field Required";
  }

  return errors;
};

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
      padding: theme.spacing(1),
      border: theme.palette.warning.main,
    },
    permissionDetails: {
      maxHeight: "40px",
      alignItems: "center",
      padding: "0px",
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

const AddRole = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  const { retrievePermissions, createNewRole, retrieveRoles, updateRole } =
    useRole();
  const [permissionGroups, setPermissionGroups] = useState([] as any[]);
  const [roles, setRoles] = useState([] as any[]);
  const currentUser = useSelector(selectUser);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardProccessing, setWizardProccessing] = useState(false);
  const [lockUsability, setLockUsability] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    id: "",
    vaultGroupId: "",
  });

  useEffect(() => {
    let unmounted = false;

    const init = async () => {
      const permissionList = await retrievePermissions();
      const rolesList = await retrieveRoles();
      if (!unmounted) {
        setPermissionGroups(permissionList);
        setRoles(rolesList);
        setLockUsability(vault.checkUserLockUsability(currentUser));
      }
    };

    init();

    return () => {
      unmounted = true;
    };
  }, []);

  const handleRoleCreate = async (values: any) => {
    setWizardProccessing(true);
    const response = await createNewRole(values.name);
    if (response) {
      dispatch(
        snackbarActions.showSnackbar({
          message: "Role has been created successfully",
          type: "success",
        })
      );
      setNewRole({
        name: values.name,
        id: response.id,
        vaultGroupId: response.vaultGroupId,
      });
      setRoles([
        ...roles,
        {
          name: values.name,
          id: response.id,
          vaultGroupId: response.vaultGroupId,
          permissions: []
        }
      ]);
      if (lockUsability) {
        setWizardStep(1);
      } else {
        setWizardStep(2);
      }
    } else {
      dispatch(
        snackbarActions.showSnackbar({
          message: "Sorry, failed to create a role",
          type: "error",
        })
      );
    }
    setWizardProccessing(false);
  };

  const handleLockPermission = async (values: any) => {
    if (
      values.addRemoveUser.length ||
      values.createDeleteRuleTree.length ||
      values.getRuleTrees.length
    ) {
      setWizardProccessing(true);
      try {
        await vault.authenticate();
        await Promise.all(
          values.addRemoveUser.map(async (vaultGroupId: string) => {
            const request = await vault.grantPermissionToAsset(
              VaultAssetType.GROUP,
              newRole.vaultGroupId,
              PermissionOwnerType.group,
              vaultGroupId,
              VaultPermissions.AddRemoveUser
            );
            await vault.sendRequest(request);
          })
        );
        await Promise.all(
          values.createDeleteRuleTree.map(async (vaultGroupId: string) => {
            const request = await vault.grantPermissionToAsset(
              VaultAssetType.GROUP,
              newRole.vaultGroupId,
              PermissionOwnerType.group,
              vaultGroupId,
              VaultPermissions.CreateDeleteRuleTree
            );
            await vault.sendRequest(request);
          })
        );
        await Promise.all(
          values.getRuleTrees.map(async (vaultGroupId: string) => {
            const request = await vault.grantPermissionToAsset(
              VaultAssetType.GROUP,
              newRole.vaultGroupId,
              PermissionOwnerType.group,
              vaultGroupId,
              VaultPermissions.GetRuleTrees
            );
            await vault.sendRequest(request);
          })
        );
        setWizardStep(2);
      } catch (error) {
        dispatch(
          snackbarActions.showSnackbar({
            message: error.message,
            type: "error",
          })
        );
      }
      setWizardProccessing(false);
    } else {
      setWizardStep(2);
    }
  };

  const handleDefinePermission = async (values: any) => {
    setWizardProccessing(true);
    const response = await updateRole(
      newRole.id,
      {
        ...newRole,
        permissions: values.permissions,
      },
      []
    );
    if (response.errorType) {
      if (Array.isArray(response.message)) {
        dispatch(
          snackbarActions.showSnackbar({
            message: response.message[0].constraints[Object.keys(response.message[0].constraints)[0]],
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
      setWizardProccessing(false);
    } else {
      history.push("/roles");
    }
  };

  const handleCancelClick = () => {
    history.push("/roles");
  };

  return (
    <div className="main-wrapper">
      <Container>
        {wizardStep === 0 && (
          <Form
            onSubmit={handleRoleCreate}
            validate={validate}
            render={({ handleSubmit }) => (
              <form onSubmit={handleSubmit} noValidate>
                <Card>
                  <CardHeader title="Create new role" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Grid container>
                          <Grid item xs={4}>
                            <TextField
                              className={classes.roleNameInput}
                              label="Role Name"
                              name="name"
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="flex-end"
                      spacing={2}
                    >
                      <Grid item>
                        <Button variant="contained" onClick={handleCancelClick}>
                          Cancel
                        </Button>
                      </Grid>
                      <Grid item>
                        <div className={classes.progressButtonWrapper}>
                          <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            disabled={wizardProccessing && wizardStep === 0}
                          >
                            Next
                          </Button>
                          {wizardProccessing && wizardStep === 0 && (
                            <CircularProgress
                              size={24}
                              className={classes.progressButton}
                            />
                          )}
                        </div>
                      </Grid>
                    </Grid>
                  </CardActions>
                </Card>
              </form>
            )}
          />
        )}
        {wizardStep === 1 && (
          <Form
            onSubmit={handleLockPermission}
            initialValues={{
              addRemoveUser: [],
              createDeleteRuleTree: [],
              getRuleTrees: [],
            }}
            render={({ handleSubmit }) => (
              <form onSubmit={handleSubmit} noValidate>
                <Card>
                  <CardHeader title={`Permission of ${newRole.name}`} />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormGroup
                          className={`permission-container ${classes.permissionContainer}`}
                        >
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
                        <FormGroup
                          className={`permission-container ${classes.permissionContainer}`}
                        >
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
                        <FormGroup
                          className={`permission-container ${classes.permissionContainer}`}
                        >
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
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="flex-end"
                      spacing={2}
                    >
                      <Grid item>
                        <Button variant="contained" onClick={handleCancelClick}>
                          Cancel
                        </Button>
                      </Grid>
                      <Grid item>
                        <div className={classes.progressButtonWrapper}>
                          <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            disabled={wizardProccessing && wizardStep === 1}
                          >
                            Next
                          </Button>
                          {wizardProccessing && wizardStep === 1 && (
                            <CircularProgress
                              size={24}
                              className={classes.progressButton}
                            />
                          )}
                        </div>
                      </Grid>
                    </Grid>
                  </CardActions>
                </Card>
              </form>
            )}
          />
        )}
        {wizardStep === 2 && (
          <Form
            onSubmit={handleDefinePermission}
            initialValues={{
              permissions: [],
            }}
            render={({ handleSubmit }) => (
              <form onSubmit={handleSubmit} noValidate>
                <Card>
                  <CardHeader title="Define permissions" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Grid container>
                          <Grid item xs={12}>
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
                                        className={classes.permissionName}
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
                                  <Grid container>
                                    {permissionGroup.permissions.map(
                                      (permission: {
                                        name: string;
                                        description?: string;
                                        code: string;
                                      }) => (
                                        <Grid item key={permission.code} xs={2}>
                                          <Grid
                                            container
                                            wrap="nowrap"
                                            spacing={1}
                                          >
                                            <Grid item>
                                              <Field
                                                name="permissions[]"
                                                component="input"
                                                type="checkbox"
                                                value={permission.code}
                                              />
                                            </Grid>
                                            <Grid item>
                                              {permission.description ? (
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
                                              )}
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                      )
                                    )}
                                  </Grid>
                                </FormGroup>
                              )
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="flex-end"
                      spacing={2}
                    >
                      <Grid item>
                        <Button variant="contained" onClick={handleCancelClick}>
                          Cancel
                        </Button>
                      </Grid>
                      <Grid item>
                        <div className={classes.progressButtonWrapper}>
                          <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            disabled={wizardProccessing && wizardStep === 2}
                          >
                            Save
                          </Button>
                          {wizardProccessing && wizardStep === 2 && (
                            <CircularProgress
                              size={24}
                              className={classes.progressButton}
                            />
                          )}
                        </div>
                      </Grid>
                    </Grid>
                  </CardActions>
                </Card>
              </form>
            )}
          />
        )}
      </Container>
    </div>
  );
};

export default AddRole;
