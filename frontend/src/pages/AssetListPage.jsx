import * as React from "react";
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
import { useNavigate } from "react-router-dom";
import CreateAssetDialog from "../components/CreateAssetDialog.jsx";
import EditIcon from "@mui/icons-material/Edit";
import EditAssetDialog from "../components/EditAssetDialog.jsx";
import { downloadCsv } from "../utils/csv.js";

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

export default function AssetListPage() {
  const [assets, setAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState(null);

  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const loadAssets = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/assets/");
      const rows = Array.isArray(data) ? data : data.results || [];
      setAssets(rows);
    } catch (e) {
      setError(e.message || "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filtered = React.useMemo(() => {
    return assets.filter((a) => {
      const businessOwner = ownerLabel(a.business_owner_user_detail, a.business_owner);
      const technicalOwner = ownerLabel(a.technical_owner_user_detail, a.technical_owner);
      const matchesSearch =
        containsIgnoreCase(a.name, search) ||
        containsIgnoreCase(a.description, search) ||
        containsIgnoreCase(businessOwner, search) ||
        containsIgnoreCase(technicalOwner, search);

      const matchesType = typeFilter === "ALL" || a.asset_type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, search, typeFilter, statusFilter]);

  const handleExport = React.useCallback(() => {
    const columns = [
      { label: "Name", value: (a) => a.name },
      { label: "Acronym", value: (a) => a.acronym || "" },
      { label: "Scope", value: (a) => SCOPE_LABELS[a.scope] || a.scope || "" },
      { label: "Type", value: (a) => ASSET_TYPE_LABELS[a.asset_type] || a.asset_type || "" },
      { label: "Status", value: (a) => STATUS_LABELS[a.status] || a.status || "" },
      {
        label: "Business Owner",
        value: (a) => ownerLabel(a.business_owner_user_detail, a.business_owner),
      },
      {
        label: "Technical Owner",
        value: (a) => ownerLabel(a.technical_owner_user_detail, a.technical_owner),
      },
      { label: "Criticality", value: (a) => a.criticality || "" },
    ];
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`assets-${date}.csv`, columns, filtered);
  }, [filtered]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Assets
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleExport} disabled={filtered.length === 0}>
            Export CSV
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Add Asset
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
              {Object.keys(ASSET_TYPE_LABELS).map((key) => (
                <MenuItem key={key} value={key}>
                  {ASSET_TYPE_LABELS[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }}>
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
          <Typography>Loading assets…</Typography>
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Acronym</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Business Owner</TableCell>
                <TableCell>Technical Owner</TableCell>
                <TableCell>Criticality</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((a) => (
                <TableRow
                  key={a.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/assets/${a.id}`)}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{a.name}</TableCell>

                  <TableCell>{a.acronym || "—"}</TableCell>

                  <TableCell>{SCOPE_LABELS[a.scope] || a.scope || "—"}</TableCell>
              
                  <TableCell>
                    <Chip
                      size="small"
                      label={ASSET_TYPE_LABELS[a.asset_type] || a.asset_type}
                    />
                  </TableCell>
              
                  <TableCell>{STATUS_LABELS[a.status] || a.status}</TableCell>
                  <TableCell>
                    {ownerLabel(a.business_owner_user_detail, a.business_owner)}
                  </TableCell>
                  <TableCell>
                    {ownerLabel(a.technical_owner_user_detail, a.technical_owner)}
                  </TableCell>
                  <TableCell>{a.criticality || "—"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(a);
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
                  <TableCell colSpan={9}>
                    <Typography sx={{ py: 2 }}>
                      No assets match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !error && (
        <Typography variant="body2" color="text.secondary">
          Showing {filtered.length} of {assets.length} assets
        </Typography>
      )}

      <CreateAssetDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          if (created) loadAssets();
        }}
      />

      <EditAssetDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        asset={selectedAsset}
        onUpdated={() => {
          setEditOpen(false);
          loadAssets();
        }}
      />
    </Stack>
  );
}
