import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Paper,
  TextField,
  Stack,
  Box,
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
  TableSortLabel,
  Button,
  ButtonBase,
  ButtonGroup,
  IconButton,
} from "@mui/material";
import { apiGet } from "../api/client.js";
import CreateProjectDialog from "../components/CreateProjectDialog.jsx";
import IntakeRequestDialog from "../components/IntakeRequestDialog.jsx";
import EditIcon from "@mui/icons-material/Edit";
import EditProjectDialog from "../components/EditProjectDialog.jsx";
import { downloadCsv } from "../utils/csv.js";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
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

const SORT_COLUMNS = [
  { id: "name", label: "Name" },
  { id: "project_type", label: "Type" },
  { id: "status", label: "Status" },
  { id: "priority", label: "Priority" },
  { id: "scope", label: "Scope" },
  { id: "sponsor", label: "Sponsor" },
  { id: "dates", label: "Dates" },
];

function getSortValue(project, field) {
  switch (field) {
    case "project_type":
      return TYPE_LABELS[project.project_type] || project.project_type || "";
    case "status":
      return STATUS_LABELS[project.status] || project.status || "";
    case "priority":
      return project.priority || "";
    case "scope":
      return SCOPE_LABELS[project.scope] || project.scope || "";
    case "sponsor":
      return project.sponsor || "";
    case "dates":
      return project.start_date || project.target_end_date || "";
    case "name":
    default:
      return project.name || "";
  }
}

function compareSortValues(a, b) {
  const emptyA = a === null || a === undefined || a === "";
  const emptyB = b === null || b === undefined || b === "";
  if (emptyA && emptyB) return 0;
  if (emptyA) return 1;
  if (emptyB) return -1;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}


