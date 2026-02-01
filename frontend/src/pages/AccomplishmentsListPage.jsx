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
import CreateAccomplishmentDialog from "../components/CreateAccomplishmentDialog.jsx";
import EditAccomplishmentDialog from "../components/EditAccomplishmentDialog.jsx";
import { downloadCsv } from "../utils/csv.js";

const IMPACT_LABELS = {
  RISK: "Risk Reduction",
  COST: "Cost Savings / Avoidance",
  SPEED: "Speed / Throughput",
  QUALITY: "Quality / Reliability",
  CUSTOMER: "Customer Experience",
};

function containsIgnoreCase(value, query) {
  if (!query) return true;
  if (!value) return false;
  return String(value).toLowerCase().includes(query.toLowerCase());
}

export default function AccomplishmentsListPage() {
  const navigate = useNavigate();
  const [accomplishments, setAccomplishments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [selectedAccomplishment, setSelectedAccomplishment] = React.useState(null);

  const [search, setSearch] = React.useState("");
  const [impactFilter, setImpactFilter] = React.useState("ALL");

  const loadAccomplishments = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/accomplishments/");
      const rows = Array.isArray(data) ? data : data.results || [];
      setAccomplishments(rows);
    } catch (e) {
      setError(e.message || "Failed to load accomplishments");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAccomplishments();
  }, [loadAccomplishments]);

  const filtered = React.useMemo(() => {
    return accomplishments.filter((a) => {
      const matchesSearch =
        containsIgnoreCase(a.title, search) ||
        containsIgnoreCase(a.narrative, search) ||
        containsIgnoreCase(a.metric, search) ||
        containsIgnoreCase(a.evidence_urls, search);

      const matchesImpact = impactFilter === "ALL" || a.impact_type === impactFilter;

      return matchesSearch && matchesImpact;
    });
  }, [accomplishments, search, impactFilter]);

  const handleExport = React.useCallback(() => {
    const columns = [
      { label: "Title", value: (a) => a.title },
      { label: "Impact", value: (a) => IMPACT_LABELS[a.impact_type] || a.impact_type || "" },
      { label: "Metric", value: (a) => a.metric || "" },
      { label: "Start Date", value: (a) => a.start_date || "" },
      { label: "End Date", value: (a) => a.end_date || "" },
    ];
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`accomplishments-${date}.csv`, columns, filtered);
  }, [filtered]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Accomplishments
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleExport} disabled={filtered.length === 0}>
            Export CSV
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Add Accomplishment
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
            <InputLabel>Impact</InputLabel>
            <Select
              value={impactFilter}
              label="Impact"
              onChange={(e) => setImpactFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              {Object.keys(IMPACT_LABELS).map((key) => (
                <MenuItem key={key} value={key}>
                  {IMPACT_LABELS[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading accomplishments…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  <TableCell key="title">Title</TableCell>,
                  <TableCell key="impact">Impact</TableCell>,
                  <TableCell key="metric">Metric</TableCell>,
                  <TableCell key="dates">Dates</TableCell>,
                  <TableCell key="actions" align="right">
                    Actions
                  </TableCell>,
                ]}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((a) => (
                <TableRow
                  key={a.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/accomplishments/${a.id}`)}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{a.title}</TableCell>
                  <TableCell>{IMPACT_LABELS[a.impact_type] || a.impact_type || "—"}</TableCell>
                  <TableCell>{a.metric || "—"}</TableCell>
                  <TableCell>
                    {(a.start_date || "—") + " → " + (a.end_date || "—")}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAccomplishment(a);
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
                    <Typography sx={{ py: 2 }}>No accomplishments match your filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !error && (
        <Typography variant="body2" color="text.secondary">
          Showing {filtered.length} of {accomplishments.length} accomplishments
        </Typography>
      )}

      <CreateAccomplishmentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          if (created) loadAccomplishments();
        }}
      />

      <EditAccomplishmentDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        accomplishment={selectedAccomplishment}
        onUpdated={() => {
          setEditOpen(false);
          loadAccomplishments();
        }}
      />
    </Stack>
  );
}
