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
  "IMPACTS",
  "ENHANCES",
  "MAINTAINS",
  "BUILDS",
  "REPLACES",
  "DECOMMISSIONS",
  "DEPENDS_ON",
];

export default function LinkAssetToProjectDialog({
  open,
  onClose,
  projectId,
  onLinked,
  excludeAssetIds = [],
}) {
  const [loading, setLoading] = React.useState(false);
  const [assets, setAssets] = React.useState([]);
  const [assetId, setAssetId] = React.useState("");
  const [relType, setRelType] = React.useState("ENHANCES");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    async function loadAssets() {
      if (!open) return;
      setError("");
      setLoading(true);
      try {
        const data = await apiGet("/api/assets/");
        const rows = Array.isArray(data) ? data : data.results || [];
        const excluded = new Set(excludeAssetIds);
        const filtered = rows.filter((a) => !excluded.has(a.id));
        if (mounted) setAssets(filtered);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAssets();
    return () => {
      mounted = false;
    };
  }, [open, excludeAssetIds]);

  async function handleLink() {
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/project-asset-links/", {
        project: projectId,
        asset: assetId,
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
      <DialogTitle>Link Asset</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>Asset</InputLabel>
            <Select
              value={assetId}
              label="Asset"
              onChange={(e) => setAssetId(e.target.value)}
              disabled={loading}
            >
              {assets.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
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
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleLink}
          disabled={loading || !assetId}
        >
          Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
