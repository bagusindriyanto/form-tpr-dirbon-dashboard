type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type TPR = `T${Digit}${Digit}`;
export type Dirbon = `D${Digit}${Digit}`;

export type LineGroup = {
  value: 'TPR' | 'Dirbon';
  items: (TPR | Dirbon)[];
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
  line: TPR | Dirbon;
  leader: Leader['nip'];
  operators: Operator['nip'][];
};

export type GasFunctions = {
  getLines: () => LineGroup[];
  getMembers: () => { leaders: Leader[]; operators: Operator[] };
  addTarget: (formData: TargetFormData) => void;
};
