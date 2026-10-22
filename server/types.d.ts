type GasFunctions = import('../shared/contracts').GasFunctions;

type Leader = import('../shared/contracts').Leader;
type Operator = import('../shared/contracts').Operator;

type TargetFormData = import('../shared/contracts').TargetFormData;
type OutputFormData = import('../shared/contracts').OutputFormData;

type CellValue = string | number | boolean | Date;

type SpreadsheetConfig = {
  spreadsheetId: string;
  sheetNames: {
    [sheetName: string]: string;
  };
};
