import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { apiPatch } from "../api/client.js";

const IMPACT_LABELS = {
  RISK: "Risk Reduction",
  COST: "Cost Savings / Avoidance",
  SPEED: "Speed / Throughput",
  QUALITY: "Quality / Reliability",
  CUSTOMER: "Customer Experience",
};

export default function EditAccomplishmentDialog({ open, onClose, accomplishment, onUpdated }) {
  const [form, setForm] = React.useState(null);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && accomplishment) {
      setForm({
        title: accomplishment.title || "",
        narrative: accomplishment.narrative || "",
        impact_type: accomplishment.impact_type || "",
        metric: accomplishment.metric || "",
        evidence_urls: accomplishment.evidence_urls || "",
        start_date: accomplishment.start_date || "",
        end_date: accomplishment.end_date || "",
      });
      setError("");
    }
  }, [open, accomplishment]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!accomplishment?.id) return;
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      const updated = await apiPatch(`/api/accomplishments/${accomplishment.id}/`, payload);
      onUpdated?.(updated);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to update accomplishment");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = form?.title?.trim();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Accomplishment</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Title"
            value={form?.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            fullWidth
            required
            disabled={saving}
          />

          <FormControl fullWidth>
            <InputLabel>Impact Type</InputLabel>
            <Select
              value={form?.impact_type || ""}
              label="Impact Type"
              onChange={(e) => updateField("impact_type", e.target.value)}
              disabled={saving}
            >
              <MenuItem value="">None</MenuItem>
              {Object.keys(IMPACT_LABELS).map((key) => (
                <MenuItem key={key} value={key}>
                  {IMPACT_LABELS[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Metric"
            value={form?.metric || ""}
            onChange={(e) => updateField("metric", e.target.value)}
            fullWidth
            disabled={saving}
          />

          <TextField
            label="Narrative"
            value={form?.narrative || ""}
            onChange={(e) => updateField("narrative", e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={saving}
          />

          <TextField
            label="Evidence URLs (one per line)"
            value={form?.evidence_urls || ""}
            onChange={(e) => updateField("evidence_urls", e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={saving}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={form?.start_date || ""}
              onChange={(e) => updateField("start_date", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={saving}
            />
            <TextField
              label="End Date"
              type="date"
              value={form?.end_date || ""}
              onChange={(e) => updateField("end_date", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={saving}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !canSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
