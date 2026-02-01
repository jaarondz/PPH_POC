import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiGet, apiDelete } from "../api/client.js";
import EditReportDialog from "../components/EditReportDialog.jsx";
import LinkAssetToReportDialog from "../components/LinkAssetToReportDialog.jsx";
import LinkAccomplishmentToReportDialog from "../components/LinkAccomplishmentToReportDialog.jsx";

const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_DEVELOPMENT: "In Development",
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  RETIRED: "Retired",
};

const AUTOMATION_LABELS = {
  AUTOMATED: "Automated",
  MANUAL: "Manual",
};

const REPORT_TYPE_LABELS = {
  POWER_BI: "Power BI",
  EXCEL: "Excel",
  OTHER: "Other",
};

const DELIVERY_METHOD_LABELS = {
  POWER_BI: "Power BI",
  AUTOMATED_EMAIL: "Automated Email",
  MANUAL_EMAIL: "Manual Email",
};

const REFRESH_FREQUENCY_LABELS = {
  MONTHLY: "Monthly",
  WEEKLY: "Weekly",
  DAILY: "Daily",
  MULTIPLE_DAILY: "Multiple Times Daily",
};

const ASSET_TYPE_LABELS = {
  APPLICATION: "Application",
  OP_SYSTEM: "Operational System",
  FACILITY: "Facility/Site",
};

const ASSET_STATUS_LABELS = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  RETIRED: "Retired",
};

const IMPACT_LABELS = {
  RISK: "Risk Reduction",
  COST: "Cost Savings / Avoidance",
  SPEED: "Speed / Throughput",
  QUALITY: "Quality / Reliability",
  CUSTOMER: "Customer Experience",
};

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

function formatUser(user) {
  if (!user) return "";
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return fullName || user.username || user.email || "";
}

function ownerLabel(userDetail, legacyValue) {
  return formatUser(userDetail) || legacyValue || "—";
}

