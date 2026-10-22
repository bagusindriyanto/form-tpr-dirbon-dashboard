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

export type TargetFormData = {
  line: string;
  workingHour: number;
  leader: Leader['nip'];
  operators: Operator['nip'][];
  target: number;
};

export type OutputFormData = {
  line: string;
  shift: '1' | '2';
  type: 'SPO' | 'GR';
  spo?: string;
  style: string;
  prc: string;
  size: string;
  hour: number;
  actual: number;
  repair: number;
  reject: number;
};

export type GasFunctions = {
  getLines: () => LineGroup[];
  getMembers: () => { leaders: Leader[]; operators: Operator[] };
  addTarget: (formData: TargetFormData) => void;
  addOutput: (formData: OutputFormData) => void;
};
