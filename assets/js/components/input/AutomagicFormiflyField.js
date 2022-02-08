import PropTypes from 'prop-types';
import React from 'react';
import {useFormiflyContext} from '../meta/FormiflyContext';
import FormiflyCheckField from './FormiflyCheckField';
import FormiflyField from './FormiflyField';
import FormiflySelectField from './FormiflySelectField';

const AutomagicFormiflyField = (props) => {
    const {getFieldProps} = useFormiflyContext();
    const fieldProps = getFieldProps(props.name, props.help, props.type, props.id);
    const type = props.type ?? fieldProps.type;

    if (['checkbox', 'radio'].includes(type)) {
        return <FormiflyCheckField {...fieldProps} {...props}/>;
    } else if (!!props.options) {
        return <FormiflySelectField {...fieldProps} {...props}/>;
    } else {
        return <FormiflyField {...fieldProps} {...props}/>;
    }
};

AutomagicFormiflyField.propTypes = {
    'label': PropTypes.string.isRequired,
    'name': PropTypes.string.isRequired,
    'help': PropTypes.string,
    'type': PropTypes.string,
    'id': PropTypes.string,
    'className': PropTypes.string,
    'inputClassName': PropTypes.string,
    'labelClassName': PropTypes.string,
    'helpClassName': PropTypes.string,
    'containerComponent': PropTypes.func,
    'inputComponent': PropTypes.func,
    'labelComponent': PropTypes.func,
    'errorComponent': PropTypes.func,
    'helpComponent': PropTypes.func,
    'labelNoMove': PropTypes.bool,
    'options': PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
    }))
};

export default AutomagicFormiflyField;
