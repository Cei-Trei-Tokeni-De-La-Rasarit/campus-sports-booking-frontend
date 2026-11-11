// Regulile de stil pentru frontend, conform paginii „Coding style frontend”
// din Confluence (Google JavaScript Style Guide + convențiile pentru React).
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// Componentele de tip clasă nu sunt permise, doar componente funcționale.
// Prinde `class X extends Component` și `class X extends React.PureComponent`.
const CLASS_COMPONENT_SELECTOR = [
  'ClassDeclaration[superClass.name=/^(Pure)?Component$/]',
  'ClassExpression[superClass.name=/^(Pure)?Component$/]',
  'ClassDeclaration[superClass.property.name=/^(Pure)?Component$/]',
  'ClassExpression[superClass.property.name=/^(Pure)?Component$/]',
].join(', ');
const CLASS_COMPONENT_MESSAGE =
  'Componentele sunt funcționale, cu hook-uri; nu se folosesc clase.';

export default [
  {ignores: ['dist/', 'node_modules/', 'coverage/']},

  // Regulile recomandate pentru JavaScript, React și hook-uri.
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,

  // Dezactivează regulile care s-ar bate cu Prettier (formatarea e a lui).
  // Stă înaintea regulilor noastre, ca să nu le suprascrie (de ex. curly).
  prettier,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {...globals.browser},
      parserOptions: {ecmaFeatures: {jsx: true}},
    },
    settings: {react: {version: '19'}},
    rules: {
      // Reguli de cod din Google JavaScript Style Guide.
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      camelcase: ['error', {properties: 'never'}],
      'new-cap': 'error',
      'no-console': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],

      // Convențiile pentru React.
      'react/prop-types': 'off',
      'react/jsx-pascal-case': 'error',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: CLASS_COMPONENT_SELECTOR,
          message: CLASS_COMPONENT_MESSAGE,
        },
      ],

      // Doar exporturi cu nume (export function FacilityList()).
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
          },
        },
      ],
    },
  },

  // Componentele și paginile nu apelează fetch direct, ci funcțiile din api/.
  {
    files: ['src/components/**/*.{js,jsx}', 'src/pages/**/*.{js,jsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Cererile către backend se fac prin funcțiile din src/api/.',
        },
      ],
    },
  },

  // Funcțiile exportate din api/ au un comentariu JSDoc care spune ce fac.
  {
    files: ['src/api/**/*.js'],
    plugins: {jsdoc},
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {FunctionDeclaration: true, ArrowFunctionExpression: true},
        },
      ],
      'jsdoc/require-description': 'error',
    },
  },

  // Fișierele de configurare ale uneltelor cer export default și rulează în Node.
  {
    files: ['*.config.js'],
    languageOptions: {globals: {...globals.node}},
    rules: {'no-restricted-exports': 'off'},
  },
];
