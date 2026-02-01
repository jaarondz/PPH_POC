import * as React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiDelete, apiGet, apiPostForm } from "../api/client.js";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export default function DocumentsPanel({ targetType, targetId }) {
  const [docs, setDocs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [file, setFile] = React.useState(null);

  const loadDocs = React.useCallback(async () => {
    if (!targetId || !targetType) {
      setDocs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(
        `/api/documents/?target_type=${targetType}&target_id=${targetId}`
      );
      setDocs(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  React.useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  async function handleUpload() {
    if (!file || !title.trim()) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("target_type", targetType);
      form.append("target_id", targetId);
      form.append("file", file);

      await apiPostForm("/api/documents/", form);
      setTitle("");
      setDescription("");
      setFile(null);
      await loadDocs();
    } catch (e) {
      setError(e.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Upload document
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              disabled={uploading}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              disabled={uploading}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Button variant="outlined" component="label" disabled={uploading}>
              {file ? "Change file" : "Choose file"}
              <input
                type="file"
                hidden
                accept=".pdf,.docx,.xlsx,.csv,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              {file ? file.name : "No file selected"}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading || !file || !title.trim()}
            >
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider />

      {loading ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={18} />
          <Typography>Loading documents…</Typography>
        </Stack>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {docs.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{d.title}</TableCell>
                <TableCell>
                  {d.file_url ? (
                    <a href={d.file_url} target="_blank" rel="noreferrer">
                      {d.original_filename || "Download"}
                    </a>
                  ) : (
                    d.original_filename || "—"
                  )}
                </TableCell>
                <TableCell>{formatBytes(d.size_bytes)}</TableCell>
                <TableCell>{d.created_at?.slice(0, 10) || "—"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={async () => {
                      await apiDelete(`/api/documents/${d.id}/`);
                      await loadDocs();
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {docs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography sx={{ py: 2 }}>No documents yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}
