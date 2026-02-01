import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
} from "@mui/material";
import { apiGet } from "../api/client.js";

const ASSET_TYPE_LABELS = {
  APPLICATION: "Application",
};

const REPORT_STATUS_LABELS = {
  PLANNED: "Planned",
  IN_DEVELOPMENT: "In Development",
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  RETIRED: "Retired",
};

const PROJECT_STATUS_LABELS = {
  INTAKE: "Intake",
  PLANNED: "Planned",
  ACTIVE: "Active",
  BLOCKED: "Blocked",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

function safeRows(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function byUpdatedDesc(a, b) {
  // updated_at is ISO string; string compare works for ISO 8601, but we’ll be safe:
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function isWithinNext24Hours(dateStr) {
  if (!dateStr) return false;
  const now = new Date();
  const end = new Date(`${dateStr}T23:59:59`);
  if (Number.isNaN(end.getTime())) return false;
  const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return end >= now && end <= cutoff;
}

function isRecent(iso, days = 30) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}

function formatStatus(value) {
  if (!value) return "";
  return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function HomePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [recentApps, setRecentApps] = React.useState([]);
  const [recentReports, setRecentReports] = React.useState([]);
  const [recentProjects, setRecentProjects] = React.useState([]);
  const [myTaskCount, setMyTaskCount] = React.useState(0);
  const [dueSoonCount, setDueSoonCount] = React.useState(0);
  const [recentAccomplishmentCount, setRecentAccomplishmentCount] = React.useState(0);
  const [overdueCount, setOverdueCount] = React.useState(0);
  const [blockedProjectCount, setBlockedProjectCount] = React.useState(0);
  const [calendarDays, setCalendarDays] = React.useState([]);

  React.useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // POC-simple: pull full lists, then take top N by updated_at.
        // Later optimization: add backend ordering/limit params or a dashboard endpoint.
        const [meData, tasksData, accomplishmentsData, assetsData, projectsData, reportsData] =
          await Promise.all([
            apiGet("/api/auth/me/"),
            apiGet("/api/project-tasks/"),
            apiGet("/api/accomplishments/"),
            apiGet("/api/assets/?mine=1"),
            apiGet("/api/projects/?mine=1"),
            apiGet("/api/reports/?mine=1"),
          ]);

        const meId = meData?.id;
        const tasks = safeRows(tasksData);
        const myTasks = meId ? tasks.filter((t) => t.assigned_to === meId) : tasks;
        const dueSoonTasks = myTasks.filter((t) => isWithinNext24Hours(t.end_date));
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const overdueTasks = myTasks.filter((t) => {
          if (!t.end_date) return false;
          const end = new Date(`${t.end_date}T23:59:59`);
          if (Number.isNaN(end.getTime())) return false;
          return end < startOfToday && t.status !== "DONE";
        });
        const blockedProjects = safeRows(projectsData).filter(
          (p) => p.status === "BLOCKED"
        );
        const calendarWindow = Array.from({ length: 7 }, (_, idx) => {
          const d = new Date(startOfToday);
          d.setDate(d.getDate() + idx);
          const key = d.toISOString().slice(0, 10);
          return {
            key,
            date: d,
            label: d.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            tasks: myTasks.filter((t) => t.end_date === key),
          };
        });
        const recentAccomplishments = safeRows(accomplishmentsData).filter((a) =>
          isRecent(a.updated_at)
        );

        const assets = safeRows(assetsData).filter((a) =>
          ["APPLICATION"].includes(a.asset_type)
        );

        const apps = assets
          .filter((a) => a.asset_type === "APPLICATION")
          .sort(byUpdatedDesc)
          .slice(0, 5);

        const reports = safeRows(reportsData).sort(byUpdatedDesc).slice(0, 5);

        const projects = safeRows(projectsData).sort(byUpdatedDesc).slice(0, 5);

        if (!isMounted) return;

        setRecentApps(apps);
        setRecentReports(reports);
        setRecentProjects(projects);
        setMyTaskCount(myTasks.length);
        setDueSoonCount(dueSoonTasks.length);
        setRecentAccomplishmentCount(recentAccomplishments.length);
        setOverdueCount(overdueTasks.length);
        setBlockedProjectCount(blockedProjects.length);
        setCalendarDays(calendarWindow);
      } catch (e) {
        if (isMounted) setError(e.message || "Failed to load dashboard data");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="stretch"
      >
        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              My Tasks
            </Typography>
            <Typography variant="h4">
              {loading ? "—" : myTaskCount}
            </Typography>
            <Typography color="text.secondary">
              Total tasks assigned to you
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              Due Soon
            </Typography>
            <Typography variant="h4">
              {loading ? "—" : dueSoonCount}
            </Typography>
            <Typography color="text.secondary">
              Tasks due in the next 24 hours
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              Recent Accomplishments
            </Typography>
            <Typography variant="h4">
              {loading ? "—" : recentAccomplishmentCount}
            </Typography>
            <Typography color="text.secondary">
              Updated in the last 30 days
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              Overdue Tasks
            </Typography>
            <Typography variant="h4" color={overdueCount ? "error.main" : "text.primary"}>
              {loading ? "—" : overdueCount}
            </Typography>
            <Typography color="text.secondary">
              Past due and not done
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              Blocked Projects
            </Typography>
            <Typography variant="h4" color={blockedProjectCount ? "warning.main" : "text.primary"}>
              {loading ? "—" : blockedProjectCount}
            </Typography>
            <Typography color="text.secondary">
              Projects currently blocked
            </Typography>
          </Stack>
        </Paper>
      </Stack>

      {!loading && !error && (
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="h6">Next 7 Days</Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(7, 1fr)",
                },
                gap: 1.5,
              }}
            >
              {calendarDays.map((day) => (
                <Paper key={day.key} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {day.label}
                    </Typography>
                    {day.tasks.length === 0 ? (
                      <Typography color="text.secondary" variant="caption">
                        No due tasks
                      </Typography>
                    ) : (
                      day.tasks.map((task, index) => (
                        <Paper
                          key={task.id}
                          variant="outlined"
                          onClick={() => navigate(`/projects/${task.project}`)}
                          sx={{
                            p: 1,
                            cursor: "pointer",
                            borderLeft: "4px solid",
                            borderLeftColor: "primary.main",
                            bgcolor: "background.paper",
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip size="small" label={`#${index + 1}`} />
                              <Typography sx={{ fontWeight: 600 }}>
                                {task.description}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="caption" color="text.secondary">
                                {task.project_detail?.name || "Project"}
                              </Typography>
                              {task.status ? (
                                <Chip size="small" label={formatStatus(task.status)} />
                              ) : null}
                            </Stack>
                          </Stack>
                        </Paper>
                      ))
                    )}
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Stack>
        </Paper>
      )}

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading dashboard…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="stretch"
        >
          {/* Recent Applications */}
          <Paper sx={{ p: 2, flex: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Recently Updated Applications</Typography>
                <Button size="small" onClick={() => navigate("/reports")}>
                  View all
                </Button>
              </Stack>

              <List dense disablePadding>
                {recentApps.map((a) => (
                  <ListItemButton
                    key={a.id}
                    onClick={() => navigate(`/assets/${a.id}`)}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography sx={{ fontWeight: 600 }}>{a.name}</Typography>
                          <Chip size="small" label={ASSET_TYPE_LABELS[a.asset_type]} />
                          {a.status ? <Chip size="small" label={a.status} /> : null}
                        </Stack>
                      }
                      secondary={`Updated: ${formatDate(a.updated_at)}`}
                    />
                  </ListItemButton>
                ))}

                {recentApps.length === 0 && (
                  <Box sx={{ py: 1 }}>
                    <Typography color="text.secondary">No applications found.</Typography>
                  </Box>
                )}
              </List>
            </Stack>
          </Paper>

          {/* Recent Reports */}
          <Paper sx={{ p: 2, flex: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Recently Updated Reports</Typography>
                <Button size="small" onClick={() => navigate("/assets")}>
                  View all
                </Button>
              </Stack>

              <List dense disablePadding>
                {recentReports.map((r) => (
                  <ListItemButton
                    key={r.id}
                    onClick={() => navigate(`/reports/${r.id}`)}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography sx={{ fontWeight: 600 }}>{r.name}</Typography>
                          {r.status ? (
                            <Chip
                              size="small"
                              label={REPORT_STATUS_LABELS[r.status] || r.status}
                            />
                          ) : null}
                        </Stack>
                      }
                      secondary={`Updated: ${formatDate(r.updated_at)}`}
                    />
                  </ListItemButton>
                ))}

                {recentReports.length === 0 && (
                  <Box sx={{ py: 1 }}>
                    <Typography color="text.secondary">No reports found.</Typography>
                  </Box>
                )}
              </List>
            </Stack>
          </Paper>

          {/* Recent Projects */}
          <Paper sx={{ p: 2, flex: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Recently Updated Projects</Typography>
                <Button size="small" onClick={() => navigate("/projects")}>
                  View all
                </Button>
              </Stack>

              <List dense disablePadding>
                {recentProjects.map((p) => (
                  <ListItemButton
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography sx={{ fontWeight: 600 }}>{p.name}</Typography>
                          {p.status ? (
                            <Chip size="small" label={PROJECT_STATUS_LABELS[p.status] || p.status} />
                          ) : null}
                          {p.priority ? <Chip size="small" label={p.priority} /> : null}
                        </Stack>
                      }
                      secondary={`Updated: ${formatDate(p.updated_at)}`}
                    />
                  </ListItemButton>
                ))}

                {recentProjects.length === 0 && (
                  <Box sx={{ py: 1 }}>
                    <Typography color="text.secondary">No projects found.</Typography>
                  </Box>
                )}
              </List>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}
