import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // catch vazio é intencional em várias operações opcionais (ex.: print de PDF)
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Regras do preset do React Compiler (experimental). Este projeto NÃO usa
      // React Compiler, e os usos atuais são padrões idiomáticos e corretos:
      //  - set-state-in-effect: carregar dados / resetar UI ao trocar de paciente;
      //  - purity: cutoff de tempo (Date.now) recalculado por render, intencional;
      //  - immutability: idem, uso legítimo.
      // Mantidas como 'warn' (visíveis para revisão) em vez de bloquear o build.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  }
);
