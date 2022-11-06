import React from 'react';
import styled from 'styled-components';
import {fieldPropTypes} from './FormiflyField';
import {ErrorSpan, FieldContainer, HelpSpan} from './withLabelErrorsAndHelp';

export const CheckLabel = styled.label`
  cursor: pointer;

  & input {
    cursor: pointer;
  }
`;

const FormiflyCheckField = (props) => {
    const {
        name,
        value,
        onChange,
        onFocus,
        label,
        help,
        onBlur,
        type,
        errors,
        id,
        className,
        inputClassName,
        labelClassName,
        helpClassName,
        errorClassName,
        checked,
    } = props;

    const ContainerComponent = props.containerComponent ?? FieldContainer;
    const LabelComponent = props.labelComponent ?? CheckLabel;
    const InputComponent = props.inputComponent ?? 'input';
    const ErrorComponent = props.errorComponent ?? ErrorSpan;
    const HelpComponent = props.helpComponent ?? HelpSpan;

    return <ContainerComponent className={'formifly-field-container formifly-' + type + '-field-container ' + (className ?? '')}>
        <div>
            <LabelComponent className={'formifly-field-label formifly-' + type + '-field-label ' + (labelClassName ?? '')}>
                <InputComponent type={type}
                                checked={checked === 'true' || checked === true}
                                id={id}
                                name={name}
                                onChange={onChange}
                                onBlur={onBlur}
                                onFocus={onFocus}
                                data-has-errors={!!errors}
                                value={value}
                                className={'formifly-field-input formifly-' + type + '-field-input ' + (inputClassName ?? '')}
                                aria-describedby={props['aria-describedby']}
                                aria-required={props['aria-required']}
                                aria-invalid={props['aria-invalid']}/>
                {label}
            </LabelComponent>
            <br/>
            <ErrorComponent id={id + '-errors'} aria-live="polite" role="alert"
                            className={'formifly-field-error formifly-' + type + '-field-error ' + (errorClassName ?? '')}>
                {errors === false ? '' : errors}
            </ErrorComponent>
        </div>
        {!!help &&
        <HelpComponent id={id + '-help'} className={'formifly-field-help formifly-' + type + '-field-help ' + (helpClassName ?? '')}>
            {help}
        </HelpComponent>}
    </ContainerComponent>;
};

FormiflyCheckField.propTypes = fieldPropTypes;

export default React.memo(FormiflyCheckField);
