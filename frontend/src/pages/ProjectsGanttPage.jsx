import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Paper,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { apiGet } from "../api/client.js";
import {
  GanttTaskListHeader,
  GanttTaskListTable,
} from "../components/GanttTaskListTable.jsx";

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

function containsIgnoreCase(value, query) {
  if (!query) return true;
  if (!value) return false;
  return String(value).toLowerCase().includes(query.toLowerCase());
}

function toDate(value, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function progressFromStatus(status) {
  switch (status) {
    case "DONE":
      return 100;
    case "ACTIVE":
      return 50;
    case "BLOCKED":
      return 25;
    case "PLANNED":
      return 10;
    default:
      return 0;
  }
}

export default function ProjectsGanttPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [ganttView, setGanttView] = React.useState(ViewMode.Week);

  const loadProjects = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/projects/");
      const rows = Array.isArray(data) ? data : data.results || [];
      setProjects(rows);
    } catch (e) {
      setError(e.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);


  const filtered = React.useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        containsIgnoreCase(p.name, search) ||
        containsIgnoreCase(p.summary, search) ||
        containsIgnoreCase(p.sponsor, search);

      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesType = typeFilter === "ALL" || p.project_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, search, statusFilter, typeFilter]);

  const ganttTasks = React.useMemo(() => {
    const today = new Date();
    return filtered.map((p) => {
      const start = toDate(p.start_date, today);
      const end = toDate(p.target_end_date, addDays(start, 7));
      const safeEnd = end < start ? addDays(start, 1) : end;

      return {
        id: p.id,
        name: p.name,
        start,
        end: safeEnd,
        type: "task",
        progress: progressFromStatus(p.status),
        isDisabled: true,
      };
    });
  }, [filtered]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Portfolio Gantt
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/projects")}>
          View Project List
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />

          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              {Object.keys(TYPE_LABELS).map((key) => (
                <MenuItem key={key} value={key}>
                  {TYPE_LABELS[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              {Object.keys(STATUS_LABELS).map((key) => (
                <MenuItem key={key} value={key}>
                  {STATUS_LABELS[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={ganttView}
              label="View"
              onChange={(e) => setGanttView(e.target.value)}
            >
              <MenuItem value={ViewMode.Day}>Day</MenuItem>
              <MenuItem value={ViewMode.Week}>Week</MenuItem>
              <MenuItem value={ViewMode.Month}>Month</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading projects…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Paper sx={{ p: 2 }}>
          {ganttTasks.length === 0 ? (
            <Typography color="text.secondary">No projects to show.</Typography>
          ) : (
            <Gantt
              tasks={ganttTasks}
              viewMode={ganttView}
              listCellWidth="420px"
              rowHeight={56}
              headerHeight={40}
              TaskListHeader={GanttTaskListHeader}
              TaskListTable={GanttTaskListTable}
            />
          )}
        </Paper>
      )}
    </Stack>
  );
}
