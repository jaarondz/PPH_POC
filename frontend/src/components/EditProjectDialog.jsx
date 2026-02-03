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

const STATUS_LABELS = {
  INTAKE: "Intake",
  PLANNED: "Planned",
  ACTIVE: "Active",
  BLOCKED: "Blocked",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

const TYPE_LABELS = {
  NEW_BUILD: "New Build",
  ENHANCEMENT: "Enhancement",
  MAINTENANCE: "Maintenance",
  INFRA: "Infrastructure",
  FACILITIES: "Facilities",
  SECURITY: "Security/Compliance",
  DISCOVERY: "Discovery/Research",
};

const PRIORITY_LABELS = {
  P0: "P0",
  P1: "P1",
  P2: "P2",
  P3: "P3",
};

const SCOPE_LABELS = {
  ADMINISTRATIVE: "Administrative",
  ADULT: "Adult",
  JUVENILE: "Juvenile",
  CROSS_CUTTING: "Cross-Cutting",
  OTHER: "Other",
};

const OWNING_TEAM_LABELS = {
  BADM: "BADM",
  PMO: "PMO",
  IO: "IO",
  ITSO: "ITSO",
};

export default function EditProjectDialog({ open, onClose, project, onUpdated }) {
  const [form, setForm] = React.useState(null);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && project) {
      setForm({
        name: project.name || "",
        summary: project.summary || "",
        project_type: project.project_type || "",
        status: project.status || "INTAKE",
        priority: project.priority || "P2",
        scope: project.scope || "",
        owning_team: project.owning_team || "",
        sponsor: project.sponsor || "",
        start_date: project.start_date || "",
        target_end_date: project.target_end_date || "",
      });
      setError("");
    }
  }, [open, project]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!project?.id) return;
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        start_date: form.start_date || null,
        target_end_date: form.target_end_date || null,
      };
      const updated = await apiPatch(`/api/projects/${project.id}/`, payload);
      onUpdated?.(updated);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = form?.name?.trim() && form?.project_type;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Name"
            value={form?.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            fullWidth
            required
            disabled={saving}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={form?.project_type || ""}
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
              <InputLabel>Status</InputLabel>
              <Select
                value={form?.status || ""}
                label="Status"
                onChange={(e) => updateField("status", e.target.value)}
                disabled={saving}
              >
                {Object.keys(STATUS_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {STATUS_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={form?.priority || ""}
                label="Priority"
                onChange={(e) => updateField("priority", e.target.value)}
                disabled={saving}
              >
                {Object.keys(PRIORITY_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {PRIORITY_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Scope</InputLabel>
              <Select
                value={form?.scope || ""}
                label="Scope"
                onChange={(e) => updateField("scope", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">None</MenuItem>
                {Object.keys(SCOPE_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {SCOPE_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Summary"
            value={form?.summary || ""}
            onChange={(e) => updateField("summary", e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={saving}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Owning Team</InputLabel>
              <Select
                value={form?.owning_team || ""}
                label="Owning Team"
                onChange={(e) => updateField("owning_team", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">None</MenuItem>
                {Object.keys(OWNING_TEAM_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {OWNING_TEAM_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Sponsor"
              value={form?.sponsor || ""}
              onChange={(e) => updateField("sponsor", e.target.value)}
              fullWidth
              disabled={saving}
            />
          </Stack>

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
              label="Target End Date"
              type="date"
              value={form?.target_end_date || ""}
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
        <Button variant="contained" onClick={handleSave} disabled={saving || !canSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
