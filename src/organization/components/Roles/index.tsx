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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Snackbar,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SearchIcon from "@material-ui/icons/Search";
import Lock from '@material-ui/icons/Lock';

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
import vault, { VaultPermissions } from "../../../vault";
import { PermissionOwnerType } from "../../../vault/enum/permission-owner-type";
import { VaultAssetType } from "../../../vault/enum/asset-type";
import { selectUser } from "../../../slice/selectors";

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

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
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
  const currentUser = useSelector(selectUser);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const roleCategories = [
    { name: "All roles", value: "all" },
    { name: "Organization roles", value: "organization" },
    { name: "Multi-desk roles", value: "multi-desk" },
    { name: "Desk roles", value: "desk" },
  ];

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
  const [lockUsability , setLockUsability] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [submitResponse, setSubmitResponse] = useState({
    type: "success",
    message: "",
  });

  useEffect(() => {
    let unmounted = false;

    const init = () => {
      dispatch(rolesActions.getOrgRoles(organizationId));
      dispatch(rolesActions.getMultiDeskRoles(organizationId));
      dispatch(rolesActions.getDeskRoles(organizationId));
      dispatch(rolesActions.getOrgPermissions(organizationId));
      dispatch(rolesActions.getMultiDeskPermissions({ organizationId }));
      dispatch(desksActions.getDesks());
      dispatch(rolesActions.getDeskPermissions({ organizationId }));
      setLockUsability(vault.checkUserLockUsability(currentUser));
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

  const onOrgRoleRemove = async (roleId: string, vaultGroupId: string) => {
    dispatch(
      rolesActions.deleteOrgRole({
        organizationId,
        roleId,
        vaultGroupId,
      })
    );
  };

  const onMultiDeskRoleRemove = async (
    roleId: string,
    vaultGroupId: string
  ) => {
    dispatch(
      rolesActions.deleteMultiDeskRole({
        organizationId,
        roleId,
        vaultGroupId,
      })
    );
  };

  const onDeskRoleRemove = async (
    deskId: string,
    roleId: string,
    vaultGroupId: string
  ) => {
    dispatch(
      rolesActions.deleteDeskRole({
        organizationId,
        deskId,
        roleId,
        vaultGroupId,
      })
    );
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
          role: values,
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
          role: values,
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
          role,
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

  const openLockModal = async (role: any) => {
    setLockingRole(role);
    try {
      const request = await vault.getAssetPermissions(
        VaultAssetType.GROUP,
        role.vaultGroupId,
        true,
      );
      const permissions = await vault.sendRequest(request);
      
      const addRemoveUser: string[] = [];
      const createDeleteRuleTree: string[] = [];
      const getRuleTrees: string[] = [];
      permissions.groupPermissions.forEach((x: any) => {
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
      })
      setLockPermissions({
        addRemoveUser,
        createDeleteRuleTree,
        getRuleTrees
      })
      setLockModalView(true); 
    } catch (error) {
      setSubmitResponse({
        type: "error",
        message: error.message,
      });
      setShowAlert(true);
    }
  }

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
      })
      await vault.authenticate();
      await Promise.all(addRemoveUserOld.map(async (vaultGroupId: string) => {
        const request = await vault.revokePermissionFromAsset(
          VaultAssetType.GROUP,
          lockingRole.vaultGroupId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.AddRemoveUser,
          true,
        );
        await vault.sendRequest(request);
      }));
      await Promise.all(addRemoveUserNew.map(async (vaultGroupId: string) => {
        const request = await vault.grantPermissionToAsset(
          VaultAssetType.GROUP,
          lockingRole.vaultGroupId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.AddRemoveUser,
          true,
        );
        await vault.sendRequest(request);
      }));

      const createDeleteRuleTreeOld = [...lockPermissions.createDeleteRuleTree];
      const createDeleteRuleTreeNew: string[] = [];
      values.createDeleteRuleTree.forEach((x: string) => {
        const index = createDeleteRuleTreeOld.indexOf(x);
        if (index !== -1) {
          createDeleteRuleTreeOld.splice(index, 1);
        } else {
          createDeleteRuleTreeNew.push(x);
        }
      })
      await Promise.all(createDeleteRuleTreeOld.map(async (vaultGroupId: string) => {
        const request = await vault.revokePermissionFromAsset(
          VaultAssetType.GROUP,
          lockingRole.vaultGroupId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.CreateDeleteRuleTree,
          true,
        );
        await vault.sendRequest(request);
      }));
      await Promise.all(createDeleteRuleTreeNew.map(async (vaultGroupId: string) => {
        const request = await vault.grantPermissionToAsset(
          VaultAssetType.GROUP,
          lockingRole.vaultGroupId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.CreateDeleteRuleTree,
          true,
        );
        await vault.sendRequest(request);
      }));

      const getRuleTreesOld = [...lockPermissions.getRuleTrees];
      const getRuleTreesNew: string[] = [];
      values.getRuleTrees.forEach((x: string) => {
        const index = getRuleTreesOld.indexOf(x);
        if (index !== -1) {
          getRuleTreesOld.splice(index, 1);
        } else {
          getRuleTreesNew.push(x);
        }
      })
      await Promise.all(getRuleTreesOld.map(async (vaultGroupId: string) => {
        const request = await vault.revokePermissionFromAsset(
          VaultAssetType.GROUP,
          lockingRole.vaultGroupId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.GetRuleTrees,
          true,
        );
        await vault.sendRequest(request);
      }));
      await Promise.all(getRuleTreesNew.map(async (vaultGroupId: string) => {
        const request = await vault.grantPermissionToAsset(
          VaultAssetType.GROUP,
          lockingRole.vaultGroupId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.GetRuleTrees,
          true,
        );
        await vault.sendRequest(request);
      }));

      setSubmitResponse({
        type: "success",
        message: "Successfully updated!",
      });
      setLockModalView(false);
    } catch (error) {
      setSubmitResponse({
        type: "error",
        message: error.message,
      });
    }
    setShowAlert(true);
    setLockModalProcessing(false);
  }

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
                                                    <Grid 
                                                      item
                                                      style={{ marginLeft: "auto" }}
                                                    >
                                                      <IconButton
                                                        style={{ padding: 0 }}
                                                        onClick={(event) => {
                                                          event.stopPropagation();
                                                          openLockModal(role);
                                                        }}
                                                        disabled={!lockUsability}
                                                      >
                                                        <Lock fontSize="default" />
                                                      </IconButton>
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
                                                        onOrgRoleRemove(
                                                          role.id,
                                                          role.vaultGroupId as string
                                                        )
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
                                              role.permissions
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
                                                    <Grid 
                                                      item
                                                      style={{ marginLeft: "auto" }}
                                                    >
                                                      <IconButton
                                                        style={{ padding: 0 }}
                                                        onClick={(event) => {
                                                          event.stopPropagation();
                                                          openLockModal(role);
                                                        }}
                                                        disabled={!lockUsability}
                                                      >
                                                        <Lock fontSize="default" />
                                                      </IconButton>
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
                                                          role.id,
                                                          role.vaultGroupId as string
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
                                              role.permissions
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
                                                    <Grid 
                                                      item
                                                      style={{ marginLeft: "auto" }}
                                                    >
                                                      <IconButton
                                                        style={{ padding: 0 }}
                                                        onClick={(event) => {
                                                          event.stopPropagation();
                                                          openLockModal(role);
                                                        }}
                                                        disabled={!lockUsability}
                                                      >
                                                        <Lock fontSize="default" />
                                                      </IconButton>
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
                                                          role.id,
                                                          role.vaultGroupId as string
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
            render={({
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit} noValidate>
                <DialogTitle id="form-dialog-title">
                  {`Permission of ${lockingRole.name}`}
                </DialogTitle>
                <Divider />
                <DialogContent>
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

export default Roles;
