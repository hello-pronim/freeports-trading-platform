/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useDispatch, useSelector } from "react-redux";
import { Field, Form } from "react-final-form";
import { TextField, Select } from "mui-rff";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardHeader,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Theme,
  Typography,
} from "@material-ui/core";
import { useClearerSettingsSlice } from "./slice";
import {
  selectClearerSettings,
  selectIsFormLoading,
  selectIsFormSubmitting,
} from "./slice/selectors";
import AvatarInput from "../../../components/AvatarInput";
import Loader from "../../../components/Loader";
import vault from "../../../vault";
import { snackbarActions } from "../../../components/Snackbar/slice";

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    marginL10: {
      marginLeft: 10,
    },
    managerName: {
      fontWeight: "bold",
      fontSize: 20,
      marginLeft: 15,
    },
    logoText: {
      fontSize: 20,
      fontWeight: "bold",
      margin: "10px 0px",
    },
    selectStyle: {
      width: "250px",
      fontSize: 25,
      fontWeight: "initial",
      marginLeft: 15,
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
  })
);

const validate = (values: any) => {
  const errors: { [key: string]: string } = {};

  if (!values.name) {
    errors.name = "This Field Required";
  }

  return errors;
};

const Settings = (): React.ReactElement => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const { actions: clearerSettingsActions } = useClearerSettingsSlice();
  const clearerSettings = useSelector(selectClearerSettings);
  const formLoading = useSelector(selectIsFormLoading);
  const formSubmitting = useSelector(selectIsFormSubmitting);
  const [initVaultView, setInitVaultView] = useState(false);
  const [initializingVault, setInitializingVault] = useState(false);

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      dispatch(clearerSettingsActions.retrieveClearerSettings());
    };
    init();
    return () => {
      mounted = true;
    };
  }, []);

  const handleOnSubmit = (values: any) => {
    console.log(values);
    const settings = { ...values };
    delete settings.vaultOrganizationId;
    dispatch(clearerSettingsActions.saveClearerSettings(settings));
  };

  const onInitializeVault = async () => {
    setInitializingVault(true);

    try {
      const vaultRequest = await vault.joinFirstUser();
      const response = await vault.sendRequest(vaultRequest);
      console.log("joinFirstUser", response);
    } catch (error) {
      dispatch(
        snackbarActions.showSnackbar({
          message: "First user is already defined",
          type: "error",
        })
      );
    }

    await vault.authenticate();
    await vault.grantClearerDefaultPermissions();

    if (!clearerSettings.vaultOrganizationId) {
      try {
        const vaultRequest1 = await vault.createOrganization();
        const response1 = await vault.sendRequest(vaultRequest1);
        const vaultOrganizationId = response1.organization.id;

        const vaultRequest2 = await vault.createOrganizationManager(
          vaultOrganizationId
        );
        await vault.sendRequest(vaultRequest2);

        await vault.grantOrganizationManagerPermissions(vaultOrganizationId);

        dispatch(clearerSettingsActions.saveClearerSettings({
          vaultOrganizationId
        }));
      } catch (error) {
        dispatch(
          snackbarActions.showSnackbar({
            message: "Error occurred during organization creation",
            type: "error",
          })
        );
      }
    }

    setInitializingVault(false);
    setInitVaultView(false);
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Card>
          <CardHeader 
            title="Settings"
            action={
              <Button
                onClick={() => {
                  setInitVaultView(true);
                }}
                color="primary"
                variant="contained"
              >
                Initialize Vault
              </Button>
            }
          />
          <Divider />
          <CardContent>
            {formLoading && <Loader />}
            {!formLoading && (
              <Form
                onSubmit={handleOnSubmit}
                mutators={{
                  ...arrayMutators,
                }}
                initialValues={clearerSettings}
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
                        <Grid container spacing={4}>
                          <Grid item xs={6}>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  required
                                  id="companyName"
                                  name="name"
                                  label="Company name"
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  id="street"
                                  name="street"
                                  label="Street"
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  id="street2"
                                  name="street2"
                                  label="Street2"
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  id="zip"
                                  label="Zip"
                                  name="zip"
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  id="city"
                                  label="City"
                                  name="city"
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  id="country"
                                  label="Country"
                                  name="country"
                                  variant="outlined"
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={6}>
                            <Field name="logo" render={AvatarInput} />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container justify="flex-end" spacing={1}>
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
            )}
          </CardContent>
        </Card>
      </Container>
      <Dialog
        open={initVaultView}
        onClose={() => {
          setInitVaultView(false);
        }}
      >
        <DialogTitle>Initialize Vault</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            You are about to initialize the vault and this will declare you as first user. Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setInitVaultView(false);
            }} 
            variant="contained"
          >
            No
          </Button>
          <div className={classes.progressButtonWrapper}>
            <Button
              onClick={onInitializeVault}
              color="primary"
              variant="contained"
              disabled={initializingVault}
            >
              Yes
            </Button>
            {initializingVault && (
              <CircularProgress
                size={24}
                className={classes.progressButton}
              />
            )}
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Settings;
