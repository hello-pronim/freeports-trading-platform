/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import { AddCircle, RemoveCircle } from "@material-ui/icons";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import ImageUploader from "react-images-upload";
import { useParams, useHistory } from "react-router";

import Manager from "../Manager";
import { useAccounts, useOrganization } from "../../../../hooks";

interface accountType {
  id: string;
  name: string;
  currency: string;
  type: string;
  iban: string;
}
interface assignedAccountType {
  currency: string;
  iban: string;
  account: string;
}
interface managerType {
  id: string;
  nickname: string;
  email: string;
}
const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  boldSpanMarginL: {
    fontWeight: "bold",
    marginLeft: 25,
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
  },
  selectStyle: {
    width: "250px",
    fontSize: 25,
    fontWeight: "initial",
    marginLeft: 15,
  },
  fullCard: {
    height: "100%",
  },
  iconButton: {
    padding: 0,
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
  profileImageContainer: {
    position: "relative",
    width: 200,
    height: 200,
    margin: "auto",
    "&:hover, &:focus": {
      "& $profileImage": {
        opacity: 0.5,
      },
    },
  },
  profileImage: {
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  profileFileInput: {
    opacity: 0,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    cursor: "pointer",
  },
}));

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const EditOrganizer = (): React.ReactElement => {
  const { id }: any = useParams();
  const history = useHistory();
  const classes = useStyle();
  const { allAccounts, assignAccount, unassignAccount } = useAccounts();
  const showingIcon = false;
  const { getOrganization, editOrganization, getManagers, editManager } =
    useOrganization();
  const [orgDetail, setOrgDetail] = useState({
    id: "",
    name: "",
    createdAt: "",
    commissionOrganization: "",
    commissionClearer: "",
    logo: "",
    userActive: "",
    userSuspended: "",
    accountList: [],
  });
  const [managers, setManagers] = useState([] as managerType[]);
  const [assignedAccounts, setAssignedAccounts] = useState<
    Array<assignedAccountType>
  >([]);
  const [selectedAccounts, setSelectedAccounts] = useState([] as string[]);
  const [accounts, setAccounts] = useState([] as accountType[]);
  const [orgUpdating, setOrgUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  const [managerUpdating, setManagerUpdating] = useState(false);
  const [submitResponse, setSubmitResponse] = useState({
    type: "success",
    message: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const timer = React.useRef<number>();

  useEffect(() => {
    let mounted = false;
    const init = async () => {
      const all = await allAccounts(); // get all clearer accounts
      const detail = await getOrganization(id);
      const managerList = await getManagers(id);

      if (!mounted) {
        setAccounts(all);
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
        });
        setAssignedAccounts(detail.clearing);
        setManagers(managerList);
      }
    };
    init();
    return () => {
      mounted = true;
    };
  }, []);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const onHandleNameChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    const newOrgDetail = { ...orgDetail };
    newOrgDetail.name = value;
    setOrgDetail(newOrgDetail);
  };

  const onHandleClearerCommission = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    const newOrgDetail = { ...orgDetail };
    newOrgDetail.commissionClearer = value;
    setOrgDetail(newOrgDetail);
  };

  const onHandleOrganizationCommission = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    const newOrgDetail = { ...orgDetail };
    newOrgDetail.commissionOrganization = value;
    setOrgDetail(newOrgDetail);
  };

  const onHandleUpdate = async () => {
    setOrgUpdating(true);
    setShowAlert(false);
    setSubmitResponse({ type: "", message: "" });
    await editOrganization(
      id,
      orgDetail.createdAt,
      orgDetail.name,
      orgDetail.logo,
      orgDetail.commissionOrganization,
      orgDetail.commissionClearer
    )
      .then((data: any) => {
        const responseId = data.id;
        setSubmitResponse({
          type: "success",
          message: "Organization has been updated successfully.",
        });
        setShowAlert(true);
        timer.current = window.setTimeout(() => {
          history.push("/organizations");
        }, 2000);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const newManager = async () => {
    history.push(`/organizations/${id}/managers/add`);
  };

  const getAccount = (accId: string): accountType => {
    const obj = accounts.filter((item: accountType) => item.id === accId);
    return obj[0];
  };

  const handleAssignCheck = (list: Array<string>): boolean => {
    let valid = true;
    list.forEach((item1: string) => {
      const selectedObject = getAccount(item1);
      let invalidCount = list.filter(
        (item2: string) =>
          item1 !== item2 &&
          selectedObject.currency === getAccount(item2).currency
      ).length;
      if (invalidCount) valid = false;
      invalidCount = assignedAccounts.filter(
        (acc: assignedAccountType) => selectedObject.currency === acc.currency
      ).length;
      if (invalidCount) valid = false;
    });
    return valid;
  };

  const onHandleAccountSelect = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const { value } = event.target;
    if (handleAssignCheck(value as string[]))
      setSelectedAccounts(value as string[]);
    else {
      setSubmitResponse({
        type: "error",
        message: "You can't select the accounts with the same currency",
      });
      setShowAlert(true);
    }
  };

  const onHandleAccountsAssign = async () => {
    const newAccounts = [...assignedAccounts];

    setAssigning(true);
    setShowAlert(true);
    selectedAccounts.map(async (item) => {
      await assignAccount(id, item)
        .then((data: string) => {
          const itemObjects = accounts.filter(
            (acc: accountType) => acc.id === item
          );
          if (itemObjects.length) {
            newAccounts.push({
              account: itemObjects[0].id,
              iban: itemObjects[0].iban,
              currency: itemObjects[0].currency,
            });
          }
          setAssigning(false);
          setSubmitResponse({
            type: "success",
            message: "Accounts has been assigned successfully.",
          });
          setShowAlert(false);
          setAssignedAccounts(newAccounts);
          setSelectedAccounts([]);
        })
        .catch((err: any) => {
          setAssigning(false);
          setSubmitResponse({
            type: "error",
            message: err.message,
          });
          setShowAlert(false);
          setAssignedAccounts(newAccounts);
          setSelectedAccounts([]);
        });
    });
  };

  const onHandleAccountUnassign = async (accountId: string) => {
    setUnassigning(true);
    setShowAlert(false);
    setSubmitResponse({ type: "", message: "" });
    await unassignAccount(id, accountId)
      .then(() => {
        setUnassigning(false);
        setSubmitResponse({
          type: "success",
          message: "Account has been unassigned successfully.",
        });
        setShowAlert(true);
        const newAccounts = assignedAccounts.filter(
          (item: assignedAccountType) => item.account !== accountId
        );
        setAssignedAccounts(newAccounts);
      })
      .catch((err: any) => {
        setUnassigning(false);
        setSubmitResponse({
          type: "error",
          message: err.message,
        });
        setShowAlert(true);
      });

    setSelectedAccounts([]);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const onHandleManagerUpdate = async (manager: any) => {
    setManagerUpdating(true);
    setShowAlert(false);
    setSubmitResponse({ type: "", message: "" });
    await editManager(
      id,
      manager.id,
      manager.nickname,
      manager.email,
      manager.phone,
      manager.avatar
    )
      .then(async (data: string) => {
        setManagerUpdating(false);
        setSubmitResponse({
          type: "success",
          message: "Manager has been updated successfully.",
        });
        setShowAlert(true);
      })
      .catch((err: any) => {
        setManagerUpdating(false);
        setSubmitResponse({
          type: "error",
          message: err.message,
        });
        setShowAlert(true);
      });
  };

  return (
    <div className="main-wrapper">
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Card className={classes.fullCard}>
              <CardHeader
                title={
                  <Grid container justify="space-between" alignItems="center">
                    <Grid item>
                      <Typography variant="h5">Edit Organization</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2" color="textSecondary">
                        {`Creation Date: ${orgDetail.createdAt}`}
                      </Typography>
                    </Grid>
                  </Grid>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Grid container justify="center">
                      <Grid item xs={6}>
                        <div className={classes.profileImageContainer}>
                          <Avatar
                            src={orgDetail.logo}
                            alt="Avatar"
                            className={classes.profileImage}
                          />
                          <input
                            type="file"
                            name="avatar"
                            className={classes.profileFileInput}
                            onChange={onAvatarChange}
                          />
                        </div>
                        {/* <CardMedia
                          style={{ marginTop: 20 }}
                          component="img"
                          height="140"
                          image={orgDetail.logo}
                        />
                        <ImageUploader
                          withIcon={showingIcon}
                          withLabel={showingIcon}
                          buttonText="Choose Image"
                          onChange={(ChangeEvent) => onDrop(ChangeEvent)}
                          buttonStyles={{
                            width: "100%",
                          }}
                          fileContainerStyle={{
                            margin: 0,
                            padding: 0,
                          }}
                        /> */}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container direction="row">
                      <TextField
                        type="text"
                        value={orgDetail.name}
                        label="Name"
                        variant="outlined"
                        onChange={onHandleNameChange}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Grid container spacing={1} alignItems="center">
                          <Grid item xs={9}>
                            <FormControl fullWidth variant="outlined">
                              <Select
                                multiple
                                displayEmpty
                                value={selectedAccounts}
                                onChange={onHandleAccountSelect}
                                renderValue={(selected: any) => {
                                  if (selected.length === 0) {
                                    return <em>Nostro accounts</em>;
                                  }

                                  return selected.join(", ");
                                }}
                              >
                                <MenuItem disabled value="">
                                  <em>Nostro accounts</em>
                                </MenuItem>
                                {accounts
                                  .filter(
                                    // filter assigned accounts from list
                                    (item: accountType) =>
                                      assignedAccounts.filter(
                                        (account: assignedAccountType) =>
                                          account.account === item.id
                                      ).length === 0
                                  )
                                  .map((item: accountType) => (
                                    <MenuItem key={item.id} value={item.id}>
                                      <Checkbox
                                        checked={
                                          selectedAccounts.indexOf(item.id) > -1
                                        }
                                      />
                                      <ListItemText>{`${item.name} (${item.currency})`}</ListItemText>
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={3}>
                            <div className={classes.progressButtonWrapper}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={onHandleAccountsAssign}
                                disabled={assigning}
                                fullWidth
                              >
                                Assign
                              </Button>
                              {assigning && (
                                <CircularProgress
                                  size={24}
                                  className={classes.progressButton}
                                />
                              )}
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>
                      {assignedAccounts.map((account: assignedAccountType) => (
                        <Grid item xs={12} key={account.account}>
                          <Grid container spacing={1} alignItems="center">
                            <Grid item>
                              <IconButton
                                color="primary"
                                aria-label="Unassign account"
                                component="span"
                                className={classes.iconButton}
                                onClick={() =>
                                  onHandleAccountUnassign(account.account)
                                }
                                disabled={unassigning}
                              >
                                <RemoveCircle />
                              </IconButton>
                            </Grid>
                            <Grid item>
                              <Typography variant="body2">
                                {`Account (${account.currency}): ${account.iban}`}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={4}>
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardContent>
                            <Grid container spacing={4}>
                              <Grid item xs={6}>
                                <Grid container spacing={1}>
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="body2"
                                      style={{ fontWeight: "bold" }}
                                    >
                                      Organization fees
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Input
                                      endAdornment={
                                        <InputAdornment position="end">
                                          %
                                        </InputAdornment>
                                      }
                                      value={orgDetail.commissionOrganization}
                                      onChange={onHandleOrganizationCommission}
                                    />
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
                                      Clearning fees
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Input
                                      endAdornment={
                                        <InputAdornment position="end">
                                          %
                                        </InputAdornment>
                                      }
                                      value={orgDetail.commissionClearer}
                                      onChange={onHandleClearerCommission}
                                    />
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
                </Grid>
              </CardContent>
              <Divider />
              <CardActions>
                <Grid container justify="flex-end">
                  <Grid item>
                    <div className={classes.progressButtonWrapper}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={onHandleUpdate}
                        disabled={orgUpdating}
                      >
                        SAVE CHANGES
                      </Button>
                      {orgUpdating && (
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
          </Grid>
          <Grid item xs={6}>
            <Card className={classes.fullCard}>
              <CardHeader
                title={
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      <Typography variant="h5">Organization Manager</Typography>
                    </Grid>
                    {managers.length === 0 && (
                      <Grid item>
                        <IconButton
                          aria-label="Add manager"
                          onClick={newManager}
                          className={classes.iconButton}
                        >
                          <AddCircle fontSize="large" color="primary" />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                }
              />
              <Divider />
              <CardContent>
                <Grid container>
                  <List>
                    {managers.map((managerItem) => (
                      <ListItem key={managerItem.id}>
                        <Manager
                          orgId={id}
                          managerId={managerItem.id}
                          onHandleManagerUpdate={onHandleManagerUpdate}
                          managerUpdating={managerUpdating}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </CardContent>
            </Card>
            <Snackbar
              autoHideDuration={2000}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              open={showAlert}
              onClose={handleAlertClose}
            >
              <Alert
                onClose={handleAlertClose}
                severity={
                  submitResponse.type === "success" ? "success" : "error"
                }
              >
                {submitResponse.message}
              </Alert>
            </Snackbar>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default EditOrganizer;
