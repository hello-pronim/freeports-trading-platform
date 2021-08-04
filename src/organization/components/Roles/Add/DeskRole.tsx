/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useDispatch, useSelector } from "react-redux";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField, Select } from "mui-rff";
import { useHistory } from "react-router";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  createStyles,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  makeStyles,
  MenuItem,
  Theme,
  Typography,
} from "@material-ui/core";

import "bootstrap/dist/css/bootstrap.min.css";

import { useNewOrgRoleSlice } from "./slice";
import { useDesksSlice } from "../../Desks/slice";
import {
  selectDeskPermissions,
  selectIsDeskPermissionsLoading,
} from "./slice/selectors";
import { selectDesks, selectIsDesksLoading } from "../../Desks/slice/selectors";
import Loader from "../../../../components/Loader";

interface RoleType {
  name: string;
  permissions: Array<string>;
}
interface PermissionType {
  name: string;
  permissions: Array<{ code: string; name: string }>;
}
interface deskType {
  id?: string;
  name: string;
}

const validate = (values: any) => {
  const errors: Partial<any> = {};

  if (!values.name) {
    errors.name = "This Field Required";
  }

  if (!values.deskId || values.deskId === "0") {
    errors.deskId = "This Field Required";
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

const NewDeskRole = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { organizationId } = Lockr.get("USER_DATA");
  const { actions: newDeskRoleActions } = useNewOrgRoleSlice();
  const { actions: desksActions } = useDesksSlice();
  const deskPermissions = useSelector(selectDeskPermissions);
  const deskPermissionsLoading = useSelector(selectIsDeskPermissionsLoading);
  const desks = useSelector(selectDesks);
  const desksLoading = useSelector(selectIsDesksLoading);
  const [deskRole, setDeskRole] = useState<RoleType>({
    name: "",
    permissions: [],
  });

  useEffect(() => {
    let unmounted = false;

    const init = async () => {
      await dispatch(desksActions.getDesks(organizationId));
      await dispatch(newDeskRoleActions.getDeskPermissions(organizationId));
    };

    init();

    return () => {
      unmounted = true;
    };
  }, []);

  const handleRoleCreate = async (values: {
    name: string;
    deskId: string;
    permissions: string[];
  }) => {
    const { deskId } = values;
    const role = { name: values.name, permissions: values.permissions };
    await dispatch(
      newDeskRoleActions.addDeskRole({
        organizationId,
        deskId,
        role,
      })
    );
    history.push("/roles");
  };

  const handleCancelClick = () => {
    history.push("/roles");
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Form
          onSubmit={handleRoleCreate}
          mutators={{
            ...arrayMutators,
          }}
          initialValues={deskRole}
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
              <Card>
                <CardHeader title="Create new Desk role" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            className={classes.roleNameInput}
                            label="Role Name"
                            name="name"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Select
                            native
                            name="deskId"
                            label="Desk"
                            variant="outlined"
                            fullWidth
                          >
                            <option value="0">Select...</option>
                            {desks.map((deskItem: deskType) => (
                              <option key={deskItem.id} value={deskItem.id}>
                                {deskItem.name}
                              </option>
                            ))}
                          </Select>
                        </Grid>
                      </Grid>
                    </Grid>
                    {deskPermissionsLoading && <Loader />}
                    {!deskPermissionsLoading && (
                      <Grid item xs={12}>
                        <Grid container>
                          {deskPermissions.map((perm: PermissionType) => (
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
                  <Grid container justify="flex-end" spacing={2}>
                    <Grid item>
                      <Button variant="contained" onClick={handleCancelClick}>
                        Cancel
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        disabled={submitting || pristine}
                      >
                        Create Role
                      </Button>
                    </Grid>
                  </Grid>
                </CardActions>
              </Card>
            </form>
          )}
        />
      </Container>
    </div>
  );
};

export default NewDeskRole;
