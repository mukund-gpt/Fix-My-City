import { persistor } from "@/redux/store";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Avatar,
  Drawer,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { userNotExist } from "../redux/reducers/auth";

const NavBar = ({ tabs }) => {
  const [anchorEl, setAnchorEl] = useState(null); // for tab dropdown
  const [profileAnchor, setProfileAnchor] = useState(null); // for profile dropdown
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Tab dropdown
  const handleMenuOpen = (event, tab) => {
    setAnchorEl(event.currentTarget);
    setCurrentTab(tab);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentTab(null);
  };

  // Profile dropdown
  const handleProfileOpen = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const handleLogout = () => {
    setProfileAnchor(null);
    dispatch(userNotExist());
    persistor.purge();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      // Use a deeper background color and a subtle shadow for a premium feel
      className="bg-gray-800 shadow-xl z-50 border-b border-indigo-700/50"
      elevation={4}
    >
      <Toolbar className="max-w-7xl mx-auto w-full flex justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-yellow-400 tracking-wide hover:scale-105 transition-transform"
        >
          FixMyCity
        </Link>

        {/* Desktop Tabs */}
        <ul className="hidden md:flex space-x-4 items-center">
          {tabs.map((tab) => (
            <li key={tab.name}>
              {tab.options ? (
                <button
                  onClick={(e) => handleMenuOpen(e, tab)}
                  className="relative flex items-center space-x-1 text-white hover:text-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/30 px-3 py-1 rounded-md"
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                  <ExpandMoreIcon
                    fontSize="small"
                    className="ml-1 text-gray-300"
                  />
                </button>
              ) : (
                <Link
                  to={tab.path}
                  className="relative flex items-center space-x-1 text-white hover:text-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/30 px-3 py-1 rounded-md"
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Profile / Login */}
        {!user ? (
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-white hover:text-yellow-400 transition-all duration-300 hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition-all duration-300 hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center">
            <IconButton
              onClick={handleProfileOpen}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Avatar
                src={user?.avatar || ""}
                alt={user?.name || "User"}
                className="bg-yellow-400 text-black"
              />
              <Typography className="ml-5 text-white">
                {user?.name || "User"}
              </Typography>
            </IconButton>
          </div>
        )}

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            className="hover:scale-110 transition-transform"
          >
            <MenuIcon />
          </IconButton>
        </div>
      </Toolbar>

      {/* Tab Dropdown */}
      {currentTab?.options && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          MenuListProps={{ className: "bg-gray-800 text-white" }}
          PaperProps={{
            className: "bg-gray-800 rounded-lg shadow-lg shadow-yellow-400/20",
          }}
        >
          {currentTab.options.map((option) => (
            <MenuItem
              key={option.name}
              component={Link}
              to={option.path}
              onClick={handleMenuClose}
              className="hover:bg-gray-700 transition-colors"
            >
              {option.name}
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* Profile Dropdown */}
      {user && (
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleProfileClose}
          TransitionComponent={Fade}
          PaperProps={{
            className: "bg-gray-800 text-white rounded-lg shadow-lg",
          }}
        >
          <MenuItem onClick={handleProfileClose} component={Link} to="/profile">
            Profile
          </MenuItem>
          <MenuItem
            onClick={handleProfileClose}
            component={Link}
            to="/settings"
          >
            Settings
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            className="text-red-500 hover:bg-red-600 hover:text-white transition-colors"
          >
            Logout
          </MenuItem>
        </Menu>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ className: "bg-gray-900 text-white w-64" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400">FixMyCity</h2>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            className="text-white"
          >
            <CloseIcon />
          </IconButton>
        </div>
        <List>
          {tabs.map((tab) => (
            <div key={tab.name}>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={tab.path}
                  onClick={() => setDrawerOpen(false)}
                  className="hover:bg-gray-800 transition-all"
                >
                  <ListItemText primary={tab.name} />
                </ListItemButton>
              </ListItem>
              {tab.options && (
                <div className="ml-4">
                  {tab.options.map((opt) => (
                    <ListItemButton
                      key={opt.name}
                      component={Link}
                      to={opt.path}
                      onClick={() => setDrawerOpen(false)}
                      className="pl-6 text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      {opt.name}
                    </ListItemButton>
                  ))}
                </div>
              )}
            </div>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default NavBar;
