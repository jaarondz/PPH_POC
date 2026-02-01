import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Paper,
  TextField,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import { apiGet } from "../api/client.js";
import CreateProjectDialog from "../components/CreateProjectDialog.jsx";
import EditIcon from "@mui/icons-material/Edit";
import EditProjectDialog from "../components/EditProjectDialog.jsx";
import { downloadCsv } from "../utils/csv.js";

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

const SCOPE_LABELS = {
  ADMINISTRATIVE: "Administrative",
  ADULT: "Adult",
  JUVENILE: "Juvenile",
  CROSS_CUTTING: "Cross-Cutting",
  OTHER: "Other",
};

function containsIgnoreCase(value, query) {
  if (!query) return true;
  if (!value) return false;
  return String(value).toLowerCase().includes(query.toLowerCase());
}


export default function ProjectsListPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [typeFilter, setTypeFilter] = React.useState("ALL");

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

  const handleExport = React.useCallback(() => {
    const columns = [
      { label: "Name", value: (p) => p.name },
      { label: "Type", value: (p) => TYPE_LABELS[p.project_type] || p.project_type || "" },
      { label: "Status", value: (p) => STATUS_LABELS[p.status] || p.status || "" },
      { label: "Priority", value: (p) => p.priority || "" },
      { label: "Scope", value: (p) => SCOPE_LABELS[p.scope] || p.scope || "" },
      { label: "Sponsor", value: (p) => p.sponsor || "" },
      { label: "Start Date", value: (p) => p.start_date || "" },
      { label: "Target End Date", value: (p) => p.target_end_date || "" },
    ];
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`projects-${date}.csv`, columns, filtered);
  }, [filtered]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Projects
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate("/projects/gantt")}>
            View Gantt
          </Button>
          <Button variant="outlined" onClick={handleExport} disabled={filtered.length === 0}>
            Export CSV
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Add Project
          </Button>
        </Stack>
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
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Sponsor</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                  <TableCell>
                    <Chip size="small" label={TYPE_LABELS[p.project_type] || p.project_type} />
                  </TableCell>
                  <TableCell>{STATUS_LABELS[p.status] || p.status}</TableCell>
                  <TableCell>{p.priority || "—"}</TableCell>
                  <TableCell>{SCOPE_LABELS[p.scope] || p.scope || "—"}</TableCell>
                  <TableCell>{p.sponsor || "—"}</TableCell>
                  <TableCell>
                    {(p.start_date || "—") + " → " + (p.target_end_date || "—")}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(p);
                        setEditOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography sx={{ py: 2 }}>No projects match your filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !error && (
        <Typography variant="body2" color="text.secondary">
          Showing {filtered.length} of {projects.length} projects
        </Typography>
      )}

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          if (created) loadProjects();
        }}
      />

      <EditProjectDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        project={selectedProject}
        onUpdated={() => {
          setEditOpen(false);
          loadProjects();
        }}
      />
    </Stack>
  );
}
