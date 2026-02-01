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

export default function LinkAccomplishmentToAssetDialog({
  open,
  onClose,
  assetId,
  onLinked,
  excludeAccomplishmentIds = [],
}) {
  const [loading, setLoading] = React.useState(false);
  const [accomplishments, setAccomplishments] = React.useState([]);
  const [accomplishmentId, setAccomplishmentId] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    async function loadAccomplishments() {
      if (!open) return;
      setError("");
      setLoading(true);
      try {
        const data = await apiGet("/api/accomplishments/");
        const rows = Array.isArray(data) ? data : data.results || [];
        const excluded = new Set(excludeAccomplishmentIds);
        const filtered = rows.filter((a) => !excluded.has(a.id));
        if (mounted) setAccomplishments(filtered);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAccomplishments();
    return () => {
      mounted = false;
    };
  }, [open, excludeAccomplishmentIds]);

  async function handleLink() {
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/accomplishment-asset-links/", {
        asset: assetId,
        accomplishment: accomplishmentId,
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
      <DialogTitle>Link Accomplishment</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>Accomplishment</InputLabel>
            <Select
              value={accomplishmentId}
              label="Accomplishment"
              onChange={(e) => setAccomplishmentId(e.target.value)}
              disabled={loading}
            >
              {accomplishments.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.title}
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
          disabled={loading || !accomplishmentId}
        >
          Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
