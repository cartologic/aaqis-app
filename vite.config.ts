import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		exclude: ['parquet-wasm']
	},
	server: {
		fs: {
			allow: ['..', '..']
		}
	},
	build: {
		minify: 'esbuild'
	},
	esbuild: {
		drop: ['console', 'debugger']
	}
});
