import React from 'react';
import {ThemeProvider} from 'styled-components';
import {FormiflyProvider, useFormiflyContext} from './FormiflyContext';
import ObjectValidator from '../../classes/ObjectValidator';
import {SubmitFunction, SubmitValidationErrorFunction, ValueType} from '../../types';

const Form = (props: FormProps) => {
    const {handleSubmit} = useFormiflyContext();
    return <form onSubmit={e =>
        handleSubmit(props.onSubmit, props.onSubmitValidationError, e)} className={'formifly-form ' + (props.className ?? '')}>
        {props.children}
    </form>;
};

const FormiflyForm = (props: FormiflyFormProps) => {
    const {
        shape,
        defaultValues,
        onSubmit,
        onSubmitValidationError,
        children,
        className,
        disableNativeRequired,
        disableNativeMinMax,
    } = props;
    const theme = props.theme ?? {};

    const scTheme = {
        inputBackgroundColor: 'white',
        errorColor: 'red',
        inputTextColor: 'black',
        inputBorderColor: 'black',
        highlightColor: 'lightblue',
        reduceMotion: theme?.reducedMotion ??
            (typeof window.matchMedia === 'function' && window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true),

        ...theme,
    };

    return <ThemeProvider theme={scTheme}>
        <FormiflyProvider initialValues={defaultValues}
                          shape={shape}
                          disableNativeRequired={disableNativeRequired ?? false}
                          disableNativeMinMax={disableNativeMinMax ?? false}>
            <Form onSubmit={onSubmit} className={className} onSubmitValidationError={onSubmitValidationError}>
                {children}
            </Form>
        </FormiflyProvider>
    </ThemeProvider>;
};

export type FormProps = {
    onSubmit: SubmitFunction;
    onSubmitValidationError?: SubmitValidationErrorFunction;
    className?: string;
    children: (JSX.Element | false)[] | JSX.Element | false;
}

export type FormiflyFormProps = FormProps & {
    shape: ObjectValidator;
    defaultValues?: Record<string, ValueType>;
    disableNativeRequired?: boolean;
    disableNativeMinMax?: boolean;
    theme?: {
        inputBackgroundColor?: string;
        errorColor?: string;
        inputTextColor?: string;
        inputBorderColor?: string;
        higghlightColor?: string;
        reducedMotion?: boolean;
    };
}

export default FormiflyForm;
