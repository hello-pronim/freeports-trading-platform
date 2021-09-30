/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
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
  createStyles,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Icon,
  IconButton,
  makeStyles,
  Snackbar,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import Permission from "../../../types/Permission";
import { useRole } from "../../../hooks";

export interface RoleType {
  id: string;
  name: string;
  permissions: Array<string>;
  vaultGroupId?: string;
}
interface PermissionType {
  name: string;
  permissions: Array<{ code: string; name: string }>;
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

const Roles = (): React.ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const { retrieveRoles, retrievePermissions, updateRole, removeRole } =
    useRole();
  const [roles, setRoles] = useState([] as any[]);
  const [permissionGroups, setPermissionGroups] = useState([] as any[]);
  const [removing, setRemoving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitResponse, setSubmitResponse] = useState({
    type: "success",
    message: "",
  });
  const [showAlert, setShowAlert] = useState(false);

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
    setShowAlert(false);
    setSubmitResponse({ type: "", message: "" });

    const response = await updateRole(roleId, newRole, oldPermissions);
    if (response.errorType) {
      setSubmitResponse({
        type: "error",
        message: response.message,
      });
    } else {
      setSubmitResponse({
        type: "success",
        message: "Role has been updated successfully.",
      });
    }
    setSaving(false);
    setShowAlert(true);
  };

  const onRoleRemove = async (roleId: string, vaultGroupId: string) => {
    // const newRoles = roles.filter((role: any) => role.id !== roleId);
    setRemoving(true);
    setShowAlert(false);
    setSubmitResponse({ type: "", message: "" });
    const response = await removeRole(roleId, vaultGroupId);
    if (response.errorType) {
      setSubmitResponse({
        type: "error",
        message: response.message,
      });
    } else {
      setSubmitResponse({
        type: "success",
        message: "Role has been removed successfully.",
      });
      const newRoles = roles.filter((role) => role.id !== roleId);
      setRoles(newRoles);
    }
    setRemoving(false);
    setShowAlert(true);
  };

  const handleNewRoleClick = () => {
    history.push("/roles/add");
  };

  const handleAlertClose = () => {
    setShowAlert(false);
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
                  .map((role: RoleType) => (
                    <Grid item xs={12}>
                      <Accordion key={role.id}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1c-content"
                        >
                          <div className={classes.column}>
                            <Typography className={classes.roleName}>
                              {role.name}
                            </Typography>
                          </div>
                          <div className={classes.column}>
                            <Typography className={classes.roleDescription} />
                          </div>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container item xs={12}>
                            <Grid item xs={4}>
                              <TextField
                                className={classes.roleNameInput}
                                label="Role Name"
                                value={role.name}
                                onChange={(e) => onRoleNameChange(e, role.id)}
                              />
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                        {permissionGroups.map((permissionGroup: Permission) => (
                          <FormGroup
                            key={permissionGroup.name}
                            className={classes.permissionContainer}
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
                        ))}
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
            <Snackbar
              autoHideDuration={2000}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              open={showAlert}
              onClose={handleAlertClose}
            >
              <Alert
                onClose={handleAlertClose}
                severity={
                  submitResponse.type === "success" ? "success" : "error"
                }
              >
                {submitResponse.message}
              </Alert>
            </Snackbar>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Roles;
