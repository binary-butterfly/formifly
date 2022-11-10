import React from 'react';
import {useFormiflyContext} from '../meta/FormiflyContext';
import FormiflyCheckField from './FormiflyCheckField';
import FormiflyField from './FormiflyField';
import FormiflyMultiSelectField from './FormiflyMultiSelectField';
import FormiflyRadioGroup from './FormiflyRadioGroup';
import FormiflySelectField from './FormiflySelectField';
import {StyledComponent} from 'styled-components';

const AutomagicFormiflyField = (props: AutomagicFormiflyFieldProps) => {
    const {getFieldProps} = useFormiflyContext();
    const fieldProps = getFieldProps(props.name, props.help, props.type, props.value, props.id, props.additionalDescribedBy);
    const type = props.type ?? fieldProps.type;

    if (!!props.options) {
        if (props.type === 'radio-group') {
            // @ts-expect-error for some reason typescript doesn't understand that we checked for the existence of 'options'
            return <FormiflyRadioGroup {...fieldProps} {...props}/>;
        } else if (!!props.multiple || !!fieldProps.multiple) {
            return <FormiflyMultiSelectField {...fieldProps} {...props}/>;
        } else {
            return <FormiflySelectField {...fieldProps} {...props}/>;
        }
    } else if (['checkbox', 'radio'].includes(type) && (fieldProps.checked !== undefined || props.checked !== undefined)) {
        // @ts-expect-error for some reason typescript doesn't understand that we checked for the existence of 'checked'
        return <FormiflyCheckField {...fieldProps} {...props}/>;
    } else {
        return <FormiflyField {...fieldProps} {...props}/>;
    }
};

export type AutomagicFormiflyFieldProps = {
    label: string,
    name: string,
    help?: string,
    type?: string,
    id?: string,
    className?: string,
    inputClassName?: string,
    labelClassName?: string,
    errorClassName?: string,
    helpClassName?: string,
    legendClassName?: string,
    containerComponent?: StyledComponent<any, any>,
    inputComponent?: StyledComponent<any, any>,
    labelComponent?: StyledComponent<any, any>,
    errorComponent?: StyledComponent<any, any>,
    helpComponent?: StyledComponent<any, any>,
    legendComponent?: StyledComponent<any, any>,
    labelNoMove?: boolean,
    additionalDescribedBy?: string,
    options?: {
        label: string,
        value: any,
    }[],
    multiple?: boolean,
    selectionDisplayCutoff?: number,
    selectedDisplayComponent?: StyledComponent<any, any>,
    selectedDisplayClassName?: string,
    menuComponent?: StyledComponent<any, any>,
    menuClassName?: string,
    selectContainerComponent?: StyledComponent<any, any>,
    selectContainerClassName?: string,
    selectAllText?: string,
    nothingSelectedText?: string,
    numSelectedText?: string,
    allSelectedText?: string,
    horizontal?: boolean,
    value?: string,
    checked?: boolean|string,
}

export default AutomagicFormiflyField;
