const GOALS_STORAGE_KEY = "meta-copilot.monthly-goals";

export type MonthlyGoalState = {
  monthKey: string;
  revenueGoal: number;
};

type StoredGoals = {
  selectedMonth?: string;
  goalsByMonth?: Record<string, { revenueGoal: number }>;
};

export function loadMonthlyGoals(defaultMonth: string): MonthlyGoalState {
  if (typeof window === "undefined") {
    return { monthKey: defaultMonth, revenueGoal: 0 };
  }
  try {
    const raw = window.localStorage.getItem(GOALS_STORAGE_KEY);
    if (!raw) return { monthKey: defaultMonth, revenueGoal: 0 };
    const parsed = JSON.parse(raw) as StoredGoals;
    const monthKey = parsed.selectedMonth ?? defaultMonth;
    const revenueGoal = parsed.goalsByMonth?.[monthKey]?.revenueGoal ?? 0;
    return { monthKey, revenueGoal };
  } catch {
    return { monthKey: defaultMonth, revenueGoal: 0 };
  }
}

export function saveMonthlyGoals(state: MonthlyGoalState) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(GOALS_STORAGE_KEY);
  let parsed: StoredGoals = {};
  try {
    parsed = raw ? (JSON.parse(raw) as StoredGoals) : {};
  } catch {
    parsed = {};
  }
  const goalsByMonth = parsed.goalsByMonth ?? {};
  goalsByMonth[state.monthKey] = { revenueGoal: state.revenueGoal };
  const payload: StoredGoals = {
    selectedMonth: state.monthKey,
    goalsByMonth,
  };
  window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(payload));
}
