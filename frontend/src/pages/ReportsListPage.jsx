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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { apiGet } from "../api/client.js";
import CreateReportDialog from "../components/CreateReportDialog.jsx";
import EditReportDialog from "../components/EditReportDialog.jsx";
import { downloadCsv } from "../utils/csv.js";

const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_DEVELOPMENT: "In Development",
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  RETIRED: "Retired",
};

function containsIgnoreCase(value, query) {
  if (!query) return true;
  if (!value) return false;
  return String(value).toLowerCase().includes(query.toLowerCase());
}

function formatUser(user) {
  if (!user) return "";
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return fullName || user.username || user.email || "";
}

function ownerLabel(userDetail, legacyValue) {
  return formatUser(userDetail) || legacyValue || "—";
}

export default function ReportsListPage() {
  const navigate = useNavigate();

  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const loadReports = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/reports/");
      const rows = Array.isArray(data) ? data : data.results || [];
      setReports(rows);
    } catch (e) {
      setError(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filtered = React.useMemo(() => {
    return reports.filter((r) => {
      const businessOwner = ownerLabel(r.business_owner_user_detail, r.business_owner);
      const technicalOwner = ownerLabel(r.technical_owner_user_detail, r.technical_owner);
      const developer = ownerLabel(r.developer_user_detail, r.developer);
      const matchesSearch =
        containsIgnoreCase(r.name, search) ||
        containsIgnoreCase(r.description, search) ||
        containsIgnoreCase(businessOwner, search) ||
        containsIgnoreCase(technicalOwner, search) ||
        containsIgnoreCase(developer, search);

      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const handleExport = React.useCallback(() => {
    const columns = [
      { label: "Name", value: (r) => r.name },
      { label: "Status", value: (r) => STATUS_LABELS[r.status] || r.status || "" },
      {
        label: "Business Owner",
        value: (r) => ownerLabel(r.business_owner_user_detail, r.business_owner),
      },
      {
        label: "Technical Owner",
        value: (r) => ownerLabel(r.technical_owner_user_detail, r.technical_owner),
      },
      {
        label: "Developer",
        value: (r) => ownerLabel(r.developer_user_detail, r.developer),
      },
      { label: "Automation", value: (r) => r.automation || "" },
      { label: "Report Type", value: (r) => r.report_type || "" },
      { label: "Delivery Method", value: (r) => r.delivery_method || "" },
      { label: "Refresh Frequency", value: (r) => r.refresh_frequency || "" },
    ];
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`reports-${date}.csv`, columns, filtered);
  }, [filtered]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Reports
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleExport} disabled={filtered.length === 0}>
            Export CSV
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Add Report
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
          <Typography>Loading reports…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Business Owner</TableCell>
                <TableCell>Technical Owner</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/reports/${r.id}`)}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                  <TableCell>{STATUS_LABELS[r.status] || r.status}</TableCell>
                  <TableCell>
                    {ownerLabel(r.business_owner_user_detail, r.business_owner)}
                  </TableCell>
                  <TableCell>
                    {ownerLabel(r.technical_owner_user_detail, r.technical_owner)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(r);
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
                  <TableCell colSpan={5}>
                    <Typography sx={{ py: 2 }}>No reports match your filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !error && (
        <Typography variant="body2" color="text.secondary">
          Showing {filtered.length} of {reports.length} reports
        </Typography>
      )}

      <CreateReportDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          if (created) loadReports();
        }}
      />

      <EditReportDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        report={selectedReport}
        onUpdated={() => {
          setEditOpen(false);
          loadReports();
        }}
      />
    </Stack>
  );
}
