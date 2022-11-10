import React from 'react';
import styled, {StyledComponent} from 'styled-components';
import {FormiflyFieldProps} from './FormiflyField';
import withLabelErrorsAndHelp from './withLabelErrorsAndHelp';

const Select = styled.select`
  display: block;
  border-radius: 0.25rem;
  padding: 0.25rem;
  background-color: transparent;
  min-width: 15rem;
  cursor: pointer;

  &[data-has-errors="true"] {
    border-color: red;
  }
`;

const FormiflySelectField = (props: FormiflySelectFieldProps) => {
    const {
        name,
        value,
        onChange,
        onFocus,
        onBlur,
        errors,
        id,
        inputClassName,
        optionClassName,
        options,
        required,
    } = props;

    const InputComponent = props.inputComponent ?? Select;
    const OptionComponent = props.optionComponent ?? 'option';

    return <InputComponent value={value}
                           id={id}
                           name={name}
                           required={required}
                           onChange={onChange}
                           onBlur={onBlur}
                           onFocus={onFocus}
                           data-has-errors={!!errors}
                           className={'formifly-field-input formifly-select-field-input ' + (inputClassName ?? '')}
                           aria-describedby={props['aria-describedby']}
                           aria-required={props['aria-required']}
                           aria-invalid={props['aria-invalid']}>
        {(value === '' || !required) && <OptionComponent value="" disabled={required}> </OptionComponent>}
        {options.map((option, index) => <OptionComponent className={'formifly-field-option ' + (optionClassName ?? '')}
                                                         value={option.value}
                                                         key={'formifly-field-option-' + name + index}>
            {option.label}
        </OptionComponent>)}
    </InputComponent>;

};

export type FormiflySelectFieldProps = FormiflyFieldProps & {
    options: {
        label: string,
        value: any,
    }[],
    optionComponent: StyledComponent<any, any>,
    optionClassName: string,
}

export default React.memo(withLabelErrorsAndHelp(FormiflySelectField));
