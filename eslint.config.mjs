import {defineConfig} from 'eslint/config';
import bbConfig from '@binary-butterfly/eslint-config';

export default defineConfig([
    {
        ...bbConfig[0],

        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        ...bbConfig[1],
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]);
