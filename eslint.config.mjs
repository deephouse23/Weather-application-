import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        ignores: [
            'node_modules/**',
            '.next/**',
            'playwright-report/**',
            'test-results/**',
            '_archive/**',
        ],
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            react: reactPlugin,
            'react-hooks': hooksPlugin,
            '@next/next': nextPlugin,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...hooksPlugin.configs.recommended.rules,
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },
];
