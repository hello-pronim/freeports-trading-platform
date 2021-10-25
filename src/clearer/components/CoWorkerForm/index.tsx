import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field, Form } from "react-final-form";
import { TextField, Select } from "mui-rff";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import { diff } from "deep-object-diff";
import {
  Avatar,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import profile from "../../../assets/images/profile.jpg";
import { useCoWorkerFormSlice } from "./slice";
import {
  selectRoles,
  selectIsUserAddingToVault,
  selectIsUserDeletingFromVault,
} from "./slice/selectors";
import User from "../../../types/User";
import { selectUser } from "../../../slice/selectors";
import { GetVaultOrganizationResponseDto } from "../../../vault/dto/get-vault-organizations.dto";
import { userPublicKeyStatus } from "../../../util/constants";
import { publicKeyToString } from "../../../util/keyStore/functions";
import { generateCertificationEmojis } from "../../../util/sas";
import AvatarInput from "../../../components/AvatarInput";
import {
  selectClearerSettings,
} from "../Settings/slice/selectors";
import { useClearerSettingsSlice } from "../Settings/slice";

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
  fixSelectLabel: {
    color: "red",
    "& fieldset>legend ": {
      maxWidth: 1000,
      transition: "max-width 100ms cubic-bezier(0.0, 0, 0.2, 1) 50ms",
    },
  },
  emojiBlock: {
    display: "inline-block",
    margin: theme.spacing(1),
    textAlign: "center",
  },
  emojiIcon: {
    fontSize: "24px",
  },
  emojiName: {
    textTransform: "uppercase",
    fontSize: "12px",
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
    newVaultGroup: string[],
    oldVaultOrgGroup: string[],
    newVaultOrgGroup: string[]
  ) => void;
  onSendResetPasswordLink: () => void;
  onResetOTP: () => void;
  formSubmitting: boolean;
  passwordResetting: boolean;
  OTPResetting: boolean;
}

