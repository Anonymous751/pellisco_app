import { useState, useEffect, useMemo } from "react";
import { ShieldCheck, History, AlertTriangle, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { getAdminAllUsers, updateUserAccountStatus, updateUserRole } from "../auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Box } from "@mui/material";
/* =========================
    APIs
  ========================= */
const fetchLogs = async () => {
  const { data } = await axios.get("/api/v1/logs");
  return data.logs;
};

const fetchSystemLogs = async ({ queryKey }) => {
  const [, type, page] = queryKey;
  const { data } = await axios.get(
    `/api/v1/system/logs?type=${type || ""}&page=${page}&limit=10`
  );
  return data;
};

const fetchSystemHealth = async () => {
  const { data } = await axios.get("/api/v1/system/health");
  return data;
};

/* =========================
    COMPONENT
  ========================= */
const ASecurity = () => {
  const queryClient = useQueryClient();

  const [openPermissions, setOpenPermissions] = useState(false);
  const dispatch = useDispatch();
  const [updatedUsers, setUpdatedUsers] = useState({});

  const { users = [], loading: usersLoading } = useSelector(
    (state) => state.auth // ✅ FIX HERE
  );

  // EXISTING
  const [page, setPage] = useState(1);
  const limit = 10;

  // SYSTEM
  const [systemType, setSystemType] = useState("");
  const [systemPage, setSystemPage] = useState(1);

  useEffect(() => {
    if (openPermissions) {
      dispatch(getAdminAllUsers({ page: 1, limit: 50 }));
    }
  }, [openPermissions, dispatch]);

  // 🔥 LIVE STREAM STATE
  const [liveLogs, setLiveLogs] = useState([]);

  /* =========================
      QUERIES
    ========================= */
  const {
    data: auditLogs = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["adminLogs"],
    queryFn: fetchLogs,
  });

  const { data: systemLogsData } = useQuery({
    queryKey: ["systemLogs", systemType, systemPage],
    queryFn: fetchSystemLogs,
    refetchInterval: 3000, // 🔥 live polling
  });

  const { data: systemHealth } = useQuery({
    queryKey: ["systemHealth"],
    queryFn: fetchSystemHealth,
    refetchInterval: 5000,
  });

  /* =========================
      SOCKET (ACTIVITY ONLY)
    ========================= */
  useEffect(() => {
    const socket = io("http://localhost:1551", {
      withCredentials: true,
    });

    socket.on("new-log", (newLog) => {
      queryClient.setQueryData(["adminLogs"], (old = []) => [newLog, ...old]);
    });

    return () => socket.disconnect();
  }, [queryClient]);

  /* =========================
      🔥 LIVE STREAM MERGE
    ========================= */
  useEffect(() => {
    if (!systemLogsData?.logs) return;

    setLiveLogs((prev) => {
      const merged = [...systemLogsData.logs, ...prev];

      // remove duplicates
      const unique = Array.from(
        new Map(merged.map((l) => [l._id, l])).values()
      );

      // keep last 20 (sliding window)
      return unique.slice(0, 20);
    });
  }, [systemLogsData]);

  const handleSaveChanges = () => {
  Object.entries(updatedUsers).forEach(([id, role]) => {
    dispatch(updateUserRole({ id, role }));
  });

  setUpdatedUsers({});
  setOpenPermissions(false);
};
  /* =========================
      HELPERS
    ========================= */
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getBadgeColor = (action) => {
    if (action.includes("LOGIN")) return "text-blue-500";
    if (action.includes("ORDER")) return "text-emerald-500";
    if (action.includes("FAILED")) return "text-red-500";
    return "text-primary";
  };

  /* =========================
      PAGINATION (UNCHANGED)
    ========================= */
  const totalPages = Math.ceil(auditLogs.length / limit);
  const paginatedLogs = auditLogs.slice((page - 1) * limit, page * limit);

  console.log("USERS FROM REDUX:", users);

  /* =========================
      📊 SUMMARY (REAL)
    ========================= */
  const summary = useMemo(() => {
    if (!liveLogs.length) return null;

    const total = systemLogsData?.total || 0;
    const slow = liveLogs.filter((l) => l.type === "slow").length;
    const error = liveLogs.filter((l) => l.type === "error").length;

    const avg =
      liveLogs.reduce((a, l) => a + l.responseTime, 0) / liveLogs.length;

    return {
      total,
      slow,
      error,
      avg: avg.toFixed(1),
    };
  }, [liveLogs, systemLogsData]);

  /* =========================
      📊 LINE CHART (LIVE)
    ========================= */
  const chartData = useMemo(() => {
    return [...liveLogs].reverse().map((log) => ({
      time: log.responseTime,
      label: new Date(log.createdAt).toLocaleTimeString(),
    }));
  }, [liveLogs]);

  /* =========================
      📊 API BREAKDOWN
    ========================= */
  const apiStats = useMemo(() => {
    if (!liveLogs.length) return [];

    const map = {};

    liveLogs.forEach((log) => {
      if (!map[log.url]) {
        map[log.url] = { total: 0, count: 0 };
      }
      map[log.url].total += log.responseTime;
      map[log.url].count++;
    });

    return Object.entries(map).map(([url, val]) => ({
      name: url.split("/").pop(),
      avg: (val.total / val.count).toFixed(0),
    }));
  }, [liveLogs]);

  /* =========================
      🚨 ALERT SYSTEM
    ========================= */
  const latest = liveLogs[0];

  const alert =
    latest?.responseTime > 1000
      ? "🚨 Critical latency (>1000ms)"
      : latest?.responseTime > 700
      ? "⚠️ High latency (>700ms)"
      : null;

  return (
    <div className="space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Security & System Monitoring
          </h1>
          <p className="text-xs text-mutedGreen">Live performance dashboard</p>
        </div>

        <button
          onClick={refetch}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card label="Total" value={summary.total} />
          <Card label="Slow" value={summary.slow} warn />
          <Card label="Error" value={summary.error} danger />
          <Card label="Avg (ms)" value={summary.avg} />
        </div>
      )}

      {/* ALERT */}
      {alert && (
        <div className="p-3 bg-red-100 text-red-600 text-xs rounded-xl">
          {alert}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* EXISTING TABLE (UNCHANGED) */}
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-5 border-b flex items-center gap-2">
              <History size={18} />
              <h3 className="font-bold text-sm">Activity Logs</h3>
            </div>

            {!isLoading && auditLogs.length > 0 && (
              <>
                <table className="w-full text-xs">
                  <thead className="bg-lightGray">
                    <tr>
                      <th className="px-4 py-3">Action</th>
                      <th>User</th>
                      <th>Date</th>
                      <th className="text-right px-4">IP</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedLogs.map((log) => (
                      <tr key={log._id} className="border-t">
                        <td className="px-4 py-3">
                          <span className={getBadgeColor(log.action)}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.user?.name || "System"}</td>
                        <td>{formatDate(log.createdAt)}</td>
                        <td className="text-right px-4">
                          {log.ipAddress || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* LIVE LINE CHART */}
          <div className="bg-white p-5 rounded-2xl border">
            <h3 className="text-sm font-bold mb-4">Live Response Time</h3>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="label" hide />
                <YAxis />
                <Tooltip />
                <Line dataKey="time" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* API BREAKDOWN */}
          <div className="bg-white p-5 rounded-2xl border">
            <h3 className="text-sm font-bold mb-4">API Performance</h3>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={apiStats}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* SYSTEM HEALTH */}
          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-bold text-sm mb-4">System Health</h3>

            {systemHealth && (
              <div className="space-y-2 text-xs">
                <Row label="Status" value={systemHealth.status} />
                <Row label="Uptime" value={systemHealth.uptime} />
                <Row label="DB" value={systemHealth.dbTime} />
                <Row label="CPU" value={systemHealth.cpuLoad} />
                <Row label="Memory" value={systemHealth.memory} />
              </div>
            )}
          </div>

          <div className="bg-primary text-white p-6 rounded-2xl">
            <ShieldCheck size={18} />
            <button
              onClick={() => {
                setOpenPermissions(true);
              }}
              className="w-full mt-3 py-2 bg-secondary rounded-xl text-xs cursor-pointer"
            >
              Manage Permissions
            </button>
          </div>

          <div className="p-4 border border-red-200 rounded-2xl bg-red-50">
            <AlertTriangle size={16} />
            <button className="text-red-500 text-xs mt-2">
              Lock All Sessions
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={openPermissions}
        onClose={() => setOpenPermissions(false)}
        disableAutoFocus
        disableEnforceFocus
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999">
          {/* MODAL CARD */}
          <div className="w-720px max-h-[85vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold tracking-tight">
                Manage Permissions
              </h2>

              <button
                onClick={() => setOpenPermissions(false)}
                className="text-gray-400 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6 overflow-y-auto space-y-3">
              {usersLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-gray-500">No users found</p>
              ) : (
                users.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:shadow-sm transition"
                  >
                    {/* USER INFO */}
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>

                    {/* ROLE DROPDOWN */}
                    <select className="cursor-pointer"
                      value={updatedUsers[u._id] || u.role}
                      onChange={(e) => {
                        const newRole = e.target.value;

                        setUpdatedUsers((prev) => ({
                          ...prev,
                          [u._id]: newRole,
                        }));
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setOpenPermissions(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Card = ({ label, value, warn, danger }) => (
  <div className="p-4 border rounded-xl text-xs">
    <p>{label}</p>
    <p
      className={`font-bold text-lg ${
        danger ? "text-red-500" : warn ? "text-yellow-500" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default ASecurity;
