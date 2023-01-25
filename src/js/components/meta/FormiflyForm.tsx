import React from 'react';
import {ThemeProvider} from 'styled-components';
import {FormiflyProvider, useFormiflyContext} from './FormiflyContext';
import {DeepPartial, SubmitFunction, SubmitValidationErrorFunction, ValueOfValidator} from '../../types';
import '../../helpers/i18n';
import {TFunction} from 'i18next';
import ObjectValidator from '../../classes/ObjectValidator';

const Form = <T extends ObjectValidator<any>>(props: FormProps<T>) => {
    const {handleSubmit} = useFormiflyContext<T>();
    return <form onSubmit={e =>
        handleSubmit(props.onSubmit, props.onSubmitValidationError, e)}
                 className={'formifly-form ' + (props.className ?? '')}>
        {props.children}
    </form>;
};

const FormiflyForm = <T extends ObjectValidator<any>>(props: FormiflyFormProps<T>) => {
    const {
        shape,
        defaultValues,
        onSubmit,
        onSubmitValidationError,
        children,
        className,
        disableNativeRequired,
        disableNativeMinMax,
        t,
    } = props;
    const theme = props.theme ?? {};

    const scTheme = {
        inputBackgroundColor: 'white',
        errorColor: 'red',
        inputTextColor: 'black',
        inputBorderColor: 'black',
        highlightColor: 'lightblue',
        reduceMotion: theme?.reducedMotion ??
            (typeof window.matchMedia === 'function' && window.matchMedia(`(prefers-reduced-motion: reduce)`).matches),
        ...theme,
    };

    return <ThemeProvider theme={scTheme}>
        <FormiflyProvider initialValues={defaultValues}
                          shape={shape}
                          t={t}
                          disableNativeRequired={disableNativeRequired ?? false}
                          disableNativeMinMax={disableNativeMinMax ?? false}>
            <Form onSubmit={onSubmit} className={className} onSubmitValidationError={onSubmitValidationError}>
                {children}
            </Form>
        </FormiflyProvider>
    </ThemeProvider>;
};

export type FormProps<T extends ObjectValidator<any>> = {
    onSubmit: SubmitFunction;
    onSubmitValidationError?: SubmitValidationErrorFunction<T>;
    className?: string;
    children: (JSX.Element | false)[] | JSX.Element | false;
}

export type FormiflyFormProps<T extends ObjectValidator<any>> = FormProps<T> & {
    shape: T;
    defaultValues?: DeepPartial<ValueOfValidator<T>>;
    disableNativeRequired?: boolean;
    disableNativeMinMax?: boolean;
    t?: TFunction,
    theme?: {
        inputBackgroundColor?: string;
        errorColor?: string;
        inputTextColor?: string;
        inputBorderColor?: string;
        highlightColor?: string;
        reducedMotion?: boolean;
    };
}

export default FormiflyForm;
