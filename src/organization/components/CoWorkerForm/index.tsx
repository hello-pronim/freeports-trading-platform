import React, { useEffect } from "react";
import Lockr from "lockr";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "react-final-form";
import { TextField, Select } from "mui-rff";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import { diff } from "deep-object-diff";
import {
  Avatar,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";

import profile from "../../../assets/images/profile.jpg";
import { useCoWorkerFormSlice } from "./slice";
import {
  selectOrgRoles,
  selectMultiDeskRoles,
  selectDeskRoles,
} from "./slice/selectors";
import User from "../../../types/User";
import { selectUser } from "../../../slice/selectors";
import { useDesksSlice } from "../Desks/slice";
import { selectDesks } from "../Desks/slice/selectors";

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
  profileImageContainer: {
    position: "relative",
    maxWidth: 200,
  },
  profileImage: {
    width: "100%",
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
  logoImageContainer: {
    position: "relative",
    width: 200,
    height: 200,
    margin: "auto",
    "&:hover, &:focus": {
      "& $logoImage": {
        opacity: 0.5,
      },
    },
  },
  logoImage: {
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  logoFileInput: {
    opacity: 0,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    cursor: "pointer",
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
  onSubmit: (coWorker: User) => void;
  onSendResetPasswordLink: () => void;
}
interface deskType {
  id?: string;
  name: string;
}

const CoWorkerForm: React.FC<CoWorkerFormProps> = ({
  onSubmit,
  onSendResetPasswordLink,
  coWorker,
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
  const canCreateVaultUser =
    currentUser &&
    currentUser.vaultUserId &&
    coWorker.publicKeys &&
    coWorker.publicKeys[0] &&
    !coWorker.vaultUserId;

  useEffect(() => {
    dispatch(coworkerActions.getOrgRoles(organizationId));
    dispatch(coworkerActions.getMultiDeskRoles(organizationId));
    dispatch(desksActions.getDesks(organizationId));
    dispatch(coworkerActions.getDeskRoles(organizationId));
  }, []);

  const handleOnSubmit = (values: any) => {
    const updates: Partial<User> = diff(coWorker, values);
    updates.roles = values.roles;
    console.log(updates);
    onSubmit(updates as User);
  };

  const handleAddVaultUser = () => {
    console.log("handle add to vault ", coWorker, currentUser);
    if (coWorker.id && coWorker.publicKeys && coWorker.publicKeys[0]) {
      dispatch(
        coworkerActions.addUserToVault({
          userId: coWorker.id,
          publicKey: coWorker.publicKeys[0],
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
        initialValues={coWorker}
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
                            >
                              <MenuItem disabled value="">
                                <em>Select</em>
                              </MenuItem>
                              {desks.map((item: deskType) => (
                                <MenuItem key={item.id} value={item.id}>
                                  {item.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </Grid>
                        )}
                        {i !== 0 && (
                          <Grid item xs={2}>
                            <Grid container spacing={1}>
                              <Grid item>
                                <IconButton
                                  onClick={() => fields.remove(i)}
                                  aria-label="Remove role"
                                >
                                  <DeleteForeverIcon />
                                </IconButton>
                              </Grid>
                              {i === (fields.length || 0) - 1 &&
                                (fields.length || 0) <
                                  orgRoles.length +
                                    multiDeskRoles.length +
                                    deskRoles.length && (
                                  <Grid item>
                                    <IconButton
                                      onClick={() => push("roles", { id: "" })}
                                      aria-label="Add role"
                                    >
                                      <AddCircleOutlineIcon />
                                    </IconButton>
                                  </Grid>
                                )}
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    ))
                  }
                </FieldArray>
              </Grid>
              {coWorker.roles && coWorker.roles.length > 0 && (
                <Grid item xs={12}>
                  <Divider variant="fullWidth" />
                </Grid>
              )}
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Select
                          label="Status"
                          native
                          name="suspended"
                          variant="outlined"
                          inputProps={{
                            name: "suspended",
                            id: "suspended-select",
                          }}
                        >
                          <option aria-label="None" value="" />
                          <option value="ACTIVE">Active</option>
                          <option value="DISABLED">Disabled</option>
                        </Select>
                      </Grid>
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
                      <Grid item xs={6}>
                        <TextField
                          id="job-title"
                          label="Job title"
                          name="jobTitle"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                    {canCreateVaultUser && (
                      <Grid container spacing={3}>
                        <Grid item sm={12} md={6}>
                          <Button
                            fullWidth
                            color="primary"
                            onClick={handleAddVaultUser}
                          >
                            Add to vault
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                  <Grid item xs={4}>
                    <div className={classes.logoImageContainer}>
                      <Avatar
                        src={profile}
                        alt="Avatar"
                        className={classes.logoImage}
                      />
                      {/* <input
                        type="file"
                        name="avatar"
                        className={classes.logoFileInput}
                        onChange={onLogoFileChange}
                      /> */}
                    </div>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid container justify="flex-end" spacing={2}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onSendResetPasswordLink}
                    >
                      Send Reset Password Link
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={submitting || pristine}
                    >
                      Save Changes
                    </Button>
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
