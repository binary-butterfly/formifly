import PropTypes from 'prop-types';
import React from 'react';
import {FormiflyProvider, useFormiflyContext} from './FormiflyContext';

const Form = (props) => {
    const {handleSubmit} = useFormiflyContext();
    return <form onSubmit={(e) => handleSubmit(props.onSubmit, e)} className={'formifly-form ' + (props.className ?? '')}>
        {props.children}
    </form>;
};

const FormiflyForm = (props) => {
    const {shape, defaultValues, onSubmit, children, className} = props;

    return <FormiflyProvider initialValues={defaultValues} shape={shape}>
        <Form onSubmit={onSubmit} className={className}>
            {children}
        </Form>
    </FormiflyProvider>;
};

FormiflyForm.propTypes = {
    shape: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    className: PropTypes.string,
    defaultValues: PropTypes.object,
};

export default FormiflyForm;