export default function ReportDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = React.useState(0);
  const [report, setReport] = React.useState(null);
  const [assetLinks, setAssetLinks] = React.useState([]);
  const [accomplishmentLinks, setAccomplishmentLinks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [linkAssetOpen, setLinkAssetOpen] = React.useState(false);
  const [linkAccomplishmentOpen, setLinkAccomplishmentOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const linkedAssetIds = React.useMemo(
    () => assetLinks.map((l) => l.asset_detail?.id || l.asset),
    [assetLinks]
  );
  const linkedAccomplishmentIds = React.useMemo(
    () => accomplishmentLinks.map((l) => l.accomplishment_detail?.id || l.accomplishment),
    [accomplishmentLinks]
  );

  const loadDetail = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await apiGet(`/api/reports/${reportId}/`);
      const al = await apiGet(`/api/report-asset-links/?report=${reportId}`);
      const acl = await apiGet(`/api/report-accomplishment-links/?report=${reportId}`);

      const assetRows = Array.isArray(al) ? al : al.results || [];
      const accomplishmentRows = Array.isArray(acl) ? acl : acl.results || [];

      setReport(r);
      setAssetLinks(assetRows);
      setAccomplishmentLinks(accomplishmentRows);
    } catch (e) {
      setError(e.message || "Failed to load report detail");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  React.useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/reports" startIcon={<ArrowBackIcon />}>
          Back to Reports
        </Button>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading report…</Typography>
        </Stack>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/reports" startIcon={<ArrowBackIcon />}>
          Back to Reports
        </Button>
        <Alert severity="error">{error}</Alert>
      </Stack>
    );
  }

  if (!report) return null;

  return (
    <Stack spacing={2}>
      <Button component={Link} to="/reports" startIcon={<ArrowBackIcon />}>
        Back to Reports
      </Button>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {report.name}
            </Typography>
            <Button variant="outlined" onClick={() => setEditOpen(true)}>
              Edit Report
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Typography>{STATUS_LABELS[report.status] || report.status}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Business Owner
              </Typography>
              <Typography>
                {ownerLabel(report.business_owner_user_detail, report.business_owner)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Technical Owner
              </Typography>
              <Typography>
                {ownerLabel(report.technical_owner_user_detail, report.technical_owner)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Developer
              </Typography>
              <Typography>
                {ownerLabel(report.developer_user_detail, report.developer)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Automated/Manual
              </Typography>
              <Typography>
                {AUTOMATION_LABELS[report.automation] || report.automation || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Report Type
              </Typography>
              <Typography>
                {REPORT_TYPE_LABELS[report.report_type] || report.report_type || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Delivery Method
              </Typography>
              <Typography>
                {DELIVERY_METHOD_LABELS[report.delivery_method] ||
                  report.delivery_method ||
                  "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Refresh Frequency
              </Typography>
              <Typography>
                {REFRESH_FREQUENCY_LABELS[report.refresh_frequency] ||
                  report.refresh_frequency ||
                  "—"}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography>{report.description || "—"}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              External Reference
            </Typography>
            {report.external_reference_url ? (
              <a href={report.external_reference_url} target="_blank" rel="noreferrer">
                {report.external_reference_url}
              </a>
            ) : (
              <Typography>—</Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Linked Assets (${assetLinks.length})`} />
          <Tab label={`Linked Accomplishments (${accomplishmentLinks.length})`} />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={() => setLinkAssetOpen(true)}>
                Link Asset
              </Button>
            </Stack>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Criticality</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assetLinks.map((l) => {
                    const a = l.asset_detail;
                    const assetId = a?.id || l.asset;
                    return (
                      <TableRow
                        key={l.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/assets/${assetId}`)}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{a?.name || assetId}</TableCell>
                        <TableCell>{ASSET_TYPE_LABELS[a?.asset_type] || a?.asset_type || "—"}</TableCell>
                        <TableCell>{ASSET_STATUS_LABELS[a?.status] || a?.status || "—"}</TableCell>
                        <TableCell>{a?.criticality || "—"}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await apiDelete(`/api/report-asset-links/${l.id}/`);
                              const al = await apiGet(`/api/report-asset-links/?report=${reportId}`);
                              setAssetLinks(Array.isArray(al) ? al : al.results || []);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {assetLinks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography sx={{ py: 2 }}>No linked assets.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={() => setLinkAccomplishmentOpen(true)}>
                Link Accomplishment
              </Button>
            </Stack>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Impact</TableCell>
                    <TableCell>Metric</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accomplishmentLinks.map((l) => {
                    const a = l.accomplishment_detail;
                    const accomplishmentId = a?.id || l.accomplishment;
                    return (
                      <TableRow
                        key={l.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/accomplishments/${accomplishmentId}`)}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{a?.title || accomplishmentId}</TableCell>
                        <TableCell>
                          {IMPACT_LABELS[a?.impact_type] || a?.impact_type || "—"}
                        </TableCell>
                        <TableCell>{a?.metric || "—"}</TableCell>
                        <TableCell>
                          {a?.start_date || "—"} → {a?.end_date || "—"}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await apiDelete(`/api/report-accomplishment-links/${l.id}/`);
                              const acl = await apiGet(
                                `/api/report-accomplishment-links/?report=${reportId}`
                              );
                              setAccomplishmentLinks(Array.isArray(acl) ? acl : acl.results || []);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {accomplishmentLinks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography sx={{ py: 2 }}>No linked accomplishments.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
      </Paper>

      <LinkAssetToReportDialog
        open={linkAssetOpen}
        onClose={() => setLinkAssetOpen(false)}
        reportId={reportId}
        excludeAssetIds={linkedAssetIds}
        onLinked={async () => {
          const al = await apiGet(`/api/report-asset-links/?report=${reportId}`);
          setAssetLinks(Array.isArray(al) ? al : al.results || []);
        }}
      />

      <LinkAccomplishmentToReportDialog
        open={linkAccomplishmentOpen}
        onClose={() => setLinkAccomplishmentOpen(false)}
        reportId={reportId}
        excludeAccomplishmentIds={linkedAccomplishmentIds}
        onLinked={async () => {
          const acl = await apiGet(`/api/report-accomplishment-links/?report=${reportId}`);
          setAccomplishmentLinks(Array.isArray(acl) ? acl : acl.results || []);
        }}
      />

      <EditReportDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        report={report}
        onUpdated={() => {
          setEditOpen(false);
          loadDetail();
        }}
      />
    </Stack>
  );
}
