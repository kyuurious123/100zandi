import { Store } from "@tauri-apps/plugin-store";
import { create } from "zustand";
import {
  AppSettings,
  AppStore,
  Category,
  DayData,
  TodoItem,
  UnitType,
  WritingEntry,
} from "../types";

const store = new Store("writing-tracker.json");

const DEFAULT_SETTINGS: AppSettings = {
  unitType: "characters",
  thresholds: {
    level1: 100,
    level2: 500,
    level3: 1000,
    level4: 5000,
  },
  unitChangedAt: null,
  previousUnitType: null,
};

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#000000",
];

interface StoreState extends AppStore {
  isLoaded: boolean;
  presetColors: string[];

  // 초기화
  loadStore: () => Promise<void>;
  saveStore: () => Promise<void>;

  // 설정
  updateUnitType: (unitType: UnitType) => void;
  updateThresholds: (thresholds: AppSettings["thresholds"]) => void;

  // 글자수/컷수
  addWritingEntry: (date: string, amount: number, memo: string) => void;
  updateWritingEntry: (date: string, entryId: string, amount: number, memo: string) => void;
  deleteWritingEntry: (date: string, entryId: string) => void;

  // 투두
  addTodo: (title: string, date: string, categoryId: string) => void;
  updateTodo: (id: string, updates: Partial<TodoItem>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;

  // 카테고리
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  isLoaded: false,
  presetColors: PRESET_COLORS,
  settings: DEFAULT_SETTINGS,
  writingData: {},
  todos: [],
  categories: [],

  loadStore: async () => {
  try {
    const settings = await store.get<AppSettings>("settings");
    const writingData = await store.get<Record<string, DayData>>("writingData");
    const todos = await store.get<TodoItem[]>("todos");
    const categories = await store.get<Category[]>("categories");

    set({
      settings: settings ?? DEFAULT_SETTINGS,
      writingData: writingData ?? {},
      todos: todos ?? [],
      categories: categories ?? [],
      isLoaded: true,
    });
  } catch (e) {
    console.error("loadStore error:", e);
    set({
      settings: DEFAULT_SETTINGS,
      writingData: {},
      todos: [],
      categories: [],
      isLoaded: true,
    });
  }
},

  saveStore: async () => {
    const { settings, writingData, todos, categories } = get();
    await store.set("settings", settings);
    await store.set("writingData", writingData);
    await store.set("todos", todos);
    await store.set("categories", categories);
    await store.save();
  },

  updateUnitType: (unitType) => {
    const { settings } = get();
    const today = new Date().toISOString().split("T")[0];
    set({
      settings: {
        ...settings,
        unitType,
        previousUnitType: settings.unitType,
        unitChangedAt: today,
      },
    });
    get().saveStore();
  },

  updateThresholds: (thresholds) => {
    const { settings } = get();
    set({ settings: { ...settings, thresholds } });
    get().saveStore();
  },

  addWritingEntry: (date, amount, memo) => {
    const { writingData } = get();
    const existing = writingData[date];
    const newEntry: WritingEntry = {
      id: crypto.randomUUID(),
      date,
      amount,
      memo: memo.slice(0, 20),
      createdAt: Date.now(),
    };
    const entries = existing ? [...existing.entries, newEntry] : [newEntry];
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    set({
      writingData: {
        ...writingData,
        [date]: { date, entries, total },
      },
    });
    get().saveStore();
  },

  updateWritingEntry: (date, entryId, amount, memo) => {
    const { writingData } = get();
    const existing = writingData[date];
    if (!existing) return;
    const entries = existing.entries.map((e) =>
      e.id === entryId ? { ...e, amount, memo: memo.slice(0, 20) } : e
    );
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    set({
      writingData: {
        ...writingData,
        [date]: { date, entries, total },
      },
    });
    get().saveStore();
  },

  deleteWritingEntry: (date, entryId) => {
    const { writingData } = get();
    const existing = writingData[date];
    if (!existing) return;
    const entries = existing.entries.filter((e) => e.id !== entryId);
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    set({
      writingData: {
        ...writingData,
        [date]: { date, entries, total },
      },
    });
    get().saveStore();
  },

  addTodo: (title, date, categoryId) => {
    const { todos } = get();
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      title,
      date,
      categoryId,
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
    };
    set({ todos: [...todos, newTodo] });
    get().saveStore();
  },

  updateTodo: (id, updates) => {
    const { todos } = get();
    set({ todos: todos.map((t) => (t.id === id ? { ...t, ...updates } : t)) });
    get().saveStore();
  },

  deleteTodo: (id) => {
    const { todos } = get();
    set({ todos: todos.filter((t) => t.id !== id) });
    get().saveStore();
  },

  toggleTodo: (id) => {
    const { todos } = get();
    const today = new Date().toISOString().split("T")[0];
    set({
      todos: todos.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? today : null,
            }
          : t
      ),
    });
    get().saveStore();
  },

  addCategory: (name, color) => {
    const { categories } = get();
    if (categories.length >= 20) return;
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      color,
    };
    set({ categories: [...categories, newCategory] });
    get().saveStore();
  },

  updateCategory: (id, name, color) => {
    const { categories } = get();
    set({
      categories: categories.map((c) =>
        c.id === id ? { ...c, name, color } : c
      ),
    });
    get().saveStore();
  },

  deleteCategory: (id) => {
    const { categories } = get();
    set({ categories: categories.filter((c) => c.id !== id) });
    get().saveStore();
  },
}));