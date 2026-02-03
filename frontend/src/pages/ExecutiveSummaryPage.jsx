import * as React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { apiGet } from "../api/client.js";

const STATUS_LABELS = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  RETIRED: "Retired",
  IN_DEVELOPMENT: "In Development",
  INTAKE: "Intake",
  BLOCKED: "Blocked",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

const ASSET_TYPE_LABELS = {
  APPLICATION: "Application",
  OP_SYSTEM: "Operational System",
  FACILITY: "Facility/Site",
  REPORT: "Report/Dashboard",
};

const SCOPE_LABELS = {
  ADMINISTRATIVE: "Administrative",
  ADULT: "Adult",
  JUVENILE: "Juvenile",
  CROSS_CUTTING: "Cross-Cutting",
  OTHER: "Other",
};

const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const CATEGORY_LABELS = {
  RISK: "Risk Reduction",
  COST: "Cost Savings / Avoidance",
  SPEED: "Speed / Throughput",
  QUALITY: "Quality / Reliability",
  CUSTOMER: "Customer Experience",
};

function StatCard({ title, value, subtitle, color = "primary.main" }) {
  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Stack spacing={1}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function BarList({ title, items, labelMap = {} }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="h6">{title}</Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">No data available.</Typography>
        ) : (
          items.map((item) => {
            const label = labelMap[item.key] || item.key || "Unspecified";
            return (
              <Stack key={item.key} spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
                  <Typography color="text.secondary">{item.count}</Typography>
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
                      width: `${(item.count / max) * 100}%`,
                      bgcolor: "primary.main",
                    }}
                  />
                </Box>
              </Stack>
            );
          })
        )}
      </Stack>
    </Paper>
  );
}

function buildItems(obj) {
  return Object.entries(obj || {})
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export default function ExecutiveSummaryPage() {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet(`/api/executive-summary/`);
        if (!mounted) return;
        setSummary(data);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load executive summary");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress size={22} />
        <Typography>Loading executive summary…</Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!summary) {
    return <Alert severity="info">No summary data available.</Alert>;
  }

  const { assets, projects, reports, accomplishments } = summary;

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Executive Summary</Typography>
        <Typography color="text.secondary">
          High-level view of all portfolio modules in one screen.
        </Typography>
      </Stack>

      {/* Overview Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assets"
            value={assets.total}
            subtitle="Inventory items"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={projects.total}
            subtitle={`${projects.active || 0} active`}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Reports"
            value={reports.total}
            subtitle={`${reports.active || 0} active`}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Accomplishments"
            value={accomplishments.total}
            subtitle="Outcomes tracked"
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Divider />

      {/* Assets Section */}
      <Stack spacing={2}>
        <Typography variant="h5">Assets Overview</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <BarList
              title="By Status"
              items={buildItems(assets.by_status)}
              labelMap={STATUS_LABELS}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <BarList
              title="By Type"
              items={buildItems(assets.by_type)}
              labelMap={ASSET_TYPE_LABELS}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <BarList
              title="By Scope"
              items={buildItems(assets.by_scope)}
              labelMap={SCOPE_LABELS}
            />
          </Grid>
        </Grid>
        {assets.risk_counts && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Risk Indicators
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Security Risk
                </Typography>
                <Typography variant="h6" color="error.main">
                  {assets.risk_counts.security}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Privacy Risk
                </Typography>
                <Typography variant="h6" color="error.main">
                  {assets.risk_counts.privacy}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Compliance Risk
                </Typography>
                <Typography variant="h6" color="error.main">
                  {assets.risk_counts.compliance}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Any Risk
                </Typography>
                <Typography variant="h6" color="error.main">
                  {assets.risk_counts.any_risk}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Stack>

      <Divider />

      {/* Projects Section */}
      <Stack spacing={2}>
        <Typography variant="h5">Projects Overview</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <BarList
              title="By Status"
              items={buildItems(projects.by_status)}
              labelMap={STATUS_LABELS}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <BarList
              title="By Priority"
              items={buildItems(projects.by_priority)}
              labelMap={PRIORITY_LABELS}
            />
          </Grid>
        </Grid>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Project Health
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
              <Typography variant="h6" color="success.main">
                {projects.active || 0}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Blocked
              </Typography>
              <Typography variant="h6" color="error.main">
                {projects.blocked || 0}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h6" color="info.main">
                {projects.completed || 0}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Stack>

      <Divider />

      {/* Reports Section */}
      <Stack spacing={2}>
        <Typography variant="h5">Reports Overview</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <BarList
              title="By Status"
              items={buildItems(reports.by_status)}
              labelMap={STATUS_LABELS}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Report Status Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {reports.active || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    In Development
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {reports.in_development || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Planned
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {reports.planned || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Stack>

      <Divider />

      {/* Accomplishments Section */}
      <Stack spacing={2}>
        <Typography variant="h5">Accomplishments Overview</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <BarList
              title="By Impact Type"
              items={buildItems(accomplishments.by_impact_type)}
              labelMap={CATEGORY_LABELS}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <BarList
              title="By Team"
              items={buildItems(accomplishments.by_team)}
            />
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
}
