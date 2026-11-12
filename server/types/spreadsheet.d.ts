type CellValue = string | number | boolean | Date;

type SpreadsheetConfig = {
  spreadsheetId: string;
  sheetNames: {
    [sheetName: string]: string;
  };
};

type LKHConfig = {
  startRow: number;
  helperCol: number;
  outputBase: number;
  sizeCol: number;
  createBlocks: (
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    target: MatchedTarget,
    jobs: Job[],
    config: LKHConfig,
  ) => void;
};
