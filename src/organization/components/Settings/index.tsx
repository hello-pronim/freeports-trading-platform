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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import Lock from '@material-ui/icons/Lock';

import { TradeLevel } from "../../../types/Organization";
import { useOrgSettingsSlice } from "./slice";
import {
  selectIsTradeLevelsUpdating,
} from "./slice/selectors";
import { useOrganization } from "../../../hooks";
import vault, { VaultPermissions } from "../../../vault";
import { PermissionOwnerType } from "../../../vault/enum/permission-owner-type";
import { VaultAssetType } from "../../../vault/enum/asset-type";
import { VaultWalletType } from "../../../vault/enum/wallet-type";
import { selectUser } from "../../../slice/selectors";
import { snackbarActions } from "../../../components/Snackbar/slice";
import {
  selectOrgRoles,
  selectMultiDeskRoles,
  selectDeskRoles,
} from "../Roles/slice/selectors";
import { useRolesSlice } from "../Roles/slice";

interface accountType {
  currency: string;
  iban: string;
  account: string;
  publicAddress: string;
  name: string;
}

interface LockPermissionsType {
  addRemoveAddress: Array<string>;
  createDeleteRuleTree: Array<string>;
  getRuleTrees: Array<string>;
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
    roleContainer: {
      padding: theme.spacing(2),
    },
    roleName: {
      fontWeight: "bold",
    },
  })
);

