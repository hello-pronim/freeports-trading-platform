import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import {
  Container,
  createStyles,
  Grid,
  IconButton,
  Icon,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import MaterialTable from "material-table";

import axios from "../../../util/axios";
import { useOrganizationsSlice } from "./slice";
import { selectOrganizations } from "./slice/selectors";

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
  })
);

const Organizations = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { actions } = useOrganizationsSlice();
  const organizations = useSelector(selectOrganizations);

  useEffect(() => {
    dispatch(actions.getOrganizations());
  }, []);

  const newOrganizer = () => {
    history.push("/organizations/add");
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="h5">Organization</Typography>
              </Grid>
              <Grid item>
                <IconButton
                  className={classes.addButton}
                  color="primary"
                  onClick={newOrganizer}
                >
                  <Icon fontSize="large">add_circle</Icon>
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <MaterialTable
              columns={[
                {
                  field: "name",
                  title: "Organization",
                  cellStyle: {
                    width: "25%",
                  },
                  render: (rowData: any) => {
                    const { id, name } = rowData;

                    return <Link to={`organizations/edit/${id}`}>{name}</Link>;
                  },
                },
                {
                  field: "createdAt",
                  title: "Create Date",
                  type: "date",
                  dateSetting: { locale: "en-GB" },
                  cellStyle: {
                    width: "25%",
                  },
                },
                {
                  field: "userActive",
                  title: "Active Users",
                  cellStyle: {
                    width: "25%",
                  },
                },
                {
                  field: "userSuspended",
                  title: "Disable Users",
                  cellStyle: {
                    width: "25%",
                  },
                },
              ]}
              data={organizations.map((orgItem: any) => ({ ...orgItem }))}
              options={{
                pageSize: 10,
                search: true,
                showTitle: false,
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Organizations;
