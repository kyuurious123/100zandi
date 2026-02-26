import { useEffect, useState } from "react";
import { useStore } from "./store/useStore";
import GrassGrid from "./components/GrassGrid";
import TodoList from "./components/TodoList";
import WritingModal from "./components/WritingModal";
import Settings from "./components/Settings";
import { format } from "date-fns";
import { Settings as SettingsIcon, Plus } from "lucide-react";

export default function App() {
  const { isLoaded, loadStore } = useStore();
  const [showWritingModal, setShowWritingModal] = useState(false);
  const [writingModalDate, setWritingModalDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadStore();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-purple-700">✍️ Writing Tracker</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setWritingModalDate(format(new Date(), "yyyy-MM-dd"));
              setShowWritingModal(true);
            }}
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg px-3 py-1.5"
          >
            <Plus size={14} />
            기록 추가
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-purple-600 p-1.5"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {/* 잔디 */}
        <GrassGrid />

        {/* 투두리스트 */}
        <TodoList />
      </div>

      {/* 모달들 */}
      {showWritingModal && (
        <WritingModal
          date={writingModalDate}
          onClose={() => setShowWritingModal(false)}
        />
      )}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}