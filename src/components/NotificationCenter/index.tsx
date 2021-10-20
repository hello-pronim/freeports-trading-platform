import React from "react";
import {
  Button,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Theme,
  Select,
  Typography,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { ChevronRight } from "@mui/icons-material";

import data from "./data";

const drawerWidth = 400;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    alignItemsCenter: {
      display: "flex",
      alignItems: "center",
      height: "100%",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(0, 2),
      ...theme.mixins.toolbar,
    },
    drawerBody: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 2),
    },
    flexWrapper: {
      display: "flex",
      alignItems: "center",
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    notificationFilterWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    notificationCenterTitle: {
      writingMode: "vertical-lr",
      textTransform: "uppercase",
      margin: theme.spacing(2, 0),
    },
    notificationTypeSelect: {
      fontSize: "14px",
      "& .MuiSelect-select": {
        padding: theme.spacing(1, 2),
      },
    },
  })
);

interface drawerProps {
  notificationDrawerOpen: boolean;
  handleNotificationDrawerOpen: () => void;
}

const NotificationCenter = ({
  notificationDrawerOpen,
  handleNotificationDrawerOpen,
}: drawerProps): React.ReactElement<drawerProps> => {
  const classes = useStyles();

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={notificationDrawerOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <Grid container justifyContent="space-between">
          <Grid item xs={2}>
            <IconButton onClick={handleNotificationDrawerOpen} size="large">
              <ChevronRight />
            </IconButton>
          </Grid>
          <Grid item>
            <div className={classes.alignItemsCenter}>
              <Button>Open as page</Button>
              <Button>History</Button>
            </div>
          </Grid>
        </Grid>
      </div>
      <div className={classes.drawerBody}>
        <Grid container>
          <Grid item xs={2}>
            <Typography
              variant="h5"
              className={classes.notificationCenterTitle}
            >
              Notification Center
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <div className={classes.notificationFilterWrapper}>
              <Typography style={{ fontWeight: 600 }}>
                Notification type
              </Typography>
              <FormControl variant="outlined" className={classes.formControl}>
                <Select
                  value="Re-funding"
                  displayEmpty
                  className={classes.notificationTypeSelect}
                >
                  <MenuItem value="Re-funding">Re-funding</MenuItem>
                </Select>
              </FormControl>
            </div>
            <Divider />
            <List>
              {data.map((item) => (
                <ListItem button key={item.id}>
                  <ListItemText
                    primary={
                      <>
                        <Typography variant="body2" color="textPrimary">
                          {`${item.type} / ${item.dateTime}`}
                        </Typography>
                        <Typography variant="h6" color="textPrimary">
                          {item.title}
                        </Typography>
                      </>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textPrimary">
                          From: name
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {item.content}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </div>
    </Drawer>
  );
};

export default NotificationCenter;
