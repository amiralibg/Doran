'use strict';

const MOMENT_SOURCES = new Set(['moment', 'moment-jalaali']);
const MOMENT_FACTORIES = new Set(['moment', 'momentj']);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow moment / moment-jalaali in favor of @doranjs/core (DoranDate).',
      url: 'https://github.com/amiralibg/Doran/tree/main/packages/eslint-plugin-doran',
    },
    schema: [],
    messages: {
      import:
        "Avoid '{{source}}'. Use '@doranjs/core' (DoranDate). Run `npx doran-codemod` to migrate.",
      call: 'Avoid moment(). Use DoranDate from @doranjs/core — DoranDate.now() / DoranDate.fromGregorian(new Date(x)). Run `npx doran-codemod` to migrate.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (MOMENT_SOURCES.has(node.source.value)) {
          context.report({
            node: node.source,
            messageId: 'import',
            data: { source: node.source.value },
          });
        }
      },
      CallExpression(node) {
        const callee = node.callee;
        // require('moment') / require('moment-jalaali')
        if (
          callee.type === 'Identifier' &&
          callee.name === 'require' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          MOMENT_SOURCES.has(node.arguments[0].value)
        ) {
          context.report({
            node: node.arguments[0],
            messageId: 'import',
            data: { source: node.arguments[0].value },
          });
          return;
        }
        // moment(...) / momentj(...)
        if (callee.type === 'Identifier' && MOMENT_FACTORIES.has(callee.name)) {
          context.report({ node, messageId: 'call' });
        }
      },
    };
  },
};
