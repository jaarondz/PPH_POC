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
import ProjectIntakePage from "./pages/ProjectIntakePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AccomplishmentsListPage from "./pages/AccomplishmentsListPage.jsx";
import AccomplishmentDetailPage from "./pages/AccomplishmentDetailPage.jsx";
import AccomplishmentsExecutivePage from "./pages/AccomplishmentsExecutivePage.jsx";
import ReportsListPage from "./pages/ReportsListPage.jsx";
import ReportDetailPage from "./pages/ReportDetailPage.jsx";
import ReportsExecutivePage from "./pages/ReportsExecutivePage.jsx";
import TeamsUsersPage from "./pages/TeamsUsersPage.jsx";
import ExecutiveSummaryPage from "./pages/ExecutiveSummaryPage.jsx";

function isAuthed() {
  return !!localStorage.getItem("token");
}

export default function App({ colorMode = "light", onToggleColorMode }) {
  const authed = isAuthed();
  const [pagesMenuAnchor, setPagesMenuAnchor] = React.useState(null);
  const [summariesMenuAnchor, setSummariesMenuAnchor] = React.useState(null);

  const pagesMenuOpen = Boolean(pagesMenuAnchor);
  const summariesMenuOpen = Boolean(summariesMenuAnchor);

  const openPagesMenu = (event) => {
    setPagesMenuAnchor(event.currentTarget);
  };

  const closePagesMenu = () => {
    setPagesMenuAnchor(null);
  };

  const openSummariesMenu = (event) => {
    setSummariesMenuAnchor(event.currentTarget);
  };

  const closeSummariesMenu = () => {
    setSummariesMenuAnchor(null);
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
            onMouseEnter={openSummariesMenu}
            aria-controls={summariesMenuOpen ? "summaries-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={summariesMenuOpen ? "true" : undefined}
            endIcon={<ArrowDropDownIcon />}
          >
            Summaries
          </Button>

          <Menu
            id="summaries-menu"
            anchorEl={summariesMenuAnchor}
            open={summariesMenuOpen}
            onClose={closeSummariesMenu}
            MenuListProps={{
              onMouseLeave: closeSummariesMenu,
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
                to="/executive-summary"
                onClick={closeSummariesMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Executive Summary
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/assets/executive"
                onClick={closeSummariesMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Asset Summary
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/projects/executive"
                onClick={closeSummariesMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Project Summary
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/accomplishments/executive"
                onClick={closeSummariesMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Accomplishment Summary
              </Button>
            </Box>
          </Menu>

          <Button
            color="inherit"
            onMouseEnter={openPagesMenu}
            aria-controls={pagesMenuOpen ? "pages-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={pagesMenuOpen ? "true" : undefined}
            endIcon={<ArrowDropDownIcon />}
          >
            Pages
          </Button>

          <Menu
            id="pages-menu"
            anchorEl={pagesMenuAnchor}
            open={pagesMenuOpen}
            onClose={closePagesMenu}
            MenuListProps={{
              onMouseLeave: closePagesMenu,
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
                onClick={closePagesMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Assets
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/projects"
                onClick={closePagesMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Projects
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/reports"
                onClick={closePagesMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Reports
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/accomplishments"
                onClick={closePagesMenu}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Accomplishments
              </Button>
            </Box>
          </Menu>

          <Button color="inherit" component={Link} to="/teams">
            Teams
          </Button>

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
              path="/executive-summary"
              element={
                authed ? <ExecutiveSummaryPage /> : <Navigate to="/login" replace />
              }
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
              path="/projects/intake"
              element={authed ? <ProjectIntakePage /> : <Navigate to="/login" replace />}
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

            <Route
              path="/teams"
              element={authed ? <TeamsUsersPage /> : <Navigate to="/login" replace />}
            />

            <Route path="*" element={<Typography>Not Found</Typography>} />
          </Routes>
        </Container>
      </Box>
    </>
  );
}
