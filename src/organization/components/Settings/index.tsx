/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import Lockr from "lockr";
import { useDispatch, useSelector } from "react-redux";
import { Field, Form } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import arrayMutators from "final-form-arrays";
import { TextField as MuiTextField, Select } from "mui-rff";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardHeader,
  CardContent,
  CircularProgress,
  Container,
  createStyles,
  Divider,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Snackbar,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";

import { TradeLevel } from "../../../types/Organization";
import { useOrgSettingsSlice } from "./slice";
import {
  selectIsTradeLevelsUpdating,
  selectIsAccountsTrusting,
} from "./slice/selectors";
import { useOrganization } from "../../../hooks";
import { setOrgAddressBook } from "../../../services/organizationService";

interface accountType {
  currency: string;
  iban: string;
  account: string;
}
const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    marginL10: {
      marginLeft: 10,
    },
    managerName: {
      fontWeight: "bold",
      fontSize: 20,
      marginLeft: 15,
    },
    logoText: {
      fontSize: 20,
      fontWeight: "bold",
      margin: "10px 0px",
    },
    selectStyle: {
      width: "250px",
      fontSize: 25,
      fontWeight: "initial",
      marginLeft: 15,
    },
    logoImageContainer: {
      position: "relative",
      width: 200,
      height: 200,
      /* "&:hover, &:focus": {
        "& $logoImage": {
          opacity: 0.5,
        },
      }, */
    },
    logoImage: {
      width: "100%",
      height: "100%",
      opacity: 1,
    },
    logoFileInput: {
      opacity: 0,
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      cursor: "pointer",
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

const Settings = (): React.ReactElement => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const { organizationId } = Lockr.get("USER_DATA");
  const { getOrganization, updateOrganization } = useOrganization();
  const [orgDetail, setOrgDetail] = useState({
    id: "",
    name: "",
    createdAt: "",
    commissionOrganization: "",
    commissionClearer: "",
    logo: "",
    userActive: 0,
    userSuspended: 0,
    accountList: [],
    tradeLevels: [],
  });
  const [accounts, setAccounts] = useState<Array<accountType>>([]);
  const [creatingAddressBook, setCreatingAddressBook] = useState(false);
  const [cryptoAccounts, setCryptoAccounts] = useState<Array<accountType>>([]);
  const { actions: orgSettingsActions } = useOrgSettingsSlice();
  const tradeLevelsUpdating = useSelector(selectIsTradeLevelsUpdating);
  const accountsTrusting = useSelector(selectIsAccountsTrusting);
  const currencyList = ["CHF", "USD", "EUR", "BTC", "ETH"];

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      const detail = await getOrganization(organizationId);

      if (!mounted) {
        if (detail) {
          setOrgDetail({
            id: detail.id,
            name: detail.name,
            createdAt: new Date(detail.createdAt).toDateString(),
            logo: detail.logo,
            commissionOrganization: detail.commissionOrganization,
            commissionClearer: detail.commissionClearer,
            userActive: detail.userActive,
            userSuspended: detail.userSuspended,
            accountList: detail.clearing,
            tradeLevels: detail.tradeLevels,
          });
          setAccounts(detail.clearing);
          setCryptoAccounts(
            detail.clearing.filter((x: accountType) => x.iban === undefined)
          );
        }
      }
    };
    init();
    return () => {
      mounted = true;
    };
  }, []);

  const onLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (files && files.length) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const newOrgDetail = { ...orgDetail };
        newOrgDetail.logo = event.target.result;
        setOrgDetail(newOrgDetail);
      };
      reader.readAsDataURL(files[0]);
    }
  };
  const handleAccountsTrust = () => {
    const cryptoAccountList = cryptoAccounts.map(({ account }) => account);

    dispatch(
      orgSettingsActions.trustAccounts({
        organizationId,
        address: cryptoAccountList,
      })
    );
  };

  const handleTradeLevelsUpdate = (values: any) => {
    dispatch(
      orgSettingsActions.saveTradeLevels({
        organizationId,
        tradeLevels: values.tradeLevels as TradeLevel[],
      })
    );
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Card>
          <CardHeader
            title={
              <Typography variant="h5">{`Settings (${orgDetail.name})`}</Typography>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={8}>
                <Grid container spacing={2}>
                  {/* <Grid item xs={12}>
                    <TextField
                      InputProps={{
                        readOnly: true,
                      }}
                      label="Organization name"
                      variant="outlined"
                      value={orgDetail.name}
                      onChange={handleName}
                      fullWidth
                    /> 
                    <Typography>{`Company name: ${orgDetail.name}`}</Typography>
                  </Grid> */}
                  <Grid item xs={12}>
                    {accounts.length > 0 ? (
                      <Card variant="outlined">
                        <CardHeader
                          title={<Typography variant="h6">Accounts</Typography>}
                        />
                        <Divider />
                        <CardContent>
                          <Grid container spacing={1}>
                            <Grid item xs={12}>
                              {accounts.map((account) => (
                                <Typography
                                  key={account.account}
                                >{`Account: ${account.iban}`}</Typography>
                              ))}
                            </Grid>
                          </Grid>
                        </CardContent>
                        <CardActions>
                          <Grid container justify="flex-end">
                            <Grid item>
                              <div className={classes.progressButtonWrapper}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={handleAccountsTrust}
                                  disabled={
                                    accountsTrusting ||
                                    cryptoAccounts.length === 0
                                  }
                                >
                                  Trust Nostro Accounts
                                </Button>

                                {accountsTrusting && (
                                  <CircularProgress
                                    size={24}
                                    className={classes.progressButton}
                                  />
                                )}
                              </div>
                            </Grid>
                          </Grid>
                        </CardActions>
                      </Card>
                    ) : (
                      <></>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Form
                      onSubmit={handleTradeLevelsUpdate}
                      mutators={{
                        ...arrayMutators,
                      }}
                      initialValues={
                        orgDetail.tradeLevels &&
                        orgDetail.tradeLevels.length > 0
                          ? orgDetail
                          : {
                              ...orgDetail,
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
                          <Card variant="outlined">
                            <CardHeader
                              title={
                                <Typography variant="h6">
                                  Trade levels
                                </Typography>
                              }
                            />
                            <Divider />
                            <CardContent>
                              <Grid container>
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
                                              <option
                                                aria-label="None"
                                                value=""
                                              />
                                              {currencyList
                                                .filter(
                                                  (currencyItem: string) =>
                                                    values.tradeLevels &&
                                                    (values.tradeLevels[i]
                                                      .currency ===
                                                      currencyItem ||
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
                                                    onClick={() =>
                                                      fields.remove(i)
                                                    }
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
                              </Grid>
                            </CardContent>
                            <CardActions>
                              <Grid container justify="flex-end">
                                <Grid item>
                                  <div
                                    className={classes.progressButtonWrapper}
                                  >
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      type="submit"
                                      disabled={tradeLevelsUpdating}
                                    >
                                      Save Changes
                                    </Button>
                                    {tradeLevelsUpdating && (
                                      <CircularProgress
                                        size={24}
                                        className={classes.progressButton}
                                      />
                                    )}
                                  </div>
                                </Grid>
                              </Grid>
                            </CardActions>
                          </Card>
                        </form>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <Typography variant="h6">Commissions</Typography>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={4}>
                          <Grid item xs={6}>
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Commission rates
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                {/* <Input
                                  readOnly
                                  endAdornment={
                                    <InputAdornment position="end">
                                      %
                                    </InputAdornment>
                                  }
                                  value={orgDetail.commissionOrganization}
                                  onChange={handleCommission}
                                /> */}
                                <Typography>{`${orgDetail.commissionOrganization}%`}</Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={6}>
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Clear Commission rates
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                {/* <Input
                                  readOnly
                                  endAdornment={
                                    <InputAdornment position="end">
                                      %
                                    </InputAdornment>
                                  }
                                  value={orgDetail.commissionClearer}
                                  onChange={handleClearer}
                                /> */}
                                <Typography>{`${orgDetail.commissionClearer}%`}</Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={6}>
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Active Users
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  {orgDetail.userActive}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={6}>
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Disabled Users
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  {orgDetail.userSuspended}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid
                  item
                  container
                  xs={12}
                  alignItems="center"
                  justify="center"
                >
                  <div className={classes.logoImageContainer}>
                    <Avatar
                      src={orgDetail.logo}
                      alt="Avatar"
                      className={classes.logoImage}
                    />
                    {/* <input
                      type="file"
                      name="avatar"
                      className={classes.logoFileInput}
                      onChange={onLogoFileChange}
                    /> */}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          {/* <CardActions>
            <Grid container justify="flex-end">
              <Grid item>
                <div className={classes.progressButtonWrapper}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onHandleUpdate}
                    disabled={loading}
                  >
                    SAVE CHANGES
                  </Button>

                  {loading && (
                    <CircularProgress
                      size={24}
                      className={classes.progressButton}
                    />
                  )}
                </div>
              </Grid>
            </Grid>
          </CardActions> */}
        </Card>
      </Container>
    </div>
  );
};

export default Settings;
