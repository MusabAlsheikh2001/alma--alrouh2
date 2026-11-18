import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['dist/**', '.angular/**', 'src/app/*.generated.ts', '**/*.spec.ts'] },
  {
    files: ['src/**/*.ts'],
    languageOptions: { parser: tseslint.parser, parserOptions: { project: false } },
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-duplicate-case': 'error',
      'no-unreachable': 'error',
      'valid-typeof': 'error',
      'no-unsafe-finally': 'error',
    },
  },
);
