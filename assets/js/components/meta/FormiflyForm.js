import PropTypes from 'prop-types';
import React from 'react';
import {ThemeProvider} from 'styled-components';
import {FormiflyProvider, useFormiflyContext} from './FormiflyContext';

const Form = (props) => {
    const {handleSubmit} = useFormiflyContext();
    return <form onSubmit={(e) => handleSubmit(props.onSubmit, e)} className={'formifly-form ' + (props.className ?? '')}>
        {props.children}
    </form>;
};

const FormiflyForm = (props) => {
    const {shape, defaultValues, onSubmit, children, className} = props;
    const theme = props.theme ?? {};

    const scTheme = {
        inputBackgroundColor: 'white',
        errorColor: 'red',
        inputTextColor: 'black',
        inputBorderColor: 'black',
        highlightColor: 'lightblue',
        reduceMotion: theme?.reducedMotion ?? (typeof window.matchMedia === 'function' && (window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true)),

        ...theme,
    };

    return <ThemeProvider theme={scTheme}>
        <FormiflyProvider initialValues={defaultValues} shape={shape}>
            <Form onSubmit={onSubmit} className={className}>
                {children}
            </Form>
        </FormiflyProvider>
    </ThemeProvider>;
};

FormiflyForm.propTypes = {
    shape: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    className: PropTypes.string,
    defaultValues: PropTypes.object,
    theme: PropTypes.shape({
        inputBackgroundColor: PropTypes.string,
        errorColor: PropTypes.string,
        inputTextColor: PropTypes.string,
        inputBorderColor: PropTypes.string,
        highlightColor: PropTypes.string,
        reducedMotion: PropTypes.bool,
    }),
};

export default FormiflyForm;
