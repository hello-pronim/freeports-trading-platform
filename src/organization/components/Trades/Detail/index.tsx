/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import MaterialTable from "material-table";
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Tabs,
  Tab,
  Theme,
  Typography,
  TextField,
} from "@material-ui/core";
import HistoryOutlinedIcon from "@material-ui/icons/HistoryOutlined";
import ChatBubbleOutlineOutlinedIcon from "@material-ui/icons/ChatBubbleOutlineOutlined";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import grey from "@material-ui/core/colors/grey";
import purple from "@material-ui/core/colors/purple";
import { BigNumber } from "bignumber.js";
import "bootstrap/dist/css/bootstrap.min.css";

import brokers from "./data";
import { useTradeDetailSlice } from "./slice";
import {
  selectTradeRequestDetail,
  selectIsDetailLoading,
  selectRfqsLoading,
  selectRfqs,
  selectBestRfq,
  selectOrderLoading,
  selectRemainingQuantity,
} from "./slice/selectors";
import Loader from "../../../../components/Loader";
import { RfqResponse } from "../../../../types/RfqResponse";

const columns = [
  {
    field: "date",
    title: "Date",
    cellStyle: {
      width: "12%",
    },
  },
  {
    field: "hours",
    title: "Hours",
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
    field: "sourceValue",
    title: "Source Value",
    cellStyle: {
      width: "12%",
    },
  },
  {
    field: "targetValue",
    title: "Target Value",
    cellStyle: {
      width: "12%",
    },
  },
  {
    field: "rate",
    title: "rate",
    cellStyle: {
      width: "12%",
    },
  },
];
const data = [
  {
    date: "28.06.2021",
    hours: "16:32",
    broker: "Broker name",
    sourceValue: "CHF 10'890",
    targetValue: "BTC 30",
    rate: "CHF 363/BTC",
  },
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      color: theme.palette.primary.main,
      fontWeight: "bold",
      marginRight: theme.spacing(2),
      marginLeft: theme.spacing(2),
    },
    greyCard: {
      backgroundColor: grey[400],
    },
    primaryCard: {
      backgroundColor: purple[400],
    },
    dividerColor: {
      backgroundColor: grey[200],
    },
    tabPanel: {
      width: "100%",
      "& .MuiBox-root": {
        paddingLeft: "0px",
        paddingRight: "0px",
      },
    },
    errorMessage: {
      marginTop: theme.spacing(8),
    },
    brokerCardHeader: {
      backgroundColor: theme.palette.primary.main,
      color: "white",
    },
    currencyBtnGroup: {
      width: 96,
    },
    numberInput: {
      "& input": {
        border: 0,
        "&:focus": { outline: "none!important" },
        "font-size": "3.75rem",
        "font-family": '"Roboto", "Helvetica", "Arial", sans-serif',
        "font-weight": 300,
        "line-height": 1.2,
        "letter-spacing": "-0.00833em",
        backgroundColor: grey[300],
        width: "100%",
      },
      "& input::-webkit-outer-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
      },
      "& input::-webkit-inner-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
      },

      /* Firefox */
      "& input[type=number]": {
        "-moz-appearance": "textfield",
      },
    },
  })
);

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-prevent-tabpanel-${index}`}
      aria-labelledby={`scrollable-prevent-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const TradeDetail = (): React.ReactElement => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { organizationId } = Lockr.get("USER_DATA");
  const { deskId, investorId, tradeId }: any = useParams();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tradeRequest = useSelector(selectTradeRequestDetail);
  const tradeRequestLoading = useSelector(selectIsDetailLoading);
  const { actions: tradeDetailActions } = useTradeDetailSlice();

  const rfqsLoading = useSelector(selectRfqsLoading);
  const orderLoading = useSelector(selectOrderLoading);
  const rfqs = useSelector(selectRfqs);
  const bestRfq = useSelector(selectBestRfq);

  const remainingQuantity = useSelector(selectRemainingQuantity);

  const calculateRate = (price: string, quantity: string): string => {
    return new BigNumber(price).dividedBy(new BigNumber(quantity)).toString();
  };
  useEffect(() => {
    let mounted = false;
    const init = async () => {
      await dispatch(
        tradeDetailActions.getTradeRequestDetail({
          organizationId,
          deskId,
          investorId,
          tradeId,
        })
      );
    };
    init();

    return () => {
      mounted = true;
    };
  }, []);

  const handleTabChange = (event: any, newValue: number) => {
    setActiveTabIndex(newValue);
  };

  const handleAmountChange = (event: any) => {
    if (
      event.target.value &&
      new BigNumber(remainingQuantity).gte(event.target.value)
    ) {
      dispatch(
        tradeDetailActions.getRfqs({
          quantity: event.target.value,
          organizationId,
          deskId,
          investorId,
          tradeId,
        })
      );
    }
  };

  const handleOnOrder = (rfq: RfqResponse) => {
    dispatch(
      tradeDetailActions.order({
        organizationId,
        deskId,
        investorId,
        tradeId,
        rfqId: rfq.id,
        quantity: rfq.quantity,
      })
    );
  };

  return (
    <div className="main-wrapper">
      {tradeRequestLoading && <Loader />}
      {!tradeRequestLoading && (
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h5">MANUAL TRADE</Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                    {`(Amount) from (${tradeRequest.accountFrom}) to (${tradeRequest.accountTo}) (Estimated account)`}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Card className={classes.greyCard}>
                    <CardContent>
                      <Grid container justify="space-between">
                        <Grid item xs={4} md={2}>
                          <Grid
                            container
                            direction="column"
                            justify="space-between"
                            className="h-100"
                          >
                            <Typography variant="subtitle2">
                              Trade value
                            </Typography>
                            <ButtonGroup
                              className={classes.currencyBtnGroup}
                              variant="contained"
                              color="primary"
                              size="small"
                            >
                              <Button>BTC</Button>
                              <Button disabled>CHF</Button>
                            </ButtonGroup>
                          </Grid>
                        </Grid>
                        <Grid item xs={8} md={4}>
                          <Box
                            className={classes.numberInput}
                            display="flex"
                            flexDirection="row"
                            alignItems="flex-end"
                            bgcolor="grey.300"
                            borderRadius={16}
                            height={100}
                            p={2}
                          >
                            <Typography variant="subtitle2">BTC</Typography>
                            {/* <Typography variant="h3">30</Typography> */}
                            <input
                              onChange={handleAmountChange}
                              type="number"
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Grid container>
                            <Grid item xs={4}>
                              <Box
                                display="flex"
                                flexDirection="row"
                                alignItems="flex-end"
                                borderRadius={16}
                                height={100}
                                p={2}
                              >
                                <Typography variant="subtitle2">BTC</Typography>
                                <Typography variant="h3">
                                  {remainingQuantity}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box
                                display="flex"
                                flexDirection="row"
                                alignItems="flex-end"
                                borderRadius={16}
                                height={100}
                                p={2}
                              >
                                <Typography variant="subtitle2">
                                  remaining of
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box
                                display="flex"
                                flexDirection="row"
                                alignItems="flex-end"
                                borderRadius={16}
                                height={100}
                                p={2}
                              >
                                <Typography variant="subtitle2">BTC</Typography>
                                <Typography variant="h3">
                                  {tradeRequest.quantity}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Divider className={classes.dividerColor} />
                    <CardActions>
                      <Grid container spacing={2}>
                        <Grid item>
                          <Typography variant="subtitle2">
                            Source account balance
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography
                            variant="subtitle2"
                            style={{ fontWeight: 600 }}
                          >
                            CHF 120&#39;000
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            {rfqsLoading || (orderLoading && <Loader />)}
            {!rfqsLoading && rfqs.length > 0 && (
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Card>
                          <CardHeader
                            className={classes.brokerCardHeader}
                            title={
                              <Typography variant="h6" align="center">
                                BEST BROKER VALUE
                              </Typography>
                            }
                          />
                          <Divider className={classes.dividerColor} />
                          <CardContent style={{ backgroundColor: grey[300] }}>
                            <Grid container justify="flex-end" xs={12}>
                              <Typography variant="body1">
                                {bestRfq.brokerId}
                              </Typography>
                            </Grid>
                            <Grid container justify="flex-end" xs={12}>
                              <Typography
                                variant="body2"
                                style={{ fontWeight: 600, marginRight: "10px" }}
                              >
                                Rate
                              </Typography>
                              <Typography variant="h5">
                                CHF{" "}
                                {calculateRate(bestRfq.price, bestRfq.quantity)}
                                /BTC
                              </Typography>
                            </Grid>
                            <Grid
                              container
                              alignItems="center"
                              justify="flex-end"
                              xs={12}
                            >
                              <Typography
                                variant="body2"
                                style={{ fontWeight: 600, marginRight: "10px" }}
                              >
                                CHF
                              </Typography>
                              <Typography variant="body2">
                                {bestRfq.price}
                              </Typography>
                            </Grid>
                          </CardContent>
                          <Divider className={classes.dividerColor} />
                          <CardActions
                            disableSpacing
                            style={{ backgroundColor: grey[300] }}
                          >
                            <Button
                              variant="outlined"
                              className="w-100"
                              onClick={() => handleOnOrder(bestRfq)}
                            >
                              Click to order!
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          style={{ fontWeight: 600 }}
                        >
                          ALL BROKERS
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          {rfqs.map((rfq: any) => (
                            <Grid key={rfq.id} item xs={2}>
                              <Card className="w-100">
                                <CardContent
                                  style={{ backgroundColor: grey[300] }}
                                >
                                  <Grid container justify="flex-end" xs={12}>
                                    <Typography variant="body1">
                                      {rfq.brokerId}
                                    </Typography>
                                  </Grid>
                                  <Grid
                                    container
                                    alignItems="center"
                                    justify="flex-end"
                                    xs={12}
                                  >
                                    <Typography
                                      variant="body2"
                                      style={{
                                        fontWeight: 600,
                                        marginRight: "10px",
                                      }}
                                    >
                                      CHF
                                    </Typography>
                                    <Typography variant="h5">
                                      {rfq.price}
                                    </Typography>
                                  </Grid>
                                  <Grid container justify="flex-end" xs={12}>
                                    <Typography
                                      variant="body2"
                                      style={{
                                        fontWeight: 600,
                                        marginRight: "10px",
                                      }}
                                    >
                                      Rate
                                    </Typography>
                                    <Typography variant="body2">
                                      {calculateRate(rfq.price, rfq.quantity)}
                                    </Typography>
                                  </Grid>
                                </CardContent>
                                <Divider className={classes.dividerColor} />
                                <CardActions
                                  disableSpacing
                                  style={{ backgroundColor: grey[300] }}
                                >
                                  <Button variant="outlined" className="w-100">
                                    Click to order!
                                  </Button>
                                </CardActions>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <AppBar position="static" color="inherit">
                <Tabs
                  value={activeTabIndex}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="off"
                  indicatorColor="primary"
                  aria-label="tabs"
                >
                  <Tab
                    icon={<HistoryOutlinedIcon />}
                    aria-label="phone"
                    id="scrollable-prevent-tab-0"
                  />
                  <Tab
                    icon={<ChatBubbleOutlineOutlinedIcon />}
                    aria-label="favorite"
                    id="scrollable-prevent-tab-1"
                  />
                  <Tab
                    icon={<InsertDriveFileOutlinedIcon />}
                    aria-label="person"
                    id="scrollable-prevent-tab-2"
                  />
                  <Tab
                    icon={<Typography variant="subtitle2">Brokers</Typography>}
                    aria-label="help"
                    id="scrollable-prevent-tab-3"
                  />
                </Tabs>
              </AppBar>
              <TabPanel
                className={classes.tabPanel}
                value={activeTabIndex}
                index={0}
              >
                <MaterialTable
                  columns={columns}
                  data={data}
                  options={{
                    toolbar: false,
                    paging: false,
                  }}
                />
              </TabPanel>
              <TabPanel
                className={classes.tabPanel}
                value={activeTabIndex}
                index={1}
              >
                Tab Content 2
              </TabPanel>
              <TabPanel
                className={classes.tabPanel}
                value={activeTabIndex}
                index={2}
              >
                Tab Content 3
              </TabPanel>
              <TabPanel
                className={classes.tabPanel}
                value={activeTabIndex}
                index={3}
              >
                Tab Content 4
              </TabPanel>
            </Grid>
          </Grid>
        </Container>
      )}{" "}
    </div>
  );
};

export default TradeDetail;
