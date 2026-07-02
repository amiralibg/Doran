'use strict';

const jscodeshift = require('jscodeshift');
const transform = require('./moment-to-doran');

function run(source) {
  const reports = [];
  const j = jscodeshift.withParser('tsx');
  const out = transform(
    { source, path: 'sample.ts' },
    { jscodeshift: j, j, stats: () => {}, report: (m) => reports.push(m) },
    {},
  );
  return { out, reports };
}

describe('moment-to-doran codemod', () => {
  it('leaves files without moment untouched', () => {
    const src = `const x = dayjs();\n`;
    expect(run(src).out).toBe(src);
  });

  it('rewrites the import', () => {
    const { out } = run(`import moment from 'moment-jalaali';\nmoment();\n`);
    expect(out).toContain("import { DoranDate } from '@doranjs/core'");
    expect(out).not.toContain('moment-jalaali');
  });

  it('maps moment() and moment(x)', () => {
    const { out } = run(
      `import moment from 'moment';\nconst a = moment();\nconst b = moment(input);\n`,
    );
    expect(out).toContain('DoranDate.now()');
    expect(out).toContain('DoranDate.fromGregorian(new Date(input))');
  });

  it('strips the j-prefix on jalali format patterns', () => {
    const { out } = run(
      `import moment from 'moment-jalaali';\nmoment(x).format('jYYYY/jMM/jDD');\n`,
    );
    expect(out).toContain(".format('YYYY/MM/DD')");
  });

  it('routes Gregorian-only patterns to formatGregorian', () => {
    const { out } = run(`import moment from 'moment';\nmoment(x).format('YYYY-MM-DD');\n`);
    expect(out).toContain(".formatGregorian('YYYY-MM-DD')");
  });

  it('maps .utc().format() and bare .format() to toISOString()', () => {
    const { out } = run(
      `import moment from 'moment';\nmoment(x).utc().format();\nmoment(y).format();\n`,
    );
    expect(out.match(/toISOString\(\)/g)?.length).toBe(2);
    expect(out).not.toContain('.utc()');
  });

  it('leaves 1:1 methods working on the rewritten head', () => {
    const { out } = run(`import moment from 'moment';\nmoment(a).isBefore(moment(b));\n`);
    expect(out).toContain('DoranDate.fromGregorian(new Date(a)).isBefore');
    expect(out).toContain('DoranDate.fromGregorian(new Date(b))');
  });

  it('reports a calendar parse it cannot auto-convert', () => {
    const { reports } = run(
      `import moment from 'moment-jalaali';\nmoment('1403/01/01', 'jYYYY/jMM/jDD');\n`,
    );
    expect(reports.join('\n')).toMatch(/calendar parse/);
  });

  it('drops moment.loadPersian()', () => {
    const { out } = run(`import moment from 'moment-jalaali';\nmoment.loadPersian();\nmoment();\n`);
    expect(out).not.toContain('loadPersian');
  });
});
