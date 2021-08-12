import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import {
  AppBar,
  Badge,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
} from "@material-ui/core";
import {
  ChevronRight,
  ExpandMore,
  Home,
  Notifications,
  Person,
  Settings,
} from "@material-ui/icons";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import ContactsIcon from "@material-ui/icons/Contacts";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import GroupIcon from "@material-ui/icons/Group";
import SendIcon from "@material-ui/icons/Send";
import { useAuth, useTheme } from "../../../hooks";
import { useGlobalSlice } from "../../../slice";
import { selectTheme } from "../../../slice/selectors";

const navLinks = [
  { title: `Dashboard`, path: `/dashboard`, hasChildren: false },
  { title: `Investors`, path: `/investors`, hasChildren: false },
  { title: `Trades`, path: `/trades`, hasChildren: false },
  { title: `Market`, path: `/market`, hasChildren: false },
];
const useStyles = makeStyles({
  navDisplayFlex: {
    display: `flex`,
    justifyContent: `space-between`,
  },
  linkText: {
    textDecoration: `none`,
    color: `white`,
    "&:hover": {
      textDecoration: `none`,
    },
  },
});

interface headerProps {
  notificationDrawerOpen: boolean;
  handleNotificationDrawerOpen: () => void;
}

const Header = ({
  notificationDrawerOpen,
  handleNotificationDrawerOpen,
}: headerProps): React.ReactElement<headerProps> => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { isAuthenticated, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useSelector(selectTheme);
  const { actions: globalActions } = useGlobalSlice();

  const redirect = (path: string) => {
    setAnchorEl(null);
    history.push(path);
  };

  const handleSettingsMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setAnchorEl(null);
  };

  const switchTheme = () => {
    dispatch(globalActions.toggleTheme());
  };

  return (
    <AppBar position="static" color="secondary">
      <Toolbar>
        <Container className={classes.navDisplayFlex}>
          <div className={classes.navDisplayFlex}>
            <IconButton edge="start" color="inherit" aria-label="home">
              <Home fontSize="large" />
            </IconButton>
            {isAuthenticated ? (
              <List
                component="nav"
                aria-labelledby="main navigation"
                className={classes.navDisplayFlex}
              >
                {navLinks.map(({ title, path, hasChildren }) => (
                  <Link to={path} key={title} className={classes.linkText}>
                    <ListItem button>
                      {hasChildren ? <ExpandMore /> : <ChevronRight />}
                      <ListItemText primary={title} />
                    </ListItem>
                  </Link>
                ))}
              </List>
            ) : (
              <></>
            )}
          </div>
          <div>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="theme"
              onClick={switchTheme}
            >
              {theme === "light" ? (
                <Brightness4Icon fontSize="large" />
              ) : (
                <Brightness7Icon fontSize="large" />
              )}
            </IconButton>
            {isAuthenticated ? (
              <>
                <IconButton
                  aria-controls="settings-menu"
                  aria-haspopup="true"
                  edge="start"
                  color="inherit"
                  aria-label="settings"
                  onClick={handleNotificationDrawerOpen}
                >
                  <Badge badgeContent={4} color="error">
                    <Notifications fontSize="large" />
                  </Badge>
                </IconButton>
                <IconButton
                  aria-controls="settings-menu"
                  aria-haspopup="true"
                  edge="start"
                  color="inherit"
                  aria-label="settings"
                  onClick={handleSettingsMenuClick}
                >
                  <Person fontSize="large" />
                </IconButton>
                <Menu
                  id="settings-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleSettingsMenuClose}
                  elevation={0}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  getContentAnchorEl={null}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <MenuItem onClick={() => redirect("/profile")}>
                    <ListItemIcon>
                      <ContactsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => redirect("/roles")}>
                    <ListItemIcon>
                      <SendIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Roles" />
                  </MenuItem>
                  <MenuItem onClick={() => redirect("/co-workers")}>
                    <ListItemIcon>
                      <GroupIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Co-workers" />
                  </MenuItem>
                  <MenuItem onClick={() => redirect("/desks")}>
                    <ListItemIcon>
                      <GroupIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Desks" />
                  </MenuItem>
                  <MenuItem onClick={() => redirect("/settings")}>
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={signOut}>
                    <ListItemIcon>
                      <ExitToAppIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Sign out" />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <></>
            )}
          </div>
        </Container>
      </Toolbar>
    </AppBar>
  );
};
export default Header;
