export type PIC = 'Produksi' | 'MT' | 'Trainer' | 'QC';
export type Shift = '1' | '2';
export type OutputType = 'SPO' | 'GR';
export type Section = 'TPR' | 'Dirbon';
export type ProblemAction = 'Start' | 'Finish';

export type LineGroup = {
  value: Section;
  items: string[];
};

export type Leader = {
  name: string;
  nip: string;
  division: string;
  section: string;
  job: string;
};

export type Operator = {
  name: string;
  nip: string;
  division: string;
  section: string;
  job: string;
};

export type Problem = {
  id: number;
  timestamp: string;
  line: string;
  problem: string;
  pic: PIC;
  start: string;
  rowNumber: number;
};

export type Target = {
  createdAt: string;
  date: string;
  line: string;
  shift: Shift;
  spo: string;
  style: string;
  prcs: string[];
  parts: string[];
  manPower: number;
  workingHour: number;
  leader: Leader['nip'];
  operators: Operator['nip'][];
  target: number;
  rowNumber: number;
};

export type StyleGroup = Record<string, Style>;

export type SizeGroup = Record<string, string[]>;

export type Style = {
  style: string;
  parts: Record<string, string>;
};

export type TargetFormData = Omit<
  Target,
  'createdAt' | 'date' | 'manPower' | 'rowNumber'
>;

export type OutputFormData = {
  line: string;
  shift: Shift;
  type: OutputType;
  spo: string;
  style: string;
  prcs: string[];
  parts: string[];
  size: string;
  hour: number;
  actual: number;
  repair?: number;
  reject?: number;
};

export type ProblemFormData = {
  line: string;
  problem: string;
  pic: PIC;
};

export type UpdateProblemData = {
  rowNumber: number;
  action: ProblemAction;
};

export type TargetEditableField =
  | 'line'
  | 'shift'
  | 'spo'
  | 'prcs'
  | 'workingHour'
  | 'leader'
  | 'operators'
  | 'target';

export type TargetCellChange = {
  rowNumber: number;
  field: TargetEditableField;
  /**
   * `string[]` untuk kolom PRC dan operator. Nilai tetap dikirim sebagai
   * data sederhana karena melewati google.script.run.
   */
  value: string | number | string[];
};

export type UpdateTargetData = {
  changes: TargetCellChange[];
};

export type GasFunctions = {
  getLines: () => LineGroup[];
  getMembers: () => { leaders: Leader[]; operators: Operator[] };
  getStyles: () => StyleGroup;
  getSizes: () => SizeGroup;
  getProblems: () => Problem[];
  getTargets: () => Target[];
  updateTarget: (
    data: UpdateTargetData,
  ) => { updated: number } | Promise<{ updated: number }>;
  addTarget: (formData: TargetFormData) => void;
  addOutput: (formData: OutputFormData) => void;
  addProblem: (formData: ProblemFormData) => void;
  updateProblem: ({
    rowNumber,
    action,
  }: {
    rowNumber: number;
    action: ProblemAction;
  }) => void;
};
