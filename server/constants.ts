const SPREADSHEET_CONFIG = {
  database: {
    spreadsheetId: '1AtRp3wCRilR-WYhpbL7MC2-thMHI2O-plKObyQB0p7A',
    sheetNames: {
      mechanic: 'Mekanik',
      member: 'Operator',
      target: 'Target',
      output: 'Output',
    },
  },
  inputOutput: {
    spreadsheetId: '1Z5k7RuMQa-zlJr8dk2eUQ5NlVlpkDJCtMAk5HPoJeJE',
    sheetNames: {
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
    spreadsheetId: '1ky7rSxy20KQJ3zcZw0mVY4qE48G6CKAjAbb3zybEmKk',
    sheetNames: {
      kanban: 'Kanban',
    },
  },
} as const satisfies Record<string, SpreadsheetConfig>;
