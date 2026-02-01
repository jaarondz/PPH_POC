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
import { apiGet, apiPost } from "../api/client.js";

const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  AT_RISK: "At Risk",
  COMPLETE: "Complete",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  assigned_to: "",
  status: "PLANNED",
  due_date: "",
};

function formatUserLabel(user) {
  if (!user) return "";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name ? `${name} (${user.username})` : user.username;
}

export default function CreateProjectMilestoneDialog({ open, onClose, projectId, onCreated }) {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [users, setUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setError("");
    }
  }, [open]);

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

  async function handleCreate() {
    if (!projectId) return;
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        project: projectId,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      };
      const created = await apiPost("/api/project-milestones/", payload);
      onCreated?.(created);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to create milestone");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = form.title.trim() && form.due_date;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Milestone</DialogTitle>
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
            label="Milestone Title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            fullWidth
            required
            disabled={saving}
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={saving}
          />

          <FormControl fullWidth>
            <InputLabel>Owner</InputLabel>
            <Select
              value={form.assigned_to}
              label="Owner"
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

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
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

          <TextField
            label="Due Date"
            type="date"
            value={form.due_date}
            onChange={(e) => updateField("due_date", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={saving}
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={saving || !canSubmit}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
