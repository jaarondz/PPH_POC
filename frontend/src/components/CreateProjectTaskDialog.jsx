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
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Done",
};

const EMPTY_FORM = {
  description: "",
  assigned_to: "",
  status: "NOT_STARTED",
  start_date: "",
  end_date: "",
};

function formatUserLabel(user) {
  if (!user) return "";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name ? `${name} (${user.username})` : user.username;
}

export default function CreateProjectTaskDialog({ open, onClose, projectId, onCreated }) {
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
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      const created = await apiPost("/api/project-tasks/", payload);
      onCreated?.(created);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    form.description.trim() && form.assigned_to && form.start_date && form.end_date;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Task</DialogTitle>
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
            label="Task Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            fullWidth
            required
            multiline
            minRows={3}
            disabled={saving}
          />

          <FormControl fullWidth required>
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={form.assigned_to}
              label="Assigned To"
              onChange={(e) => updateField("assigned_to", e.target.value)}
              disabled={saving || loadingUsers}
            >
              <MenuItem value="">Select a user</MenuItem>
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

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => updateField("start_date", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={saving}
              required
            />
            <TextField
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={(e) => updateField("end_date", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={saving}
              required
            />
          </Stack>
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
