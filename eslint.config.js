import js from '@eslint/js';
import globals from 'globals';

export default [{
  ignores: [
    'coverage/**',
    'node_modules/**',
    '**/tmp/**'
  ]
}, {
  files: [
    'index.js',
    '__tests__/**'
  ],
  ...js.configs.recommended,
  languageOptions: {
    globals: {
      ...globals.node
    }
  }
}];
