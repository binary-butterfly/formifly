import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import globals from 'rollup-plugin-node-globals';
import styles from 'rollup-plugin-styles';
import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';

const env = process.env.NODE_ENV;

const config = {
    input: 'assets/js/components/demo/DemoPage.js',
    output: {
        file: 'dist/formifly.js',
        format: 'cjs',
        sourcemap: env !== 'production',
        globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
        },
        name: 'Formifly',
        inlineDynamicImports: true,
        exports: 'auto',
    },
    plugins: [
        styles(),
        nodeResolve({
            browser: true,
            preferBuiltins: true,
            extensions: ['.js', '.ts', '.tsx'],
        }),
        commonjs({
            exclude: 'assets/**',
        }),
        babel({
            'babelHelpers': 'runtime',
        }),
        globals(),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env === 'production' ? 'production' : 'development'),
            'preventAssignment': true,
        }),
    ],
};

if (env === 'production') {
    config.input = 'assets/js/main.js';
    config.output.file = 'dist/formifly.min.js';
    config.external = [
        'react',
        'reactDOM',
    ];
    config.plugins.push(terser());
}

export default config;
