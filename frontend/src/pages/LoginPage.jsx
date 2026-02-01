import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Stack, TextField, Typography, Button, Alert } from "@mui/material";
import { apiPost } from "../api/client.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiPost("/api/auth/login/", { username, password });
      localStorage.setItem("token", data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 420 }}>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <Typography variant="h5">Sign in</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained">Login</Button>
        </Stack>
      </form>
    </Paper>
  );
}
