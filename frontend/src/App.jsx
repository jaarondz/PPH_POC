import * as React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  CssBaseline,
  IconButton,
  Tooltip,
  Menu,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

// Import pages
import HomePage from "./pages/HomePage.jsx";
import AssetListPage from "./pages/AssetListPage.jsx";
import AssetDetailPage from "./pages/AssetDetailPage.jsx";
import AssetExecutivePage from "./pages/AssetExecutivePage.jsx";
import ProjectsListPage from "./pages/ProjectsListPage.jsx";
import ProjectsGanttPage from "./pages/ProjectsGanttPage.jsx";
import ProjectDetailPage from "./pages/ProjectsDetailPage.jsx";
import ProjectsExecutivePage from "./pages/ProjectsExecutivePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AccomplishmentsListPage from "./pages/AccomplishmentsListPage.jsx";
import AccomplishmentDetailPage from "./pages/AccomplishmentDetailPage.jsx";
import AccomplishmentsExecutivePage from "./pages/AccomplishmentsExecutivePage.jsx";
import ReportsListPage from "./pages/ReportsListPage.jsx";
import ReportDetailPage from "./pages/ReportDetailPage.jsx";
import ReportsExecutivePage from "./pages/ReportsExecutivePage.jsx";

function isAuthed() {
  return !!localStorage.getItem("token");
}

