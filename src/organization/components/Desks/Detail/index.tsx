/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { TextField as MuiTextField } from "mui-rff";
import {
  Button,
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
  Theme,
  TextField,
  Typography,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import red from "@material-ui/core/colors/red";

import { useDesksSlice } from "../slice";
import { useDeskDetailSlice } from "./slice";
import { selectDesks, selectIsDesksLoading } from "../slice/selectors";
import { selectDeskDetail, selectIsDetailLoading } from "./slice/selectors";
import Loader from "../../../../components/Loader";

interface deskType {
  name: string;
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
  const errors: Partial<deskType> = {};
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
  const [desk, setDesk] = useState<deskType>({
    name: "",
  });
  const selectedDesk = useSelector(selectDeskDetail);
  const desksLoading = useSelector(selectIsDesksLoading);
  const deskDetailLoading = useSelector(selectIsDetailLoading);
  const [searchText, setSearchText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      await dispatch(desksActions.getDesks(organizationId));
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

  const handleDeskCreate = async (values: deskType) => {
    await dispatch(desksActions.addDesk({ organizationId, desk: values }));
    setDialogOpen(false);
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="h4">Desks</Typography>
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
            <Grid container item xs={12} spacing={4}>
              <Grid item xs={3}>
                <Grid>
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
              <Grid item xs={9}>
                {deskDetailLoading && <Loader />}
                {!deskDetailLoading && (
                  <Container>
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography variant="h5">
                          {selectedDesk.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        {selectedDesk.createdAt && (
                          <Typography variant="body2" color="textSecondary">
                            {`Creation date: ${convertDateToDMY(
                              selectedDesk.createdAt
                            )}`}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                    <Divider />
                  </Container>
                )}
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
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitting || pristine}
                  >
                    Create
                  </Button>
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
