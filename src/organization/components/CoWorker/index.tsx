import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  Accordion,
  AccordionSummary,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import SearchIcon from "@material-ui/icons/Search";

import profile from "../../../assets/images/profile.jpg";
import CoWorkerForm from "../CoWorkerForm";
import User from "../../../types/User";
import { useCoWorkersSlice, initialState } from "./slice";
import {
  selectCoWorkers,
  selectIsFormLoading,
  selectIsLoading,
  selectSelectedCoWorker,
  selectSuspendStateLoading,
} from "./slice/selectors";

import Loader from "../../../components/Loader";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  sideMenu: {
    padding: theme.spacing(3),
    maxWidth: 320,
  },
  main: {
    padding: theme.spacing(2),
  },
  margin: {
    margin: theme.spacing(2),
  },
  addButton: {
    fontWeight: "bold",
    padding: 0,
  },
  accordionSummary: {
    justifyContent: "space-between",
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
  },
  accordionProfile: {
    height: 36,
  },
  accordionCoWorker: {
    display: "flex",
    alignItems: "center",
  },
  paddingSmall: {
    padding: theme.spacing(1),
  },
  userStateLoader: {
    maxHeight: 26,
  },
}));

const defaultCoWorker = initialState.selectedCoWorker;
const CoWorker = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { organizationId } = Lockr.get("USER_DATA");
  const { actions } = useCoWorkersSlice();
  const { coWorkerId } = useParams<{ coWorkerId: string }>();
  const coWorkers = useSelector(selectCoWorkers);
  const formLoading = useSelector(selectIsFormLoading);
  const loading = useSelector(selectIsLoading);
  const selectedCoWorker: User = useSelector(selectSelectedCoWorker);
  const suspendStateLoading: boolean = useSelector(selectSuspendStateLoading);
  const [coWorkerSearch, setCoWorkerSearch] = useState("");
  if (
    coWorkerId &&
    coWorkerId !== "new" &&
    coWorkers.length &&
    (!selectedCoWorker || selectedCoWorker.id !== coWorkerId)
  ) {
    const foundCoWorker = coWorkers.find(
      (coWorker) => coWorker.id === coWorkerId
    );
    if (
      foundCoWorker &&
      foundCoWorker.id !== selectedCoWorker.id &&
      !formLoading
    ) {
      dispatch(actions.selectCoWorker(foundCoWorker));
    } else if (!foundCoWorker) {
      dispatch(actions.selectCoWorker(coWorkers[0]));
    }
  }

  if (coWorkerId === "new") {
    if (selectedCoWorker?.id) {
      history.push(`/co-workers/${selectedCoWorker.id}`);
      dispatch(actions.selectCoWorker(selectedCoWorker));
    } else if (!selectedCoWorker) {
      dispatch(actions.selectCoWorker(defaultCoWorker));
    }
  }
  const handleCoWorkerSelected = (i: number) => {
    history.push(`/co-workers/${coWorkers[i].id}`);
    dispatch(actions.selectCoWorker(coWorkers[i]));
  };

  useEffect(() => {
    window.store.dispatch(
      actions.getCoWorkers({ organizationId, search: coWorkerSearch })
    );
  }, []);

  const handleNewCoWorker = (coWorker: User) => {
    dispatch(actions.createCoWorker({ organizationId, user: coWorker }));
  };

  const handleCoWorkerUpdate = (updates: User) => {
    console.log("CoWorker update", updates, selectedCoWorker);
    if (selectedCoWorker.id) {
      dispatch(
        actions.updateCoWorker({
          organizationId,
          id: selectedCoWorker.id,
          updates,
        })
      );
    }
  };

  const handleAddCoWorker = () => {
    dispatch(actions.selectCoWorker(defaultCoWorker));
    history.push("/co-workers/new");
  };

  const handleSearchChange = (evt: any) => {
    console.log("Event", evt.target.value);
    setCoWorkerSearch(evt.target.value);
    dispatch(
      actions.getCoWorkers({ organizationId, search: evt.target.value })
    );
  };

  const handleOnSuspend = () => {
    if (selectedCoWorker.id) {
      dispatch(
        actions.suspendCoWorker({ organizationId, id: selectedCoWorker.id })
      );
    }
  };
  const handleOnResume = () => {
    if (selectedCoWorker.id) {
      dispatch(
        actions.resumeCoWorker({ organizationId, id: selectedCoWorker.id })
      );
    }
  };

  const handleSendResetPasswordLink = async () => {
    if (selectedCoWorker.id) {
      dispatch(
        actions.sendCoWorkerResetPasswordEmail({ id: selectedCoWorker.id })
      );
    }
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="h5">CO-WORKER</Typography>
              </Grid>
              <Grid item>
                <IconButton
                  className={classes.addButton}
                  color="inherit"
                  aria-label="Add Co-worker"
                  onClick={handleAddCoWorker}
                >
                  <AddCircleIcon fontSize="large" color="primary" />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4} md={4} lg={3}>
                <Grid container>
                  <Grid item xs={12}>
                    <TextField
                      onChange={handleSearchChange}
                      id="input-with-icon-grid"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {loading && <Loader />}
                    {!loading && (
                      <List>
                        {coWorkers &&
                          coWorkers.map((coWorker: User, i: number) => (
                            <ListItem
                              button
                              key={coWorker.id}
                              onClick={() => handleCoWorkerSelected(i)}
                              selected={
                                selectedCoWorker &&
                                coWorker.id === selectedCoWorker.id
                              }
                            >
                              <ListItemText primary={`${coWorker.nickname} `} />
                            </ListItem>
                          ))}
                      </List>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={8} md={8} lg={9}>
                {selectedCoWorker && (
                  <Accordion expanded>
                    <AccordionSummary
                      classes={{ content: classes.accordionSummary }}
                      aria-controls="panel1c-content"
                    >
                      <Grid
                        container
                        alignItems="center"
                        justify="space-between"
                      >
                        <Grid item>
                          <Grid container spacing={1} alignItems="center">
                            <Grid item>
                              <ExpandMoreIcon />
                            </Grid>
                            <Grid item>
                              <img
                                className={`${classes.accordionProfile}
                          ${classes.paddingSmall}`}
                                src={profile}
                                alt="Co-worker"
                              />
                            </Grid>
                            <Grid item>
                              {selectedCoWorker && (
                                <Typography>
                                  {selectedCoWorker.nickname}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item>
                          {!selectedCoWorker.suspended && !suspendStateLoading && (
                            <Button onClick={handleOnSuspend} color="secondary">
                              Disable
                            </Button>
                          )}
                          {selectedCoWorker.suspended && !suspendStateLoading && (
                            <Button onClick={handleOnResume} color="primary">
                              Activate
                            </Button>
                          )}
                          {suspendStateLoading && (
                            <Button
                              className={classes.userStateLoader}
                              disabled
                            >
                              <Loader />
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </AccordionSummary>
                    <Divider />
                    <div className={classes.margin}>
                      {formLoading && <Loader />}
                      {!formLoading && selectedCoWorker && (
                        <CoWorkerForm
                          onSubmit={
                            selectedCoWorker.id
                              ? handleCoWorkerUpdate
                              : handleNewCoWorker
                          }
                          onSendResetPasswordLink={handleSendResetPasswordLink}
                          coWorker={selectedCoWorker}
                        />
                      )}
                    </div>
                  </Accordion>
                )}{" "}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default CoWorker;
