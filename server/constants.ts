const SPREADSHEET_CONFIG = {
  database: {
    spreadsheetId: '1zDjzPMYHqOkwnZ0EkQ1ovEzZOX51OBoiafNFm7ov_Mg',
    sheetNames: {
      member: 'Operator',
      target: 'Target',
      output: 'Output',
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
  chk10: {
    spreadsheetId: '1e7SrnbLRkfS5cMu3XoCrvb1yTzhI17onhQXknhw-e_0',
    sheetNames: {
      spoAndSize: 'SPO dan Size',
    },
  },
  tprDirbon: {
    spreadsheetId: '1t7IGaII6O-uvGXXZImQE8gxnXgXq2i0flef4YPuLxo8',
    sheetNames: {
      kanban: 'Kanban',
    },
  },
} as const satisfies Record<string, SpreadsheetConfig>;
