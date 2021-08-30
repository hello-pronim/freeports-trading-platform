/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField as MuiTextField, Select as MuiSelect } from "mui-rff";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Container,
  createStyles,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SearchIcon from "@material-ui/icons/Search";

import { useRolesSlice } from "./slice";
import { useDesksSlice } from "../Desks/slice";
import {
  selectOrgRoles,
  selectIsOrgRolesLoading,
  selectIsOrgRoleUpdating,
  selectIsOrgRoleDeleting,
  selectMultiDeskRoles,
  selectIsMultiDeskRolesLoading,
  selectIsMultiDeskRoleUpdating,
  selectIsMultiDeskRoleDeleting,
  selectDeskRoles,
  selectIsDeskRolesLoading,
  selectIsDeskRoleUpdating,
  selectIsDeskRoleDeleting,
  selectOrgPermissions,
  selectIsOrgPermissionsLoading,
  selectMultiDeskPermissions,
  selectIsMultiDeskPermissionsLoading,
  selectDeskPermissions,
  selectIsDeskPermissionsLoading,
} from "./slice/selectors";
import { selectDesks, selectIsDesksLoading } from "../Desks/slice/selectors";
import Role from "../../../types/Role";
import DeskRole from "../../../types/DeskRole";
import Permission from "../../../types/Permission";
import Loader from "../../../components/Loader";

interface RoleType {
  name: string;
  permissions: Array<string>;
}
interface PermissionType {
  name: string;
  permissions: Array<{ code: string; name: string }>;
}
interface DeskType {
  id?: string;
  name: string;
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
    column: {
      flexBasis: "20%",
    },
    link: {
      color: theme.palette.primary.main,
    },
    roleNameInput: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
    errorMessage: {
      marginTop: theme.spacing(8),
    },
    addButton: {
      padding: 0,
    },
    fullWidth: {
      width: "100%",
    },
    roleWrapper: {
      marginBottom: 10,
    },
  })
);

const orgRoleValidate = (values: any) => {
  const errors: Partial<RoleType> = {};

  if (!values.name) {
    errors.name = "This Field Required";
  }

  return errors;
};

const multiDeskRoleValidate = (values: any) => {
  const errors: Partial<RoleType> = {};

  if (!values.name) {
    errors.name = "This Field Required";
  }

  return errors;
};

const deskRoleValidate = (values: any) => {
  const errors: Partial<any> = {};

  if (!values.name) {
    errors.name = "This Field Required";
  }

  if (!values.deskId || values.deskId === "0") {
    errors.deskId = "This Field Required";
  }

  return errors;
};

