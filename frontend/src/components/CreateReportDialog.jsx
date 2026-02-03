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
  FormHelperText,
} from "@mui/material";
import { apiGet, apiPost } from "../api/client.js";

const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_DEVELOPMENT: "In Development",
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  RETIRED: "Retired",
};

const AUTOMATION_LABELS = {
  AUTOMATED: "Automated",
  MANUAL: "Manual",
};

const REPORT_TYPE_LABELS = {
  POWER_BI: "Power BI",
  EXCEL: "Excel",
  OTHER: "Other",
};

const DELIVERY_METHOD_LABELS = {
  POWER_BI: "Power BI",
  AUTOMATED_EMAIL: "Automated Email",
  MANUAL_EMAIL: "Manual Email",
};

const REFRESH_FREQUENCY_LABELS = {
  MONTHLY: "Monthly",
  WEEKLY: "Weekly",
  DAILY: "Daily",
  MULTIPLE_DAILY: "Multiple Times Daily",
};

const SCOPE_LABELS = {
  ADMINISTRATIVE: "Administrative",
  ADULT: "Adult",
  JUVENILE: "Juvenile",
  CROSS_CUTTING: "Cross-Cutting",
};

const EMPTY_FORM = {
  name: "",
  status: "ACTIVE",
  scope: "",
  description: "",
  business_owner_user: "",
  technical_owner_user: "",
  developer_user: "",
  automation: "",
  report_type: "",
  delivery_method: "",
  refresh_frequency: "",
  external_reference_url: "",
};

function formatUser(user) {
  if (!user) return "";
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return fullName || user.username || user.email || "";
}

export default function CreateReportDialog({ open, onClose, onCreated }) {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [error, setError] = React.useState("");
  const [usersError, setUsersError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setError("");
      setUsersError("");
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    let active = true;

    async function loadUsers() {
      try {
        const data = await apiGet("/api/users/");
        const rows = Array.isArray(data) ? data : data.results || [];
        if (active) setUsers(rows);
      } catch (e) {
        if (active) setUsersError(e.message || "Failed to load users");
      }
    }

    loadUsers();
    return () => {
      active = false;
    };
  }, [open]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate() {
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        external_reference_url: form.external_reference_url || "",
        business_owner_user: form.business_owner_user || null,
        technical_owner_user: form.technical_owner_user || null,
        developer_user: form.developer_user || null,
      };
      const created = await apiPost("/api/reports/", payload);
      onCreated?.(created);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to create report");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = form.name.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add Report</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {usersError && <Alert severity="warning">{usersError}</Alert>}

          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            fullWidth
            required
            disabled={saving}
          />

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

          <FormControl fullWidth>
            <InputLabel>Scope</InputLabel>
            <Select
              value={form.scope}
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

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={saving}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Business Owner</InputLabel>
              <Select
                value={form.business_owner_user}
                label="Business Owner"
                onChange={(e) => updateField("business_owner_user", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {formatUser(u)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select a user</FormHelperText>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Technical Owner</InputLabel>
              <Select
                value={form.technical_owner_user}
                label="Technical Owner"
                onChange={(e) => updateField("technical_owner_user", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {formatUser(u)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select a user</FormHelperText>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Developer</InputLabel>
              <Select
                value={form.developer_user}
                label="Developer"
                onChange={(e) => updateField("developer_user", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {formatUser(u)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select a user</FormHelperText>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Refresh Frequency</InputLabel>
              <Select
                value={form.refresh_frequency}
                label="Refresh Frequency"
                onChange={(e) => updateField("refresh_frequency", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">Not set</MenuItem>
                {Object.keys(REFRESH_FREQUENCY_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {REFRESH_FREQUENCY_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Automated/Manual</InputLabel>
              <Select
                value={form.automation}
                label="Automated/Manual"
                onChange={(e) => updateField("automation", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">Not set</MenuItem>
                {Object.keys(AUTOMATION_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {AUTOMATION_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={form.report_type}
                label="Report Type"
                onChange={(e) => updateField("report_type", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">Not set</MenuItem>
                {Object.keys(REPORT_TYPE_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {REPORT_TYPE_LABELS[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <FormControl fullWidth>
            <InputLabel>Delivery Method</InputLabel>
            <Select
              value={form.delivery_method}
              label="Delivery Method"
              onChange={(e) => updateField("delivery_method", e.target.value)}
              disabled={saving}
            >
              <MenuItem value="">Not set</MenuItem>
              {Object.keys(DELIVERY_METHOD_LABELS).map((key) => (
                <MenuItem key={key} value={key}>
                  {DELIVERY_METHOD_LABELS[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="External Reference URL"
            value={form.external_reference_url}
            onChange={(e) => updateField("external_reference_url", e.target.value)}
            fullWidth
            disabled={saving}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleCreate} disabled={saving || !canSubmit}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