const Settings = (): React.ReactElement => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const { organizationId } = Lockr.get("USER_DATA");
  const { getOrganization, addAddressbook } = useOrganization();
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
    vaultAddressbookId: "",
  });
  const [accounts, setAccounts] = useState<Array<accountType>>([]);
  const [cryptoAccounts, setCryptoAccounts] = useState<Array<accountType>>([]);
  const { actions: orgSettingsActions } = useOrgSettingsSlice();
  const tradeLevelsUpdating = useSelector(selectIsTradeLevelsUpdating);
  const currencyList = ["CHF", "USD", "EUR", "BTC", "ETH"];
  
  const currentUser = useSelector(selectUser);

  const [addingToVault, setAddingToVault] = useState(false);
  const [loadingVaultPermission, setLoadingVaultPermission] = useState(false);
  const [trustingAccounts, setTrustingAccounts] = useState(false);

  const [lockModalView, setLockModalView] = useState(false);
  const [lockPermissions, setLockPermissions] = useState<LockPermissionsType>({
    addRemoveAddress: [],
    createDeleteRuleTree: [],
    getRuleTrees: [],
  });
  const [lockModalProcessing, setLockModalProcessing] = useState(false);

  const { actions: rolesActions } = useRolesSlice();
  const orgRoles = useSelector(selectOrgRoles);
  const multiDeskRoles = useSelector(selectMultiDeskRoles);
  const deskRoles = useSelector(selectDeskRoles);

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      if (!mounted) {
        const detail = await getOrganization(organizationId);
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
            vaultAddressbookId: detail.vaultAddressbookId,
          });
          setAccounts(detail.clearing);
          setCryptoAccounts(detail.clearing.filter((x: accountType) => x.iban === undefined));
        }
        dispatch(rolesActions.getOrgRoles(organizationId));
        dispatch(rolesActions.getMultiDeskRoles(organizationId));
        dispatch(rolesActions.getDeskRoles(organizationId));
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

  const onClickAddToVault = async () => {
    setAddingToVault(true);
    const response = await addAddressbook(organizationId);
    if (response) {
      dispatch(
        snackbarActions.showSnackbar({
          message: "Successfully created addressbook",
          type: "success",
        })
      );
      setOrgDetail({
        ...orgDetail,
        vaultAddressbookId : response.vaultAddressbookId
      });
    } else {
      dispatch(
        snackbarActions.showSnackbar({
          message: "Sorry, failed to create an addressbook",
          type: "error",
        })
      );
    }
    setAddingToVault(false);
  };

  const onClickLockPermission = async () => {
    try {
      const request = await vault.getAssetPermissions(
        VaultAssetType.ADDRESS_BOOK,
        orgDetail.vaultAddressbookId,
        true,
      );
      const permissions = await vault.sendRequest(request);
      
      const addRemoveAddress: string[] = [];
      const createDeleteRuleTree: string[] = [];
      const getRuleTrees: string[] = [];
      permissions.groupPermissions.forEach((x: any) => {
        switch (x.permissionType) {
          case VaultPermissions.AddRemoveAddress:
            addRemoveAddress.push(x.groupId);
            break;
          case VaultPermissions.CreateDeleteRuleTree:
            createDeleteRuleTree.push(x.groupId);
            break;
          case VaultPermissions.GetRuleTrees:
            getRuleTrees.push(x.groupId);
            break;
          default:
            break;
        }
      })
      setLockPermissions({
        addRemoveAddress,
        createDeleteRuleTree,
        getRuleTrees
      })
      setLockModalView(true); 
    } catch (error) {
      dispatch(
        snackbarActions.showSnackbar({
          message: error.message,
          type: "error",
        })
      );
    }
  };

  const handleLockPermission = async (values: any) => {
    setLockModalProcessing(true);
    try {
      const addRemoveAddressOld = [...lockPermissions.addRemoveAddress];
      const addRemoveAddressNew: string[] = [];
      values.addRemoveAddress.forEach((x: string) => {
        const index = addRemoveAddressOld.indexOf(x);
        if (index !== -1) {
          addRemoveAddressOld.splice(index, 1);
        } else {
          addRemoveAddressNew.push(x);
        }
      })
      await Promise.all(addRemoveAddressOld.map(async (vaultGroupId: string) => {
        const request1 = await vault.revokePermissionFromAsset(
          VaultAssetType.ADDRESS_BOOK,
          orgDetail.vaultAddressbookId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.AddRemoveAddress,
          true,
        );
        await vault.sendRequest(request1);

        const request2 = await vault.revokePermissionFromAsset(
          VaultAssetType.ADDRESS_BOOK,
          orgDetail.vaultAddressbookId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.GetAddressBookDetails,
          true,
        );
        await vault.sendRequest(request2);
      }));
      await Promise.all(addRemoveAddressNew.map(async (vaultGroupId: string) => {
        const request1 = await vault.grantPermissionToAsset(
          VaultAssetType.ADDRESS_BOOK,
          orgDetail.vaultAddressbookId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.AddRemoveAddress,
          true,
        );
        await vault.sendRequest(request1);

        const request2 = await vault.grantPermissionToAsset(
          VaultAssetType.ADDRESS_BOOK,
          orgDetail.vaultAddressbookId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.GetAddressBookDetails,
          true,
        );
        await vault.sendRequest(request2);
      }));

      const createDeleteRuleTreeOld = [...lockPermissions.createDeleteRuleTree];
      const createDeleteRuleTreeNew: string[] = [];
      values.createDeleteRuleTree.forEach((x: string) => {
        const index = createDeleteRuleTreeOld.indexOf(x);
        if (index !== -1) {
          createDeleteRuleTreeOld.splice(index, 1);
        } else {
          createDeleteRuleTreeNew.push(x);
        }
      })
      await Promise.all(createDeleteRuleTreeOld.map(async (vaultGroupId: string) => {
        const request = await vault.revokePermissionFromAsset(
          VaultAssetType.ADDRESS_BOOK,
          orgDetail.vaultAddressbookId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.CreateDeleteRuleTree,
          true,
        );
        await vault.sendRequest(request);
      }));
      await Promise.all(createDeleteRuleTreeNew.map(async (vaultGroupId: string) => {
        const request = await vault.grantPermissionToAsset(
          VaultAssetType.ADDRESS_BOOK,
          orgDetail.vaultAddressbookId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.CreateDeleteRuleTree,
          true,
        );
        await vault.sendRequest(request);
      }));

      const getRuleTreesOld = [...lockPermissions.getRuleTrees];
      const getRuleTreesNew: string[] = [];
      values.getRuleTrees.forEach((x: string) => {
        const index = getRuleTreesOld.indexOf(x);
        if (index !== -1) {
          getRuleTreesOld.splice(index, 1);
        } else {
          getRuleTreesNew.push(x);
        }
      })
      await Promise.all(getRuleTreesOld.map(async (vaultGroupId: string) => {
        const request = await vault.revokePermissionFromAsset(
          VaultAssetType.ADDRESS_BOOK,
          orgDetail.vaultAddressbookId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.GetRuleTrees,
          true,
        );
        await vault.sendRequest(request);
      }));
      await Promise.all(getRuleTreesNew.map(async (vaultGroupId: string) => {
        const request = await vault.grantPermissionToAsset(
          VaultAssetType.ADDRESS_BOOK,
          orgDetail.vaultAddressbookId,
          PermissionOwnerType.group,
          vaultGroupId,
          VaultPermissions.GetRuleTrees,
          true,
        );
        await vault.sendRequest(request);
      }));

      dispatch(
        snackbarActions.showSnackbar({
          message: "Successfully updated!",
          type: "success",
        })
      );
      setLockModalView(false);
    } catch (error) {
      dispatch(
        snackbarActions.showSnackbar({
          message: error.message,
          type: "error",
        })
      );
    }
    setLockModalProcessing(false);
  }

  const onClickTrustAccounts = async () => {
    setTrustingAccounts(true);
    try {
      const vaultRequest = await vault.getAddressbook(orgDetail.vaultAddressbookId);
      const response = await vault.sendRequest(vaultRequest);
      
      const addressesOld = response.addresses.map((x: any) => x.address);
      const addressesNew: Array<accountType> = [];
      cryptoAccounts.forEach((x: accountType) => {
        const index = addressesOld.indexOf(x.publicAddress);
        if (index !== -1) {
          addressesOld.splice(index, 1);
        } else {
          addressesNew.push(x);
        }
      })
      await Promise.all(addressesOld.map(async (address: string) => {
        const request = await vault.deleteAddressbookEntry(
          orgDetail.vaultAddressbookId,
          address,
        );
        await vault.sendRequest(request);
      }));
      await Promise.all(addressesNew.map(async (x: accountType) => {
        const request = await vault.createAddressbookEntry(
          orgDetail.vaultAddressbookId,
          x.publicAddress,
          x.name,
          x.currency === "BTC" ? VaultWalletType.Bitcoin : VaultWalletType.Ethereum,
        );
        await vault.sendRequest(request);
      }));

      dispatch(
        snackbarActions.showSnackbar({
          message: "Successfully done!",
          type: "success",
        })
      );
    } catch (error) {
      dispatch(
        snackbarActions.showSnackbar({
          message: error.message,
          type: "error",
        })
      );
    }
    setTrustingAccounts(false);
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
                                  onClick={onClickAddToVault}
                                  disabled={
                                    addingToVault ||
                                    !vault.checkUserVaultPermission(
                                      currentUser, 
                                      VaultPermissions.CreateDeleteAddressBook
                                    ) || 
                                    !!orgDetail.vaultAddressbookId
                                  }
                                >
                                  Add To Vault
                                </Button>

                                {addingToVault && (
                                  <CircularProgress
                                    size={24}
                                    className={classes.progressButton}
                                  />
                                )}
                              </div>
                            </Grid>
                            <Grid item>
                              <div className={classes.progressButtonWrapper}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={onClickLockPermission}
                                  disabled={
                                    loadingVaultPermission || 
                                    !vault.checkUserLockUsability(currentUser) ||
                                    !orgDetail.vaultAddressbookId
                                  }
                                >
                                  <Lock fontSize="small" />Permission
                                </Button>

                                {loadingVaultPermission && (
                                  <CircularProgress
                                    size={24}
                                    className={classes.progressButton}
                                  />
                                )}
                              </div>
                            </Grid>
                            <Grid item>
                              <div className={classes.progressButtonWrapper}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={onClickTrustAccounts}
                                  disabled={
                                    trustingAccounts ||
                                    !cryptoAccounts.length ||
                                    !orgDetail.vaultAddressbookId
                                  }
                                >
                                  Trust Nostro Accounts
                                </Button>

                                {trustingAccounts && (
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
      <Dialog
          open={lockModalView}
          onClose={() => {
            setLockModalView(false);
          }}
          aria-labelledby="form-dialog-title"
        >
          <Form
            onSubmit={handleLockPermission}
            initialValues={lockPermissions}
            render={({
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit} noValidate>
                <DialogTitle id="form-dialog-title">
                  Permission of Addressbook
                </DialogTitle>
                <Divider />
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormGroup
                        className={classes.roleContainer}
                      >
                        <FormLabel
                          component="legend"
                          className={classes.roleName}
                        >
                          Trust accounts (AddRemoveAddress)
                        </FormLabel>
                        <Grid container>
                          {orgRoles.concat(multiDeskRoles, deskRoles).map(
                            (x) => (
                              <Grid item key={x.vaultGroupId} xs={2}>
                                <Grid
                                  container
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <Grid item>
                                    <Field
                                      name="addRemoveAddress[]"
                                      component="input"
                                      type="checkbox"
                                      value={x.vaultGroupId}
                                    />
                                  </Grid>
                                  <Grid item>
                                    <Typography variant="body1">
                                      {x.name}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                      <FormGroup
                        className={classes.roleContainer}
                      >
                        <FormLabel
                          component="legend"
                          className={classes.roleName}
                        >
                          Create Rules (CreateDeleteRuleTree)
                        </FormLabel>
                        <Grid container>
                          {orgRoles.concat(multiDeskRoles, deskRoles).map(
                            (x) => (
                              <Grid item key={x.vaultGroupId} xs={2}>
                                <Grid
                                  container
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <Grid item>
                                    <Field
                                      name="createDeleteRuleTree[]"
                                      component="input"
                                      type="checkbox"
                                      value={x.vaultGroupId}
                                    />
                                  </Grid>
                                  <Grid item>
                                    <Typography variant="body1">
                                      {x.name}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                      <FormGroup
                        className={classes.roleContainer}
                      >
                        <FormLabel
                          component="legend"
                          className={classes.roleName}
                        >
                          Display Rules (GetRuleTrees)
                        </FormLabel>
                        <Grid container>
                          {orgRoles.concat(multiDeskRoles, deskRoles).map(
                            (x) => (
                              <Grid item key={x.vaultGroupId} xs={2}>
                                <Grid
                                  container
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <Grid item>
                                    <Field
                                      name="getRuleTrees[]"
                                      component="input"
                                      type="checkbox"
                                      value={x.vaultGroupId}
                                    />
                                  </Grid>
                                  <Grid item>
                                    <Typography variant="body1">
                                      {x.name}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </FormGroup>
                    </Grid>
                  </Grid>
                </DialogContent>
                <Divider />
                <DialogActions>
                  <Button
                    onClick={() => {
                      setLockModalView(false);
                    }}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <div className={classes.progressButtonWrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={lockModalProcessing}
                    >
                      Save
                    </Button>
                    {lockModalProcessing && (
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
    </div>
  );
};

export default Settings;
