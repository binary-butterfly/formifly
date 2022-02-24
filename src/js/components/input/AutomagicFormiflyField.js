import PropTypes from 'prop-types';
import React from 'react';
import {useFormiflyContext} from '../meta/FormiflyContext';
import FormiflyCheckField from './FormiflyCheckField';
import FormiflyField from './FormiflyField';
import FormiflyMultiSelectField from './FormiflyMultiSelectField';
import FormiflyRadioGroup from './FormiflyRadioGroup';
import FormiflySelectField from './FormiflySelectField';

const AutomagicFormiflyField = (props) => {
    const {getFieldProps} = useFormiflyContext();
    const fieldProps = getFieldProps(props.name, props.help, props.type, props.value, props.id, props.additionalDescribedBy);
    const type = props.type ?? fieldProps.type;

    if (!!props.options) {
        if (props.type === 'radio-group') {
            return <FormiflyRadioGroup {...fieldProps} {...props}/>;
        } else if (!!props.multiple || !!fieldProps.multiple) {
            return <FormiflyMultiSelectField {...fieldProps} {...props}/>;
        } else {
            return <FormiflySelectField {...fieldProps} {...props}/>;
        }
    } else if (['checkbox', 'radio'].includes(type)) {
        return <FormiflyCheckField {...fieldProps} {...props}/>;
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
    'legendClassName': PropTypes.string,
    'containerComponent': PropTypes.func,
    'inputComponent': PropTypes.func,
    'labelComponent': PropTypes.func,
    'errorComponent': PropTypes.func,
    'helpComponent': PropTypes.func,
    'legendComponent': PropTypes.func,
    'labelNoMove': PropTypes.bool,
    'additionalDescribedBy': PropTypes.string,
    'options': PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
    })),
    'multiple': PropTypes.bool,
    'selectionDisplayCutoff': PropTypes.number,
    'selectedDisplayComponent': PropTypes.func,
    'selectedDisplayClassName': PropTypes.string,
    'menuComponent': PropTypes.func,
    'menuClassName': PropTypes.string,
    'selectContainerComponent': PropTypes.func,
    'selectContainerClassName': PropTypes.string,
    'selectAllText': PropTypes.string,
    'nothingSelectedText': PropTypes.string,
    'numSelectedText': PropTypes.string,
    'allSelectedText': PropTypes.string,
};

export default AutomagicFormiflyField;
