import * as React from "react";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function columnStyle(width) {
  return {
    flex: `0 0 ${width}`,
    padding: "0 12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
}

export function GanttTaskListHeader({ headerHeight, rowWidth, fontFamily, fontSize }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: headerHeight,
        width: rowWidth,
        fontFamily,
        fontSize,
        fontWeight: 600,
        borderBottom: "1px solid rgba(148,163,184,0.35)",
        boxSizing: "border-box",
      }}
    >
      <div style={columnStyle("50%")}>Task</div>
      <div style={columnStyle("25%")}>Start</div>
      <div style={columnStyle("25%")}>End</div>
    </div>
  );
}

export function GanttTaskListTable({
  rowHeight,
  rowWidth,
  fontFamily,
  fontSize,
  tasks,
  selectedTaskId,
  setSelectedTask,
  onRowClick,
}) {
  return (
    <div style={{ width: rowWidth, fontFamily, fontSize }}>
      {tasks.map((task) => {
        const isSelected = task.id === selectedTaskId;
        return (
          <div
            key={task.id}
            onClick={() => {
              setSelectedTask?.(task.id);
              onRowClick?.(task);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              height: rowHeight,
              cursor: "pointer",
              background: isSelected ? "rgba(14, 116, 144, 0.12)" : "transparent",
              borderBottom: "1px solid rgba(148,163,184,0.15)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                ...columnStyle("50%"),
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: 1.2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              title={task.name}
            >
              {task.name}
            </div>
            <div style={columnStyle("25%")}>{formatDate(task.start)}</div>
            <div style={columnStyle("25%")}>{formatDate(task.end)}</div>
          </div>
        );
      })}
    </div>
  );
}
