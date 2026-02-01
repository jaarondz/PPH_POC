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
  PLANNED: "Planned",
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  RETIRED: "Retired",
};

const SCOPE_LABELS = {
  ADMINISTRATIVE: "Administrative",
  ADULT: "Adult",
  JUVENILE: "Juvenile",
  CROSS_CUTTING: "Cross-Cutting",
  OTHER: "Other",
};

const TYPE_LABELS = {
  APPLICATION: "Application",
  OP_SYSTEM: "Operational System",
  FACILITY: "Facility/Site",
  REPORT: "Report/Dashboard",
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

export default function AssetExecutivePage() {
  const [assets, setAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet("/api/assets/");
        const rows = safeRows(data);
        if (!mounted) return;
        setAssets(rows);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load assets");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const total = assets.length;
  const planned = assets.filter((a) => a.status === "PLANNED").length;
  const active = assets.filter((a) => a.status === "ACTIVE").length;
  const deprecated = assets.filter((a) => a.status === "DEPRECATED").length;
  const retired = assets.filter((a) => a.status === "RETIRED").length;
  const securityRisk = assets.filter((a) => a.risk_security).length;
  const privacyRisk = assets.filter((a) => a.risk_privacy).length;
  const complianceRisk = assets.filter((a) => a.risk_compliance).length;
  const anyRisk = assets.filter(
    (a) => a.risk_security || a.risk_privacy || a.risk_compliance
  ).length;

  const scopeCounts = buildCounts(assets, "scope", SCOPE_LABELS);
  const statusCounts = buildCounts(assets, "status", STATUS_LABELS);
  const typeCounts = buildCounts(assets, "asset_type", TYPE_LABELS);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Asset Executive View</Typography>
        <Typography color="text.secondary">
          Portfolio-level asset distribution and status highlights.
        </Typography>
      </Stack>

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading asset insights…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Total Assets
                </Typography>
                <Typography variant="h4">{total}</Typography>
                <Typography color="text.secondary">
                  Across all scopes and types
                </Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Planned Assets
                </Typography>
                <Typography variant="h4">{planned}</Typography>
                <Typography color="text.secondary">Pipeline / intake</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  In Build (Active)
                </Typography>
                <Typography variant="h4">{active}</Typography>
                <Typography color="text.secondary">Currently active assets</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Lifecycle Watch
                </Typography>
                <Typography variant="h5">
                  {deprecated + retired}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={`Deprecated ${deprecated}`} />
                  <Chip size="small" label={`Retired ${retired}`} />
                </Stack>
              </Stack>
            </Paper>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <BarList title="Assets by Scope" items={scopeCounts} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <BarList title="Assets by Status" items={statusCounts} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <BarList title="Assets by Type" items={typeCounts} />
            </Box>
          </Stack>

          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Risk Flags</Typography>
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
