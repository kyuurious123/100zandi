import { useState } from "react";
import { useStore } from "../store/useStore";
import { X, Plus, Trash2, Pencil, Check } from "lucide-react";

interface Props {
  date: string;
  onClose: () => void;
}

export default function WritingModal({ date, onClose }: Props) {
  const { writingData, settings, addWritingEntry, updateWritingEntry, deleteWritingEntry } = useStore();
  const dayData = writingData[date];
  const entries = dayData?.entries ?? [];
  const total = dayData?.total ?? 0;

  const unitLabel = settings.unitType === "characters" ? "자" : "컷";

  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const handleAdd = () => {
    const num = parseInt(amount);
    if (isNaN(num) || num <= 0) return;
    addWritingEntry(date, num, memo);
    setAmount("");
    setMemo("");
  };

  const handleEditStart = (id: string, a: number, m: string) => {
    setEditingId(id);
    setEditAmount(String(a));
    setEditMemo(m);
  };

  const handleEditSave = () => {
    if (!editingId) return;
    const num = parseInt(editAmount);
    if (isNaN(num) || num <= 0) return;
    updateWritingEntry(date, editingId, num, editMemo);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{date}</h2>
            <p className="text-sm text-purple-600 font-semibold">
              총 {total.toLocaleString()}{unitLabel}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            placeholder={`${unitLabel} 수`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <input
            type="text"
            placeholder="메모 (20자 이내)"
            value={memo}
            onChange={(e) => setMemo(e.target.value.slice(0, 20))}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-2"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* 입력 내역 */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {entries.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">아직 기록이 없어요</p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              {editingId === entry.id ? (
                <>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-24 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <input
                    type="text"
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value.slice(0, 20))}
                    className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    onClick={handleEditSave}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <Check size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="font-semibold text-sm text-gray-800 w-24">
                    {entry.amount.toLocaleString()}{unitLabel}
                  </span>
                  <span className="flex-1 text-sm text-gray-500">{entry.memo}</span>
                  <button
                    onClick={() => handleEditStart(entry.id, entry.amount, entry.memo)}
                    className="text-gray-400 hover:text-purple-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteWritingEntry(date, entry.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}