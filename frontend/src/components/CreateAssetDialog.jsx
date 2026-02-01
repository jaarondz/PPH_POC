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
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import { apiGet, apiPost } from "../api/client.js";

const ASSET_TYPE_LABELS = {
  APPLICATION: "Application",
  OP_SYSTEM: "Operational System",
  FACILITY: "Facility/Site",
};

const STATUS_LABELS = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  RETIRED: "Retired",
};

const SCOPE_LABELS = {
  ADMINISTRATIVE: "Administrative",
  ADULT: "Adult",
  JUVENILE: "Juvenile",
  CROSS_CUTTING: "Cross-Cutting",
  OTHER: "Other",
};

const CRITICALITY_LABELS = {
  TIER_0: "Tier 0 (Mission Critical)",
  TIER_1: "Tier 1",
  TIER_2: "Tier 2",
  TIER_3: "Tier 3",
};

function formatUser(user) {
  if (!user) return "";
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return fullName || user.username || user.email || "";
}

const EMPTY_FORM = {
  name: "",
  acronym: "",
  asset_type: "",
  status: "ACTIVE",
  scope: "",
  description: "",
  business_owner_user: "",
  technical_owner_user: "",
  criticality: "",
  external_reference_url: "",
  risk_security: false,
  risk_privacy: false,
  risk_compliance: false,
};

export default function CreateAssetDialog({ open, onClose, onCreated }) {
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
        criticality: form.criticality || "",
        external_reference_url: form.external_reference_url || "",
        business_owner_user: form.business_owner_user || null,
        technical_owner_user: form.technical_owner_user || null,
      };
      const created = await apiPost("/api/assets/", payload);
      onCreated?.(created);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to create asset");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = form.name.trim() && form.asset_type;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add Asset</DialogTitle>
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

          <TextField
            label="Acronym"
            value={form.acronym}
            onChange={(e) => updateField("acronym", e.target.value)}
            fullWidth
            disabled={saving}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.asset_type}
                label="Type"
                onChange={(e) => updateField("asset_type", e.target.value)}
                disabled={saving}
              >
                {Object.keys(ASSET_TYPE_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {ASSET_TYPE_LABELS[key]}
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
          </Stack>

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
              <InputLabel>Criticality</InputLabel>
              <Select
                value={form.criticality}
                label="Criticality"
                onChange={(e) => updateField("criticality", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">None</MenuItem>
                {Object.keys(CRITICALITY_LABELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {CRITICALITY_LABELS[key]}
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

          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.risk_security}
                  onChange={(e) => updateField("risk_security", e.target.checked)}
                  disabled={saving}
                />
              }
              label="Security Risk"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.risk_privacy}
                  onChange={(e) => updateField("risk_privacy", e.target.checked)}
                  disabled={saving}
                />
              }
              label="Privacy Risk"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.risk_compliance}
                  onChange={(e) => updateField("risk_compliance", e.target.checked)}
                  disabled={saving}
                />
              }
              label="Compliance Risk"
            />
          </FormGroup>
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
