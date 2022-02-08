import React from 'react';
import styled from 'styled-components';
import {ErrorSpan, FieldContainer, HelpSpan, InputLabel} from './FormiflyField';

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

const FormiflySelectField = (props) => {
    const {
        name,
        value,
        onChange,
        onFocus,
        label,
        help,
        onBlur,
        errors,
        id,
        className,
        inputClassName,
        labelClassName,
        helpClassName,
        optionClassName,
        errorClassName,
        options,
        required,
    } = props;

    const ContainerComponent = props.containerComponent ?? FieldContainer;
    const LabelComponent = props.labelComponent ?? InputLabel;
    const InputComponent = props.inputComponent ?? Select;
    const OptionComponent = props.optionComponent ?? 'option';
    const ErrorComponent = props.errorComponent ?? ErrorSpan;
    const HelpComponent = props.helpComponent ?? HelpSpan;

    return <ContainerComponent className={'formifly-field-container formifly-select-field-container ' + (className ?? '')}>
        <div>
            <LabelComponent htmlFor={id} className={'formifly-field-label formifly-select-field-label ' + (labelClassName ?? '')}>
                {label}
            </LabelComponent>
            <InputComponent value={value}
                             id={id}
                             name={name}
                             required={required}
                             onChange={onChange}
                             onBlur={onBlur}
                             onFocus={onFocus}
                             data-has-errors={!!errors}
                             className={'formifly-field-input formifly-select-field-input ' + (inputClassName ?? '')}
                             aria-describedby={props['aria-describedby']}
                             aria-invalid={props['aria-invalid']}>
                {(value === '' || !required) && <OptionComponent value="" disabled={required}> </OptionComponent>}
                {options.map((option, index) => <OptionComponent className={'formifly-field-option ' + (optionClassName ?? '')}
                                                                 value={option.value}
                                                                 key={'formifly-field-option-' + name + index}>
                    {option.label}
                </OptionComponent>)}
            </InputComponent>
            <ErrorComponent id={id + '-errors'}
                            aria-live="polite"
                            role="alert"
                            className={'formifly-field-error formifly-select-field-error ' + (errorClassName ?? '')}>{errors === false ? '' : errors}</ErrorComponent>
        </div>
        {!!help &&
        <HelpComponent id={id + '-help'} className={'formifly-field-help formifly-select-field-help ' + (helpClassName ?? '')}>
            {help}
        </HelpComponent>}
    </ContainerComponent>;
};

export default React.memo(FormiflySelectField);
