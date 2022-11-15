import React from 'react';
import {useFormiflyContext} from '../meta/FormiflyContext';
import FormiflyCheckField from './FormiflyCheckField';
import FormiflyField from './FormiflyField';
import FormiflyMultiSelectField from './FormiflyMultiSelectField';
import FormiflyRadioGroup from './FormiflyRadioGroup';
import FormiflySelectField from './FormiflySelectField';

const AutomagicFormiflyField = (props: AutomagicFormiflyFieldProps) => {
    const {getFieldProps} = useFormiflyContext();
    const fieldProps = getFieldProps(props.name, props.help, props.type, props.value, props.id, props.additionalDescribedBy);
    const type = props.type ?? fieldProps.type;

    const options = props.options;
    if (options !== undefined) {
        if (props.type === 'radio-group') {
            return <FormiflyRadioGroup {...fieldProps} {...props} options={options}/>;
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
    containerComponent?: React.ComponentType<{'$horizontal'?: boolean}>,
    inputComponent?: React.ComponentType<{onBlur?: React.FocusEventHandler}>,
    labelComponent?: React.ComponentType,
    errorComponent?: React.ComponentType,
    helpComponent?: React.ComponentType,
    legendComponent?: React.ComponentType,
    labelNoMove?: boolean,
    additionalDescribedBy?: string,
    options?: {
        label: string,
        value: any,
    }[],
    multiple?: boolean,
    selectionDisplayCutoff?: number,
    selectedDisplayComponent?: React.ComponentType,
    selectedDisplayClassName?: string,
    menuComponent?: React.ComponentType,
    menuClassName?: string,
    selectContainerComponent?: React.ComponentType,
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
