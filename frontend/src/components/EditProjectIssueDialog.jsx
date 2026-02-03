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
  CircularProgress,
} from "@mui/material";
import { apiGet, apiPatch } from "../api/client.js";

const ISSUE_TYPE_LABELS = {
  BUG: "Bug",
  DEFECT: "Defect",
};

const STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const SEVERITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

function formatUserLabel(user) {
  if (!user) return "";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name ? `${name} (${user.username})` : user.username;
}

export default function EditProjectIssueDialog({ open, onClose, issue, onUpdated }) {
  const [form, setForm] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && issue) {
      setForm({
        title: issue.title || "",
        description: issue.description || "",
        issue_type: issue.issue_type || "BUG",
        status: issue.status || "OPEN",
        severity: issue.severity || "MEDIUM",
        assigned_to: issue.assigned_to || "",
      });
      setError("");
    }
  }, [open, issue]);

  React.useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoadingUsers(true);
    apiGet("/api/users/")
      .then((data) => {
        if (!mounted) return;
        const rows = Array.isArray(data) ? data : data.results || [];
        setUsers(rows);
      })
      .catch((e) => {
        if (mounted) setError(e.message || "Failed to load users");
      })
      .finally(() => {
        if (mounted) setLoadingUsers(false);
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!issue?.id) return;
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
      };
      const updated = await apiPatch(`/api/project-issues/${issue.id}/`, payload);
      onUpdated?.(updated);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to update issue");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = form?.title?.trim() && form?.issue_type;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Issue</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {loadingUsers ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={18} />
              <span>Loading users…</span>
            </Stack>
          ) : null}

          <TextField
            label="Title"
            value={form?.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            fullWidth
            required
            disabled={saving}
          />

          <TextField
            label="Description"
            value={form?.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={saving}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={form?.issue_type || "BUG"}
                label="Type"
                onChange={(e) => updateField("issue_type", e.target.value)}
                disabled={saving}
              >
                {Object.keys(ISSUE_TYPE_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {ISSUE_TYPE_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={form?.severity || "MEDIUM"}
                label="Severity"
                onChange={(e) => updateField("severity", e.target.value)}
                disabled={saving}
              >
                {Object.keys(SEVERITY_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {SEVERITY_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form?.status || "OPEN"}
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
          </Stack>

          <FormControl fullWidth>
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={form?.assigned_to || ""}
              label="Assigned To"
              onChange={(e) => updateField("assigned_to", e.target.value)}
              disabled={saving || loadingUsers}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {formatUserLabel(u)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
