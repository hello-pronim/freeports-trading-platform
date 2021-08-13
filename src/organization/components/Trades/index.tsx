/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Container,
  createStyles,
  Grid,
  makeStyles,
  Theme,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import MaterialTable from "material-table";

import data from "./data";

import { useTradesSlice } from "./slice";
import {
  selectTradeRequests,
  selectIsTradeRequestsLoading,
} from "./slice/selectors";
import Loader from "../../../components/Loader";

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
            <Grid container justify="flex-end">
              <Button color="primary" variant="contained">
                <AddIcon fontSize="small" />
                New Trade
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {tradeRequestsLoading && <Loader />}
            {!tradeRequestsLoading && (
              <MaterialTable
                title="TRADE REQUESTS"
                columns={[
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
                          className={classes.link}
                        >
                          {investor.id}
                        </Link>
                      );
                    },
                  },
                  {
                    field: "type",
                    title: "Order",
                  },
                  {
                    field: "status",
                    title: "Status",
                  },
                  {
                    title: "Send",
                  },
                  {
                    title: "Receive",
                  },
                  {
                    title: "Broker",
                  },
                  {
                    title: "Commission",
                  },
                  {
                    title: "Actions",
                    render: (rowData: any) => {
                      const { id, investor } = rowData;

                      return (
                        <Link
                          to={`/desks/${investor.desk}/investors/${investor.id}/trades/${id}`}
                          className={classes.link}
                        >
                          <SyncAltIcon />
                        </Link>
                      );
                    },
                  },
                ]}
                data={tradeRequests.map((investorItem: any) => ({
                  ...investorItem,
                }))}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <MaterialTable
              title="TRADE HISTORY"
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
                      <Link
                        to={`/trades/${investorId}`}
                        className={classes.link}
                      >
                        {investorId}
                      </Link>
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
                  field: "status",
                  title: "Status",
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
                  field: "broker",
                  title: "Broker",
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
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Trades;
