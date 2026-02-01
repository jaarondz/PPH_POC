import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { apiGet, apiPost } from "../api/client.js";

const REL_TYPES = [
  "OWNER",
  "MAINTAINS",
  "DEPENDS_ON",
  "ENHANCES",
  "REPLACES",
  "REPORTS_ON",
];

export default function LinkProjectToAssetDialog({
  open,
  onClose,
  assetId,
  onLinked,
  excludeProjectIds = [],
}) {
  const [loading, setLoading] = React.useState(false);
  const [projects, setProjects] = React.useState([]);
  const [projectId, setProjectId] = React.useState("");
  const [relType, setRelType] = React.useState("ENHANCES");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      if (!open) return;
      setError("");
      setLoading(true);
      try {
        const data = await apiGet("/api/projects/");
        const rows = Array.isArray(data) ? data : data.results || [];
        const excluded = new Set(excludeProjectIds);
        const filtered = rows.filter((p) => !excluded.has(p.id));
        if (mounted) setProjects(filtered);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProjects();
    return () => { mounted = false; };
  }, [open]);

  async function handleLink() {
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/project-asset-links/", {
        asset: assetId,
        project: projectId,
        relationship_type: relType,
      });
      onLinked?.();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Link Project</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>Project</InputLabel>
            <Select
              value={projectId}
              label="Project"
              onChange={(e) => setProjectId(e.target.value)}
              disabled={loading}
            >
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Relationship</InputLabel>
            <Select
              value={relType}
              label="Relationship"
              onChange={(e) => setRelType(e.target.value)}
              disabled={loading}
            >
              {REL_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading && (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={18} />
              <span>Loading…</span>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleLink}
          disabled={loading || !projectId}
        >
          Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
