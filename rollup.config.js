import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import globals from 'rollup-plugin-node-globals';
import styles from 'rollup-plugin-styles';
import babel from '@rollup/plugin-babel';

const env = process.env.NODE_ENV;

const config = {
    input: 'src/js/components/demo/DemoPage.js',
    output: {
        file: 'dist/formifly.js',
        format: 'umd',
        sourcemap: true,
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
            exclude: 'src/**',
        }),
        babel({
            babelHelpers: 'runtime',
            exclude: 'node_modules/**',
        }),
        globals(),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env === 'production' ? 'production' : 'development'),
            'preventAssignment': true,
        }),
    ],
};

if (env === 'production') {
    config.input = 'src/js/main.js';
    config.output = [
        {
            file: 'dist/umd/formifly.js',
            format: 'umd',
            sourcemap: true,
            globals: {
                'react': 'React',
                'react-dom': 'ReactDOM',
                'prop-types': 'PropTypes',
            },
            name: 'Formifly',
            inlineDynamicImports: true,
            exports: 'auto',
        },
        {
            file: 'dist/esm/index.js',
            format: 'esm',
            sourcemap: true,
            globals: {
                'react': 'React',
                'react-dom': 'ReactDOM',
                'prop-types': 'PropTypes',
            },
            name: 'Formifly',
            inlineDynamicImports: true,
            exports: 'auto',
        },
    ];
    config.external = [
        'react',
        'reactDOM',
        'prop-types',
    ];
}

export default config;
