import * as React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { apiGet } from "../api/client.js";

const STATUS_LABELS = {
  INTAKE: "Intake",
  PLANNED: "Planned",
  ACTIVE: "Active",
  BLOCKED: "Blocked",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

const TYPE_LABELS = {
  NEW_BUILD: "New Build",
  ENHANCEMENT: "Enhancement",
  MAINTENANCE: "Maintenance",
  INFRA: "Infrastructure",
  FACILITIES: "Facilities",
  SECURITY: "Security/Compliance",
  DISCOVERY: "Discovery/Research",
};

const PRIORITY_LABELS = {
  P0: "P0",
  P1: "P1",
  P2: "P2",
  P3: "P3",
};

const SCOPE_LABELS = {
  ADMINISTRATIVE: "Administrative",
  ADULT: "Adult",
  JUVENILE: "Juvenile",
  CROSS_CUTTING: "Cross-Cutting",
  OTHER: "Other",
};

function safeRows(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function buildCounts(rows, key, labelMap = {}, emptyLabel = "Unspecified") {
  const counts = new Map();
  rows.forEach((row) => {
    const raw = row[key] || "";
    const label = labelMap[raw] || raw || emptyLabel;
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function BarList({ title, items }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="h6">{title}</Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">No data available.</Typography>
        ) : (
          items.map((item) => (
            <Stack key={item.label} spacing={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontWeight: 600 }}>{item.label}</Typography>
                <Typography color="text.secondary">{item.value}</Typography>
              </Stack>
              <Box
                sx={{
                  height: 10,
                  borderRadius: 999,
                  bgcolor: "action.hover",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${(item.value / max) * 100}%`,
                    bgcolor: "primary.main",
                  }}
                />
              </Box>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
}

export default function ProjectsExecutivePage() {
  const [projects, setProjects] = React.useState([]);
  const [assets, setAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [projectsData, assetsData] = await Promise.all([
          apiGet("/api/projects/"),
          apiGet("/api/assets/"),
        ]);
        const rows = safeRows(projectsData);
        const assetRows = safeRows(assetsData);
        if (!mounted) return;
        setProjects(rows);
        setAssets(assetRows);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load projects");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const total = projects.length;
  const blocked = projects.filter((p) => p.status === "BLOCKED").length;
  const active = projects.filter((p) => p.status === "ACTIVE").length;
  const planned = projects.filter((p) => p.status === "PLANNED").length;
  const done = projects.filter((p) => p.status === "DONE").length;

  const statusCounts = buildCounts(projects, "status", STATUS_LABELS);
  const typeCounts = buildCounts(projects, "project_type", TYPE_LABELS);
  const priorityCounts = buildCounts(projects, "priority", PRIORITY_LABELS);
  const scopeCounts = buildCounts(projects, "scope", SCOPE_LABELS);
  const securityRisk = assets.filter((a) => a.risk_security).length;
  const privacyRisk = assets.filter((a) => a.risk_privacy).length;
  const complianceRisk = assets.filter((a) => a.risk_compliance).length;
  const anyRisk = assets.filter(
    (a) => a.risk_security || a.risk_privacy || a.risk_compliance
  ).length;

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Project Executive View</Typography>
        <Typography color="text.secondary">
          Portfolio-level project distribution and risk highlights.
        </Typography>
      </Stack>

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading project insights…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Total Projects
                </Typography>
                <Typography variant="h4">{total}</Typography>
                <Typography color="text.secondary">All active pipeline</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Active Projects
                </Typography>
                <Typography variant="h4">{active}</Typography>
                <Typography color="text.secondary">Currently in flight</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Planned / Intake
                </Typography>
                <Typography variant="h4">{planned}</Typography>
                <Typography color="text.secondary">Upcoming work</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Risk Watch
                </Typography>
                <Typography variant="h5">{blocked}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={`Blocked ${blocked}`} />
                  <Chip size="small" label={`Done ${done}`} />
                </Stack>
              </Stack>
            </Paper>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <BarList title="Projects by Status" items={statusCounts} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <BarList title="Projects by Type" items={typeCounts} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <BarList title="Projects by Priority" items={priorityCounts} />
            </Box>
          </Stack>

          <Box>
            <BarList title="Projects by Scope" items={scopeCounts} />
          </Box>

          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Risk Flags (Assets)</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
                <Chip color="error" label={`Security Risk ${securityRisk}`} />
                <Chip color="warning" label={`Privacy Risk ${privacyRisk}`} />
                <Chip color="info" label={`Compliance Risk ${complianceRisk}`} />
                <Chip label={`Any Risk ${anyRisk}`} />
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}
