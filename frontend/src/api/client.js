const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token");
}

export async function apiGet(path) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function apiPost(path, body) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const dataText = await res.text();
  const data = dataText ? JSON.parse(dataText) : null;

  if (!res.ok) {
    throw new Error(`POST ${path} failed (${res.status}): ${data?.detail || dataText}`);
  }
  return data;
}

export async function apiDelete(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${path} failed (${res.status}): ${text}`);
  }
  return true;
}

export async function apiPatch(path, body) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const dataText = await res.text();
  const data = dataText ? JSON.parse(dataText) : null;

  if (!res.ok) {
    throw new Error(`PATCH ${path} failed (${res.status}): ${data?.detail || dataText}`);
  }
  return data;
}
