function toCsvValue(value) {
  if (value === null || value === undefined) return "";
  let text = Array.isArray(value) ? value.join(", ") : String(value);
  text = text.replace(/\r?\n/g, " ");
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildCsv(columns, rows) {
  const header = columns.map((c) => toCsvValue(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => toCsvValue(c.value(row))).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCsv(filename, columns, rows) {
  const csv = buildCsv(columns, rows);
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}