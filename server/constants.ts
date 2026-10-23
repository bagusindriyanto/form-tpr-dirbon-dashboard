const SPREADSHEET_CONFIG = {
  database: {
    spreadsheetId: '1AtRp3wCRilR-WYhpbL7MC2-thMHI2O-plKObyQB0p7A',
    sheetNames: {
      mechanic: 'Mekanik',
      member: 'Operator',
      target: 'Target',
      output: 'Output',
      kanban: 'Kanban',
    },
  },
  inputOutput: {
    spreadsheetId: '1Z5k7RuMQa-zlJr8dk2eUQ5NlVlpkDJCtMAk5HPoJeJE',
    sheetNames: {
      spoAndPrc: 'Daftar SPOPRC',
    },
  },
} as const satisfies Record<string, SpreadsheetConfig>;
