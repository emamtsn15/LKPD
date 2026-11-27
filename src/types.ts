export interface RubricItem {
  aspect: string;
  max: number;
  score: number;
  note: string;
}

export interface ErrorItem {
  part: string;
  current: string;
  explanation: string;
  fix: string;
}

export type TabStatus = 'TUNTAS' | 'REMEDIAL' | 'KOSONG' | 'EXCLUDED' | 'BELUM_DIKOREKSI';

export interface DocTabRecord {
  id: string;
  googleTabId?: string;
  tabName: string;
  excluded: boolean;
  exclusionReason?: string;
  studentIdentity: string;
  members: string[];
  score: number | null;
  predicate: string;
  status: TabStatus;
  studentAnswerSnippet: string;
  rubricBreakdown: RubricItem[];
  errorTable: ErrorItem[];
  teacherFeedback: string;
  recapNote: string;
  hasExistingMarker?: boolean;
  dirtyToDocs?: boolean;
}

export interface FolderWorkspace {
  id: string;
  folderName: string;
  docId: string;
  docTitle: string;
  docUrl: string;
  kkm: number;
  rubricSummary: string;
  nilaiTabId?: string;
  tabs: DocTabRecord[];
}

export interface FlattenedStudentRecord {
  folderId: string;
  folderName: string;
  docId: string;
  docTitle: string;
  studentName: string;
  tabName: string;
  score: number;
  predicate: string;
  status: string;
  isTuntas: boolean;
  recapNote: string;
}

export interface PendingConfirmation {
  title: string;
  description: string;
  items: string[];
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

export type AppView = 'dashboard' | 'recap' | 'drive' | 'appscript';
export type DataSourceMode = 'demo' | 'workspace';
