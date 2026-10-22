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
} as const satisfies Record<string, SpreadsheetConfig>;
