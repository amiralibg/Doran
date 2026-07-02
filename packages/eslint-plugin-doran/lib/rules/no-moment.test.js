'use strict';

const { RuleTester } = require('eslint');
const rule = require('./no-moment');

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

ruleTester.run('no-moment', rule, {
  valid: [
    "import { DoranDate } from '@doranjs/core';",
    'const d = DoranDate.now();',
    "import x from 'dayjs';",
    "const r = require('@doranjs/core');",
  ],
  invalid: [
    {
      code: "import moment from 'moment';",
      errors: [{ messageId: 'import' }],
    },
    {
      code: "import momentj from 'moment-jalaali';",
      errors: [{ messageId: 'import' }],
    },
    {
      code: "const m = require('moment-jalaali');",
      errors: [{ messageId: 'import' }],
    },
    {
      code: 'const d = moment();',
      errors: [{ messageId: 'call' }],
    },
    {
      code: "const d = momentj('1403/01/01', 'jYYYY/jMM/jDD');",
      errors: [{ messageId: 'call' }],
    },
    {
      // both the import and the call site are flagged
      code: "import moment from 'moment';\nmoment().format('YYYY');",
      errors: [{ messageId: 'import' }, { messageId: 'call' }],
    },
  ],
});
