import React from 'react';
import styled from 'styled-components';
import withLabelErrorsAndHelp from './withLabelErrorsAndHelp';
import {AutomagicFormiflyFieldProps} from './AutomagicFormiflyField';

export const Input = styled.input`
  display: block;
  border-radius: 0.25rem;
  padding: 0.25rem;
  min-width: 15rem;
  border: 1px solid;

  &[data-has-errors="true"] {
    border-color: ${props => props.theme.errorColor};
  }
`;

const FormiflyField = (props: FormiflyFieldProps) => {
    const {
        name,
        value,
        onChange,
        onFocus,
        onBlur,
        type,
        errors,
        id,
        inputClassName,
        required,
        min,
        max,
    } = props;

    const InputComponent = props.inputComponent ?? Input;

    return <InputComponent type={type}
                           value={value}
                           id={id}
                           name={name}
                           onChange={onChange}
                           onBlur={onBlur}
                           onFocus={onFocus}
                           data-has-errors={!!errors}
                           required={required}
                           min={min}
                           max={max}
                           className={'formifly-field-input formifly-' + type + '-field-input ' + (inputClassName ?? '')}
                           aria-describedby={props['aria-describedby']}
                           aria-required={props['aria-required']}
                           aria-invalid={props['aria-invalid']}/>;
};

export type FormiflyFieldProps = Pick<AutomagicFormiflyFieldProps,
    'name' |
    'containerComponent' |
    'inputComponent' |
    'labelComponent' |
    'errorComponent' |
    'helpComponent'|
    'help' |
    'className' |
    'inputClassName' |
    'labelClassName' |
    'helpClassName' |
    'errorClassName' |
    'labelNoMove' |
    'horizontal' |
    'options' |
    'multiple' |
    'checked'
    > & {
    value: number | string | any[] | boolean,
    onChange: React.ChangeEventHandler,
    onFocus: React.ChangeEventHandler,
    label?: string,
    id: string,
    type: string,
    errors: boolean | string,
    onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => Promise<boolean>,
    'aria-invalid'?: boolean,
    'aria-describedby'?: string,
    'aria-required'?: boolean,
    required?: boolean,
    min?: number,
    max?: number,
}

export default React.memo(withLabelErrorsAndHelp(FormiflyField));
