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
import { useRef, useState , useEffect} from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { userNotExist } from "../redux/reducers/auth";

const NavBar = ({ tabs }) => {
  const [anchorEl, setAnchorEl] = useState(null); // for tab dropdown
  const [profileAnchor, setProfileAnchor] = useState(null); // for profile dropdown
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(null);
    const vantaRef = useRef(null);
    const vantaEffect = useRef(null);

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


    // useEffect(() => {
    //   let mounted = true;
  
    //   const loadScripts = async () => {
    //     try {
    //       // Load Three.js
    //       if (!window.THREE) {
    //         await new Promise((resolve, reject) => {
    //           const existingScript = document.querySelector(
    //             'script[src*="three.min.js"]'
    //           );
    //           if (existingScript) {
    //             if (window.THREE) resolve();
    //             else existingScript.addEventListener("load", resolve);
    //             return;
    //           }
  
    //           const threeScript = document.createElement("script");
    //           threeScript.src =
    //             "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
    //           threeScript.async = true;
    //           threeScript.onload = resolve;
    //           threeScript.onerror = reject;
    //           document.head.appendChild(threeScript);
    //         });
    //       }
  
    //       // Load Vanta Birds
    //       if (!window.VANTA?.BIRDS) {
    //         await new Promise((resolve, reject) => {
    //           const existingScript = document.querySelector(
    //             'script[src*="vanta.birds"]'
    //           );
    //           if (existingScript) {
    //             if (window.VANTA?.BIRDS) resolve();
    //             else existingScript.addEventListener("load", resolve);
    //             return;
    //           }
  
    //           const vantaScript = document.createElement("script");
    //           vantaScript.src =
    //             "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js";
    //           vantaScript.async = true;
    //           vantaScript.onload = resolve;
    //           vantaScript.onerror = reject;
    //           document.head.appendChild(vantaScript);
    //         });
    //       }
  
    //       // Initialize Vanta effect only if component is still mounted
    //       if (
    //         mounted &&
    //         window.VANTA?.BIRDS &&
    //         vantaRef.current &&
    //         !vantaEffect.current
    //       ) {
    //         vantaEffect.current = window.VANTA.BIRDS({
    //           el: vantaRef.current,
    //           mouseControls: true,
    //           touchControls: true,
    //           gyroControls: false,
    //           minHeight: 200.0,
    //           minWidth: 200.0,
    //           scale: 1.0,
    //           scaleMobile: 1.0,
    //           backgroundColor: 0x1e3a8a,
    //           color1: 0xff0000,
    //           color2: 0x00ffff,
    //           colorMode: "variance",
    //           birdSize: 1.8,
    //           wingSpan: 25.0,
    //           speedLimit: 4.0,
    //           separation: 50.0,
    //           alignment: 50.0,
    //           cohesion: 40.0,
    //           quantity: 4.0,
    //         });
    //       }
    //     } catch (error) {
    //       console.error("Error loading Vanta scripts:", error);
    //     }
    //   };
  
    //   loadScripts();
  
    //   return () => {
    //     mounted = false;
    //     if (vantaEffect.current) {
    //       try {
    //         vantaEffect.current.destroy();
    //         vantaEffect.current = null;
    //       } catch (error) {
    //         console.error("Error destroying Vanta effect:", error);
    //       }
    //     }
    //   };
    // }, []);

useEffect(() => {
  let mounted = true;

  async function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded) return resolve();
        existing.addEventListener("load", resolve);
        existing.addEventListener("error", reject);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const initFog = async () => {
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js");

      // Clean up old effect
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }

      if (mounted && window.VANTA?.FOG && vantaRef.current) {
        vantaEffect.current = window.VANTA.FOG({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 64.0,
          minWidth: 200.0,
          highlightColor: 0x4aff,
          midtoneColor: 0xff0000,
          lowlightColor: 0x2d00ff,
          baseColor: 0xedebff,
          blurFactor: 0.6,
          zoom: 0.1,
          speed: 5,
        });
        console.log("✅ VANTA.FOG initialized!");
      } else {
        console.error("⚠️ VANTA.FOG or target element not ready!");
      }
    } catch (err) {
      console.error("VANTA.FOG load failed:", err);
    }
  };

  initFog();

  return () => {
    mounted = false;
    if (vantaEffect.current) {
      vantaEffect.current.destroy();
      vantaEffect.current = null;
    }
  };
}, []);



  return (
    
      <AppBar
        ref={vantaRef}
      position="sticky"
      // Use a deeper background color and a subtle shadow for a premium feel
      className="bg-gray-800 shadow-xl z-0 border-b border-indigo-700/50 "
      elevation={4}
    >
      <Toolbar className="max-w-8xl mx-auto mr-0 w-full flex justify-between">
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
              <Typography className="px-5 text-white">
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
