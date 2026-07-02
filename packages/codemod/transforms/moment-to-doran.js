'use strict';

/**
 * jscodeshift transform: moment / moment-jalaali → @doranjs/core.
 *
 * Handles the parity-table cases and reports (to jscodeshift stdout) anything it
 * cannot safely auto-convert, so nothing is silently dropped.
 *
 * Run via the bundled CLI: `npx doran-codemod src/**`
 * Or directly:           `npx jscodeshift -t moment-to-doran.js --parser tsx src/**`
 */

// moment-jalaali jalali tokens are `j`-prefixed; Doran's `format()` is jalali by
// default and uses the unprefixed tokens. Anything left is plain Gregorian.
const JALALI_TOKEN = /j(YYYY|YY|MMMM|MMM|MM|M|DD|D|gggg|GGGG)/;

function isJalaliFormat(str) {
  return JALALI_TOKEN.test(str);
}

function stripJalaliPrefix(str) {
  return str.replace(/j(gggg|GGGG)/g, 'YYYY').replace(/j(YYYY|YY|MMMM|MMM|MM|M|DD|D)/g, '$1');
}

module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const report = [];
  let usedDoran = false;

  // 1. Collect the local names that `moment` was imported / required as.
  const momentLocals = new Set();

  root.find(j.ImportDeclaration).forEach((p) => {
    const src = p.node.source.value;
    if (src !== 'moment' && src !== 'moment-jalaali') return;
    for (const s of p.node.specifiers) {
      if (s.type === 'ImportDefaultSpecifier' || s.type === 'ImportNamespaceSpecifier') {
        momentLocals.add(s.local.name);
      }
    }
  });

  root
    .find(j.VariableDeclarator, {
      init: { type: 'CallExpression', callee: { name: 'require' } },
    })
    .forEach((p) => {
      const arg = p.node.init.arguments[0];
      if (!arg || (arg.value !== 'moment' && arg.value !== 'moment-jalaali')) return;
      if (p.node.id.type === 'Identifier') momentLocals.add(p.node.id.name);
    });

  if (momentLocals.size === 0) return file.source; // nothing to do — leave untouched

  const isMomentCall = (node) =>
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    momentLocals.has(node.callee.name);

  // True when the receiver chain bottoms out at a `moment(...)` call.
  const chainRootsAtMoment = (node) => {
    let cur = node;
    while (cur) {
      if (cur.type === 'CallExpression') {
        if (isMomentCall(cur)) return true;
        cur = cur.callee;
      } else if (cur.type === 'MemberExpression') {
        cur = cur.object;
      } else {
        return false;
      }
    }
    return false;
  };

  const addReport = (loc, msg) => {
    report.push(`  • line ${loc ? loc.start.line : '?'}: ${msg}`);
  };

  // 2. `.utc().format(...)` → `.toISOString()` (Doran's ISO output is UTC).
  root
    .find(j.CallExpression, {
      callee: { type: 'MemberExpression', property: { name: 'format' } },
    })
    .filter(
      (p) =>
        p.node.callee.object.type === 'CallExpression' &&
        p.node.callee.object.callee.type === 'MemberExpression' &&
        p.node.callee.object.callee.property.name === 'utc' &&
        chainRootsAtMoment(p.node.callee.object),
    )
    .forEach((p) => {
      const beforeUtc = p.node.callee.object.callee.object; // receiver of `.utc()`
      j(p).replaceWith(
        j.callExpression(j.memberExpression(beforeUtc, j.identifier('toISOString')), []),
      );
    });

  // 3. `.format(...)` on a moment value → `.format()` (jalali) or `.formatGregorian()`.
  root
    .find(j.CallExpression, {
      callee: { type: 'MemberExpression', property: { name: 'format' } },
    })
    .filter((p) => chainRootsAtMoment(p.node.callee.object))
    .forEach((p) => {
      const args = p.node.arguments;
      if (args.length === 0) {
        // moment().format() with no pattern returns ISO-8601 → toISOString().
        p.node.callee.property = j.identifier('toISOString');
        return;
      }
      const arg = args[0];
      if (arg.type !== 'StringLiteral' && arg.type !== 'Literal') {
        addReport(
          p.node.loc,
          '`.format(<dynamic>)` — check the pattern manually (jalali vs Gregorian tokens differ).',
        );
        return;
      }
      const pattern = String(arg.value);
      if (isJalaliFormat(pattern)) {
        args[0] = j.stringLiteral(stripJalaliPrefix(pattern));
      } else {
        // Gregorian-only pattern → use the explicit Gregorian formatter.
        p.node.callee.property = j.identifier('formatGregorian');
      }
    });

  // 4. The `moment(...)` heads themselves.
  root
    .find(j.CallExpression)
    .filter((p) => isMomentCall(p.node))
    .forEach((p) => {
      const args = p.node.arguments;
      if (args.length === 0) {
        j(p).replaceWith(
          j.callExpression(j.memberExpression(j.identifier('DoranDate'), j.identifier('now')), []),
        );
        usedDoran = true;
      } else if (args.length === 1) {
        // moment(x) reads x as a Gregorian instant.
        j(p).replaceWith(
          j.callExpression(
            j.memberExpression(j.identifier('DoranDate'), j.identifier('fromGregorian')),
            [j.newExpression(j.identifier('Date'), [args[0]])],
          ),
        );
        usedDoran = true;
      } else {
        // moment(value, format) is a *jalali parse* — not a 1:1 instant. Flag it.
        addReport(
          p.node.loc,
          '`moment(value, format)` is a calendar parse — use `parseJalali(value, format)` or `parse(...)` from @doranjs/core.',
        );
      }
    });

  // 5. Static helpers we can't auto-convert.
  root
    .find(j.MemberExpression)
    .filter((p) => p.node.object.type === 'Identifier' && momentLocals.has(p.node.object.name))
    .forEach((p) => {
      const name = p.node.property.name;
      if (name === 'loadPersian') {
        // No equivalent — Doran is Persian-first. Drop the whole statement.
        const stmt = j(p).closest(j.ExpressionStatement);
        if (stmt.size()) stmt.remove();
      } else if (name === 'duration') {
        addReport(
          p.node.loc,
          '`moment.duration(...)` → use `Duration` / `durationToHuman` from @doranjs/core.',
        );
      }
    });

  // 6. Swap the import once we know Doran is used.
  if (usedDoran || report.length > 0) {
    let replacedImport = false;
    root.find(j.ImportDeclaration).forEach((p) => {
      const src = p.node.source.value;
      if (src !== 'moment' && src !== 'moment-jalaali') return;
      if (!replacedImport) {
        p.node.specifiers = [
          j.importSpecifier(j.identifier('DoranDate'), j.identifier('DoranDate')),
        ];
        p.node.source = j.stringLiteral('@doranjs/core');
        replacedImport = true;
      } else {
        j(p).remove();
      }
    });
    root
      .find(j.VariableDeclaration)
      .filter((p) =>
        p.node.declarations.some(
          (d) =>
            d.init &&
            d.init.type === 'CallExpression' &&
            d.init.callee.name === 'require' &&
            d.init.arguments[0] &&
            (d.init.arguments[0].value === 'moment' ||
              d.init.arguments[0].value === 'moment-jalaali'),
        ),
      )
      .forEach((p, i) => {
        if (i === 0 && !replacedImport) {
          p.node.declarations = [
            j.variableDeclarator(
              j.objectPattern([
                Object.assign(
                  j.objectProperty(j.identifier('DoranDate'), j.identifier('DoranDate')),
                  { shorthand: true },
                ),
              ]),
              j.callExpression(j.identifier('require'), [j.stringLiteral('@doranjs/core')]),
            ),
          ];
          replacedImport = true;
        } else {
          j(p).remove();
        }
      });
  }

  if (report.length > 0) {
    // Surfaced by jscodeshift's stdout so nothing converts silently.
    api.report(`\n${file.path}: needs manual review:\n${report.join('\n')}`);
  }

  return root.toSource({ quote: 'single' });
};
