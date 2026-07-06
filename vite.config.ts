import {defineConfig} from 'vitest/config';
import {resolve} from 'path';
import {ConfigEnv, loadEnv, UserConfigExport} from 'vite';
import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import babel from '@rolldown/plugin-babel';

// I know how this looks. If you find a better way to not have the bundle throw errors about imaginary require calls, be my guest.
const stripRolldownRuntimePlugin = () => ({
    name: 'strip-rolldown-runtime',
    renderChunk(code: string) {
        if (code.includes('rolldown/runtime.js')) {
            return {
                code: code.replace(/\/\/#region\s\\0rolldown\/runtime\.js(.|\n)*?\/\/#endregion/gm, ''),
                map: null, // Disables complex remap shifts
            };
        }
        return null;
    },
});

// https://vitejs.dev/config/
export default ({mode}: ConfigEnv): UserConfigExport => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};

    return defineConfig({
        plugins: [
            react(),
            dts(
                {
                    tsconfigPath: 'build.tsconfig.json',
                    include: ['src/*/**'],
                    outDir: 'dist',
                    staticImport: true,
                },
            ),
            babel({
                presets: [reactCompilerPreset()],
                exclude: [/node_modules/],
            }),
            stripRolldownRuntimePlugin(),
        ],
        build: {
            sourcemap: true,
            emptyOutDir: true,
            lib: {
                entry: {
                    'formifly': resolve(__dirname, 'src/js/main.ts'),
                    'i18n': resolve(__dirname, 'src/js/helpers/i18n.ts'),
                },
                name: 'Formifly',
                fileName: (format, entryName) => `${entryName}.${format}.js`,
                formats: ['es'],
            },
            rolldownOptions: {
                external: [
                    'react',
                    'react-dom',
                    'prop-types',
                    'styled-components',
                    'react-i18next',
                    'i18next',
                ],
                output: {
                    globals: {
                        'react': 'React',
                        'react-dom': 'ReactDOM',
                    },
                    exports: 'auto',
                    preserveModules: false,
                    externalLiveBindings: false,
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
                include: ['src/js/**'],
                exclude: ['src/js/components/demo/DemoPage.tsx', 'src/js/main.ts', 'src/js/styled.d.ts'],
                provider: 'v8',
            },
            restoreMocks: true,
        },
    });
};
