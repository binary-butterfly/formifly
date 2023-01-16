import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import globals from 'rollup-plugin-node-globals';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';

const env = process.env.NODE_ENV;

const config = [
    {
        input: 'src/js/components/demo/DemoPage.tsx',
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
            nodeResolve({
                browser: true,
                preferBuiltins: true,
                extensions: ['.js', '.ts', '.tsx'],
            }),
            commonjs({
                exclude: 'src/**',
            }),
            babel({
                extensions: ['.js', '.ts', '.jsx', '.tsx'],
                babelHelpers: 'runtime',
                exclude: 'node_modules/**',
            }),
            globals(),
            replace({
                'process.env.NODE_ENV': JSON.stringify(env === 'production' ? 'production' : 'development'),
                'preventAssignment': true,
            }),
        ],
    },
    {
        input: 'src/js/main.ts',
        output: [{
            file: 'dist/index.d.ts',
            format: 'es',
            plugins: [],
        }],
        plugins: [
            commonjs({
                exclude: 'src/**',
            }),
            babel({
                extensions: ['.js', '.ts', '.jsx', '.tsx'],
                babelHelpers: 'runtime',
                exclude: 'node_modules/**',
            }),
            typescript({tsconfig: './build.tsconfig.json'}),
            dts(),
            del({targets: ['dist/src'], hook: 'buildEnd'}),
        ],
    },
];

if (env === 'production') {
    config[0].input = 'src/js/main.ts';
    config[0].output = [
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
    config[0].external = [
        'react',
        'reactDOM',
        'prop-types',
    ];
}

export default config;
