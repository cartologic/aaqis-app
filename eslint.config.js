import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	// Global ignores
	{
		ignores: ['build/**', '.svelte-kit/**', 'dist/**', 'node_modules/**', '*.min.js', 'static/**/*.js']
	},

	// Base JavaScript configuration
	js.configs.recommended,

	// TypeScript files
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: parser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module'
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			'@typescript-eslint': ts
		},
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'prefer-const': 'error'
		}
	},

	// Svelte files
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: parser,
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser
			}
		},
		plugins: {
			svelte: svelte
		},
		rules: {
			// Basic Svelte rules (only using ones that definitely exist)
			'svelte/no-at-debug-tags': 'warn',
			'svelte/no-unused-svelte-ignore': 'error',
			'svelte/no-target-blank': 'error',

			// Style preferences - let Prettier handle these
			'svelte/html-closing-bracket-spacing': 'off',
			'svelte/html-self-closing': 'off',
			'svelte/mustache-spacing': 'off',

			// TypeScript integration - disable conflicting rules
			'@typescript-eslint/no-unused-vars': 'off',
			'no-undef': 'off'
		}
	},

	// Configuration files
	{
		files: ['*.config.{js,ts}', 'vite.config.ts', 'svelte.config.js'],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	},

	// Prettier integration (must be last)
	prettier
];
