type CellValue = string | number | boolean | Date;

type SpreadsheetConfig = {
  spreadsheetId: string;
  sheetNames: {
    [sheetName: string]: string;
  };
};
