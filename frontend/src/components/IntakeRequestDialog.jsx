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
  Chip,
  Typography,
} from "@mui/material";
import { apiPost } from "../api/client.js";

const TYPE_LABELS = {
  NEW_BUILD: "New Build",
  ENHANCEMENT: "Enhancement",
  MAINTENANCE: "Maintenance",
  INFRA: "Infrastructure",
  FACILITIES: "Facilities",
  SECURITY: "Security/Compliance",
  DISCOVERY: "Discovery/Research",
};

const SCOPE_LABELS = {
  ADMINISTRATIVE: "Administrative",
  ADULT: "Adult",
  JUVENILE: "Juvenile",
  CROSS_CUTTING: "Cross-Cutting",
  OTHER: "Other",
};

const EMPTY_FORM = {
  name: "",
  summary: "",
  project_type: "",
  scope: "",
  sponsor: "",
  start_date: "",
  target_end_date: "",
};

export default function IntakeRequestDialog({ open, onClose, onCreated }) {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setError("");
    }
  }, [open]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const canSubmit = Boolean(form.name.trim()) && Boolean(form.project_type);

  async function handleSubmit() {
    if (!canSubmit) return;
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        status: "INTAKE",
        start_date: form.start_date || null,
        target_end_date: form.target_end_date || null,
      };
      const created = await apiPost("/api/projects/", payload);
      onCreated?.(created);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to submit intake request");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Project Intake Request</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography color="text.secondary">Status</Typography>
            <Chip size="small" label="Intake" color="info" variant="outlined" />
          </Stack>

          <TextField
            label="Project Name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            fullWidth
            required
            disabled={saving}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.project_type}
                label="Type"
                onChange={(e) => updateField("project_type", e.target.value)}
                disabled={saving}
              >
                {Object.keys(TYPE_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {TYPE_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Scope</InputLabel>
              <Select
                value={form.scope}
                label="Scope"
                onChange={(e) => updateField("scope", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">Unspecified</MenuItem>
                {Object.keys(SCOPE_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {SCOPE_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Request Summary"
            value={form.summary}
            onChange={(e) => updateField("summary", e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={saving}
          />

          <TextField
            label="Requestor / Sponsor"
            value={form.sponsor}
            onChange={(e) => updateField("sponsor", e.target.value)}
            fullWidth
            disabled={saving}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Desired Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => updateField("start_date", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={saving}
            />
            <TextField
              label="Target End Date"
              type="date"
              value={form.target_end_date}
              onChange={(e) => updateField("target_end_date", e.target.value)}
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
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || saving}>
          Submit Intake Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}
