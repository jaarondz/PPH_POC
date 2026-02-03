import * as React from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { apiGet } from "../api/client.js";

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

function safeRows(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function buildCounts(rows, key, labelMap = {}, emptyLabel = "Unspecified") {
  const counts = new Map();
  rows.forEach((row) => {
    const raw = row[key] || "";
    const label = labelMap[raw] || raw || emptyLabel;
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function BarList({ title, items }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="h6">{title}</Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">No data available.</Typography>
        ) : (
          items.map((item) => (
            <Stack key={item.label} spacing={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontWeight: 600 }}>{item.label}</Typography>
                <Typography color="text.secondary">{item.value}</Typography>
              </Stack>
              <Box
                sx={{
                  height: 10,
                  borderRadius: 999,
                  bgcolor: "action.hover",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${(item.value / max) * 100}%`,
                    bgcolor: "primary.main",
                  }}
                />
              </Box>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
}

function formatUserLabel(user) {
  if (!user) return "Unassigned";
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return full || user.username || user.email || "User";
}

export default function ProjectsExecutivePage() {
  const [projects, setProjects] = React.useState([]);
  const [assets, setAssets] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [owningTeam, setOwningTeam] = React.useState("");
  const [teamOptions, setTeamOptions] = React.useState([]);
  const sortedTeamOptions = React.useMemo(
    () => [...teamOptions].sort((a, b) => a.localeCompare(b)),
    [teamOptions]
  );

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const query = owningTeam ? `?owning_team=${encodeURIComponent(owningTeam)}` : "";
        const [projectsData, assetsData, tasksData] = await Promise.all([
          apiGet(`/api/projects/${query}`),
          apiGet("/api/assets/"),
          apiGet("/api/project-tasks/"),
        ]);
        const rows = safeRows(projectsData);
        const assetRows = safeRows(assetsData);
        const taskRows = safeRows(tasksData);
        if (!mounted) return;
        setProjects(rows);
        setAssets(assetRows);
        setTasks(taskRows);
        const currentTeams = rows
          .map((row) => row.owning_team)
          .filter((value) => Boolean(value));
        if (currentTeams.length) {
          setTeamOptions((prev) => {
            const merged = new Set(prev);
            currentTeams.forEach((team) => merged.add(team));
            return Array.from(merged);
          });
        }
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load projects");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [owningTeam]);

  const total = projects.length;
  const blocked = projects.filter((p) => p.status === "BLOCKED").length;
  const active = projects.filter((p) => p.status === "ACTIVE").length;
  const planned = projects.filter((p) => p.status === "PLANNED").length;
  const done = projects.filter((p) => p.status === "DONE").length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdue = projects.filter((p) => p.target_end_date && p.target_end_date < todayStr).length;

  const statusCounts = buildCounts(projects, "status", STATUS_LABELS);
  const typeCounts = buildCounts(projects, "project_type", TYPE_LABELS);
  const priorityCounts = buildCounts(projects, "priority", PRIORITY_LABELS);
  const scopeCounts = buildCounts(projects, "scope", SCOPE_LABELS);
  const securityRisk = assets.filter((a) => a.risk_security).length;
  const privacyRisk = assets.filter((a) => a.risk_privacy).length;
  const complianceRisk = assets.filter((a) => a.risk_compliance).length;
  const anyRisk = assets.filter(
    (a) => a.risk_security || a.risk_privacy || a.risk_compliance
  ).length;

  const owningTeamLabel = React.useCallback(
    (team) => OWNING_TEAM_LABELS[team] || team,
    []
  );

  const taskMatrix = React.useMemo(() => {
    const projectIds = new Set(projects.map((project) => project.id));
    const filteredTasks = tasks.filter((task) => projectIds.has(task.project));

    const peopleMap = new Map();
    filteredTasks.forEach((task) => {
      const user = task.assigned_to_detail;
      const key = user?.id || "unassigned";
      if (!peopleMap.has(key)) {
        peopleMap.set(key, {
          id: key,
          label: formatUserLabel(user),
        });
      }
    });

    const people = Array.from(peopleMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );

    const counts = new Map();
    filteredTasks.forEach((task) => {
      const projectId = task.project;
      if (!projectId) return;
      const personId = task.assigned_to_detail?.id || "unassigned";
      const key = `${projectId}:${personId}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const projectRows = projects
      .map((project) => {
        const rowCounts = {};
        people.forEach((person) => {
          const key = `${project.id}:${person.id}`;
          rowCounts[person.id] = counts.get(key) || 0;
        });

        return {
          id: project.id,
          name: project.name,
          counts: rowCounts,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return { people, projectRows };
  }, [projects, tasks]);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Project Executive View</Typography>
        <Typography color="text.secondary">
          Portfolio-level project distribution and risk highlights.
        </Typography>
      </Stack>

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading project insights…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="flex-end"
          >
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="projects-owning-team-filter-label">Owning Team</InputLabel>
              <Select
                labelId="projects-owning-team-filter-label"
                label="Owning Team"
                value={owningTeam}
                onChange={(event) => setOwningTeam(event.target.value)}
              >
                <MenuItem value="">All Owning Teams</MenuItem>
                {sortedTeamOptions.map((team) => (
                  <MenuItem key={team} value={team}>
                    {owningTeamLabel(team)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Total Projects
                </Typography>
                <Typography variant="h4">{total}</Typography>
                <Typography color="text.secondary">All active pipeline</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Active Projects
                </Typography>
                <Typography variant="h4">{active}</Typography>
                <Typography color="text.secondary">Currently in flight</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Planned / Intake
                </Typography>
                <Typography variant="h4">{planned}</Typography>
                <Typography color="text.secondary">Upcoming work</Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Risk Watch
                </Typography>
                <Typography variant="h5">{blocked}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={`Blocked ${blocked}`} />
                  <Chip size="small" label={`Done ${done}`} />
                </Stack>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                  Overdue Projects
                </Typography>
                <Typography variant="h4">{overdue}</Typography>
                <Typography color="text.secondary">Past target end date</Typography>
              </Stack>
            </Paper>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <BarList title="Projects by Status" items={statusCounts} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <BarList title="Projects by Type" items={typeCounts} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <BarList title="Projects by Priority" items={priorityCounts} />
            </Box>
          </Stack>

          <Box>
            <BarList title="Projects by Scope" items={scopeCounts} />
          </Box>

          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Tasks by Person and Project</Typography>
              {taskMatrix.people.length === 0 ? (
                <Typography color="text.secondary">No project tasks available.</Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 420 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                        {taskMatrix.people.map((person) => (
                          <TableCell key={person.id} align="center">
                            {person.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {taskMatrix.projectRows.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                          {taskMatrix.people.map((person) => (
                            <TableCell key={person.id} align="center">
                              {row.counts[person.id] || 0}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Risk Flags (Assets)</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
                <Chip color="error" label={`Security Risk ${securityRisk}`} />
                <Chip color="warning" label={`Privacy Risk ${privacyRisk}`} />
                <Chip color="info" label={`Compliance Risk ${complianceRisk}`} />
                <Chip label={`Any Risk ${anyRisk}`} />
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}
