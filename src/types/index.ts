// 단위 타입
export type UnitType = "characters" | "cuts";

// 글자수/컷수 입력 항목
export interface WritingEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  amount: number;
  memo: string; // 최대 20자
  createdAt: number;
}

// 하루치 데이터
export interface DayData {
  date: string; // "YYYY-MM-DD"
  entries: WritingEntry[];
  total: number;
}

// 잔디 색상 단계 설정
export interface ThresholdSettings {
  level1: number; // 기본 100
  level2: number; // 기본 500
  level3: number; // 기본 1000
  level4: number; // 기본 5000
}

// 카테고리
export interface Category {
  id: string;
  name: string;
  color: string; // 10개 프리셋 중 하나
}

// 투두 아이템
export interface TodoItem {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD" 필수
  categoryId: string;
  completed: boolean;
  completedAt: string | null; // "YYYY-MM-DD"
  createdAt: number;
}

// 앱 설정
export interface AppSettings {
  unitType: UnitType;
  thresholds: ThresholdSettings;
  unitChangedAt: string | null; // 단위 변경 시점 "YYYY-MM-DD"
  previousUnitType: UnitType | null;
}

// 전체 스토어 타입
export interface AppStore {
  settings: AppSettings;
  writingData: Record<string, DayData>; // key: "YYYY-MM-DD"
  todos: TodoItem[];
  categories: Category[];
}