const CoWorkerForm: React.FC<CoWorkerFormProps> = ({
  onSubmit,
  onSendResetPasswordLink,
  onResetOTP,
  coWorker,
  formSubmitting,
  passwordResetting,
  OTPResetting,
}: CoWorkerFormProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { actions } = useCoWorkerFormSlice();
  const existingRoles = useSelector(selectRoles);
  const addingUserToVault = useSelector(selectIsUserAddingToVault);
  const removingUserFromVault = useSelector(selectIsUserDeletingFromVault);
  const [publicKeyEmojisDialog, setPublicKeyEmojisDialog] = useState(false);
  const [publicKeyEmojis, setPublicKeyEmojis] = useState<any>([]);
  const currentUser = useSelector(selectUser);
  const clearerSettings = useSelector(selectClearerSettings);
  const { actions: clearerSettingsActions } = useClearerSettingsSlice();

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

    dispatch(actions.getRoles());
    
    return () => {
      unmounted = true;
    };
  }, [coWorker]);

  useEffect(() => {
    dispatch(clearerSettingsActions.retrieveClearerSettings());
  }, []);

  const handleOnSubmit = (values: any) => {
    const updates: Partial<User> = diff(coWorker, values);
    updates.roles = values.roles;
    const oldVaultGroup: string[] = [];
    const oldVaultOrgGroup: string[] = [];
    coWorker.roles?.forEach((x: any) => {
      const exist = existingRoles.find((y) => y.id === x.id);
      if (exist && exist.vaultGroupId) {
        if (exist.vaultType === "organization") {
          oldVaultOrgGroup.push(exist.vaultGroupId);
        } else {
          oldVaultGroup.push(exist.vaultGroupId);
        }
      }
    });
    const newVaultGroup: string[] = [];
    const newVaultOrgGroup: string[] = [];
    values.roles.forEach((x: any) => {
      const exist = existingRoles.find((y) => y.id === x.id);
      if (exist && exist.vaultGroupId) {
        if (exist.vaultType === "organization") {
          const index = oldVaultOrgGroup.indexOf(exist.vaultGroupId);
          if (index !== -1) {
            oldVaultOrgGroup.splice(index, 1);
          } else {
            newVaultOrgGroup.push(exist.vaultGroupId);
          }
        } else {
          const index = oldVaultGroup.indexOf(exist.vaultGroupId);
          if (index !== -1) {
            oldVaultGroup.splice(index, 1);
          } else {
            newVaultGroup.push(exist.vaultGroupId);
          }
        }
      }
    });

    onSubmit(
      updates as User, 
      oldVaultGroup, 
      newVaultGroup, 
      oldVaultOrgGroup, 
      newVaultOrgGroup
    );
  };

  const onViewPublicKey = async (publicKey: string) => {
    const emojis = generateCertificationEmojis(publicKey);

    setPublicKeyEmojis(emojis);
    setPublicKeyEmojisDialog(true);
  };

  const handleAddVaultUser = () => {
    if (coWorker.id && coWorker.publicKey) {
      dispatch(
        actions.addUserToVault({
          userId: coWorker.id,
          publicKey: coWorker.publicKey,
          vaultOrgId: clearerSettings.vaultOrganizationId as string,
        })
      );
    }

    setPublicKeyEmojisDialog(false);
  };

  const handleRemoveVaultUser = () => {
    if (coWorker.id && coWorker.publicKey) {
      dispatch(
        actions.removeUserFromVault({
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
                              xs={6}
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
                                fullWidth
                                label="Role"
                                variant="outlined"
                                inputLabelProps={{
                                  shrink: !!values.roles[i],
                                  filled: true,
                                }}
                              >
                                <option aria-label="None" value="" />
                                {existingRoles
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
                              </Select>
                            </Grid>
                            {fields.length !== 1 && (
                              <Grid item xs={1}>
                                <IconButton onClick={() => fields.remove(i)} aria-label="Add role" size="large">
                                  <DeleteForeverIcon />
                                </IconButton>
                              </Grid>
                            )}
                            {i === (fields.length || 0) - 1 &&
                              (fields.length || 0) < existingRoles.length && (
                                <Grid item xs={1}>
                                  <IconButton
                                    onClick={() => push("roles", { id: "" })}
                                    aria-label="Add role"
                                    size="large">
                                    <AddCircleOutlineIcon />
                                  </IconButton>
                                </Grid>
                              )}
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
                  <Grid item xs={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
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
                  <Grid item xs={4}>
                    <Field name="avatar" render={AvatarInput} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent="flex-end" spacing={1}>
                  <Grid item>
                    <div className={classes.progressButtonWrapper}>
                      <Button
                        fullWidth
                        color="primary"
                        variant="outlined"
                        disabled={!canCreateVaultUser || addingUserToVault}
                        onClick={() =>
                          onViewPublicKey(
                            coWorker.publicKey ? coWorker.publicKey.key : ""
                          )
                        }
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
                  {coWorker.id && (
                    <Grid item>
                      <div className={classes.progressButtonWrapper}>
                        <Button
                          onClick={onResetOTP}
                          color="primary"
                          variant="contained"
                          disabled={OTPResetting}
                        >
                          Reset OTP Key
                        </Button>
                        {OTPResetting && (
                          <CircularProgress
                            size={24}
                            className={classes.progressButton}
                          />
                        )}
                      </div>
                    </Grid>
                  )}
                  {coWorker.id && (
                    <Grid item>
                      <div className={classes.progressButtonWrapper}>
                        <Button
                          onClick={onSendResetPasswordLink}
                          color="primary"
                          variant="contained"
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
                  )}
                  <Grid item>
                    <div className={classes.progressButtonWrapper}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
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
      <Dialog
        open={publicKeyEmojisDialog}
        onClose={() => setPublicKeyEmojisDialog(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Approve public key</DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              {publicKeyEmojis.map((emoji: any) => {
                return (
                  <div className={classes.emojiBlock} key={emoji}>
                    <div className={classes.emojiIcon}>{emoji[0]}</div>
                    <div className={classes.emojiName}>{emoji[1]}</div>
                  </div>
                );
              })}
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            onClick={() => setPublicKeyEmojisDialog(false)}
            color="secondary"
            variant="contained"
          >
            Close
          </Button>
          <Button
            onClick={handleAddVaultUser}
            color="primary"
            variant="contained"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// CoWorkerForm.defaultProps = defaultProps;
export default CoWorkerForm;
