/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField } from "mui-rff";
import {
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  Icon,
  IconButton,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import DeleteIcon from "@mui/icons-material/Delete";
import MaterialTable from "material-table";

import data from "./data";
import { useDesksSlice } from "./slice";
import {
  selectDesks,
  selectIsDeskCreating,
  selectIsDeskDeleting,
} from "./slice/selectors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      fontWeight: "bold",
      padding: 0,
    },
    currencyDropdown: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    errorMessage: {
      marginTop: theme.spacing(8),
    },
    link: {
      color: theme.palette.primary.main,
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

const currencyOptions = [{ name: "U$", value: "usd" }];
interface deskType {
  name: string;
  tradeLevels: [];
  investors?: number;
  coworkers?: number;
  value?: number;
  createdAt?: string;
}

const validate = (values: any) => {
  const errors: Partial<deskType> = {};
  if (!values.name) {
    errors.name = "This Field Required";
  }
  return errors;
};

const Desks = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { organizationId } = Lockr.get("USER_DATA");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [desk, setDesk] = useState<deskType>({
    name: "",
    tradeLevels: [],
  });
  const { actions } = useDesksSlice();
  const desks = useSelector(selectDesks);
  const deskCreating = useSelector(selectIsDeskCreating);
  const deskDeleting = useSelector(selectIsDeskDeleting);

  useEffect(() => {
    dispatch(actions.getDesks());
  }, []);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDeskCreate = async (values: deskType) => {
    await dispatch(actions.addDesk({ organizationId, desk: values }));
    setDialogOpen(false);
  };

  const handleDeskDelete = (id: string) => {
    dispatch(actions.removeDesk({ organizationId, deskId: id }));
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item>
                        <Typography variant="h5">DESKS</Typography>
                      </Grid>
                      <Grid item>
                        <IconButton
                          className={classes.addButton}
                          color="primary"
                          onClick={handleDialogOpen}
                          size="large">
                          <Icon fontSize="large">add_circle</Icon>
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Typography variant="body2">
                          Preferred currency display:
                        </Typography>
                      </Grid>
                      <Grid item>
                        <FormControl
                          size="small"
                          variant="outlined"
                          className={classes.currencyDropdown}
                        >
                          <Select value="usd">
                            {currencyOptions.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <MaterialTable
                  columns={[
                    {
                      field: "name",
                      title: "Desks",
                      cellStyle: {
                        width: "30%",
                      },
                      render: (rowData: any) => {
                        const { id, name } = rowData;

                        return <Link to={`/desks/${id}`}>{name}</Link>;
                      },
                    },
                    {
                      field: "investors",
                      title: "Investors",
                      cellStyle: {
                        width: "20%",
                      },
                    },
                    {
                      field: "coworkers",
                      title: "Co-workers",
                      cellStyle: {
                        width: "20%",
                      },
                    },
                    {
                      field: "value",
                      title: "Desk Value",
                      cellStyle: {
                        width: "20%",
                      },
                    },
                    {
                      title: "Action",
                      cellStyle: {
                        width: "10%",
                      },
                      render: (rowData: any) => {
                        const { id } = rowData;

                        return (
                          <Grid container spacing={2}>
                            <Grid item>
                              <IconButton
                                color="inherit"
                                onClick={() => handleDeskDelete(id)}
                                disabled={deskDeleting}
                                size="large">
                                <DeleteIcon
                                  fontSize="small"
                                  color="error"
                                  className="icon-delete"
                                />
                              </IconButton>
                            </Grid>
                          </Grid>
                        );
                      },
                    },
                  ]}
                  data={desks.map((deskItem: any) => ({ ...deskItem }))}
                  options={{ showTitle: false }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          aria-labelledby="form-dialog-title"
        >
          <Form
            onSubmit={handleDeskCreate}
            mutators={{
              ...arrayMutators,
            }}
            initialValues={desk}
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
                <DialogTitle id="form-dialog-title">
                  Create New Desk
                </DialogTitle>
                <Divider />
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        label="Desk name"
                        type="text"
                        name="name"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <Divider />
                <DialogActions>
                  <Button onClick={handleDialogClose} variant="contained">
                    Cancel
                  </Button>
                  <div className={classes.progressButtonWrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={deskCreating}
                    >
                      Create
                    </Button>
                    {deskCreating && (
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
      </Container>
    </div>
  );
};

export default Desks;
