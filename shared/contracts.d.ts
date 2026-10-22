export type Machine = {
  name: string;
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

export type OutputFormData = {
  leader: Leader['nip'];
  operators: Operator['nip'][];
};

export type GasFunctions = {
  getMachines: () => Machine[];
  getMembers: () => { leaders: Leader[]; operators: Operator[] };
  addOutput: (formData: OutputFormData) => void;
};