const Roles = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { organizationId } = Lockr.get("USER_DATA");
  const { actions: rolesActions } = useRolesSlice();
  const { actions: desksActions } = useDesksSlice();
  const desks = useSelector(selectDesks);
  // organization roles
  const orgRoles = useSelector(selectOrgRoles);
  const orgPermissions = useSelector(selectOrgPermissions);
  const orgRolesLoading = useSelector(selectIsOrgRolesLoading);
  const orgRoleUpdating = useSelector(selectIsOrgRoleUpdating);
  const orgRoleDeleting = useSelector(selectIsOrgRoleDeleting);
  const orgPermissionsLoading = useSelector(selectIsOrgPermissionsLoading);
  // multi-desk roles
  const multiDeskRoles = useSelector(selectMultiDeskRoles);
  const multiDeskPermissions = useSelector(selectMultiDeskPermissions);
  const multiDeskRolesLoading = useSelector(selectIsMultiDeskRolesLoading);
  const multiDeskRoleUpdating = useSelector(selectIsMultiDeskRoleUpdating);
  const multiDeskRoleDeleting = useSelector(selectIsMultiDeskRoleDeleting);
  const multiDeskPermissionsLoading = useSelector(
    selectIsMultiDeskPermissionsLoading
  );
  // desk roles
  const deskRoles = useSelector(selectDeskRoles);
  const deskPermissions = useSelector(selectDeskPermissions);
  const deskRolesLoading = useSelector(selectIsDeskRolesLoading);
  const deskRoleUpdating = useSelector(selectIsDeskRoleUpdating);
  const deskRoleDeleting = useSelector(selectIsDeskRoleDeleting);
  const deskPermissionsLoading = useSelector(selectIsDeskPermissionsLoading);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const roleCategories = [
    { name: "All roles", value: "all" },
    { name: "Organization roles", value: "organization" },
    { name: "Multi-desk roles", value: "multi-desk" },
    { name: "Desk roles", value: "desk" },
  ];

  useEffect(() => {
    let unmounted = false;

    const init = () => {
      dispatch(rolesActions.getOrgRoles(organizationId));
      dispatch(rolesActions.getMultiDeskRoles(organizationId));
      dispatch(rolesActions.getDeskRoles(organizationId));
      dispatch(rolesActions.getOrgPermissions(organizationId));
      dispatch(rolesActions.getMultiDeskPermissions({ organizationId }));
      dispatch(desksActions.getDesks(organizationId));
      dispatch(rolesActions.getDeskPermissions({ organizationId }));
    };

    init();

    return () => {
      unmounted = true;
    };
  }, []);

  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchText(value);
  };

  const onCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const onOrgRoleRemove = async (roleId: string) => {
    dispatch(rolesActions.deleteOrgRole({ organizationId, roleId }));
  };

  const onMultiDeskRoleRemove = async (roleId: string) => {
    dispatch(rolesActions.deleteMultiDeskRole({ organizationId, roleId }));
  };

  const onDeskRoleRemove = async (deskId: string, roleId: string) => {
    dispatch(rolesActions.deleteDeskRole({ organizationId, deskId, roleId }));
  };

  const handleOrgRoleUpdate = (
    values: any, 
    roleId: string, 
    vaultGroupId: string, 
    oldPermissions: string[]
  ) => {
    if (roleId) {
      dispatch(
        rolesActions.editOrgRole({ 
          organizationId, 
          roleId, 
          vaultGroupId, 
          oldPermissions, 
          role: values 
        })
      );
    }
  };

  const handleMultiDeskRoleUpdate = (
    values: any, 
    roleId: string, 
    vaultGroupId: string, 
    oldPermissions: string[]
  ) => {
    if (roleId) {
      dispatch(
        rolesActions.editMultiDeskRole({ 
          organizationId, 
          roleId, 
          vaultGroupId, 
          oldPermissions, 
          role: values 
        })
      );
    }
  };

  const handleDeskRoleUpdate = (
    values: any, 
    roleId: string, 
    vaultGroupId: string, 
    oldPermissions: string[]
  ) => {
    if (roleId) {
      const { deskId } = values;
      const role = { name: values.name, permissions: values.permissions };
      dispatch(
        rolesActions.editDeskRole({ 
          organizationId, 
          deskId, 
          roleId, 
          vaultGroupId, 
          oldPermissions, 
          role 
        })
      );
    }
  };

  const handleNewOrgRoleClick = () => {
    history.push("/roles/add");
  };

  const handleNewMultiDeskRoleClick = () => {
    history.push("/multi-desk/roles/add");
  };

  const handleNewDeskRoleClick = () => {
    history.push("/desk/roles/add");
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={6}>
          <Grid item xs={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  className="w-100"
                  placeholder="Search..."
                  value={searchText}
                  onChange={onSearchTextChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <List component="nav" aria-label="investors">
                  {roleCategories
                    .filter((category) =>
                      category.name
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                    )
                    .map((category) => (
                      <ListItem
                        key={category.value}
                        button
                        onClick={() => onCategoryClick(category.value)}
                        selected={category.value === selectedCategory}
                      >
                        <ListItemText primary={category.name} />
                      </ListItem>
                    ))}
                </List>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Grid container spacing={6}>
              {(selectedCategory === "all" ||
                selectedCategory === "organization") && (
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Typography variant="h6">
                            Organization roles
                          </Typography>
                        </Grid>
                        <Grid item>
                          <IconButton
                            color="primary"
                            aria-label="Add Organization Role"
                            className={classes.addButton}
                            onClick={handleNewOrgRoleClick}
                          >
                            <AddCircleIcon fontSize="large" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          {orgRolesLoading && <Loader />}
                          {!orgRolesLoading &&
                            (orgRoles.length > 0 ? (
                              <Grid container item>
                                <Grid item xs={12}>
                                  {orgRoles
                                    .filter(
                                      (role: Role) => role.name !== "_default"
                                    )
                                    .map((role: Role) => (
                                      <div className={classes.roleWrapper}>
                                        <Form
                                          onSubmit={(values) =>
                                            handleOrgRoleUpdate(
                                              values, 
                                              role.id as string, 
                                              role.vaultGroupId as string, 
                                              role.permissions
                                            )
                                          }
                                          mutators={{
                                            ...arrayMutators,
                                          }}
                                          initialValues={role}
                                          validate={orgRoleValidate}
                                          render={({
                                            handleSubmit,
                                            submitting,
                                            pristine,
                                            form: {
                                              mutators: { push },
                                            },
                                            values,
                                          }) => (
                                            <form
                                              onSubmit={handleSubmit}
                                              noValidate
                                            >
                                              <Accordion key={role.id}>
                                                <AccordionSummary
                                                  expandIcon={
                                                    <ExpandMoreIcon />
                                                  }
                                                  aria-controls="panel1c-content"
                                                >
                                                  <Grid
                                                    container
                                                    alignItems="center"
                                                  >
                                                    <Grid item>
                                                      <Typography
                                                        className={
                                                          classes.roleName
                                                        }
                                                      >
                                                        {role.name}
                                                      </Typography>
                                                    </Grid>
                                                    <Grid item>
                                                      <Typography
                                                        className={
                                                          classes.roleDescription
                                                        }
                                                      />
                                                    </Grid>
                                                  </Grid>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                  <Grid container item xs={12}>
                                                    <Grid item xs={4}>
                                                      <MuiTextField
                                                        label="Role Name"
                                                        name="name"
                                                        variant="outlined"
                                                      />
                                                    </Grid>
                                                  </Grid>
                                                </AccordionDetails>
                                                {orgPermissionsLoading && (
                                                  <Loader />
                                                )}
                                                {!orgPermissionsLoading && (
                                                  <>
                                                    {orgPermissions.map(
                                                      (perm: Permission) => (
                                                        <FormGroup
                                                          key={perm.name}
                                                          className={
                                                            classes.permissionContainer
                                                          }
                                                        >
                                                          <FormLabel
                                                            component="legend"
                                                            className={
                                                              classes.permissionName
                                                            }
                                                          >
                                                            {perm.name}
                                                          </FormLabel>
                                                          <AccordionDetails
                                                            className={
                                                              classes.permissionDetails
                                                            }
                                                          >
                                                            {perm.permissions.map(
                                                              (avail: {
                                                                name: string;
                                                                code: string;
                                                              }) => (
                                                                <Grid
                                                                  item
                                                                  key={
                                                                    avail.code
                                                                  }
                                                                  xs={2}
                                                                >
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
                                                                        value={
                                                                          avail.code
                                                                        }
                                                                      />
                                                                    </Grid>
                                                                    <Grid item>
                                                                      <Typography variant="body1">
                                                                        {
                                                                          avail.name
                                                                        }
                                                                      </Typography>
                                                                    </Grid>
                                                                  </Grid>
                                                                </Grid>
                                                              )
                                                            )}
                                                          </AccordionDetails>
                                                        </FormGroup>
                                                      )
                                                    )}
                                                  </>
                                                )}
                                                <Divider />
                                                <AccordionActions>
                                                  <div
                                                    className={
                                                      classes.progressButtonWrapper
                                                    }
                                                  >
                                                    <Button
                                                      variant="contained"
                                                      size="small"
                                                      disabled={orgRoleDeleting}
                                                      onClick={() =>
                                                        role.id &&
                                                        onOrgRoleRemove(role.id)
                                                      }
                                                    >
                                                      Remove
                                                    </Button>
                                                    {orgRoleDeleting && (
                                                      <CircularProgress
                                                        size={24}
                                                        className={
                                                          classes.progressButton
                                                        }
                                                      />
                                                    )}
                                                  </div>
                                                  <div
                                                    className={
                                                      classes.progressButtonWrapper
                                                    }
                                                  >
                                                    <Button
                                                      variant="contained"
                                                      size="small"
                                                      color="primary"
                                                      type="submit"
                                                      disabled={orgRoleUpdating}
                                                    >
                                                      Save
                                                    </Button>
                                                    {orgRoleUpdating && (
                                                      <CircularProgress
                                                        size={24}
                                                        className={
                                                          classes.progressButton
                                                        }
                                                      />
                                                    )}
                                                  </div>
                                                </AccordionActions>
                                              </Accordion>
                                            </form>
                                          )}
                                        />
                                      </div>
                                    ))}
                                </Grid>
                              </Grid>
                            ) : (
                              <></>
                            ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {selectedCategory === "all" && (
                <Divider className={classes.fullWidth} />
              )}
              {(selectedCategory === "all" ||
                selectedCategory === "multi-desk") && (
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Typography variant="h6">Multi-desk roles</Typography>
                        </Grid>
                        <Grid item>
                          <IconButton
                            color="primary"
                            aria-label="Add Multi-Desk Role"
                            className={classes.addButton}
                            onClick={handleNewMultiDeskRoleClick}
                          >
                            <AddCircleIcon fontSize="large" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          {multiDeskRolesLoading && <Loader />}
                          {!multiDeskRolesLoading &&
                            (multiDeskRoles.length > 0 ? (
                              <Grid container item>
                                <Grid item xs={12}>
                                  {multiDeskRoles
                                    .filter(
                                      (role: Role) => role.name !== "_default"
                                    )
                                    .map((role: Role) => (
                                      <div className={classes.roleWrapper}>
                                        <Form
                                          onSubmit={(values) =>
                                            handleMultiDeskRoleUpdate(
                                              values,
                                              role.id as string,
                                              role.vaultGroupId as string,
                                              role.permissions,
                                            )
                                          }
                                          mutators={{
                                            ...arrayMutators,
                                          }}
                                          initialValues={role}
                                          validate={multiDeskRoleValidate}
                                          render={({
                                            handleSubmit,
                                            submitting,
                                            pristine,
                                            form: {
                                              mutators: { push },
                                            },
                                            values,
                                          }) => (
                                            <form
                                              onSubmit={handleSubmit}
                                              noValidate
                                            >
                                              <Accordion key={role.id}>
                                                <AccordionSummary
                                                  expandIcon={
                                                    <ExpandMoreIcon />
                                                  }
                                                  aria-controls="panel1c-content"
                                                >
                                                  <Grid
                                                    container
                                                    alignItems="center"
                                                  >
                                                    <Grid item>
                                                      <Typography
                                                        className={
                                                          classes.roleName
                                                        }
                                                      >
                                                        {role.name}
                                                      </Typography>
                                                    </Grid>
                                                  </Grid>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                  <Grid container item xs={12}>
                                                    <Grid item xs={4}>
                                                      <MuiTextField
                                                        label="Role Name"
                                                        name="name"
                                                        variant="outlined"
                                                      />
                                                    </Grid>
                                                  </Grid>
                                                </AccordionDetails>
                                                {multiDeskPermissionsLoading && (
                                                  <Loader />
                                                )}
                                                {!multiDeskPermissionsLoading && (
                                                  <>
                                                    {multiDeskPermissions.map(
                                                      (perm: Permission) => (
                                                        <FormGroup
                                                          key={perm.name}
                                                          className={
                                                            classes.permissionContainer
                                                          }
                                                        >
                                                          <FormLabel
                                                            component="legend"
                                                            className={
                                                              classes.permissionName
                                                            }
                                                          >
                                                            {perm.name}
                                                          </FormLabel>
                                                          <AccordionDetails
                                                            className={
                                                              classes.permissionDetails
                                                            }
                                                          >
                                                            {perm.permissions.map(
                                                              (avail: {
                                                                name: string;
                                                                code: string;
                                                              }) => (
                                                                <Grid
                                                                  item
                                                                  key={
                                                                    avail.code
                                                                  }
                                                                  xs={2}
                                                                >
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
                                                                        value={
                                                                          avail.code
                                                                        }
                                                                      />
                                                                    </Grid>
                                                                    <Grid item>
                                                                      <Typography variant="body1">
                                                                        {
                                                                          avail.name
                                                                        }
                                                                      </Typography>
                                                                    </Grid>
                                                                  </Grid>
                                                                </Grid>
                                                              )
                                                            )}
                                                          </AccordionDetails>
                                                        </FormGroup>
                                                      )
                                                    )}
                                                  </>
                                                )}
                                                <Divider />
                                                <AccordionActions>
                                                  <div
                                                    className={
                                                      classes.progressButtonWrapper
                                                    }
                                                  >
                                                    <Button
                                                      variant="contained"
                                                      size="small"
                                                      disabled={
                                                        multiDeskRoleDeleting
                                                      }
                                                      onClick={() =>
                                                        role.id &&
                                                        onMultiDeskRoleRemove(
                                                          role.id
                                                        )
                                                      }
                                                    >
                                                      Remove
                                                    </Button>
                                                    {multiDeskRoleDeleting && (
                                                      <CircularProgress
                                                        size={24}
                                                        className={
                                                          classes.progressButton
                                                        }
                                                      />
                                                    )}
                                                  </div>
                                                  <div
                                                    className={
                                                      classes.progressButtonWrapper
                                                    }
                                                  >
                                                    <Button
                                                      variant="contained"
                                                      size="small"
                                                      color="primary"
                                                      type="submit"
                                                      disabled={
                                                        multiDeskRoleUpdating
                                                      }
                                                    >
                                                      Save
                                                    </Button>
                                                    {multiDeskRoleUpdating && (
                                                      <CircularProgress
                                                        size={24}
                                                        className={
                                                          classes.progressButton
                                                        }
                                                      />
                                                    )}
                                                  </div>
                                                </AccordionActions>
                                              </Accordion>
                                            </form>
                                          )}
                                        />
                                      </div>
                                    ))}
                                </Grid>
                              </Grid>
                            ) : (
                              <></>
                            ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {selectedCategory === "all" && (
                <Divider className={classes.fullWidth} />
              )}
              {(selectedCategory === "all" || selectedCategory === "desk") && (
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Typography variant="h6">Desk roles</Typography>
                        </Grid>
                        <Grid item>
                          <Link to="/desk/roles/add">
                            <IconButton
                              color="primary"
                              aria-label="Add Desk Role"
                              className={classes.addButton}
                              onClick={handleNewDeskRoleClick}
                            >
                              <AddCircleIcon fontSize="large" />
                            </IconButton>
                          </Link>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          {deskRolesLoading && <Loader />}
                          {!deskRolesLoading &&
                            (orgRoles.length > 0 ? (
                              <Grid container item>
                                <Grid item xs={12}>
                                  {deskRoles
                                    .filter(
                                      (role: DeskRole) =>
                                        role.name !== "_default"
                                    )
                                    .map((role: DeskRole) => (
                                      <div className={classes.roleWrapper}>
                                        <Form
                                          onSubmit={(values) =>
                                            handleDeskRoleUpdate(
                                              values,
                                              role.id as string,
                                              role.vaultGroupId as string,
                                              role.permissions,
                                            )
                                          }
                                          mutators={{
                                            ...arrayMutators,
                                          }}
                                          initialValues={{
                                            name: role.name,
                                            deskId: role.desk.id,
                                            permissions: role.permissions,
                                          }}
                                          validate={deskRoleValidate}
                                          render={({
                                            handleSubmit,
                                            submitting,
                                            pristine,
                                            form: {
                                              mutators: { push },
                                            },
                                            values,
                                          }) => (
                                            <form
                                              onSubmit={handleSubmit}
                                              noValidate
                                            >
                                              <Accordion key={role.id}>
                                                <AccordionSummary
                                                  expandIcon={
                                                    <ExpandMoreIcon />
                                                  }
                                                  aria-controls="panel1c-content"
                                                >
                                                  <Grid
                                                    container
                                                    alignItems="center"
                                                    spacing={2}
                                                  >
                                                    <Grid item>
                                                      <Typography
                                                        className={
                                                          classes.roleName
                                                        }
                                                      >
                                                        {role.name}
                                                      </Typography>
                                                    </Grid>
                                                    <Grid item>
                                                      <Typography
                                                        color="textSecondary"
                                                        className={
                                                          classes.roleDescription
                                                        }
                                                      >
                                                        {`(${role.desk.name})`}
                                                      </Typography>
                                                    </Grid>
                                                  </Grid>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                  <Grid container spacing={2}>
                                                    <Grid item xs={4}>
                                                      <MuiTextField
                                                        label="Role Name"
                                                        name="name"
                                                        variant="outlined"
                                                      />
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                      <MuiSelect
                                                        native
                                                        name="deskId"
                                                        label="Desk"
                                                        variant="outlined"
                                                        fullWidth
                                                        disabled
                                                      >
                                                        <option value="0">
                                                          Select...
                                                        </option>
                                                        {desks.map(
                                                          (
                                                            deskItem: DeskType
                                                          ) => (
                                                            <option
                                                              key={deskItem.id}
                                                              value={
                                                                deskItem.id
                                                              }
                                                            >
                                                              {deskItem.name}
                                                            </option>
                                                          )
                                                        )}
                                                      </MuiSelect>
                                                    </Grid>
                                                  </Grid>
                                                </AccordionDetails>
                                                {deskPermissionsLoading && (
                                                  <Loader />
                                                )}
                                                {!deskPermissionsLoading && (
                                                  <>
                                                    {deskPermissions.map(
                                                      (perm: Permission) => (
                                                        <FormGroup
                                                          key={perm.name}
                                                          className={
                                                            classes.permissionContainer
                                                          }
                                                        >
                                                          <FormLabel
                                                            component="legend"
                                                            className={
                                                              classes.permissionName
                                                            }
                                                          >
                                                            {perm.name}
                                                          </FormLabel>
                                                          <AccordionDetails
                                                            className={
                                                              classes.permissionDetails
                                                            }
                                                          >
                                                            {perm.permissions.map(
                                                              (avail: {
                                                                name: string;
                                                                code: string;
                                                              }) => (
                                                                <Grid
                                                                  item
                                                                  key={
                                                                    avail.code
                                                                  }
                                                                  xs={2}
                                                                >
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
                                                                        value={
                                                                          avail.code
                                                                        }
                                                                      />
                                                                    </Grid>
                                                                    <Grid item>
                                                                      <Typography variant="body1">
                                                                        {
                                                                          avail.name
                                                                        }
                                                                      </Typography>
                                                                    </Grid>
                                                                  </Grid>
                                                                </Grid>
                                                              )
                                                            )}
                                                          </AccordionDetails>
                                                        </FormGroup>
                                                      )
                                                    )}
                                                  </>
                                                )}
                                                <Divider />
                                                <AccordionActions>
                                                  <div
                                                    className={
                                                      classes.progressButtonWrapper
                                                    }
                                                  >
                                                    <Button
                                                      variant="contained"
                                                      size="small"
                                                      disabled={
                                                        deskRoleDeleting
                                                      }
                                                      onClick={() =>
                                                        role.id &&
                                                        role.desk.id &&
                                                        onDeskRoleRemove(
                                                          role.desk.id,
                                                          role.id
                                                        )
                                                      }
                                                    >
                                                      Remove
                                                    </Button>
                                                    {deskRoleDeleting && (
                                                      <CircularProgress
                                                        size={24}
                                                        className={
                                                          classes.progressButton
                                                        }
                                                      />
                                                    )}
                                                  </div>
                                                  <div
                                                    className={
                                                      classes.progressButtonWrapper
                                                    }
                                                  >
                                                    <Button
                                                      variant="contained"
                                                      size="small"
                                                      color="primary"
                                                      type="submit"
                                                      disabled={
                                                        deskRoleUpdating
                                                      }
                                                    >
                                                      Save
                                                    </Button>
                                                    {deskRoleUpdating && (
                                                      <CircularProgress
                                                        size={24}
                                                        className={
                                                          classes.progressButton
                                                        }
                                                      />
                                                    )}
                                                  </div>
                                                </AccordionActions>
                                              </Accordion>
                                            </form>
                                          )}
                                        />
                                      </div>
                                    ))}
                                </Grid>
                              </Grid>
                            ) : (
                              <></>
                            ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Roles;
