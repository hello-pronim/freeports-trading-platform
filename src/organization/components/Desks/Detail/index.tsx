/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Field, Form } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import arrayMutators from "final-form-arrays";
import { TextField as MuiTextField, Select } from "mui-rff";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CircularProgress,
  Container,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Icon,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  MenuItem,
  Theme,
  TextField,
  Typography,
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import SearchIcon from "@material-ui/icons/Search";
import red from "@material-ui/core/colors/red";

import { useDesksSlice } from "../slice";
import { useDeskDetailSlice } from "./slice";
import {
  selectDesks,
  selectIsDesksLoading,
  selectIsDeskCreating,
} from "../slice/selectors";
import {
  selectDeskDetail,
  selectIsDetailLoading,
  selectIsFormSubmitting,
} from "./slice/selectors";
import Loader from "../../../../components/Loader";
import Desk, { TradeLevel } from "../../../../types/Desk";

interface deskType {
  name: string;
  tradeLevels: [];
  createdAt?: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      fontWeight: "bold",
      padding: 0,
    },
    deleteButton: {
      color: "red",
    },
    textLink: {
      color: red[500],
      cursor: "pointer",
    },
    errorMessage: {
      marginTop: theme.spacing(8),
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

const convertDateToDMY = (date: string) => {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = `${d.getFullYear()}`;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [day, month, year].join(".");
};

const validate = (values: any) => {
  const errors: Partial<Desk> = {};
  if (!values.name) {
    errors.name = "This Field Required";
  }
  return errors;
};

const Detail = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { organizationId } = Lockr.get("USER_DATA");
  const { deskId } = useParams<{ deskId: string }>();
  const { actions: desksActions } = useDesksSlice();
  const { actions: deskDetailActions } = useDeskDetailSlice();
  const desks = useSelector(selectDesks);
  const [desk, setDesk] = useState<Desk>({
    name: "",
    tradeLevels: [],
  });
  const selectedDesk = useSelector(selectDeskDetail);
  const { tradeLevels } = selectedDesk;
  const desksLoading = useSelector(selectIsDesksLoading);
  const deskDetailLoading = useSelector(selectIsDetailLoading);
  const deskCreating = useSelector(selectIsDeskCreating);
  const formSubmitting = useSelector(selectIsFormSubmitting);
  const [searchText, setSearchText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const currencyList = ["CHF", "USD", "EUR", "BTC", "ETH"];

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      await dispatch(desksActions.getDesks());
      await dispatch(deskDetailActions.getDesk({ organizationId, deskId }));
    };
    init();

    return () => {
      mounted = true;
    };
  }, [deskId]);

  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchText(value);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDeskCreate = async (values: Desk) => {
    await dispatch(desksActions.addDesk({ organizationId, desk: values }));
    setDialogOpen(false);
  };

  const handleTradeLevelsUpdate = (values: Desk) => {
    dispatch(
      deskDetailActions.saveTradeLevels({
        organizationId,
        deskId,
        tradeLevels: values.tradeLevels as TradeLevel[],
      })
    );
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Typography variant="h5">Desks</Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      className={classes.addButton}
                      color="primary"
                      onClick={handleDialogOpen}
                    >
                      <Icon fontSize="large">add_circle</Icon>
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
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
                </Grid>
                <Grid item xs={12}>
                  {desksLoading && <Loader />}
                  {!desksLoading && (
                    <List component="nav" aria-label="desks">
                      {desks
                        .filter((deskItem) =>
                          deskItem.name
                            .toLowerCase()
                            .includes(searchText.toLowerCase())
                        )
                        .map((deskItem) => (
                          <ListItem
                            component={Link}
                            button
                            key={deskItem.id}
                            selected={deskItem.id === deskId}
                            to={`/desks/${deskItem.id}`}
                          >
                            <ListItemText primary={deskItem.name} />
                          </ListItem>
                        ))}
                    </List>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            {deskDetailLoading && <Loader />}
            {!deskDetailLoading && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid container justify="space-between" alignItems="center">
                    <Grid item>
                      <Typography variant="h5">{selectedDesk.name}</Typography>
                    </Grid>
                    <Grid item>
                      {selectedDesk.createdAt && (
                        <Typography variant="body2" color="textSecondary">
                          {`Creation date: ${convertDateToDMY(
                            selectedDesk.createdAt
                          )}`}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Form
                    onSubmit={handleTradeLevelsUpdate}
                    mutators={{
                      ...arrayMutators,
                    }}
                    initialValues={
                      selectedDesk.tradeLevels &&
                      selectedDesk.tradeLevels.length > 0
                        ? selectedDesk
                        : {
                            ...selectedDesk,
                            tradeLevels: [
                              {
                                currency: "",
                                small: "",
                                medium: "",
                                mediumSplitBy: "",
                              },
                            ],
                          }
                    }
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
                          <CardHeader
                            title={
                              <Typography variant="h6">Trade Levels</Typography>
                            }
                          />
                          <Divider />
                          <CardContent>
                            <Grid item xs={12}>
                              <FieldArray name="tradeLevels">
                                {({ fields }) =>
                                  fields.map((name, i) => (
                                    <Grid container key={name} spacing={2}>
                                      <Grid item xs={3}>
                                        <Select
                                          native
                                          name={`${name}.currency`}
                                          variant="outlined"
                                          label="Currency"
                                        >
                                          <option aria-label="None" value="" />
                                          {currencyList
                                            .filter(
                                              (currencyItem: string) =>
                                                values.tradeLevels &&
                                                (values.tradeLevels[i]
                                                  .currency === currencyItem ||
                                                  values.tradeLevels.filter(
                                                    (level: any) =>
                                                      level.currency ===
                                                      currencyItem
                                                  ).length === 0)
                                            )
                                            .map((currencyItem: string) => (
                                              <option value={currencyItem}>
                                                {currencyItem}
                                              </option>
                                            ))}
                                        </Select>
                                      </Grid>
                                      <Grid item xs={2}>
                                        <MuiTextField
                                          name={`${name}.small`}
                                          label="Small"
                                          variant="outlined"
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <MuiTextField
                                          name={`${name}.medium`}
                                          label="Medium"
                                          variant="outlined"
                                        />
                                      </Grid>
                                      <Grid item xs={3}>
                                        <MuiTextField
                                          name={`${name}.mediumSplitBy`}
                                          label="Medium split by"
                                          variant="outlined"
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <Grid container spacing={1}>
                                          {fields.length !== 1 && (
                                            <Grid item>
                                              <IconButton
                                                onClick={() => fields.remove(i)}
                                                aria-label="Remove"
                                              >
                                                <DeleteForeverIcon />
                                              </IconButton>
                                            </Grid>
                                          )}
                                          {i === (fields.length || 0) - 1 &&
                                            i < currencyList.length - 1 && (
                                              <Grid item>
                                                <IconButton
                                                  onClick={() =>
                                                    push("tradeLevels", {
                                                      currency: "",
                                                      small: "",
                                                      medium: "",
                                                      mediumSplitBy: "",
                                                    })
                                                  }
                                                  aria-label="Add"
                                                >
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
                          </CardContent>
                          <Divider />
                          <CardActions>
                            <Grid item xs={12}>
                              <Grid
                                container
                                alignItems="center"
                                justify="flex-end"
                              >
                                <Grid item>
                                  <div
                                    className={classes.progressButtonWrapper}
                                  >
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
                          </CardActions>
                        </Card>
                      </form>
                    )}
                  />
                </Grid>
              </Grid>
            )}
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
                      <MuiTextField
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

export default Detail;
