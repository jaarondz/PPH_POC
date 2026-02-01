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
  IN_DEVELOPMENT: "In Development",
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  RETIRED: "Retired",
};

const TYPE_LABELS = {
  POWER_BI: "Power BI",
  EXCEL: "Excel",
  OTHER: "Other",
};

const AUTOMATION_LABELS = {
  AUTOMATED: "Automated",
  MANUAL: "Manual",
};

const DELIVERY_LABELS = {
  POWER_BI: "Power BI",
  AUTOMATED_EMAIL: "Automated Email",
  MANUAL_EMAIL: "Manual Email",
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

export default function ReportsExecutivePage() {
  const [reports, setReports] = React.useState([]);
  const [assets, setAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [reportsData, assetsData] = await Promise.all([
          apiGet("/api/reports/"),
          apiGet("/api/assets/"),
        ]);
        const rows = safeRows(reportsData);
        const assetRows = safeRows(assetsData);
        if (!mounted) return;
        setReports(rows);
        setAssets(assetRows);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load reports");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const total = reports.length;
  const active = reports.filter((r) => r.status === "ACTIVE").length;
  const planned = reports.filter((r) => r.status === "PLANNED").length;
  const deprecated = reports.filter((r) => r.status === "DEPRECATED").length;
  const retired = reports.filter((r) => r.status === "RETIRED").length;

  const statusCounts = buildCounts(reports, "status", STATUS_LABELS);
  const typeCounts = buildCounts(reports, "report_type", TYPE_LABELS);
  const automationCounts = buildCounts(reports, "automation", AUTOMATION_LABELS);
  const deliveryCounts = buildCounts(reports, "delivery_method", DELIVERY_LABELS);
  const securityRisk = assets.filter((a) => a.risk_security).length;
  const privacyRisk = assets.filter((a) => a.risk_privacy).length;
  const complianceRisk = assets.filter((a) => a.risk_compliance).length;
  const anyRisk = assets.filter(
    (a) => a.risk_security || a.risk_privacy || a.risk_compliance
  ).length;

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Report Executive View</Typography>
        <Typography color="text.secondary">
          Portfolio-level reporting distribution and lifecycle signals.
        </Typography>
      </Stack>

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading report insights…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Total Reports
                </Typography>
                <Typography variant="h4">{total}</Typography>
                <Typography color="text.secondary">All published and planned</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Active Reports
                </Typography>
                <Typography variant="h4">{active}</Typography>
                <Typography color="text.secondary">In production</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Planned Reports
                </Typography>
                <Typography variant="h4">{planned}</Typography>
                <Typography color="text.secondary">On the roadmap</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Lifecycle Watch
                </Typography>
                <Typography variant="h5">{deprecated + retired}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={`Deprecated ${deprecated}`} />
                  <Chip size="small" label={`Retired ${retired}`} />
                </Stack>
              </Stack>
            </Paper>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <BarList title="Reports by Status" items={statusCounts} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <BarList title="Reports by Type" items={typeCounts} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <BarList title="Reports by Automation" items={automationCounts} />
            </Box>
          </Stack>

          <Box>
            <BarList title="Reports by Delivery Method" items={deliveryCounts} />
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