export default function ProjectsListPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [intakeOpen, setIntakeOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [sortField, setSortField] = React.useState("name");
  const [sortDirection, setSortDirection] = React.useState("asc");
  const [viewMode, setViewMode] = React.useState("DEFAULT");
  const [ganttView, setGanttView] = React.useState(ViewMode.Week);
  const [assetLinks, setAssetLinks] = React.useState([]);
  const [loadingLinks, setLoadingLinks] = React.useState(false);
  const [linksError, setLinksError] = React.useState("");

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

  React.useEffect(() => {
    if (viewMode !== "BUCKET") return;
    let mounted = true;
    setLoadingLinks(true);
    setLinksError("");
    apiGet("/api/project-asset-links/")
      .then((data) => {
        if (!mounted) return;
        const rows = Array.isArray(data) ? data : data.results || [];
        setAssetLinks(rows);
      })
      .catch((e) => {
        if (mounted) setLinksError(e.message || "Failed to load asset links");
      })
      .finally(() => {
        if (mounted) setLoadingLinks(false);
      });

    return () => {
      mounted = false;
    };
  }, [viewMode]);

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

  const summaryCounts = React.useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const todayStr = now.toISOString().slice(0, 10);

    const active = projects.filter((p) => p.status === "ACTIVE").length;
    const blocked = projects.filter((p) => p.status === "BLOCKED").length;
    const recentCompleted = projects.filter((p) => {
      if (p.status !== "DONE") return false;
      if (!p.updated_at) return false;
      const updated = new Date(p.updated_at);
      return updated >= thirtyDaysAgo;
    }).length;
    const overdue = projects.filter((p) => {
      if (!p.target_end_date) return false;
      return p.target_end_date < todayStr;
    }).length;

    return { active, blocked, recentCompleted, overdue };
  }, [projects]);

  function applyStatusFilter(value) {
    setStatusFilter(value);
    setTypeFilter("ALL");
    setSearch("");
  }

  const sorted = React.useMemo(() => {
    const rows = [...filtered];
    rows.sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);
      const base = compareSortValues(aVal, bVal);
      return sortDirection === "asc" ? base : -base;
    });
    return rows;
  }, [filtered, sortField, sortDirection]);

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

  const TaskListTable = React.useCallback(
    (props) => (
      <GanttTaskListTable
        {...props}
        onRowClick={(task) => navigate(`/projects/${task.id}`)}
      />
    ),
    [navigate]
  );

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const bucketed = React.useMemo(() => {
    if (viewMode !== "BUCKET") return [];

    const projectById = new Map(projects.map((p) => [p.id, p]));
    const projectIdsInFilter = new Set(filtered.map((p) => p.id));

    const bucketsMap = new Map();
    const linkedProjectIds = new Set();

    assetLinks.forEach((link) => {
      const projectId = link.project || link.project_detail?.id;
      const assetId = link.asset || link.asset_detail?.id;
      if (!projectId || !assetId || !projectIdsInFilter.has(projectId)) return;
      linkedProjectIds.add(projectId);

      const assetLabel =
        link.asset_detail?.name || link.asset_detail?.asset_tag || `Asset ${assetId}`;

      if (!bucketsMap.has(assetId)) {
        bucketsMap.set(assetId, {
          id: assetId,
          label: assetLabel,
          projectIds: new Set(),
        });
      }
      bucketsMap.get(assetId).projectIds.add(projectId);
    });

    const unlinkedProjects = filtered.filter((p) => !linkedProjectIds.has(p.id));

    const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
    const getScopeLabel = (p) => SCOPE_LABELS[p.scope] || p.scope || "";
    const sortBucketProjects = (rows) => {
      return [...rows].sort((a, b) => {
        const pa = priorityRank[a.priority] ?? 99;
        const pb = priorityRank[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;

        const scopeCompare = compareSortValues(getScopeLabel(a), getScopeLabel(b));
        if (scopeCompare !== 0) return scopeCompare;

        return compareSortValues(a.name || "", b.name || "");
      });
    };

    const buckets = Array.from(bucketsMap.values())
      .map((bucket) => ({
        id: bucket.id,
        label: bucket.label,
        projects: sortBucketProjects(
          Array.from(bucket.projectIds)
            .map((id) => projectById.get(id))
            .filter(Boolean)
        ),
      }))
      .filter((bucket) => bucket.projects.length > 0)
      .sort((a, b) => compareSortValues(a.label, b.label));

    if (unlinkedProjects.length > 0) {
      buckets.push({
        id: "unlinked",
        label: "Standalone Projects",
        projects: sortBucketProjects(unlinkedProjects),
      });
    }

    return buckets;
  }, [viewMode, assetLinks, filtered, projects]);

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
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <ButtonBase
          onClick={() => applyStatusFilter("ACTIVE")}
          sx={{ flex: 1, textAlign: "left", borderRadius: 2 }}
        >
          <Paper sx={{ p: 2, width: "100%" }}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                Active Projects
              </Typography>
              <Typography variant="h4">{summaryCounts.active}</Typography>
              <Chip size="small" label="Filter: Active" />
            </Stack>
          </Paper>
        </ButtonBase>

        <ButtonBase
          onClick={() => applyStatusFilter("BLOCKED")}
          sx={{ flex: 1, textAlign: "left", borderRadius: 2 }}
        >
          <Paper sx={{ p: 2, width: "100%" }}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                Blocked Projects
              </Typography>
              <Typography variant="h4">{summaryCounts.blocked}</Typography>
              <Chip size="small" label="Filter: Blocked" />
            </Stack>
          </Paper>
        </ButtonBase>

        <ButtonBase
          onClick={() => applyStatusFilter("DONE")}
          sx={{ flex: 1, textAlign: "left", borderRadius: 2 }}
        >
          <Paper sx={{ p: 2, width: "100%" }}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                Recently Completed (30 days)
              </Typography>
              <Typography variant="h4">{summaryCounts.recentCompleted}</Typography>
              <Chip size="small" label="Filter: Done" />
            </Stack>
          </Paper>
        </ButtonBase>

        <ButtonBase
          onClick={() => applyStatusFilter("ALL")}
          sx={{ flex: 1, textAlign: "left", borderRadius: 2 }}
        >
          <Paper sx={{ p: 2, width: "100%" }}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                Overdue Projects
              </Typography>
              <Typography variant="h4">{summaryCounts.overdue}</Typography>
              <Chip size="small" label="Past target end date" />
            </Stack>
          </Paper>
        </ButtonBase>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Projects
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
          <ButtonGroup variant="outlined">
            <Button
              variant={viewMode === "DEFAULT" ? "contained" : "outlined"}
              onClick={() => setViewMode("DEFAULT")}
            >
              Default View
            </Button>
            <Button
              variant={viewMode === "BUCKET" ? "contained" : "outlined"}
              onClick={() => setViewMode("BUCKET")}
            >
              Bucket by Asset
            </Button>
            <Button
              variant={viewMode === "GANTT" ? "contained" : "outlined"}
              onClick={() => setViewMode("GANTT")}
            >
              Gantt View
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="outlined">
            <Button onClick={() => setIntakeOpen(true)}>Intake Request</Button>
            <Button onClick={() => setCreateOpen(true)}>Add Project</Button>
          </ButtonGroup>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" onClick={handleExport} disabled={filtered.length === 0}>
            Export CSV
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

          {viewMode === "GANTT" && (
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
          )}
        </Stack>
      </Paper>

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading projects…</Typography>
        </Stack>
      )}

      {viewMode === "BUCKET" && loadingLinks && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading asset buckets…</Typography>
        </Stack>
      )}

      {linksError && <Alert severity="error">{linksError}</Alert>}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && viewMode === "DEFAULT" && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {SORT_COLUMNS.map((col) => (
                  <TableCell
                    key={col.id}
                    sortDirection={sortField === col.id ? sortDirection : false}
                  >
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortField === col.id ? sortDirection : "asc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((p) => (
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

      {!loading && !error && viewMode === "BUCKET" && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {SORT_COLUMNS.map((col) => (
                  <TableCell key={col.id}>{col.label}</TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bucketed.map((bucket) => (
                <React.Fragment key={bucket.id}>
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        borderTop: 2,
                        borderColor: "divider",
                        bgcolor: "action.hover",
                      }}
                    >
                      {bucket.label}
                    </TableCell>
                  </TableRow>
                  {bucket.projects.map((p) => (
                    <TableRow
                      key={p.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <TableCell sx={{ fontWeight: 600, pl: 4 }}>
                        {p.name}
                      </TableCell>
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
                </React.Fragment>
              ))}

              {bucketed.length === 0 && (
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

      {!loading && !error && viewMode === "GANTT" && (
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
              TaskListTable={TaskListTable}
            />
          )}
        </Paper>
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

      <IntakeRequestDialog
        open={intakeOpen}
        onClose={() => setIntakeOpen(false)}
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
