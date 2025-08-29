import {defineConfig} from 'vitest/config';
import {resolve} from 'path';
import {ConfigEnv, loadEnv, UserConfigExport} from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';


// https://vitejs.dev/config/
export default ({mode}: ConfigEnv): UserConfigExport => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};

    return defineConfig({
        plugins: [
            react(),
            dts(
                {tsconfigPath: 'build.tsconfig.json'},
            ),
        ],
        build: {
            sourcemap: true,
            lib: {
                // Could also be a dictionary or array of multiple entry points
                entry: resolve(__dirname, 'src/js/main.ts'),
                name: 'Formifly',
                // the proper extensions will be added
                fileName: 'formifly',
            },
            rollupOptions: {
                external: [
                    'react',
                    'reactDOM',
                    'prop-types',
                ],
                output: {
                    globals: {
                        'react': 'React',
                        'react-dom': 'ReactDOM',
                        'prop-types': 'PropTypes',
                    },
                    inlineDynamicImports: true,
                    exports: 'auto',
                },
            },
        },

        define: {
            'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
            'preventAssignment': true,
        },

        test: {
            setupFiles: [
                './test.setup.ts',
            ],
            environment: 'jsdom',
            globals: true,
            coverage: {
                reporter: ['text', 'html', 'clover', 'json', 'cobertura'],
                all: true,
                include: ['src/js/**'],
                exclude: ['src/js/components/demo/DemoPage.tsx', 'src/js/main.ts', 'src/js/styled.d.ts'],
                provider: 'v8',
            },
            restoreMocks: true,
        },
    });
};
