import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {
  Accordion,
  AccordionSummary,
  IconButton,
  InputAdornment,
  Typography,
  Button,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import AddCircleIcon from "@material-ui/icons/AddCircle";
import SearchIcon from "@material-ui/icons/Search";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";

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
  sideMenu: {
    padding: theme.spacing(3),
    maxWidth: 320,
  },
  root: {
    flexGrow: 1,
  },
  toolbar: theme.mixins.toolbar,

  main: {
    padding: theme.spacing(2),
  },
  margin: {
    margin: theme.spacing(2),
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
  const { actions } = useCoWorkersSlice();
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
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
    window.store.dispatch(actions.getCoWorkers({ search: coWorkerSearch }));
  }, []);

  const handleNewCoWorker = (coWorker: User) => {
    dispatch(actions.createCoWorker({ user: coWorker }));
  };

  const handleCoWorkerUpdate = (updates: User) => {
    console.log("CoWorker update", updates, selectedCoWorker);
    if (selectedCoWorker.id) {
      dispatch(actions.updateCoWorker({ updates, id: selectedCoWorker.id }));
    }
  };

  const handleAddCoWorker = () => {
    dispatch(actions.selectCoWorker(defaultCoWorker));
    history.push("/co-workers/new");
  };

  const handleSearchChange = (evt: any) => {
    console.log("Event", evt.target.value);
    setCoWorkerSearch(evt.target.value);
    dispatch(actions.getCoWorkers({ search: evt.target.value }));
  };

  const handleOnSuspend = () => {
    if (selectedCoWorker.id) {
      dispatch(actions.suspendCoWorker({ id: selectedCoWorker.id }));
    }
  };
  const handleOnResume = () => {
    if (selectedCoWorker.id) {
      dispatch(actions.resumeCoWorker({ id: selectedCoWorker.id }));
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
    <Grid>
      <Grid container className={classes.root}>
        <Grid item className={classes.sideMenu} xs={12} sm={4} md={4} lg={3}>
          <Grid container justify="flex-start">
            <Grid sm={8} item className={classes.accordionCoWorker}>
              <Typography variant="h6">CO-WORKER</Typography>
            </Grid>
            <Grid xs={2} item>
              <IconButton
                color="inherit"
                aria-label="Add Role"
                onClick={handleAddCoWorker}
              >
                <AddCircleIcon fontSize="large" color="primary" />
              </IconButton>
            </Grid>
          </Grid>
          <Grid container>
            <Grid xs={12} item>
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
          </Grid>
          <>{loading && <Loader />}</>
          {!loading && (
            <List>
              {coWorkers &&
                coWorkers.map((coWorker: User, i: number) => (
                  <ListItem
                    button
                    key={coWorker.id}
                    onClick={() => handleCoWorkerSelected(i)}
                    selected={
                      selectedCoWorker && coWorker.id === selectedCoWorker.id
                    }
                  >
                    <ListItemText primary={`${coWorker.nickname} `} />
                  </ListItem>
                ))}
            </List>
          )}
        </Grid>
        <Grid item className={classes.main} xs={12} sm={8} md={8} lg={9}>
          {selectedCoWorker && (
            <Accordion expanded>
              <AccordionSummary
                classes={{ content: classes.accordionSummary }}
                aria-controls="panel1c-content"
              >
                <Grid container alignItems="center" justify="space-between">
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
                          <Typography>{selectedCoWorker.nickname}</Typography>
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
                      <Button className={classes.userStateLoader} disabled>
                        <Loader />
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </AccordionSummary>
              {formLoading && <Loader />}
              {!formLoading && selectedCoWorker && (
                <CoWorkerForm
                  onSubmit={
                    selectedCoWorker.id
                      ? handleCoWorkerUpdate
                      : handleNewCoWorker
                  }
                  coWorker={selectedCoWorker}
                />
              )}
              {selectedCoWorker.id && (
                <Button
                  className={classes.margin}
                  onClick={handleSendResetPasswordLink}
                  color="primary"
                >
                  Send Reset Password Link
                </Button>
              )}
            </Accordion>
          )}{" "}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CoWorker;
