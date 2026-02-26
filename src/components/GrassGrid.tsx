import { useState } from "react";
import { useStore } from "../store/useStore";
import { format, startOfWeek, eachDayOfInterval, subMonths, isSameDay } from "date-fns";

const LEVEL_COLORS = [
  "bg-gray-200",    // 0단계 - 0자
  "bg-purple-200",  // 1단계 - 1자 이상
  "bg-purple-400",  // 2단계 - level1 이상
  "bg-purple-600",  // 3단계 - level2 이상
  "bg-purple-800",  // 4단계 - level3 이상
  "bg-purple-900",  // 5단계 - level4 이상
];

function getLevel(total: number, thresholds: { level1: number; level2: number; level3: number; level4: number }) {
  if (total === 0) return 0;
  if (total < thresholds.level1) return 1;
  if (total < thresholds.level2) return 2;
  if (total < thresholds.level3) return 3;
  if (total < thresholds.level4) return 4;
  return 5;
}

interface TooltipData {
  date: string;
  total: number;
  entries: { amount: number; memo: string }[];
  x: number;
  y: number;
}

export default function GrassGrid() {
  const { writingData, settings } = useStore();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const today = new Date();
  const oneYearAgo = subMonths(today, 6);
  const startDate = startOfWeek(oneYearAgo, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: today });

  // 주(week) 단위로 그룹핑
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  days.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || idx === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const unitLabel = settings.unitType === "characters" ? "자" : "컷";

  const handleMouseEnter = (e: React.MouseEvent, day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayData = writingData[dateStr];
    if (!dayData || dayData.total === 0) {
      setTooltip({
        date: dateStr,
        total: 0,
        entries: [],
        x: e.clientX,
        y: e.clientY,
      });
      return;
    }
    setTooltip({
      date: dateStr,
      total: dayData.total,
      entries: dayData.entries.map((e) => ({ amount: e.amount, memo: e.memo })),
      x: e.clientX,
      y: e.clientY,
    });
  };

  const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 월 라벨 계산
  const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wIdx) => {
    const firstDay = week[0];
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
        monthLabels.push({
        label: format(firstDay, "MMM"),
        weekIndex: wIdx,
        });
        lastMonth = month;
    }
    });

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">

      <div className="flex">
        {/* 요일 라벨 */}
        <div className="flex flex-col justify-around mr-2 mt-5">
          {WEEKDAY_LABELS.map((d) => (
            <span key={d} className="text-[10px] text-gray-400 h-3 leading-3">
              {d}
            </span>
          ))}
        </div>

        <div className="flex flex-col overflow-hidden">
          {/* 월 라벨 */}
          <div className="flex mb-1">
            {weeks.map((_, wIdx) => {
              const label = monthLabels.find((m) => m.weekIndex === wIdx);
              return (
                <div key={wIdx} className="w-3 mr-0.5 text-[10px] text-gray-400">
                  {label ? label.label : ""}
                </div>
              );
            })}
          </div>

          {/* 잔디 셀 */}
          <div className="flex">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col mr-0.5">
                {week.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const total = writingData[dateStr]?.total ?? 0;
                  const level = getLevel(total, settings.thresholds);
                  const isToday = isSameDay(day, today);

                  return (
                    <div
                      key={dateStr}
                      className={`w-4 h-4 mb-0.5 rounded-sm cursor-pointer transition-opacity hover:opacity-80
                        ${LEVEL_COLORS[level]}
                        ${isToday ? "ring-1 ring-purple-500 ring-offset-1" : ""}
                        `}
                      onMouseEnter={(e) => handleMouseEnter(e, day)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[10px] text-gray-400">적음</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`w-4 h-4 rounded-sm ${LEVEL_COLORS[l]}`} />
        ))}
        <div className="w-4 h-4 rounded-sm bg-purple-900" />
        <span className="text-[10px] text-gray-400">많음</span>
      </div>

      {/* 툴팁 */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-2 pointer-events-none shadow-xl max-w-xs"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="font-semibold mb-1">{tooltip.date}</div>
          {tooltip.total === 0 ? (
            <div className="text-gray-400">기록 없음</div>
          ) : (
            <>
              <div className="font-bold text-purple-300">
                총 {tooltip.total.toLocaleString()}{unitLabel}
              </div>
              {tooltip.entries.map((e, i) => (
                <div key={i} className="text-gray-300">
                  {e.amount.toLocaleString()}{unitLabel}
                  {e.memo && <span className="text-gray-400"> · {e.memo}</span>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}