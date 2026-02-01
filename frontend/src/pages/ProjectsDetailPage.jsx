import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { apiGet, apiDelete, apiPost, apiPatch } from "../api/client.js";
import {
  GanttTaskListHeader,
  GanttTaskListTable,
} from "../components/GanttTaskListTable.jsx";
import LinkAssetToProjectDialog from "../components/LinkAssetToProjectDialog.jsx";
import DocumentsPanel from "../components/DocumentsPanel.jsx";
import EditProjectDialog from "../components/EditProjectDialog.jsx";
import CreateAccomplishmentDialog from "../components/CreateAccomplishmentDialog.jsx";
import CreateProjectTaskDialog from "../components/CreateProjectTaskDialog.jsx";
import EditProjectTaskDialog from "../components/EditProjectTaskDialog.jsx";
import CreateProjectMilestoneDialog from "../components/CreateProjectMilestoneDialog.jsx";
import EditProjectMilestoneDialog from "../components/EditProjectMilestoneDialog.jsx";

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

const TASK_STATUS_LABELS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Done",
};

const MILESTONE_STATUS_LABELS = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  AT_RISK: "At Risk",
  COMPLETE: "Complete",
};


function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
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

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = React.useState(0);
  const [project, setProject] = React.useState(null);

  const [assetLinks, setAssetLinks] = React.useState([]);
  const [accomplishmentLinks, setAccomplishmentLinks] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [milestones, setMilestones] = React.useState([]);
  const [linkAssetDialogOpen, setLinkAssetDialogOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [createAccomplishmentOpen, setCreateAccomplishmentOpen] = React.useState(false);
  const [createTaskOpen, setCreateTaskOpen] = React.useState(false);
  const [editTaskOpen, setEditTaskOpen] = React.useState(false);
  const [createMilestoneOpen, setCreateMilestoneOpen] = React.useState(false);
  const [editMilestoneOpen, setEditMilestoneOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [selectedMilestone, setSelectedMilestone] = React.useState(null);
  const [taskStatusFilter, setTaskStatusFilter] = React.useState("ALL");
  const [taskGanttView, setTaskGanttView] = React.useState(ViewMode.Week);
  const [taskTab, setTaskTab] = React.useState(0);
  const [draggedTaskId, setDraggedTaskId] = React.useState(null);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const linkedAssetIds = React.useMemo(
    () => assetLinks.map((l) => l.asset_detail?.id || l.asset),
    [assetLinks]
  );

  const loadProjectDetail = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p = await apiGet(`/api/projects/${projectId}/`);

      const al = await apiGet(`/api/project-asset-links/?project=${projectId}`);
      const apl = await apiGet(`/api/accomplishment-project-links/?project=${projectId}`);

      const assetLinkRows = Array.isArray(al) ? al : al.results || [];
      const accomplishmentLinkRows = Array.isArray(apl) ? apl : apl.results || [];

      setProject(p);
      setAssetLinks(assetLinkRows);
      setAccomplishmentLinks(accomplishmentLinkRows);
    } catch (e) {
      setError(e.message || "Failed to load project detail");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadTasks = React.useCallback(async () => {
    try {
      const statusParam = taskStatusFilter === "ALL" ? "" : `&status=${taskStatusFilter}`;
      const data = await apiGet(`/api/project-tasks/?project=${projectId}${statusParam}`);
      const rows = Array.isArray(data) ? data : data.results || [];
      setTasks(rows);
    } catch (e) {
      setError(e.message || "Failed to load tasks");
    }
  }, [projectId, taskStatusFilter]);

  const loadMilestones = React.useCallback(async () => {
    try {
      const data = await apiGet(`/api/project-milestones/?project=${projectId}`);
      const rows = Array.isArray(data) ? data : data.results || [];
      setMilestones(rows);
    } catch (e) {
      setError(e.message || "Failed to load milestones");
    }
  }, [projectId]);

  React.useEffect(() => {
    loadProjectDetail();
  }, [loadProjectDetail]);

  React.useEffect(() => {
    if (!projectId) return;
    loadTasks();
  }, [projectId, loadTasks]);

  React.useEffect(() => {
    if (!projectId) return;
    loadMilestones();
  }, [projectId, loadMilestones]);

  const ganttTasks = React.useMemo(() => {
    const today = new Date();
    return tasks.map((task) => {
      const start = toDate(task.start_date, today);
      const end = toDate(task.end_date, addDays(start, 7));
      const safeEnd = end < start ? addDays(start, 1) : end;
      return {
        id: task.id,
        name: task.description,
        start,
        end: safeEnd,
        type: "task",
        progress: task.status === "DONE" ? 100 : 0,
        isDisabled: true,
      };
    });
  }, [tasks]);

  const boardBuckets = React.useMemo(
    () =>
      Object.keys(TASK_STATUS_LABELS).map((key) => ({
        key,
        label: TASK_STATUS_LABELS[key],
      })),
    []
  );

  async function handleBucketDrop(statusKey) {
    if (!draggedTaskId) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.status === statusKey) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTaskId ? { ...t, status: statusKey } : t))
    );

    try {
      await apiPatch(`/api/project-tasks/${draggedTaskId}/`, { status: statusKey });
    } catch (e) {
      setTasks((prev) => prev.map((t) => (t.id === draggedTaskId ? task : t)));
      setError(e.message || "Failed to update task status");
    } finally {
      setDraggedTaskId(null);
    }
  }

  if (loading) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/projects" startIcon={<ArrowBackIcon />}>
          Back to Projects
        </Button>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading project…</Typography>
        </Stack>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/projects" startIcon={<ArrowBackIcon />}>
          Back to Projects
        </Button>
        <Alert severity="error">{error}</Alert>
      </Stack>
    );
  }

  if (!project) return null;

  return (
    <Stack spacing={2}>
      <Button component={Link} to="/projects" startIcon={<ArrowBackIcon />}>
        Back to Projects
      </Button>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {project.name}
            </Typography>
            <Button variant="outlined" onClick={() => setEditOpen(true)}>
              Edit Project
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={TYPE_LABELS[project.project_type] || project.project_type} />
            <Chip size="small" label={STATUS_LABELS[project.status] || project.status} />
            {project.priority ? <Chip size="small" label={project.priority} /> : null}
          </Stack>

          {project.summary ? (
            <Typography color="text.secondary">{project.summary}</Typography>
          ) : (
            <Typography color="text.secondary">No summary provided.</Typography>
          )}

          <Divider sx={{ my: 1 }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Sponsor
              </Typography>
              <Typography>{project.sponsor || "—"}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Scope
              </Typography>
              <Typography>{SCOPE_LABELS[project.scope] || project.scope || "—"}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Dates
              </Typography>
              <Typography>
                {(project.start_date || "—") + " → " + (project.target_end_date || "—")}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Typography variant="h6">Milestones</Typography>
            <Button variant="contained" onClick={() => setCreateMilestoneOpen(true)}>
              Add Milestone
            </Button>
          </Stack>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Milestone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {milestones.map((m) => {
                  const owner = m.assigned_to_detail;
                  const ownerLabel = owner
                    ? [owner.first_name, owner.last_name].filter(Boolean).join(" ") ||
                      owner.username
                    : "—";

                  return (
                    <TableRow key={m.id} hover>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 600 }}>{m.title}</Typography>
                          {m.description ? (
                            <Typography variant="caption" color="text.secondary">
                              {m.description}
                            </Typography>
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {MILESTONE_STATUS_LABELS[m.status] || m.status}
                      </TableCell>
                      <TableCell>{m.due_date || "—"}</TableCell>
                      <TableCell>{ownerLabel}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedMilestone(m);
                              setEditMilestoneOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={async () => {
                              await apiDelete(`/api/project-milestones/${m.id}/`);
                              loadMilestones();
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {milestones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography sx={{ py: 2 }}>No milestones yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Typography variant="h6">Tasks</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={taskStatusFilter}
                  label="Status"
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  {Object.keys(TASK_STATUS_LABELS).map((key) => (
                    <MenuItem key={key} value={key}>
                      {TASK_STATUS_LABELS[key]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>View</InputLabel>
                <Select
                  value={taskGanttView}
                  label="View"
                  onChange={(e) => setTaskGanttView(e.target.value)}
                >
                  <MenuItem value={ViewMode.Day}>Day</MenuItem>
                  <MenuItem value={ViewMode.Week}>Week</MenuItem>
                  <MenuItem value={ViewMode.Month}>Month</MenuItem>
                </Select>
              </FormControl>

              <Button variant="contained" onClick={() => setCreateTaskOpen(true)}>
                Add Task
              </Button>
            </Stack>
          </Stack>

          <Tabs value={taskTab} onChange={(_, v) => setTaskTab(v)}>
            <Tab label={`Task Details (${tasks.length})`} />
            <Tab label="Task Gantt" />
            <Tab label="Task Board" />
          </Tabs>

          <TabPanel value={taskTab} index={0}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => {
                    const assigned = task.assigned_to_detail;
                    const assignedLabel = assigned
                      ? [assigned.first_name, assigned.last_name].filter(Boolean).join(" ") ||
                        assigned.username
                      : "—";

                    return (
                      <TableRow key={task.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{task.description}</TableCell>
                        <TableCell>{assignedLabel}</TableCell>
                        <TableCell>
                          {TASK_STATUS_LABELS[task.status] || task.status}
                        </TableCell>
                        <TableCell>
                          {task.start_date || "—"} → {task.end_date || "—"}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedTask(task);
                                setEditTaskOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={async () => {
                                await apiDelete(`/api/project-tasks/${task.id}/`);
                                loadTasks();
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {tasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography sx={{ py: 2 }}>No tasks found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={taskTab} index={1}>
            {ganttTasks.length === 0 ? (
              <Typography color="text.secondary">No tasks to show.</Typography>
            ) : (
              <Gantt
                tasks={ganttTasks}
                viewMode={taskGanttView}
                listCellWidth="420px"
                rowHeight={56}
                headerHeight={40}
                TaskListHeader={GanttTaskListHeader}
                TaskListTable={GanttTaskListTable}
              />
            )}
          </TabPanel>

          <TabPanel value={taskTab} index={2}>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                overflowX: "auto",
                pb: 1,
              }}
            >
              {boardBuckets.map((bucket) => {
                const bucketTasks = tasks.filter((t) => t.status === bucket.key);
                return (
                  <Paper
                    key={bucket.key}
                    variant="outlined"
                    sx={{
                      p: 2,
                      width: 280,
                      minHeight: 320,
                      bgcolor: "background.default",
                      flexShrink: 0,
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleBucketDrop(bucket.key)}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {bucket.label}
                        </Typography>
                        <Chip size="small" label={bucketTasks.length} />
                      </Stack>

                      {bucketTasks.length === 0 ? (
                        <Typography color="text.secondary">
                          Drop tasks here.
                        </Typography>
                      ) : (
                        bucketTasks.map((task) => {
                          const assigned = task.assigned_to_detail;
                          const assignedLabel = assigned
                            ? [assigned.first_name, assigned.last_name]
                                .filter(Boolean)
                                .join(" ") || assigned.username
                            : "Unassigned";

                          return (
                            <Paper
                              key={task.id}
                              variant="outlined"
                              draggable
                              onDragStart={() => setDraggedTaskId(task.id)}
                              onDragEnd={() => setDraggedTaskId(null)}
                              sx={{
                                p: 1,
                                cursor: "grab",
                                bgcolor: "background.paper",
                              }}
                            >
                              <Stack spacing={0.5}>
                                <Typography sx={{ fontWeight: 600 }}>
                                  {task.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {assignedLabel}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip
                                    size="small"
                                    label={TASK_STATUS_LABELS[task.status] || task.status}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {task.start_date || "—"} → {task.end_date || "—"}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Paper>
                          );
                        })
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </TabPanel>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Linked Assets (${assetLinks.length})`} />
          <Tab label={`Related Accomplishments (${accomplishmentLinks.length})`} />
          <Tab label="Documents" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={() => setLinkAssetDialogOpen(true)}>
                Link Asset
              </Button>
            </Stack>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Relationship</TableCell>
                    <TableCell>Asset</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Criticality</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assetLinks.map((l) => {
                    const a = l.asset_detail;
                    const assetId = a?.id || l.asset;
                    return (
                      <TableRow
                        key={l.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/assets/${assetId}`)}
                      >
                        <TableCell>{l.relationship_type}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{a?.name || assetId}</TableCell>
                        <TableCell>{a?.asset_type || "—"}</TableCell>
                        <TableCell>{a?.status || "—"}</TableCell>
                        <TableCell>{a?.criticality || "—"}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await apiDelete(`/api/project-asset-links/${l.id}/`);
                              const al = await apiGet(
                                `/api/project-asset-links/?project=${projectId}`
                              );
                              setAssetLinks(Array.isArray(al) ? al : al.results || []);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {assetLinks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography sx={{ py: 2 }}>No linked assets.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setCreateAccomplishmentOpen(true)}>
                Create Accomplishment
              </Button>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Metric</TableCell>
                  <TableCell>Dates</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accomplishmentLinks.map((l) => {
                  const a = l.accomplishment_detail;
                  return (
                    <TableRow key={l.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {a?.title || l.accomplishment}
                      </TableCell>
                      <TableCell>{a?.impact_type || "—"}</TableCell>
                      <TableCell>{a?.metric || "—"}</TableCell>
                      <TableCell>
                        {a?.start_date || "—"} → {a?.end_date || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {accomplishmentLinks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography sx={{ py: 2 }}>No related accomplishments.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <DocumentsPanel targetType="PROJECT" targetId={projectId} />
        </TabPanel>
      </Paper>

      <LinkAssetToProjectDialog
        open={linkAssetDialogOpen}
        onClose={() => setLinkAssetDialogOpen(false)}
        projectId={projectId}
        excludeAssetIds={linkedAssetIds}
        onLinked={async () => {
          const al = await apiGet(`/api/project-asset-links/?project=${projectId}`);
          setAssetLinks(Array.isArray(al) ? al : al.results || []);
        }}
      />

      <EditProjectDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
        onUpdated={() => {
          setEditOpen(false);
          loadProjectDetail();
        }}
      />

      <CreateAccomplishmentDialog
        open={createAccomplishmentOpen}
        onClose={() => setCreateAccomplishmentOpen(false)}
        onCreated={async (created) => {
          if (!created) return;
          await apiPost("/api/accomplishment-project-links/", {
            accomplishment: created.id,
            project: projectId,
          });
          const apl = await apiGet(`/api/accomplishment-project-links/?project=${projectId}`);
          setAccomplishmentLinks(Array.isArray(apl) ? apl : apl.results || []);
        }}
      />

      <CreateProjectTaskDialog
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projectId={projectId}
        onCreated={() => {
          setCreateTaskOpen(false);
          loadTasks();
        }}
      />

      <EditProjectTaskDialog
        open={editTaskOpen}
        onClose={() => setEditTaskOpen(false)}
        task={selectedTask}
        onUpdated={() => {
          setEditTaskOpen(false);
          loadTasks();
        }}
      />

      <CreateProjectMilestoneDialog
        open={createMilestoneOpen}
        onClose={() => setCreateMilestoneOpen(false)}
        projectId={projectId}
        onCreated={() => {
          setCreateMilestoneOpen(false);
          loadMilestones();
        }}
      />

      <EditProjectMilestoneDialog
        open={editMilestoneOpen}
        onClose={() => setEditMilestoneOpen(false)}
        milestone={selectedMilestone}
        onUpdated={() => {
          setEditMilestoneOpen(false);
          loadMilestones();
        }}
      />
    </Stack>
  );
}
