/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Grid, Theme, Typography } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import AddIcon from "@mui/icons-material/Add";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import MaterialTable from "material-table";

import data from "./data";

import { useTradesSlice } from "./slice";
import {
  selectTradeRequests,
  selectIsTradeRequestsLoading,
} from "./slice/selectors";
import Loader from "../../../components/Loader";
import PatchedPagination from "../../../util/patchedPagination";

const { manualTrades, tradeHistory } = data;

const convertDateToDMY = (date: string) => {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = `${d.getFullYear()}`;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [day, month, year].join(".");
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      color: theme.palette.primary.main,
    },
  })
);

const Trades = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const tradeRequests = useSelector(selectTradeRequests);
  const tradeRequestsLoading = useSelector(selectIsTradeRequestsLoading);
  const { actions: tradesActions } = useTradesSlice();

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      await dispatch(tradesActions.getTradeRequests());
    };
    init();

    return () => {
      mounted = true;
    };
  }, []);

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Grid item>
                    <Typography variant="h5">ORDER REQUESTS</Typography>
                  </Grid>
                  <Grid item>
                    <Button color="primary" variant="contained">
                      <AddIcon fontSize="small" />
                      New Trade
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                {tradeRequestsLoading && <Loader />}
                {!tradeRequestsLoading && (
                  <MaterialTable
                    columns={[
                      {
                        field: "friendlyId",
                        title: "Order ID",
                        render: (rowData: any) => {
                          const { id, investor } = rowData;

                          return (
                            <Link
                              to={`/desks/${investor.desk}/investors/${investor.id}/trades/${id}`}
                            >
                              {id}
                            </Link>
                          );
                        },
                      },
                      {
                        field: "createdAt",
                        title: "Date",
                        render: (rowData: any) => {
                          const { createdAt } = rowData;

                          return convertDateToDMY(createdAt);
                        },
                      },
                      {
                        field: "investor",
                        title: "Investors",
                        render: (rowData: any) => {
                          const { investor } = rowData;

                          return (
                            <Link
                              to={`/desks/${investor.desk}/investors/${investor.id}`}
                            >
                              {investor.id}
                            </Link>
                          );
                        },
                      },
                      {
                        field: "status",
                        title: "Status",
                      },
                      {
                        field: "quantity",
                        title: "Quantity",
                        render: (rowData: any) => {
                          const { quantity, currencyTo } = rowData;
                          return `${quantity} ${currencyTo}`;
                        },
                      },
                      {
                        field: "currencyFrom",
                        title: "from",
                      },
                      {
                        title: "Commission",
                      },
                    ]}
                    data={tradeRequests.map((investorItem: any) => ({
                      ...investorItem,
                    }))}
                    options={{ showTitle: false }}
                    components={{ Pagination: PatchedPagination }}
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5">TRADE HISTORY</Typography>
              </Grid>
              <Grid item xs={12}>
                <MaterialTable
                  columns={[
                    {
                      field: "date",
                      title: "Date",
                      cellStyle: {
                        width: "12%",
                      },
                    },
                    {
                      field: "investors",
                      title: "Investors",
                      cellStyle: {
                        width: "12%",
                      },
                      render: (rowData: any) => {
                        const { investorId } = rowData;

                        return (
                          <Link to={`/trades/${investorId}`}>{investorId}</Link>
                        );
                      },
                    },
                    {
                      field: "order",
                      title: "Order",
                      cellStyle: {
                        width: "12%",
                      },
                    },
                    {
                      field: "send",
                      title: "Send",
                      cellStyle: {
                        width: "12%",
                      },
                    },
                    {
                      field: "receive",
                      title: "Receive",
                      cellStyle: {
                        width: "12%",
                      },
                    },
                    {
                      field: "commission",
                      title: "Commission",
                      cellStyle: {
                        width: "12%",
                      },
                    },
                  ]}
                  data={tradeHistory}
                  options={{ showTitle: false }}
                  components={{ Pagination: PatchedPagination }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Trades;
