import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import App from "./App.jsx";
import "./index.css";

const STORAGE_KEY = "ui:color-mode";

function getInitialMode() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function AppRoot() {
  const [mode, setMode] = React.useState(getInitialMode);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    document.body.dataset.theme = mode;
  }, [mode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "dark" ? "#2DD4BF" : "#0F766E",
            light: mode === "dark" ? "#14B8A6" : "#14B8A6",
          },
          secondary: {
            main: mode === "dark" ? "#94A3B8" : "#334155",
          },
          background: {
            default: mode === "dark" ? "#0B1220" : "#F8FAFC",
            paper: mode === "dark" ? "#111827" : "#FFFFFF",
          },
          divider: mode === "dark" ? "#1E293B" : "#E2E8F0",
          text: {
            primary: mode === "dark" ? "#E2E8F0" : "#0F172A",
            secondary: mode === "dark" ? "#94A3B8" : "#475569",
          },
          success: {
            main: mode === "dark" ? "#22C55E" : "#16A34A",
          },
          warning: {
            main: mode === "dark" ? "#F59E0B" : "#D97706",
          },
          error: {
            main: mode === "dark" ? "#F87171" : "#DC2626",
          },
          info: {
            main: mode === "dark" ? "#38BDF8" : "#0284C7",
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          h4: {
            fontWeight: 700,
          },
          h6: {
            fontWeight: 700,
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                borderBottom: `1px solid ${
                  mode === "dark" ? "#1E293B" : "#E2E8F0"
                }`,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                border: `1px solid ${
                  mode === "dark" ? "#1E293B" : "#E2E8F0"
                }`,
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === "dark" ? "#1F2937" : "#FFFFFF",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === "dark" ? "#1F2937" : "#FFFFFF",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: 10,
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "dark" ? "#111827" : "#F8FAFC",
              },
            },
          },
          MuiTableBody: {
            styleOverrides: {
              root: {
                "& .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root": {
                  backgroundColor: mode === "dark" ? "#0B1220" : "#F8FAFC",
                },
                "& .MuiTableRow-root:hover .MuiTableCell-root": {
                  backgroundColor: mode === "dark" ? "#111827" : "#EFF6FF",
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App
          colorMode={mode}
          onToggleColorMode={() =>
            setMode((prev) => (prev === "dark" ? "light" : "dark"))
          }
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
);
