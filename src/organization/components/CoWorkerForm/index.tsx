import React, { useEffect } from "react";
import Lockr from "lockr";
import { useDispatch, useSelector } from "react-redux";
import { Field, Form } from "react-final-form";
import { TextField, Select } from "mui-rff";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import { diff } from "deep-object-diff";
import {
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import { useCoWorkerFormSlice } from "./slice";
import {
  selectOrgRoles,
  selectMultiDeskRoles,
  selectDeskRoles,
  selectIsUserAddingToVault,
  selectIsUserDeletingFromVault,
} from "./slice/selectors";
import User from "../../../types/User";
import { selectUser } from "../../../slice/selectors";
import { useDesksSlice } from "../Desks/slice";
import { selectDesks } from "../Desks/slice/selectors";
import { userPublicKeyStatus } from "../../../util/constants";
import AvatarInput from "../../../components/AvatarInput";

const useStyles = makeStyles((theme) => ({
  sideMenu: {
    width: 230,
  },
  toolbar: theme.mixins.toolbar,
  listTitle: {
    display: "flex",
  },
  margin: {
    margin: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  selectRole: {
    width: 300,
  },
  roleSelectContainer: {
    display: "flex",
  },
  textInput: {
    minWidth: 230,
    margin: theme.spacing(2),
  },
  saveBtn: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  changeImageBtn: {
    position: "absolute",
    bottom: 45,
    left: 0,
  },
  fixSelectLabel: {
    color: "red",
    "& fieldset>legend ": {
      maxWidth: 1000,
      transition: "max-width 100ms cubic-bezier(0.0, 0, 0.2, 1) 50ms",
    },
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
}));

const validate = (values: any) => {
  const errors: { [key: string]: string } = {};
  if (!values.nickname) {
    errors.nickname = "This Field Required";
  }

  if (!values.email) {
    errors.email = "This Field Required";
  }

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Please enter a valid Email";
  }

  if (!values.jobTitle) {
    errors.jobTitle = "This Field Required";
  }

  if (!values.phone) {
    errors.phone = "This Field Required";
  }

  if (
    // eslint-disable-next-line no-useless-escape
    !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(
      values.phone
    )
  ) {
    errors.phone = "Please enter a valid Phone number";
  }
  return errors;
};

interface CoWorkerFormProps {
  // eslint-disable-next-line react/require-default-props
  coWorker: Partial<User>;
  onSubmit: (
    coWorker: User,
    oldVaultGroup: string[],
    newVaultGroup: string[]
  ) => void;
  onSendResetPasswordLink: () => void;
  formSubmitting: boolean;
  passwordResetting: boolean;
}
interface deskType {
  id?: string;
  name: string;
}

const CoWorkerForm: React.FC<CoWorkerFormProps> = ({
  onSubmit,
  onSendResetPasswordLink,
  coWorker,
  formSubmitting,
  passwordResetting,
}: CoWorkerFormProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { organizationId } = Lockr.get("USER_DATA");
  const { actions: coworkerActions } = useCoWorkerFormSlice();
  const { actions: desksActions } = useDesksSlice();
  const desks = useSelector(selectDesks);
  const orgRoles = useSelector(selectOrgRoles);
  const multiDeskRoles = useSelector(selectMultiDeskRoles);
  const deskRoles = useSelector(selectDeskRoles);
  const currentUser = useSelector(selectUser);
  const addingUserToVault = useSelector(selectIsUserAddingToVault);
  const removingUserFromVault = useSelector(selectIsUserDeletingFromVault);
  const canCreateVaultUser =
    currentUser &&
    currentUser.vaultUserId &&
    currentUser.publicKey &&
    currentUser.publicKey.status === userPublicKeyStatus.approved &&
    coWorker.publicKey &&
    coWorker.publicKey.status === userPublicKeyStatus.requesting &&
    !coWorker.vaultUserId;

  const canRemoveVaultUser =
    currentUser &&
    currentUser.vaultUserId &&
    currentUser.publicKey &&
    currentUser.publicKey.status === userPublicKeyStatus.approved &&
    coWorker.publicKey &&
    coWorker.publicKey.status === userPublicKeyStatus.revoking &&
    coWorker.vaultUserId;

  useEffect(() => {
    let unmounted = false;

    dispatch(coworkerActions.getOrgRoles(organizationId));
    dispatch(coworkerActions.getMultiDeskRoles(organizationId));
    dispatch(desksActions.getDesks());
    dispatch(coworkerActions.getDeskRoles(organizationId));

    return () => {
      unmounted = true;
    };
  }, [coWorker]);

  const getRoleDetail = (roleId: string) => {
    if (orgRoles.filter((role: any) => role.id === roleId).length > 0)
      return {
        kind: "RoleOrganization",
        ...orgRoles.filter((role: any) => role.id === roleId)[0],
      };
    if (multiDeskRoles.filter((role: any) => role.id === roleId).length > 0)
      return {
        kind: "RoleMultidesk",
        ...multiDeskRoles.filter((role: any) => role.id === roleId)[0],
      };
    if (deskRoles.filter((role: any) => role.id === roleId).length > 0)
      return {
        kind: "RoleDesk",
        ...deskRoles.filter((role: any) => role.id === roleId)[0],
      };
    return {
      id: roleId,
      kind: "",
      desk: { id: "", name: "" },
      effectiveDesks: [],
    };
  };
  const handleOnSubmit = (values: any) => {
    const updates: Partial<User> = diff(coWorker, values);

    updates.roles = values.roles.map((role: any) => {
      const roleDetail = getRoleDetail(role.id);

      if (roleDetail.kind === "RoleOrganization") {
        return { id: role.id, kind: roleDetail.kind };
      }
      if (roleDetail.kind === "RoleMultidesk") {
        return {
          id: role.id,
          kind: roleDetail.kind,
          effectiveDesks: role.effectiveDesks,
        };
      }
      if (roleDetail.kind === "RoleDesk") {
        return {
          id: role.id,
          kind: roleDetail.kind,
          desk: roleDetail.desk ? roleDetail.desk.id : "",
        };
      }
      return role;
    });

    const existingRoles = orgRoles.concat(multiDeskRoles, deskRoles);

    const oldVaultGroup: string[] = [];
    coWorker.roles?.forEach((x: any) => {
      const exist = existingRoles.find((y) => y.id === x.id);
      if (exist && exist.vaultGroupId) {
        oldVaultGroup.push(exist.vaultGroupId);
      }
    });
    const newVaultGroup: string[] = [];
    values.roles.forEach((x: any) => {
      const exist = existingRoles.find((y) => y.id === x.id);
      if (exist && exist.vaultGroupId) {
        const index = oldVaultGroup.indexOf(exist.vaultGroupId);
        if (index !== -1) {
          oldVaultGroup.splice(index, 1);
        } else {
          newVaultGroup.push(exist.vaultGroupId);
        }
      }
    });

    onSubmit(updates as User, oldVaultGroup, newVaultGroup);
  };

  const handleAddVaultUser = () => {
    if (coWorker.id && coWorker.publicKey) {
      dispatch(
        coworkerActions.addUserToVault({
          organizationId,
          userId: coWorker.id,
          publicKey: coWorker.publicKey,
        })
      );
    }
  };

  const handleRemoveVaultUser = () => {
    if (coWorker.id && coWorker.publicKey) {
      dispatch(
        coworkerActions.removeUserFromVault({
          userVaultId: coWorker.vaultUserId || "",
          userId: coWorker.id,
        })
      );
    }
  };

  return (
    <Container>
      <Form
        onSubmit={handleOnSubmit}
        mutators={{
          ...arrayMutators,
        }}
        initialValues={
          coWorker.roles && coWorker.roles.length > 0
            ? coWorker
            : { ...coWorker, roles: [{ id: "" }] }
        }
        validate={validate}
        render={({
          handleSubmit,
          submitting,
          pristine,
          form: {
            mutators: { push },
          },
          values,
        }) => (
          <form onSubmit={handleSubmit} noValidate>
            <Grid container alignItems="flex-start" spacing={2}>
              {coWorker.vaultUserId && (
                <>
                  <Grid item xs={12}>
                    <FieldArray name="roles">
                      {({ fields }) =>
                        fields.map((name, i) => (
                          <Grid container key={name} spacing={2}>
                            <Grid
                              item
                              xs={5}
                              className={
                                values.roles[i] ? classes.fixSelectLabel : ""
                              }
                            >
                              <Select
                                native
                                name={`${name}.id`}
                                inputProps={{
                                  name: "role",
                                  id: "role-select",
                                }}
                                autoWidth
                                label="Role"
                                variant="outlined"
                                inputLabelProps={{
                                  shrink: !!values.roles[i],
                                  filled: true,
                                }}
                              >
                                <option aria-label="None" value="" />
                                {orgRoles.length && (
                                  <optgroup label="Organization roles">
                                    {orgRoles
                                      .filter(
                                        (role) =>
                                          values.roles[i].id === role.id ||
                                          values.roles.filter(
                                            (r: any) => r.id === role.id
                                          ).length === 0
                                      )
                                      .map((r) => (
                                        <option key={r.id} value={r.id}>
                                          {r.name}
                                        </option>
                                      ))}
                                  </optgroup>
                                )}
                                {multiDeskRoles.length && (
                                  <optgroup label="Multi-desk roles">
                                    {multiDeskRoles
                                      .filter(
                                        (role) =>
                                          values.roles[i].id === role.id ||
                                          values.roles.filter(
                                            (r: any) => r.id === role.id
                                          ).length === 0
                                      )
                                      .map((r) => (
                                        <option key={r.id} value={r.id}>
                                          {r.name}
                                        </option>
                                      ))}
                                  </optgroup>
                                )}
                                {deskRoles.length && (
                                  <optgroup label="Desk roles">
                                    {deskRoles
                                      .filter(
                                        (role) =>
                                          values.roles[i].id === role.id ||
                                          values.roles.filter(
                                            (r: any) => r.id === role.id
                                          ).length === 0
                                      )
                                      .map((r) => (
                                        <option key={r.id} value={r.id}>
                                          {r.name}
                                        </option>
                                      ))}
                                  </optgroup>
                                )}
                              </Select>
                            </Grid>
                            {multiDeskRoles.filter(
                              (role) => values.roles[i].id === role.id
                            ).length > 0 && (
                              <Grid item xs={5}>
                                <Select
                                  multiple
                                  displayEmpty
                                  name={`${name}.effectiveDesks`}
                                  variant="outlined"
                                  label="Desks"
                                  renderValue={(selected: any) => {
                                    return desks
                                      .filter((desk: deskType) =>
                                        selected.includes(desk.id)
                                      )
                                      .map((desk: deskType) => desk.name)
                                      .join(", ");
                                  }}
                                >
                                  <MenuItem disabled value="">
                                    <em>Select</em>
                                  </MenuItem>
                                  {desks.map((item: deskType) => (
                                    <MenuItem key={item.id} value={item.id}>
                                      <Checkbox
                                        checked={
                                          values.roles[
                                            i
                                          ].effectiveDesks.indexOf(item.id) > -1
                                        }
                                      />
                                      <ListItemText>{item.name}</ListItemText>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </Grid>
                            )}
                            <Grid item xs={2}>
                              <Grid container spacing={1}>
                                {fields.length !== 1 && (
                                  <Grid item>
                                    <IconButton onClick={() => fields.remove(i)} aria-label="Remove role" size="large">
                                      <DeleteForeverIcon />
                                    </IconButton>
                                  </Grid>
                                )}
                                {i === (fields.length || 0) - 1 &&
                                  (fields.length || 0) <
                                    orgRoles.length +
                                      multiDeskRoles.length +
                                      deskRoles.length && (
                                    <Grid item>
                                      <IconButton
                                        onClick={() =>
                                          push("roles", {
                                            id: "",
                                            kind: "",
                                            desk: "",
                                            effectiveDesks: [],
                                          })
                                        }
                                        aria-label="Add role"
                                        size="large">
                                        <AddCircleOutlineIcon />
                                      </IconButton>
                                    </Grid>
                                  )}
                              </Grid>
                            </Grid>
                          </Grid>
                        ))
                      }
                    </FieldArray>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider variant="fullWidth" />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Grid container spacing={4}>
                  <Grid item xs={7}>
                    <Grid container spacing={2}>
                      <Grid item sm={12}>
                        <TextField
                          required
                          id="nickname"
                          name="nickname"
                          label="Nickname"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          id="email"
                          name="email"
                          label="Email"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          label="Phone"
                          name="phone"
                          id="phone"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          id="job-title"
                          label="Job title"
                          name="jobTitle"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={5}>
                    <Field name="avatar" render={AvatarInput} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid container alignItems="center" justifyContent="flex-end">
                  <Grid item>
                    <div className={classes.progressButtonWrapper}>
                      <Button
                        variant="contained"
                        disabled={!canCreateVaultUser || addingUserToVault}
                        fullWidth
                        color="primary"
                        onClick={handleAddVaultUser}
                      >
                        Add to vault
                      </Button>
                      {addingUserToVault && (
                        <CircularProgress
                          size={24}
                          className={classes.progressButton}
                        />
                      )}
                    </div>
                  </Grid>
                  {canRemoveVaultUser && (
                    <Grid item>
                      <div className={classes.progressButtonWrapper}>
                        <Button
                          fullWidth
                          color="secondary"
                          variant="outlined"
                          onClick={handleRemoveVaultUser}
                          disabled={removingUserFromVault}
                        >
                          Remove from vault
                        </Button>
                        {removingUserFromVault && (
                          <CircularProgress
                            size={24}
                            className={classes.progressButton}
                          />
                        )}
                      </div>
                    </Grid>
                  )}
                  <Grid item>
                    <div className={classes.progressButtonWrapper}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={onSendResetPasswordLink}
                        disabled={passwordResetting}
                      >
                        Send Reset Password Link
                      </Button>
                      {passwordResetting && (
                        <CircularProgress
                          size={24}
                          className={classes.progressButton}
                        />
                      )}
                    </div>
                  </Grid>
                  <Grid item>
                    <div className={classes.progressButtonWrapper}>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={formSubmitting}
                      >
                        Save Changes
                      </Button>
                      {formSubmitting && (
                        <CircularProgress
                          size={24}
                          className={classes.progressButton}
                        />
                      )}
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        )}
      />
    </Container>
  );
};

// CoWorkerForm.defaultProps = defaultProps;
export default CoWorkerForm;