export default function App({ colorMode = "light", onToggleColorMode }) {
  const authed = isAuthed();
  const [assetsMenuAnchor, setAssetsMenuAnchor] = React.useState(null);
  const [reportsMenuAnchor, setReportsMenuAnchor] = React.useState(null);
  const [accomplishmentsMenuAnchor, setAccomplishmentsMenuAnchor] = React.useState(null);
  const [projectsMenuAnchor, setProjectsMenuAnchor] = React.useState(null);

  const assetsMenuOpen = Boolean(assetsMenuAnchor);
  const reportsMenuOpen = Boolean(reportsMenuAnchor);
  const accomplishmentsMenuOpen = Boolean(accomplishmentsMenuAnchor);
  const projectsMenuOpen = Boolean(projectsMenuAnchor);

  const openAssetsMenu = (event) => {
    setAssetsMenuAnchor(event.currentTarget);
  };

  const closeAssetsMenu = () => {
    setAssetsMenuAnchor(null);
  };

  const openReportsMenu = (event) => {
    setReportsMenuAnchor(event.currentTarget);
  };

  const closeReportsMenu = () => {
    setReportsMenuAnchor(null);
  };

  const openAccomplishmentsMenu = (event) => {
    setAccomplishmentsMenuAnchor(event.currentTarget);
  };

  const closeAccomplishmentsMenu = () => {
    setAccomplishmentsMenuAnchor(null);
  };

  const openProjectsMenu = (event) => {
    setProjectsMenuAnchor(event.currentTarget);
  };

  const closeProjectsMenu = () => {
    setProjectsMenuAnchor(null);
  };

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <>
      <CssBaseline />

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Probation Portfolio Hub
          </Typography>

          <Button color="inherit" component={Link} to="/">
            Home
          </Button>

          <Button
            color="inherit"
            onMouseEnter={openAssetsMenu}
            aria-controls={assetsMenuOpen ? "assets-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={assetsMenuOpen ? "true" : undefined}
            endIcon={<ArrowDropDownIcon />}
          >
            Assets
          </Button>

          <Menu
            id="assets-menu"
            anchorEl={assetsMenuAnchor}
            open={assetsMenuOpen}
            onClose={closeAssetsMenu}
            MenuListProps={{
              onMouseLeave: closeAssetsMenu,
              sx: { p: 0 },
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{ sx: { p: 1 } }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                component={Link}
                to="/assets"
                onClick={closeAssetsMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Asset List
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/assets/executive"
                onClick={closeAssetsMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Executive View
              </Button>
            </Box>
          </Menu>

          <Button
            color="inherit"
            onMouseEnter={openProjectsMenu}
            aria-controls={projectsMenuOpen ? "projects-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={projectsMenuOpen ? "true" : undefined}
            endIcon={<ArrowDropDownIcon />}
          >
            Projects
          </Button>

          <Menu
            id="projects-menu"
            anchorEl={projectsMenuAnchor}
            open={projectsMenuOpen}
            onClose={closeProjectsMenu}
            MenuListProps={{
              onMouseLeave: closeProjectsMenu,
              sx: { p: 0 },
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{ sx: { p: 1 } }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                component={Link}
                to="/projects"
                onClick={closeProjectsMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Project List
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/projects/executive"
                onClick={closeProjectsMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Executive View
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/projects/gantt"
                onClick={closeProjectsMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Project Gantt
              </Button>
            </Box>
          </Menu>

          <Button
            color="inherit"
            onMouseEnter={openReportsMenu}
            aria-controls={reportsMenuOpen ? "reports-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={reportsMenuOpen ? "true" : undefined}
            endIcon={<ArrowDropDownIcon />}
          >
            Reports
          </Button>

          <Menu
            id="reports-menu"
            anchorEl={reportsMenuAnchor}
            open={reportsMenuOpen}
            onClose={closeReportsMenu}
            MenuListProps={{
              onMouseLeave: closeReportsMenu,
              sx: { p: 0 },
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{ sx: { p: 1 } }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                component={Link}
                to="/reports"
                onClick={closeReportsMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Report List
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/reports/executive"
                onClick={closeReportsMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Executive View
              </Button>
            </Box>
          </Menu>

          <Button
            color="inherit"
            onMouseEnter={openAccomplishmentsMenu}
            aria-controls={accomplishmentsMenuOpen ? "accomplishments-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={accomplishmentsMenuOpen ? "true" : undefined}
            endIcon={<ArrowDropDownIcon />}
          >
            Accomplishments
          </Button>

          <Menu
            id="accomplishments-menu"
            anchorEl={accomplishmentsMenuAnchor}
            open={accomplishmentsMenuOpen}
            onClose={closeAccomplishmentsMenu}
            MenuListProps={{
              onMouseLeave: closeAccomplishmentsMenu,
              sx: { p: 0 },
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{ sx: { p: 1 } }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                component={Link}
                to="/accomplishments"
                onClick={closeAccomplishmentsMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Accomplishments List
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/accomplishments/executive"
                onClick={closeAccomplishmentsMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Executive View
              </Button>
            </Box>
          </Menu>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={colorMode === "dark" ? "Switch to light" : "Switch to dark"}>
            <IconButton color="inherit" onClick={onToggleColorMode}>
              {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Auth button on the right */}
          {authed ? (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 3 }}>
        <Container maxWidth="lg">
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={authed ? <HomePage /> : <Navigate to="/login" replace />}
            />

            <Route
              path="/assets"
              element={authed ? <AssetListPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/assets/executive"
              element={
                authed ? <AssetExecutivePage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/assets/:assetId"
              element={authed ? <AssetDetailPage /> : <Navigate to="/login" replace />}
            />

            <Route
              path="/projects"
              element={authed ? <ProjectsListPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/projects/executive"
              element={
                authed ? <ProjectsExecutivePage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/projects/gantt"
              element={authed ? <ProjectsGanttPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/projects/:projectId"
              element={authed ? <ProjectDetailPage /> : <Navigate to="/login" replace />}
            />

            <Route
              path="/reports"
              element={authed ? <ReportsListPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/reports/executive"
              element={
                authed ? <ReportsExecutivePage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/reports/:reportId"
              element={authed ? <ReportDetailPage /> : <Navigate to="/login" replace />}
            />

            <Route
              path="/accomplishments"
              element={
                authed ? <AccomplishmentsListPage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/accomplishments/executive"
              element={
                authed ? (
                  <AccomplishmentsExecutivePage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/accomplishments/:accomplishmentId"
              element={
                authed ? <AccomplishmentDetailPage /> : <Navigate to="/login" replace />
              }
            />

            <Route path="*" element={<Typography>Not Found</Typography>} />
          </Routes>
        </Container>
      </Box>
    </>
  );
}
