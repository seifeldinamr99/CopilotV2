import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Pencil, Plus } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

type TaskPriority = "Low" | "Medium" | "High";
type TaskWindow = "Daily" | "Weekly" | "Monthly";

type WorkTask = {
  id: string;
  title: string;
  priority: TaskPriority;
  window: TaskWindow;
  deadline: string;
  completed: boolean;
};

const priorityStyles: Record<TaskPriority, string> = {
  Low: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  Medium: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  High: "bg-rose-500/15 text-rose-200 border-rose-400/30",
};

export function WorkStationPage() {
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const accessToken = session?.access_token ?? null;
  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [window, setWindow] = useState<TaskWindow>("Daily");
  const [deadline, setDeadline] = useState("");
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [editing, setEditing] = useState<WorkTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<TaskWindow, WorkTask[]> = { Daily: [], Weekly: [], Monthly: [] };
    tasks.forEach((task) => map[task.window].push(task));
    return map;
  }, [tasks]);

  useEffect(() => {
    if (!accessToken) return;
    let canceled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/work-station/tasks`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          const details = await res.text();
          throw new Error(details || `Failed to load tasks (${res.status})`);
        }
        const data = await res.json();
        if (!canceled) setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      } catch (err) {
        if (!canceled) setError(err instanceof Error ? err.message : "Failed to load tasks.");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [accessToken, API_BASE]);

  const addTask = async () => {
    const trimmed = title.trim();
    if (!trimmed || !deadline || !accessToken) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/work-station/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: trimmed, priority, window, deadline }),
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Failed to create task (${res.status})`);
      }
      const data = await res.json();
      if (data.task) setTasks((prev) => [data.task, ...prev]);
      setTitle("");
      setPriority("Medium");
      setWindow("Daily");
      setDeadline("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
    }
  };

  const toggleTask = async (task: WorkTask) => {
    if (!accessToken) return;
    const nextCompleted = !task.completed;
    setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, completed: nextCompleted } : item)));
    try {
      const res = await fetch(`${API_BASE}/work-station/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: nextCompleted }),
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Failed to update task (${res.status})`);
      }
    } catch (err) {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, completed: task.completed } : item)));
      setError(err instanceof Error ? err.message : "Failed to update task.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Work Station</p>
          <h2 className="text-2xl font-semibold text-foreground">Plan tasks by priority and timeframe</h2>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-sky-400 to-sky-600 text-black hover:from-sky-300 hover:to-sky-500"
          onClick={() => navigate("/ai-chat")}
        >
          <MessageSquare className="h-4 w-4" /> Open AI Chat
        </Button>
      </div>

      <Card className="border border-white/5 bg-card/90">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
          <div>
            <label className="text-xs text-muted-foreground">Task</label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
              placeholder="e.g., Refresh top creatives for new offer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Priority</label>
            <select
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Window</label>
            <select
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
              value={window}
              onChange={(e) => setWindow(e.target.value as TaskWindow)}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Deadline</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                className="w-full bg-transparent text-sm text-foreground outline-none"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <Button className="gap-2" onClick={addTask} disabled={!title.trim() || !deadline}>
            <Plus className="h-4 w-4" /> Add task
          </Button>
        </div>
      </Card>

      {loading && (
        <Card className="border border-white/5 bg-card/90">
          <div className="py-6 text-center text-sm text-muted-foreground">Loading tasks...</div>
        </Card>
      )}
      {error && (
        <Card className="border border-white/5 bg-card/90">
          <div className="py-6 text-center text-sm text-red-300">{error}</div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {(["Daily", "Weekly", "Monthly"] as TaskWindow[]).map((slot) => (
          <Card key={slot} className="border border-white/5 bg-card/90">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{slot}</h3>
              <span className="text-xs text-muted-foreground">{grouped[slot].length} tasks</span>
            </div>
            <div className="mt-4 space-y-3">
              {grouped[slot].map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task)}
                  className={[
                    "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left transition",
                    task.completed ? "opacity-60" : "hover:border-white/20",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className={task.completed ? "text-sm line-through" : "text-sm font-medium"}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={`border ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditing(task);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDaysLeft(task.deadline)}</p>
                </button>
              ))}
              {grouped[slot].length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center text-xs text-muted-foreground">
                  No {slot.toLowerCase()} tasks yet.
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <EditTaskModal
          task={editing}
          onClose={() => setEditing(null)}
          onSave={async (next) => {
            if (!accessToken) return;
            setError(null);
            try {
              const res = await fetch(`${API_BASE}/work-station/tasks/${next.id}`, {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: next.title,
                  priority: next.priority,
                  window: next.window,
                  deadline: next.deadline,
                }),
              });
              if (!res.ok) {
                const details = await res.text();
                throw new Error(details || `Failed to update task (${res.status})`);
              }
              setTasks((prev) => prev.map((task) => (task.id === next.id ? next : task)));
              setEditing(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to update task.");
            }
          }}
        />
      )}
    </div>
  );
}

function EditTaskModal({
  task,
  onClose,
  onSave,
}: {
  task: WorkTask;
  onClose: () => void;
  onSave: (next: WorkTask) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [window, setWindow] = useState<TaskWindow>(task.window);
  const [deadline, setDeadline] = useState(task.deadline.slice(0, 10));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border border-white/10 bg-background/90 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Edit task</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">Update task details</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Task</label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Priority</label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Window</label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
                value={window}
                onChange={(e) => setWindow(e.target.value as TaskWindow)}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Deadline</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                className="w-full bg-transparent text-sm text-foreground outline-none"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                ...task,
                title: title.trim() || task.title,
                priority,
                window,
                deadline,
              })
            }
            disabled={!title.trim() || !deadline}
          >
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

function formatDaysLeft(deadline: string) {
  const today = new Date();
  const end = new Date(deadline);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDeadline = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffMs = endOfDeadline.getTime() - startOfToday.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Due today";
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  return `${days} day${days === 1 ? "" : "s"} left`;
}
