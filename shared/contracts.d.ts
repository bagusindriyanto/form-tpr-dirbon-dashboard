export type LineGroup = {
  value: 'TPR' | 'Dirbon';
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

export type PIC = 'Produksi' | 'MT' | 'Trainer' | 'QC';

export type Problem = {
  id: number;
  timestamp: string;
  line: string;
  problem: string;
  pic: PIC;
  start: string;
  rowNumber: number;
};

export type StyleGroup = Record<string, Style>;

export type SizeGroup = Record<string, string[]>;

export type Style = {
  style: string;
  parts: Record<string, string>;
};

export type TargetFormData = {
  line: string;
  shift: '1' | '2';
  spo: string;
  style: string;
  prc: string;
  part: string;
  workingHour: number;
  leader: Leader['nip'];
  operators: Operator['nip'][];
  target: number;
};

export type OutputFormData = {
  line: string;
  shift: '1' | '2';
  type: 'SPO' | 'GR';
  spo: string;
  style: string;
  prc: string;
  part: string;
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

export type ProblemAction = 'Start' | 'Finish';

export type UpdateProblemData = {
  rowNumber: number;
  action: ProblemAction;
};

export type GasFunctions = {
  getLines: () => LineGroup[];
  getMembers: () => { leaders: Leader[]; operators: Operator[] };
  getStyles: () => StyleGroup;
  getSizes: () => SizeGroup;
  getProblems: () => Problem[];
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
