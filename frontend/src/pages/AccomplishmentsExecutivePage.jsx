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

const IMPACT_LABELS = {
  RISK: "Risk Reduction",
  COST: "Cost Savings / Avoidance",
  SPEED: "Speed / Throughput",
  QUALITY: "Quality / Reliability",
  CUSTOMER: "Customer Experience",
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

function isRecent(iso, days = 30) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}

export default function AccomplishmentsExecutivePage() {
  const [accomplishments, setAccomplishments] = React.useState([]);
  const [assets, setAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [accomplishmentsData, assetsData] = await Promise.all([
          apiGet("/api/accomplishments/"),
          apiGet("/api/assets/"),
        ]);
        const rows = safeRows(accomplishmentsData);
        const assetRows = safeRows(assetsData);
        if (!mounted) return;
        setAccomplishments(rows);
        setAssets(assetRows);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load accomplishments");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const total = accomplishments.length;
  const recent = accomplishments.filter((a) => isRecent(a.updated_at)).length;

  const impactCounts = buildCounts(accomplishments, "impact_type", IMPACT_LABELS);
  const securityRisk = assets.filter((a) => a.risk_security).length;
  const privacyRisk = assets.filter((a) => a.risk_privacy).length;
  const complianceRisk = assets.filter((a) => a.risk_compliance).length;
  const anyRisk = assets.filter(
    (a) => a.risk_security || a.risk_privacy || a.risk_compliance
  ).length;

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Accomplishment Executive View</Typography>
        <Typography color="text.secondary">
          Impact mix and recent delivery signals.
        </Typography>
      </Stack>

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading accomplishment insights…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Total Accomplishments
                </Typography>
                <Typography variant="h4">{total}</Typography>
                <Typography color="text.secondary">All recorded outcomes</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Recent Updates
                </Typography>
                <Typography variant="h4">{recent}</Typography>
                <Typography color="text.secondary">Updated in last 30 days</Typography>
              </Stack>
            </Paper>
          </Stack>

          <Box>
            <BarList title="Accomplishments by Impact" items={impactCounts} />
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
