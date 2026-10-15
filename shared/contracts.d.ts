export type Machine = {
  name: string;
};

export type MachineInput = {
  name: string;
};

export type GasFunctions = {
  getMachines: () => Machine[];
};
