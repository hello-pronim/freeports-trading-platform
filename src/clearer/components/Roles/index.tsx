/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardHeader,
  CardContent,
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
  Typography,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { useRole } from "../../../hooks";

export interface RoleType {
  id: string;
  name: string;
  permissions: Array<string>;
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

const Roles = (): React.ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const { error } = useSelector(
    (state: any) => ({
      error: state.global.error,
    }),
    shallowEqual
  );
  const { retrieveRoles, retrievePermissions, updateRole, removeRole } =
    useRole();
  const [roles, setRoles] = useState([] as any[]);
  const [permissions, setPermissions] = useState([] as any[]);
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
        setPermissions(permissionList);
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

    setSaving(true);
    setShowAlert(false);
    setSubmitResponse({ type: "", message: "" });

    console.log(newRole);

    await updateRole(roleId, newRole)
      .then((data: string) => {
        if (data !== "") {
          setSaving(false);
          setSubmitResponse({
            type: "success",
            message: "Role has been updated successfully.",
          });
          setShowAlert(true);
        }
      })
      .catch((err: any) => {
        setSaving(false);
        setSubmitResponse({
          type: "error",
          message: err.message,
        });
        setShowAlert(true);
      });
  };

  const onRoleRemove = async (roleId: string) => {
    // const newRoles = roles.filter((role: any) => role.id !== roleId);
    setRemoving(true);
    setShowAlert(false);
    setSubmitResponse({ type: "", message: "" });
    await removeRole(roleId)
      .then((data: string) => {
        if (data !== "") {
          setRemoving(false);
          setSubmitResponse({
            type: "success",
            message: "Role has been removed successfully.",
          });
          setShowAlert(true);

          const newRoles = roles.filter((role) => role.id !== roleId);
          setRoles(newRoles);
        }
      })
      .catch((err: any) => {
        setSaving(false);
        setSubmitResponse({
          type: "error",
          message: err.message,
        });
        setShowAlert(true);
      });
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
            <Card>
              <CardHeader
                title={
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
                }
              />
              <Divider />
              <CardContent>
                {roles.length > 0 ? (
                  <Grid container item>
                    <Grid item xs={12}>
                      {roles
                        .filter((role: RoleType) => role.name !== "_default")
                        .map((role: RoleType) => (
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
                                <Typography
                                  className={classes.roleDescription}
                                />
                              </div>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container item xs={12}>
                                <Grid item xs={4}>
                                  <TextField
                                    className={classes.roleNameInput}
                                    label="Role Name"
                                    value={role.name}
                                    onChange={(e) =>
                                      onRoleNameChange(e, role.id)
                                    }
                                  />
                                </Grid>
                              </Grid>
                            </AccordionDetails>
                            {permissions.map((perm: PermissionType) => (
                              <FormGroup
                                key={perm.name}
                                className={classes.permissionContainer}
                              >
                                <FormLabel
                                  component="legend"
                                  className={classes.permissionName}
                                >
                                  {perm.name}
                                </FormLabel>
                                <AccordionDetails
                                  className={classes.permissionDetails}
                                >
                                  {perm.permissions.map(
                                    (avail: { name: string; code: string }) => (
                                      <div
                                        key={avail.code}
                                        className={classes.column}
                                      >
                                        <FormControlLabel
                                          className={classes.checkboxLabel}
                                          control={
                                            <Checkbox
                                              color="primary"
                                              name={avail.code}
                                              checked={Boolean(
                                                role.permissions.includes(
                                                  avail.code
                                                )
                                              )}
                                              onChange={(e) =>
                                                onPermissionChange(e, role.id)
                                              }
                                            />
                                          }
                                          label={avail.name}
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
                                  onClick={() => onRoleRemove(role.id)}
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
                        ))}
                    </Grid>
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Roles;
