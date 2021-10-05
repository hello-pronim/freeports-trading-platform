/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useDispatch, useSelector } from "react-redux";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField } from "mui-rff";
import { useHistory } from "react-router";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  createStyles,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  makeStyles,
  Snackbar,
  Theme,
  Typography,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { useNewOrgRoleSlice } from "./slice";
import {
  selectOrgPermissions,
  selectIsOrgPermissionsLoading,
} from "./slice/selectors";
import Loader from "../../../../components/Loader";
import { selectUser } from "../../../../slice/selectors";
import {
  selectOrgRoles,
  selectMultiDeskRoles,
  selectDeskRoles,
} from "../slice/selectors";
import { useRolesSlice } from "../slice";
import { createOrgRole, updateOrgRole } from "../../../../services/roleService";
import vault, { VaultPermissions } from "../../../../vault";
import { PermissionOwnerType } from "../../../../vault/enum/permission-owner-type";
import { VaultAssetType } from "../../../../vault/enum/asset-type";

interface RoleType {
  name: string;
  permissions: Array<string>;
}
interface PermissionType {
  name: string;
  permissions: Array<{ code: string; name: string }>;
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
      padding: theme.spacing(2),
    },
    permissionDetails: {
      maxHeight: "40px",
      alignItems: "center",
      padding: "0px",
    },
    permissionName: {
      fontWeight: "bold",
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
      "&:hover": {
        textDecoration: "underline",
      },
    },
    roleNameInput: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
  })
);

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const NewOrgRole = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { organizationId } = Lockr.get("USER_DATA");
  const { actions: newOrgRoleActions } = useNewOrgRoleSlice();
  const orgPermissions = useSelector(selectOrgPermissions);
  const orgPermissionsLoading = useSelector(selectIsOrgPermissionsLoading);
  const currentUser = useSelector(selectUser);

  const [wizardStep, setWizardStep] = useState(0);
  const [wizardProccessing, setWizardProccessing] = useState(false);

  const orgRoles = useSelector(selectOrgRoles);
  const multiDeskRoles = useSelector(selectMultiDeskRoles);
  const deskRoles = useSelector(selectDeskRoles);
  const { actions: rolesActions } = useRolesSlice();
  const [newRole, setNewRole] = useState({
    name: "",
    id: "",
    vaultGroupId: "",
  });
  const [lockUsability , setLockUsability] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [submitResponse, setSubmitResponse] = useState({
    type: "success",
    message: "",
  });

  useEffect(() => {
    let unmounted = false;

    const init = async () => {
      dispatch(newOrgRoleActions.getOrgPermissions(organizationId));
      dispatch(rolesActions.getOrgRoles(organizationId));
      dispatch(rolesActions.getMultiDeskRoles(organizationId));
      dispatch(rolesActions.getDeskRoles(organizationId));
      setLockUsability(vault.checkUserLockUsability(currentUser));
    };

    init();

    return () => {
      unmounted = true;
    };
  }, []);

  const handleRoleCreate = async (values: any) => {
    setWizardProccessing(true);
    await createOrgRole(
      organizationId, 
      values.name, 
      currentUser?.vaultUserId as string
    ).then((data) => {
      setSubmitResponse({
        type: "success",
        message: "Successfully created a role",
      });
      setNewRole({
        name: values.name,
        id: data.id,
        vaultGroupId: data.vaultGroupId,
      });
      if (lockUsability) {
        setWizardStep(1);
      } else {
        setWizardStep(2);
      }
    }).catch((err) => {
      setSubmitResponse({
        type: "error",
        message: err.message,
      });
    });
    setWizardProccessing(false);
    setShowAlert(true);
  };

  const handleLockPermission = async (values: any) => {
    if (values.addRemoveUser.length 
      || values.createDeleteRuleTree.length 
      || values.getRuleTrees.length) {
      setWizardProccessing(true);
      try {
        await vault.authenticate();
        await Promise.all(values.addRemoveUser.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.GROUP,
            newRole.vaultGroupId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.AddRemoveUser,
            true,
          );
          await vault.sendRequest(request);
        }));
        await Promise.all(values.createDeleteRuleTree.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.GROUP,
            newRole.vaultGroupId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.CreateDeleteRuleTree,
            true,
          );
          await vault.sendRequest(request);
        }));
        await Promise.all(values.getRuleTrees.map(async (vaultGroupId: string) => {
          const request = await vault.grantPermissionToAsset(
            VaultAssetType.GROUP,
            newRole.vaultGroupId,
            PermissionOwnerType.group,
            vaultGroupId,
            VaultPermissions.GetRuleTrees,
            true,
          );
          await vault.sendRequest(request);
        }));
        setWizardStep(2);
      } catch (error) {
        setSubmitResponse({
          type: "error",
          message: error.message,
        });
        setShowAlert(true);
      }
      setWizardProccessing(false);
    } else {
      setWizardStep(2);
    }
  }

  const handleDefinePermission = async (values: any) => {
    setWizardProccessing(true);
    await updateOrgRole(
      organizationId, 
      newRole.id, 
      newRole.vaultGroupId,
      [],
      {
        name: newRole.name,
        permissions: values.permissions,
      }
    ).then((data) => {
      history.push("/roles");
    }).catch((err) => {
      setSubmitResponse({
        type: "error",
        message: err.message,
      });
      setShowAlert(true);
      setWizardProccessing(false);
    });
  }

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
            render={({
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit} noValidate>
                <Card>
                  <CardHeader title="Create new Organization role" />
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
                      justify="flex-end"
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
            render={({
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit} noValidate>
                <Card>
                  <CardHeader title={`Permission of ${newRole.name}`} />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormGroup
                          className={classes.permissionContainer}
                        >
                          <FormLabel
                            component="legend"
                            className={classes.permissionName}
                          >
                            Assign Users (AddRemoveUser)
                          </FormLabel>
                          <Grid container>
                            {orgRoles.concat(multiDeskRoles, deskRoles).map(
                              (x) => (
                                <Grid item key={x.vaultGroupId} xs={2}>
                                  <Grid
                                    container
                                    alignItems="center"
                                    spacing={1}
                                  >
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
                              )
                            )}
                          </Grid>
                        </FormGroup>
                      </Grid>
                      <Grid item xs={12}>
                        <FormGroup
                          className={classes.permissionContainer}
                        >
                          <FormLabel
                            component="legend"
                            className={classes.permissionName}
                          >
                            Create Rules (CreateDeleteRuleTree)
                          </FormLabel>
                          <Grid container>
                            {orgRoles.concat(multiDeskRoles, deskRoles).map(
                              (x) => (
                                <Grid item key={x.vaultGroupId} xs={2}>
                                  <Grid
                                    container
                                    alignItems="center"
                                    spacing={1}
                                  >
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
                              )
                            )}
                          </Grid>
                        </FormGroup>
                      </Grid>
                      <Grid item xs={12}>
                        <FormGroup
                          className={classes.permissionContainer}
                        >
                          <FormLabel
                            component="legend"
                            className={classes.permissionName}
                          >
                            Display Rules (GetRuleTrees)
                          </FormLabel>
                          <Grid container>
                            {orgRoles.concat(multiDeskRoles, deskRoles).map(
                              (x) => (
                                <Grid item key={x.vaultGroupId} xs={2}>
                                  <Grid
                                    container
                                    alignItems="center"
                                    spacing={1}
                                  >
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
                              )
                            )}
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
                      justify="flex-end"
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
            render={({
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit} noValidate>
                <Card>
                  <CardHeader title="Define permissions" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      {orgPermissionsLoading && <Loader />}
                      {!orgPermissionsLoading && (
                        <Grid item xs={12}>
                          <Grid container>
                            {orgPermissions.map((perm: PermissionType) => (
                              <Grid item key={perm.name} xs={12}>
                                <FormGroup
                                  className={classes.permissionContainer}
                                >
                                  <FormLabel
                                    component="legend"
                                    className={classes.permissionName}
                                  >
                                    {perm.name}
                                  </FormLabel>
                                  <Grid container>
                                    {perm.permissions.map(
                                      (avail: { name: string; code: string }) => (
                                        <Grid item key={avail.code} xs={2}>
                                          <Grid
                                            container
                                            alignItems="center"
                                            spacing={1}
                                          >
                                            <Grid item>
                                              <Field
                                                name="permissions[]"
                                                component="input"
                                                type="checkbox"
                                                value={avail.code}
                                              />
                                            </Grid>
                                            <Grid item>
                                              <Typography variant="body1">
                                                {avail.name}
                                              </Typography>
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                      )
                                    )}
                                  </Grid>
                                </FormGroup>
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Grid
                      container
                      alignItems="center"
                      justify="flex-end"
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
        <Snackbar
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={showAlert}
          onClose={() => {
            setShowAlert(false);
          }}
        >
          <Alert
            onClose={() => {
              setShowAlert(false);
            }}
            severity={submitResponse.type === "success" ? "success" : "error"}
          >
            {submitResponse.message}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default NewOrgRole;
