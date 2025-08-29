import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        errorColor: string,
        inputBackgroundColor: string,
        reduceMotion: boolean,
        inputBorderColor: string,
        inputTextColor: string,
        highlightColor: string,
    }
}
