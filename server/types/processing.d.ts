type OutputKey = Pick<OutputFormData, 'line' | 'shift' | 'spo' | 'prcs'>;

type MatchedTarget = {
  timestamp: Date;
  tanggal: Date;
  line: string;
  shift: Shift;
  spo: string;
  style: string;
  prcs: string[];
  parts: string[];
  mp: number;
  jk: number;
  leader: Leader['name'];
  operators: Operator['nip'][];
  target: number;
};

type Job = {
  tanggal: Date;
  shift: Shift;
  line: string;
  type: OutputType;
  spo: string;
  style: string;
  prcs: string;
  parts: string;
  size: string;
};

type JobBlock = { job: Job; rows: number[] };
