// import * as React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import AppBar from "@mui/material/AppBar";
// import Box from "@mui/material/Box";
// import Toolbar from "@mui/material/Toolbar";
// import IconButton from "@mui/material/IconButton";
// import Typography from "@mui/material/Typography";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
// import MenuIcon from "@mui/icons-material/Menu";
// import Container from "@mui/material/Container";
// import Avatar from "@mui/material/Avatar";
// import Tooltip from "@mui/material/Tooltip";
// import Button from "@mui/material/Button";
// import Web2 from "../assets/Web2.jpg"; // Import the image

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [anchorElNav, setAnchorElNav] = React.useState(null);
//   const [anchorElUser, setAnchorElUser] = React.useState(null);

//   const handleOpenNavMenu = (event) => {
//     setAnchorElNav(event.currentTarget);
//   };

//   const handleCloseNavMenu = () => {
//     setAnchorElNav(null);
//   };

//   const handleOpenUserMenu = (event) => {
//     setAnchorElUser(event.currentTarget);
//   };

//   const handleCloseUserMenu = () => {
//     setAnchorElUser(null);
//   };

//   const handleLoginClick = (e) => {
//     e.preventDefault();
//     navigate("/login"); // Navigate to the login page
//   };

//   const handlePrivateClick = (e) => {
//     e.preventDefault();
//     navigate("/private"); // Navigate to the private page
//   };

//   return (
//     <AppBar
//       position="static"
//       sx={{
//         backgroundImage: `url(${Web2})`, // Use the imported image
//         backgroundSize: "cover", // Ensure the image covers the entire navbar
//         backgroundPosition: "center", // Center the image
//       }}
//     >
//       <Container maxWidth="xl">
//         <Toolbar disableGutters>
//           {/* Hamburger Menu (Mobile View) */}
//           <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
//             <IconButton
//               size="large"
//               aria-label="menu"
//               aria-controls="menu-appbar"
//               aria-haspopup="true"
//               onClick={handleOpenNavMenu}
//               color="inherit"
//             >
//               <MenuIcon />
//             </IconButton>
//             <Menu
//               id="menu-appbar"
//               anchorEl={anchorElNav}
//               anchorOrigin={{
//                 vertical: "bottom",
//                 horizontal: "left",
//               }}
//               transformOrigin={{
//                 vertical: "top",
//                 horizontal: "left",
//               }}
//               open={Boolean(anchorElNav)}
//               onClose={handleCloseNavMenu}
//               sx={{ display: { xs: "block", md: "none" } }}
//             >
//               <MenuItem component={Link} to="/" onClick={handleCloseNavMenu}>
//                 <Typography textAlign="center">Home</Typography>
//               </MenuItem>
//               <MenuItem component={Link} to="/about" onClick={handleCloseNavMenu}>
//                 <Typography textAlign="center">About</Typography>
//               </MenuItem>
//               <MenuItem component={Link} to="/photos" onClick={handleCloseNavMenu}>
//                 <Typography textAlign="center">Photos</Typography>
//               </MenuItem>
//               <MenuItem component={Link} to="/contact" onClick={handleCloseNavMenu}>
//                 <Typography textAlign="center">Contact</Typography>
//               </MenuItem>
//               <MenuItem onClick={handlePrivateClick}>
//                 <Typography textAlign="center">Private</Typography>
//               </MenuItem>
//               <MenuItem onClick={handleLoginClick}>
//                 <Typography textAlign="center">Login</Typography>
//               </MenuItem>
//             </Menu>
//           </Box>

//           {/* Navbar Title (Brand Logo or Name) */}
//           <Typography
//             variant="h6"
//             noWrap
//             component={Link}
//             to="/"
//             sx={{
//               mr: 2,
//               display: { xs: "none", md: "flex" },
//               fontFamily: "monospace",
//               fontWeight: 700,
//               letterSpacing: ".3rem",
//               color: "inherit",
//               textDecoration: "none",
//             }}
//           >
//             Alkarabubi
//           </Typography>

