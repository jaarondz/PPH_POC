import * as React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiDelete, apiGet, apiPost } from "../api/client.js";

const EMPTY_TEAM = {
  name: "",
  code: "",
  parent: "",
};

const EMPTY_MEMBERSHIP = {
  team: "",
  role: "STAFF",
};

const ROLE_LABELS = {
  DIRECTOR: "Director",
  MANAGER: "Manager",
  SUPERVISOR: "Supervisor",
  STAFF: "Line Staff",
};

function formatUserName(user) {
  if (!user) return "";
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return fullName || user.username || user.email || "—";
}

export default function TeamsUsersPage() {
  const [teams, setTeams] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [memberships, setMemberships] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_TEAM);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");

  const [manageUser, setManageUser] = React.useState(null);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [membershipForm, setMembershipForm] = React.useState(EMPTY_MEMBERSHIP);
  const [membershipSaving, setMembershipSaving] = React.useState(false);
  const [membershipError, setMembershipError] = React.useState("");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, teamsData, membershipsData] = await Promise.all([
        apiGet("/api/users/"),
        apiGet("/api/teams/"),
        apiGet("/api/team-memberships/"),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : usersData.results || []);
      setTeams(Array.isArray(teamsData) ? teamsData : teamsData.results || []);
      setMemberships(
        Array.isArray(membershipsData) ? membershipsData : membershipsData.results || []
      );
    } catch (e) {
      setError(e.message || "Failed to load teams and users");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const teamMap = React.useMemo(() => {
    const map = new Map();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  const teamMemberCounts = React.useMemo(() => {
    const counts = new Map();
    memberships.forEach((m) => {
      counts.set(m.team, (counts.get(m.team) || 0) + 1);
    });
    return counts;
  }, [memberships]);

  const userTeams = React.useMemo(() => {
    const map = new Map();
    memberships.forEach((m) => {
      const team = teamMap.get(m.team);
      if (!team) return;
      const list = map.get(m.user) || [];
      list.push({ name: team.name, role: m.role });
      map.set(m.user, list);
    });
    return map;
  }, [memberships, teamMap]);

  function openDialog() {
    setForm(EMPTY_TEAM);
    setSaveError("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openManageDialog(user) {
    setManageUser(user);
    setMembershipForm(EMPTY_MEMBERSHIP);
    setMembershipError("");
    setManageOpen(true);
  }

  function closeManageDialog() {
    setManageOpen(false);
    setManageUser(null);
  }

  function updateMembershipField(name, value) {
    setMembershipForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreateTeam() {
    setSaveError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        parent: form.parent || null,
      };
      await apiPost("/api/teams/", payload);
      setDialogOpen(false);
      await loadData();
    } catch (e) {
      setSaveError(e.message || "Failed to add team");
    } finally {
      setSaving(false);
    }
  }

  const manageMemberships = React.useMemo(() => {
    if (!manageUser) return [];
    return memberships.filter((m) => m.user === manageUser.id);
  }, [memberships, manageUser]);

  async function handleAddMembership() {
    if (!manageUser) return;
    setMembershipError("");
    setMembershipSaving(true);
    try {
      await apiPost("/api/team-memberships/", {
        user: manageUser.id,
        team: membershipForm.team,
        role: membershipForm.role,
      });
      setMembershipForm(EMPTY_MEMBERSHIP);
      await loadData();
    } catch (e) {
      setMembershipError(e.message || "Failed to add user to team");
    } finally {
      setMembershipSaving(false);
    }
  }


  if (loading) {
    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading teams and users…</Typography>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Teams & Users
        </Typography>
        <Button variant="contained" onClick={openDialog}>
          Add Team
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="h6">Teams</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell align="right">Members</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{team.name}</TableCell>
                  <TableCell>{team.code || "—"}</TableCell>
                  <TableCell>{team.parent_detail?.name || "—"}</TableCell>
                  <TableCell align="right">{teamMemberCounts.get(team.id) || 0}</TableCell>
                </TableRow>
              ))}
              {teams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography sx={{ py: 2 }}>No teams yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="h6">Users</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teams</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const teamsForUser = userTeams.get(user.id) || [];
                return (
                  <TableRow key={user.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{formatUserName(user)}</TableCell>
                    <TableCell>{user.email || "—"}</TableCell>
                    <TableCell>
                      {teamsForUser.length > 0
                        ? teamsForUser
                            .map((t) => `${t.name} (${t.role.replace("_", " ")})`)
                            .join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openManageDialog(user)}>
                        Manage Teams
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography sx={{ py: 2 }}>No users found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Stack>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add Team</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {saveError && <Alert severity="error">{saveError}</Alert>}
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              fullWidth
              required
              disabled={saving}
            />
            <TextField
              label="Code"
              value={form.code}
              onChange={(e) => updateField("code", e.target.value)}
              fullWidth
              disabled={saving}
            />
            <TextField
              select
              label="Parent Team"
              value={form.parent}
              onChange={(e) => updateField("parent", e.target.value)}
              fullWidth
              disabled={saving}
            >
              <MenuItem value="">None</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTeam}
            disabled={saving || !form.name.trim()}
          >
            {saving ? "Saving…" : "Add Team"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={manageOpen} onClose={closeManageDialog} fullWidth maxWidth="md">
        <DialogTitle>
          Manage Teams {manageUser ? `- ${formatUserName(manageUser)}` : ""}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {membershipError && <Alert severity="error">{membershipError}</Alert>}

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Current Teams
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Team</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {manageMemberships.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>{m.team_detail?.name || "—"}</TableCell>
                        <TableCell>{ROLE_LABELS[m.role] || m.role}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            disabled={membershipSaving}
                            onClick={async () => {
                              setMembershipError("");
                              setMembershipSaving(true);
                              try {
                                await apiDelete(`/api/team-memberships/${m.id}/`);
                                await loadData();
                              } catch (e) {
                                setMembershipError(
                                  e.message || "Failed to remove team membership"
                                );
                              } finally {
                                setMembershipSaving(false);
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {manageMemberships.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography sx={{ py: 1 }} color="text.secondary">
                            No teams assigned yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Add to Team
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    label="Team"
                    value={membershipForm.team}
                    onChange={(e) => updateMembershipField("team", e.target.value)}
                    fullWidth
                    disabled={membershipSaving}
                  >
                    <MenuItem value="">Select team</MenuItem>
                    {teams.map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        {team.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Role"
                    value={membershipForm.role}
                    onChange={(e) => updateMembershipField("role", e.target.value)}
                    fullWidth
                    disabled={membershipSaving}
                  >
                    {Object.keys(ROLE_LABELS).map((key) => (
                      <MenuItem key={key} value={key}>
                        {ROLE_LABELS[key]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={handleAddMembership}
                    disabled={
                      membershipSaving || !membershipForm.team || !manageUser
                    }
                  >
                    {membershipSaving ? "Saving…" : "Add to Team"}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeManageDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
