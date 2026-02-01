import * as React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { apiGet, apiDelete, apiPost } from "../api/client.js";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import LinkProjectToAssetDialog from "../components/LinkProjectToAssetDialog.jsx";
import LinkAccomplishmentToAssetDialog from "../components/LinkAccomplishmentToAssetDialog.jsx";
import EditAssetDialog from "../components/EditAssetDialog.jsx";
import CreateProjectDialog from "../components/CreateProjectDialog.jsx";
import DocumentsPanel from "../components/DocumentsPanel.jsx";


const ASSET_TYPE_LABELS = {
  APPLICATION: "Application",
  OP_SYSTEM: "Operational System",
  FACILITY: "Facility/Site",
};

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

export default function AssetDetailPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState(0);
  const [asset, setAsset] = React.useState(null);
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [createProjectOpen, setCreateProjectOpen] = React.useState(false);

  const [projectLinks, setProjectLinks] = React.useState([]);
  const [accomplishmentLinks, setAccomplishmentLinks] = React.useState([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [linkAccomplishmentDialogOpen, setLinkAccomplishmentDialogOpen] =
    React.useState(false);
  const linkedProjectIds = React.useMemo(
    () => projectLinks.map((l) => l.project_detail?.id || l.project),
    [projectLinks]
  );
  const linkedAccomplishmentIds = React.useMemo(
    () => accomplishmentLinks.map((l) => l.accomplishment_detail?.id || l.accomplishment),
    [accomplishmentLinks]
  );

  const loadAssetDetail = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const a = await apiGet(`/api/assets/${assetId}/`);
      const pl = await apiGet(`/api/project-asset-links/?asset=${assetId}`);
      const al = await apiGet(`/api/accomplishment-asset-links/?asset=${assetId}`);

      const projectRows = Array.isArray(pl) ? pl : pl.results || [];
      const accomplishmentRows = Array.isArray(al) ? al : al.results || [];

      setAsset(a);
      setProjectLinks(projectRows);
      setAccomplishmentLinks(accomplishmentRows);
    } catch (e) {
      setError(e.message || "Failed to load asset detail");
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  React.useEffect(() => {
    loadAssetDetail();
  }, [loadAssetDetail]);

  if (loading) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/assets" startIcon={<ArrowBackIcon />}>
          Back to Assets
        </Button>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading asset…</Typography>
        </Stack>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/assets" startIcon={<ArrowBackIcon />}>
          Back to Assets
        </Button>
        <Alert severity="error">{error}</Alert>
      </Stack>
    );
  }

  if (!asset) return null;

  return (
    <Stack spacing={2}>
      <Button component={Link} to="/assets" startIcon={<ArrowBackIcon />}>
        Back to Assets
      </Button>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {asset.name}
            </Typography>
            <Button variant="outlined" onClick={() => setEditOpen(true)}>
              Edit Asset
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              label={ASSET_TYPE_LABELS[asset.asset_type] || asset.asset_type}
            />
            <Chip size="small" label={STATUS_LABELS[asset.status] || asset.status} />
            {asset.criticality ? <Chip size="small" label={asset.criticality} /> : null}
            {asset.risk_security ? <Chip size="small" label="Security Risk" /> : null}
            {asset.risk_privacy ? <Chip size="small" label="Privacy Risk" /> : null}
            {asset.risk_compliance ? <Chip size="small" label="Compliance Risk" /> : null}
          </Stack>

          {asset.description ? (
            <Typography color="text.secondary">{asset.description}</Typography>
          ) : (
            <Typography color="text.secondary">No description provided.</Typography>
          )}

          <Divider sx={{ my: 1 }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Business Owner
              </Typography>
              <Typography>
                {ownerLabel(asset.business_owner_user_detail, asset.business_owner)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Acronym
              </Typography>
              <Typography>{asset.acronym || "—"}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Scope
              </Typography>
              <Typography>{SCOPE_LABELS[asset.scope] || asset.scope || "—"}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Technical Owner
              </Typography>
              <Typography>
                {ownerLabel(asset.technical_owner_user_detail, asset.technical_owner)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                External Reference
              </Typography>
              {asset.external_reference_url ? (
                <a href={asset.external_reference_url} target="_blank" rel="noreferrer">
                  {asset.external_reference_url}
                </a>
              ) : (
                <Typography>—</Typography>
              )}
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Related Projects (${projectLinks.length})`} />
          <Tab label={`Related Accomplishments (${accomplishmentLinks.length})`} />
          <Tab label="Documents" />
        </Tabs>

  <TabPanel value={tab} index={0}>
  <Stack spacing={2}>

    {/* Button row */}
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
      <Button variant="outlined" onClick={() => setCreateProjectOpen(true)}>
        Create Project
      </Button>
      <Button variant="contained" onClick={() => setLinkDialogOpen(true)}>
        Link Project
      </Button>
    </Stack>

    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Relationship</TableCell>
            <TableCell>Project</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell align="right">Actions</TableCell> {/* NEW */}
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
                <TableCell>{l.relationship_type}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{p?.name || projectId}</TableCell>
                <TableCell>{p?.project_type || "—"}</TableCell>
                <TableCell>{p?.status || "—"}</TableCell>
                <TableCell>{p?.priority || "—"}</TableCell>

                {/* NEW: Unlink button */}
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await apiDelete(`/api/project-asset-links/${l.id}/`);
                      const pl = await apiGet(`/api/project-asset-links/?asset=${assetId}`);
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
              <TableCell colSpan={6}>
                <Typography sx={{ py: 2 }}>No related projects.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

  </Stack>
</TabPanel>

        <LinkProjectToAssetDialog
          open={linkDialogOpen}
          onClose={() => setLinkDialogOpen(false)}
          assetId={assetId}
          excludeProjectIds={linkedProjectIds}
          onLinked={async () => {
            const pl = await apiGet(`/api/project-asset-links/?asset=${assetId}`);
            setProjectLinks(Array.isArray(pl) ? pl : pl.results || []);
          }}
        />

        <CreateProjectDialog
          open={createProjectOpen}
          onClose={() => setCreateProjectOpen(false)}
          onCreated={async (created) => {
            if (!created) return;
            await apiPost("/api/project-asset-links/", {
              asset: assetId,
              project: created.id,
              relationship_type: "ENHANCES",
            });
            const pl = await apiGet(`/api/project-asset-links/?asset=${assetId}`);
            setProjectLinks(Array.isArray(pl) ? pl : pl.results || []);
          }}
        />


  <TabPanel value={tab} index={1}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={() => setLinkAccomplishmentDialogOpen(true)}
              >
                Link Accomplishment
              </Button>
            </Stack>

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
                return (
                  <TableRow key={l.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{a?.title || l.accomplishment}</TableCell>
                    <TableCell>{a?.impact_type || "—"}</TableCell>
                    <TableCell>{a?.metric || "—"}</TableCell>
                    <TableCell>
                      {a?.start_date || "—"} → {a?.end_date || "—"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await apiDelete(`/api/accomplishment-asset-links/${l.id}/`);
                          const al = await apiGet(
                            `/api/accomplishment-asset-links/?asset=${assetId}`
                          );
                          setAccomplishmentLinks(Array.isArray(al) ? al : al.results || []);
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
                    <Typography sx={{ py: 2 }}>No related accomplishments.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <DocumentsPanel targetType="ASSET" targetId={assetId} />
        </TabPanel>

        <LinkAccomplishmentToAssetDialog
          open={linkAccomplishmentDialogOpen}
          onClose={() => setLinkAccomplishmentDialogOpen(false)}
          assetId={assetId}
          excludeAccomplishmentIds={linkedAccomplishmentIds}
          onLinked={async () => {
            const al = await apiGet(`/api/accomplishment-asset-links/?asset=${assetId}`);
            setAccomplishmentLinks(Array.isArray(al) ? al : al.results || []);
          }}
        />
      </Paper>

      <EditAssetDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        asset={asset}
        onUpdated={() => {
          setEditOpen(false);
          loadAssetDetail();
        }}
      />
    </Stack>
  );
}