//           {/* Desktop Navigation Links */}
//           <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
//             <Button
//               component={Link}
//               to="/"
//               sx={{ my: 2, color: "white", display: "block" }}
//             >
//               Home
//             </Button>
//             <Button
//               component={Link}
//               to="/about"
//               sx={{ my: 2, color: "white", display: "block" }}
//             >
//               About
//             </Button>
//             <Button
//               component={Link}
//               to="/photos"
//               sx={{ my: 2, color: "white", display: "block" }}
//             >
//               Photos
//             </Button>
//             <Button
//               component={Link}
//               to="/contact"
//               sx={{ my: 2, color: "white", display: "block" }}
//             >
//               Contact
//             </Button>
//             <Button
//               onClick={handlePrivateClick}
//               sx={{ my: 2, color: "white", display: "block" }}
//             >
//               Private
//             </Button>
//             <Button
//               onClick={handleLoginClick}
//               sx={{ my: 2, color: "white", display: "block" }}
//             >
//               Login
//             </Button>
//           </Box>

//           {/* User Avatar Menu */}
//           <Box sx={{ flexGrow: 0 }}>
//             <Tooltip title="Open settings">
//               <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//                 <Avatar alt="User" src="/static/images/avatar/2.jpg" />
//               </IconButton>
//             </Tooltip>
//             <Menu
//               sx={{ mt: "45px" }}
//               id="menu-appbar"
//               anchorEl={anchorElUser}
//               anchorOrigin={{
//                 vertical: "top",
//                 horizontal: "right",
//               }}
//               keepMounted
//               transformOrigin={{
//                 vertical: "top",
//                 horizontal: "right",
//               }}
//               open={Boolean(anchorElUser)}
//               onClose={handleCloseUserMenu}
//             >
//               <MenuItem key="profile" onClick={handleCloseUserMenu}>
//                 <Typography textAlign="center">Profile</Typography>
//               </MenuItem>
//               <MenuItem key="dashboard" onClick={handleCloseUserMenu}>
//                 <Typography textAlign="center">Dashboard</Typography>
//               </MenuItem>
//               <MenuItem key="logout" onClick={handleCloseUserMenu}>
//                 <Typography textAlign="center">Logout</Typography>
//               </MenuItem>
//             </Menu>
//           </Box>
//         </Toolbar>
//       </Container>
//     </AppBar>
//   );
// };

// export default Navbar;


import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Web2 from "../assets/Web2.jpg"; // Import the background image
import SalehImage from "../assets/saleh.jpg"; // Import the saleh.jpg image

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/login"); // Navigate to the login page
  };

  const handlePrivateClick = (e) => {
    e.preventDefault();
    navigate("/private"); // Navigate to the private page
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundImage: `url(${Web2})`, // Use the imported background image
        backgroundSize: "cover", // Ensure the image covers the entire navbar
        backgroundPosition: "center", // Center the image
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Hamburger Menu (Mobile View) */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              <MenuItem component={Link} to="/" onClick={handleCloseNavMenu}>
                <Typography textAlign="center">Home</Typography>
              </MenuItem>
              <MenuItem component={Link} to="/about" onClick={handleCloseNavMenu}>
                <Typography textAlign="center">About</Typography>
              </MenuItem>
              <MenuItem component={Link} to="/photos" onClick={handleCloseNavMenu}>
                <Typography textAlign="center">Photos</Typography>
              </MenuItem>
              <MenuItem component={Link} to="/contact" onClick={handleCloseNavMenu}>
                <Typography textAlign="center">Contact</Typography>
              </MenuItem>
              <MenuItem onClick={handlePrivateClick}>
                <Typography textAlign="center">Private</Typography>
              </MenuItem>
              <MenuItem onClick={handleLoginClick}>
                <Typography textAlign="center">Login</Typography>
              </MenuItem>
            </Menu>
          </Box>

          {/* Navbar Title (Brand Logo or Name) */}
          <Box
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
            }}
          >
            <img
              src={SalehImage} // Use the imported saleh.jpg image
              alt="Saleh"
              style={{
                height: "40px", // Adjust the height as needed
                width: "auto", // Maintain aspect ratio
              }}
            />
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button
              component={Link}
              to="/"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Home
            </Button>
            <Button
              component={Link}
              to="/about"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              About
            </Button>
            <Button
              component={Link}
              to="/photos"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Photos
            </Button>
            <Button
              component={Link}
              to="/contact"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Contact
            </Button>
            <Button
              onClick={handlePrivateClick}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Private
            </Button>
            <Button
              onClick={handleLoginClick}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Login
            </Button>
          </Box>

          {/* User Avatar Menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem key="profile" onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem key="dashboard" onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Dashboard</Typography>
              </MenuItem>
              <MenuItem key="logout" onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;