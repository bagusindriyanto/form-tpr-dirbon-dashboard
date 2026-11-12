const SPREADSHEET_CONFIG = {
  database: {
    spreadsheetId: '1zDjzPMYHqOkwnZ0EkQ1ovEzZOX51OBoiafNFm7ov_Mg',
    sheetNames: {
      member: 'Operator',
      target: 'Target',
      output: 'Output',
      spoAndSize: 'SPO dan Size',
    },
  },
  lkh: {
    spreadsheetId: '10wBmTIk7b81l_3ed-RFnuqMbnSXcGUqKIiOV0K_S87I',
    sheetNames: {
      dirbon: '[Trial] OUTPUT DIRBON/JAM',
      tpr: '[Trial] Output TPR/Jam',
      spoAndPrc: 'Daftar SPOPRC',
    },
  },
  tprDirbon: {
    spreadsheetId: '1t7IGaII6O-uvGXXZImQE8gxnXgXq2i0flef4YPuLxo8',
    sheetNames: {
      kanban: 'Kanban',
    },
  },
} as const satisfies Record<string, SpreadsheetConfig>;

const LKH_SHEETS = {
  dirbon: {
    startRow: 4,
    helperCol: 54,
    outputBase: 19,
    sizeCol: 18,
    createBlocks: (sheet, target, jobs, config) =>
      createJobBlocksDirbon(sheet, target, jobs, config),
  },
  tpr: {
    startRow: 3,
    helperCol: 42,
    outputBase: 18,
    sizeCol: 17,
    createBlocks: (sheet, target, jobs, config) =>
      createJobBlocksTPR(sheet, target, jobs, config),
  },
} as const satisfies Record<Division, LKHConfig>;
