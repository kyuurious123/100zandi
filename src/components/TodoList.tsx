import { useState } from "react";
import { useStore } from "../store/useStore";
import { format } from "date-fns";
import { Plus, Trash2, Pencil, Check, X, Calendar, List } from "lucide-react";
import { TodoItem } from "../types";

// DatePicker 컴포넌트
function DatePicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => value ? parseInt(value.split("-")[0]) : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => value ? parseInt(value.split("-")[1]) - 1 : new Date().getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const cells = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const handleSelect = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(dateStr);
    setOpen(false);
  };

  const displayValue = value
    ? `${value.split("-")[0]}년 ${parseInt(value.split("-")[1])}월 ${parseInt(value.split("-")[2])}일`
    : "날짜 선택";

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
      >
        {displayValue}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); }}
              className="text-gray-400 hover:text-purple-600 px-2 py-1 rounded"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              type="button"
              onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); }}
              className="text-gray-400 hover:text-purple-600 px-2 py-1 rounded"
            >
              ›
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d} className="text-center text-[10px] text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = dateStr === value;
              const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={`w-full aspect-square rounded-lg text-xs font-medium transition-colors
                    ${isSelected ? "bg-purple-600 text-white" : ""}
                    ${isToday && !isSelected ? "text-purple-600 font-bold" : ""}
                    ${!isSelected ? "hover:bg-purple-50 text-gray-700" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// CategorySelect 컴포넌트
function CategorySelect({ value, onChange, categories }: {
  value: string;
  onChange: (id: string) => void;
  categories: { id: string; name: string; color: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white flex items-center gap-2"
      >
        {selected ? (
          <>
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: selected.color }} />
            <span className="text-gray-700">{selected.name}</span>
          </>
        ) : (
          <span className="text-gray-400">카테고리 선택</span>
        )}
        <span className="ml-auto text-gray-300 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl w-full overflow-hidden">
          {categories.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-3">카테고리가 없어요</div>
          )}
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { onChange(cat.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-purple-50 transition-colors
                ${value === cat.id ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"}
              `}
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              {cat.name}
              {value === cat.id && <span className="ml-auto text-purple-500 text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type ViewMode = "list" | "calendar";

const MONTH_DAYS = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export default function TodoList() {
  const { todos, categories, addTodo, updateTodo, deleteTodo, toggleTodo } = useStore();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newCategoryId, setNewCategoryId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate || !newCategoryId) return;
    addTodo(newTitle.trim(), newDate, newCategoryId);
    setNewTitle("");
    setNewDate(format(new Date(), "yyyy-MM-dd"));
    setNewCategoryId("");
    setShowAddForm(false);
  };

  const handleEditStart = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDate(todo.date);
    setEditCategoryId(todo.categoryId);
  };

  const handleEditSave = () => {
    if (!editingId || !editTitle.trim() || !editDate || !editCategoryId) return;
    updateTodo(editingId, { title: editTitle.trim(), date: editDate, categoryId: editCategoryId });
    setEditingId(null);
  };

  // 리스트 뷰 정렬: 카테고리순 + 날짜순, 완료는 하단
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.categoryId !== b.categoryId) return a.categoryId.localeCompare(b.categoryId);
    return a.date.localeCompare(b.date);
  });

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  // 캘린더 뷰
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = MONTH_DAYS(calYear, calMonth);
  const calCells = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const todosForDay = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return todos.filter((t) => t.completed && t.completedAt === dateStr);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-600">투두리스트</h2>
        <div className="flex items-center gap-2">
          {/* 뷰 전환 */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-2 py-1 ${viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-2 py-1 ${viewMode === "calendar" ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <Calendar size={14} />
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-2 py-1"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* 추가 폼 */}
      {showAddForm && (
        <div className="bg-purple-50 rounded-xl p-3 mb-3 space-y-2">
          <input
            type="text"
            placeholder="투두 내용"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="flex gap-2">
            <DatePicker value={newDate} onChange={setNewDate} />
            <CategorySelect value={newCategoryId} onChange={setNewCategoryId} categories={categories} />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1"
            >
              취소
            </button>
            <button
              onClick={handleAdd}
              className="text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-1"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 리스트 뷰 */}
      {viewMode === "list" && (
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {sortedTodos.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">투두가 없어요</p>
          )}
          {sortedTodos.map((todo) => {
            const category = getCategoryById(todo.categoryId);
            return (
              <div
                key={todo.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${todo.completed ? "bg-gray-50 opacity-60" : "bg-white border border-gray-100"}`}
              >
                {/* 완료 체크 */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${todo.completed ? "bg-purple-600 border-purple-600" : "border-gray-300 hover:border-purple-400"}`}
                >
                  {todo.completed && <Check size={10} className="text-white" />}
                </button>

                {editingId === todo.id ? (
                  <div className="flex-1 flex gap-1">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 border border-gray-200 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <DatePicker value={newDate} onChange={setNewDate} />
                    <CategorySelect value={newCategoryId} onChange={setNewCategoryId} categories={categories} />
                    <button onClick={handleEditSave} className="text-purple-600 hover:text-purple-800">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {todo.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {category && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">{todo.date}</span>
                      </div>
                    </div>
                    <button onClick={() => handleEditStart(todo)} className="text-gray-300 hover:text-purple-500">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deleteTodo(todo.id)} className="text-gray-300 hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 캘린더 뷰 */}
      {viewMode === "calendar" && (
        <div>
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
              className="text-gray-400 hover:text-purple-600 px-2"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {calYear}년 {calMonth + 1}월
            </span>
            <button
              onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
              className="text-gray-400 hover:text-purple-600 px-2"
            >
              ›
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d} className="text-center text-[10px] text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div className="grid grid-cols-7 gap-0.5">
            {calCells.map((day, idx) => {
              if (!day) return <div key={idx} />;
              const completed = todosForDay(day);
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

              return (
                <div
                  key={idx}
                  className={`rounded-lg p-1 min-h-12 ${isToday ? "bg-purple-50 ring-1 ring-purple-300" : "hover:bg-gray-50"}`}
                >
                  <div className={`text-[11px] font-medium mb-0.5 ${isToday ? "text-purple-600" : "text-gray-600"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {completed.slice(0, 2).map((t) => {
                      const cat = getCategoryById(t.categoryId);
                      return (
                        <div
                          key={t.id}
                          className="text-[9px] text-white rounded px-1 truncate"
                          style={{ backgroundColor: cat?.color ?? "#8b5cf6" }}
                        >
                          {t.title}
                        </div>
                      );
                    })}
                    {completed.length > 2 && (
                      <div className="text-[9px] text-gray-400">+{completed.length - 2}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}