export type Machine = {
  name: string;
};

export type Operator = {
  name: string;
  nip: string;
  division: string;
  section: string;
  job: string;
};

export type OutputFormData = {
  operators: Operator['nip'][];
};

export type GasFunctions = {
  getMachines: () => Machine[];
  getOperators: () => Operator[];
  addOutput: (formData: OutputFormData) => void;
};
