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
import LinkAssetToAccomplishmentDialog from "../components/LinkAssetToAccomplishmentDialog.jsx";
import LinkProjectToAccomplishmentDialog from "../components/LinkProjectToAccomplishmentDialog.jsx";
import EditAccomplishmentDialog from "../components/EditAccomplishmentDialog.jsx";
import DocumentsPanel from "../components/DocumentsPanel.jsx";

const IMPACT_LABELS = {
  RISK: "Risk Reduction",
  COST: "Cost Savings / Avoidance",
  SPEED: "Speed / Throughput",
  QUALITY: "Quality / Reliability",
  CUSTOMER: "Customer Experience",
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

const PROJECT_STATUS_LABELS = {
  INTAKE: "Intake",
  PLANNED: "Planned",
  ACTIVE: "Active",
  BLOCKED: "Blocked",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

const PROJECT_TYPE_LABELS = {
  NEW_BUILD: "New Build",
  ENHANCEMENT: "Enhancement",
  MAINTENANCE: "Maintenance",
  INFRA: "Infrastructure",
  FACILITIES: "Facilities",
  SECURITY: "Security/Compliance",
  DISCOVERY: "Discovery/Research",
};

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export default function AccomplishmentDetailPage() {
  const { accomplishmentId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = React.useState(0);
  const [accomplishment, setAccomplishment] = React.useState(null);
  const [assetLinks, setAssetLinks] = React.useState([]);
  const [projectLinks, setProjectLinks] = React.useState([]);
  const [docCount, setDocCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [linkAssetOpen, setLinkAssetOpen] = React.useState(false);
  const [linkProjectOpen, setLinkProjectOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const linkedAssetIds = React.useMemo(
    () => assetLinks.map((l) => l.asset_detail?.id || l.asset),
    [assetLinks]
  );
  const linkedProjectIds = React.useMemo(
    () => projectLinks.map((l) => l.project_detail?.id || l.project),
    [projectLinks]
  );

  const loadDetail = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const a = await apiGet(`/api/accomplishments/${accomplishmentId}/`);
      const al = await apiGet(`/api/accomplishment-asset-links/?accomplishment=${accomplishmentId}`);
      const pl = await apiGet(`/api/accomplishment-project-links/?accomplishment=${accomplishmentId}`);
      const dl = await apiGet(
        `/api/documents/?target_type=ACCOMPLISHMENT&target_id=${accomplishmentId}`
      );

      const assetRows = Array.isArray(al) ? al : al.results || [];
      const projectRows = Array.isArray(pl) ? pl : pl.results || [];
      const docRows = Array.isArray(dl) ? dl : dl.results || [];

      setAccomplishment(a);
      setAssetLinks(assetRows);
      setProjectLinks(projectRows);
      setDocCount(docRows.length);
    } catch (e) {
      setError(e.message || "Failed to load accomplishment detail");
    } finally {
      setLoading(false);
    }
  }, [accomplishmentId]);

  React.useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/accomplishments" startIcon={<ArrowBackIcon />}>
          Back to Accomplishments
        </Button>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading accomplishment…</Typography>
        </Stack>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/accomplishments" startIcon={<ArrowBackIcon />}>
          Back to Accomplishments
        </Button>
        <Alert severity="error">{error}</Alert>
      </Stack>
    );
  }

  if (!accomplishment) return null;

  return (
    <Stack spacing={2}>
      <Button component={Link} to="/accomplishments" startIcon={<ArrowBackIcon />}>
        Back to Accomplishments
      </Button>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {accomplishment.title}
            </Typography>
            <Button variant="outlined" onClick={() => setEditOpen(true)}>
              Edit Accomplishment
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Impact Type
              </Typography>
              <Typography>
                {IMPACT_LABELS[accomplishment.impact_type] || accomplishment.impact_type || "—"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Metric
              </Typography>
              <Typography>{accomplishment.metric || "—"}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Dates
              </Typography>
              <Typography>
                {(accomplishment.start_date || "—") + " → " + (accomplishment.end_date || "—")}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Narrative
            </Typography>
            <Typography>{accomplishment.narrative || "—"}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Evidence URLs
            </Typography>
            {accomplishment.evidence_urls ? (
              <Typography sx={{ whiteSpace: "pre-line" }}>
                {accomplishment.evidence_urls}
              </Typography>
            ) : (
              <Typography>—</Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Linked Assets (${assetLinks.length})`} />
          <Tab label={`Linked Projects (${projectLinks.length})`} />
          <Tab label={`Documents (${docCount})`} />
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
                              await apiDelete(`/api/accomplishment-asset-links/${l.id}/`);
                              const al = await apiGet(
                                `/api/accomplishment-asset-links/?accomplishment=${accomplishmentId}`
                              );
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
              <Button variant="contained" onClick={() => setLinkProjectOpen(true)}>
                Link Project
              </Button>
            </Stack>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectLinks.map((l) => {
                    const p = l.project_detail;
                    const projectId = p?.id || l.project;
                    return (
                      <TableRow
                        key={l.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/projects/${projectId}`)}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{p?.name || projectId}</TableCell>
                        <TableCell>
                          {PROJECT_TYPE_LABELS[p?.project_type] || p?.project_type || "—"}
                        </TableCell>
                        <TableCell>
                          {PROJECT_STATUS_LABELS[p?.status] || p?.status || "—"}
                        </TableCell>
                        <TableCell>{p?.priority || "—"}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await apiDelete(`/api/accomplishment-project-links/${l.id}/`);
                              const pl = await apiGet(
                                `/api/accomplishment-project-links/?accomplishment=${accomplishmentId}`
                              );
                              setProjectLinks(Array.isArray(pl) ? pl : pl.results || []);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {projectLinks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography sx={{ py: 2 }}>No linked projects.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <DocumentsPanel
            targetType="ACCOMPLISHMENT"
            targetId={accomplishmentId}
            onCountChange={setDocCount}
          />
        </TabPanel>
      </Paper>

      <LinkAssetToAccomplishmentDialog
        open={linkAssetOpen}
        onClose={() => setLinkAssetOpen(false)}
        accomplishmentId={accomplishmentId}
        excludeAssetIds={linkedAssetIds}
        onLinked={async () => {
          const al = await apiGet(
            `/api/accomplishment-asset-links/?accomplishment=${accomplishmentId}`
          );
          setAssetLinks(Array.isArray(al) ? al : al.results || []);
        }}
      />

      <LinkProjectToAccomplishmentDialog
        open={linkProjectOpen}
        onClose={() => setLinkProjectOpen(false)}
        accomplishmentId={accomplishmentId}
        excludeProjectIds={linkedProjectIds}
        onLinked={async () => {
          const pl = await apiGet(
            `/api/accomplishment-project-links/?accomplishment=${accomplishmentId}`
          );
          setProjectLinks(Array.isArray(pl) ? pl : pl.results || []);
        }}
      />

      <EditAccomplishmentDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        accomplishment={accomplishment}
        onUpdated={() => {
          setEditOpen(false);
          loadDetail();
        }}
      />
    </Stack>
  );
}
