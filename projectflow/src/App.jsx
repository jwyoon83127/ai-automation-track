import { useState, useEffect } from "react";
import { initialData, PERMISSIONS } from "./constants";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TaskList from "./components/TaskList";
import TaskDetail from "./components/TaskDetail";
import AddTaskModal from "./components/AddTaskModal";
import AddTeamModal from "./components/AddTeamModal";
import SettingsPage from "./components/SettingsPage";
import CalendarPage from "./components/CalendarPage";
import GanttPage from "./components/GanttPage";
import AgentPage from "./components/AgentPage";
import DashboardPage from "./components/DashboardPage";

const LS_KEY = "projectflow-data";

function loadData() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return initialData;
}

export default function App() {
  const [data, setData]               = useState(loadData);
  const [view, setView]               = useState("dashboard");
  const [selTeam, setSelTeam]         = useState("전체");
  const [stFilter, setStFilter]       = useState("전체");
  const [selTask, setSelTask]         = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch]           = useState("");

  // Persist data to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  const currentUser = data.users.find(u => u.id === data.currentUserId) || data.users[0];
  const perms = PERMISSIONS[currentUser.role];

  // Improved search: title + assignee + description + tags
  const filtered = data.tasks.filter(t => {
    const q = search.toLowerCase();
    return (
      (selTeam === "전체" || t.teamId === selTeam) &&
      (stFilter === "전체" || t.status === stFilter) &&
      (!q ||
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      )
    );
  });

  const getStats = (tid) => {
    const ts = tid === "전체" ? data.tasks : data.tasks.filter(t => t.teamId === tid);
    return {
      total:      ts.length,
      done:       ts.filter(t => t.status === "완료").length,
      inProgress: ts.filter(t => t.status === "진행중").length,
      waiting:    ts.filter(t => t.status === "대기").length,
    };
  };

  const doAddTask = (task) => {
    setData(d => ({ ...d, tasks: [...d.tasks, task] }));
  };

  const doAddTeam = (team) => {
    setData(d => ({ ...d, teams: [...d.teams, team] }));
  };

  const doUpdateStatus = (tid, status) => {
    if (!perms.editTask) return;
    const progress = status === "완료" ? 100 : status === "대기" ? 0 : undefined;
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t =>
        t.id === tid ? { ...t, status, ...(progress !== undefined ? { progress } : {}) } : t
      ),
    }));
  };

  const doUpdateProgress = (tid, progress) => {
    if (!perms.editTask) return;
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === tid ? { ...t, progress: Number(progress) } : t),
    }));
  };

  const doDeleteTask = (tid) => {
    if (!perms.deleteTask) return;
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== tid) }));
    setSelTask(null);
  };

  // Subtask status toggle
  const doUpdateSubtask = (taskId, subId, newStatus) => {
    if (!perms.editTask) return;
    const newProgress = newStatus === "완료" ? 100 : 0;
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubs = (t.subtasks || []).map(s =>
          s.id === subId ? { ...s, status: newStatus, progress: newProgress } : s
        );
        // Auto-update parent task progress based on subtasks
        const doneCount = updatedSubs.filter(s => s.status === "완료").length;
        const autoProgress = updatedSubs.length ? Math.round((doneCount / updatedSubs.length) * 100) : t.progress;
        return { ...t, subtasks: updatedSubs, progress: autoProgress };
      }),
    }));
  };

  // Sync selTask with latest data
  const liveTask = selTask ? data.tasks.find(t => t.id === selTask.id) || null : null;

  return (
    <div style={{ fontFamily: "'Noto Sans KR',sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b", display: "flex", flexDirection: "column" }}>
      <Header
        currentUser={currentUser}
        search={search}
        setSearch={setSearch}
        onSettings={() => setShowSettings(true)}
        onAddTask={() => setShowAddTask(true)}
        view={view}
        setView={setView}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 56px)" }}>
        <Sidebar
          data={data}
          setData={setData}
          currentUser={currentUser}
          selTeam={selTeam}
          setSelTeam={setSelTeam}
          stFilter={stFilter}
          setStFilter={setStFilter}
          onAddTeam={() => setShowAddTeam(true)}
        />

        {view === "dashboard" && (
          <DashboardPage
            tasks={data.tasks}
            teams={data.teams}
            onSelectTask={setSelTask}
          />
        )}
        {view === "tasks" && (
          <TaskList
            tasks={filtered}
            teams={data.teams}
            stats={getStats(selTeam)}
            onSelectTask={setSelTask}
          />
        )}
        {view === "calendar" && (
          <CalendarPage
            tasks={data.tasks}
            teams={data.teams}
            onSelectTask={setSelTask}
          />
        )}
        {view === "gantt" && (
          <GanttPage
            tasks={data.tasks}
            teams={data.teams}
            onSelectTask={setSelTask}
          />
        )}
        {view === "agent" && (
          <AgentPage
            tasks={data.tasks}
            teams={data.teams}
          />
        )}
      </div>

      {showSettings && (
        <SettingsPage
          data={data}
          setData={setData}
          currentUser={currentUser}
          onClose={() => setShowSettings(false)}
        />
      )}

      {liveTask && (
        <TaskDetail
          task={liveTask}
          teams={data.teams}
          currentUser={currentUser}
          onClose={() => setSelTask(null)}
          onUpdateStatus={doUpdateStatus}
          onUpdateProgress={doUpdateProgress}
          onDelete={doDeleteTask}
          onUpdateSubtask={doUpdateSubtask}
        />
      )}

      {showAddTask && perms.addTask && (
        <AddTaskModal
          teams={data.teams}
          onAdd={doAddTask}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {showAddTeam && perms.addTeam && (
        <AddTeamModal
          onAdd={doAddTeam}
          onClose={() => setShowAddTeam(false)}
        />
      )}
    </div>
  );
}
