import { useState } from "react";
import { useStore } from "../store/useStore";
import { X, Plus, Trash2, Pencil, Check } from "lucide-react";
import { UnitType } from "../types";

interface Props {
  onClose: () => void;
}

export default function Settings({ onClose }: Props) {
  const {
    settings,
    categories,
    presetColors,
    updateUnitType,
    updateThresholds,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useStore();

  const [thresholds, setThresholds] = useState(settings.thresholds);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(presetColors[0]);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatColor, setEditCatColor] = useState("");

  const handleThresholdSave = () => {
    updateThresholds(thresholds);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatColor);
    setNewCatName("");
    setNewCatColor(presetColors[0]);
  };

  const handleEditCatStart = (id: string, name: string, color: string) => {
    setEditingCatId(id);
    setEditCatName(name);
    setEditCatColor(color);
  };

  const handleEditCatSave = () => {
    if (!editingCatId || !editCatName.trim()) return;
    updateCategory(editingCatId, editCatName.trim(), editCatColor);
    setEditingCatId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">설정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 단위 설정 */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">기록 단위</h3>
          <div className="flex gap-2">
            {(["characters", "cuts"] as UnitType[]).map((unit) => (
              <button
                key={unit}
                onClick={() => updateUnitType(unit)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${settings.unitType === unit
                    ? "bg-purple-600 text-white border-purple-600"
                    : "text-gray-600 border-gray-200 hover:border-purple-400"
                  }`}
              >
                {unit === "characters" ? "글자수" : "컷수"}
              </button>
            ))}
          </div>
          {settings.unitChangedAt && (
            <p className="text-[11px] text-gray-400 mt-1">
              {settings.unitChangedAt} 이후부터 {settings.unitType === "characters" ? "글자수" : "컷수"} 기준으로 표시됩니다.
            </p>
          )}
        </section>

        {/* 잔디 색상 단계 설정 */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">잔디 색상 기준</h3>
          <div className="space-y-2">
            {[
              { key: "level1", label: "2단계", color: "bg-purple-200" },
              { key: "level2", label: "3단계", color: "bg-purple-400" },
              { key: "level3", label: "4단계", color: "bg-purple-600" },
              { key: "level4", label: "5단계", color: "bg-purple-800" },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-sm ${color} flex-shrink-0`} />
                <span className="text-sm text-gray-600 w-44">{label}</span>
                <input
                  type="number"
                  value={thresholds[key as keyof typeof thresholds]}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, [key]: parseInt(e.target.value) || 0 })
                  }
                  className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <span className="text-sm text-gray-400">이상</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleThresholdSave}
            className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg px-4 py-2"
          >
            저장
          </button>
        </section>

        {/* 카테고리 설정 */}
        <section>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            카테고리 ({categories.length}/20)
          </h3>

          {/* 카테고리 추가 */}
          {categories.length < 20 && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="카테고리 이름"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              {/* 색상 선택 */}
              <div className="flex gap-1 items-center">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    className={`w-5 h-5 rounded-full transition-transform ${newCatColor === color ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                onClick={handleAddCategory}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-2"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          {/* 카테고리 목록 */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {categories.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">카테고리가 없어요</p>
            )}
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                {editingCatId === cat.id ? (
                  <>
                    <input
                      type="text"
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <div className="flex gap-1">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditCatColor(color)}
                          className={`w-4 h-4 rounded-full ${editCatColor === color ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button onClick={handleEditCatSave} className="text-purple-600 hover:text-purple-800">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingCatId(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 text-sm text-gray-700">{cat.name}</span>
                    <button
                      onClick={() => handleEditCatStart(cat.id, cat.name, cat.color)}
                      className="text-gray-300 hover:text-purple-500"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-gray-300 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}