import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export const FieldContainer = styled.div`
  display: flex;
  margin: 0.5rem;
  flex-wrap: wrap;

  & > * {
    margin-right: 1rem;
  }
`;

export const InputLabel = styled.label`
  display: block;
  background-color: white;
  width: max-content;
  padding: 0 0.1rem 0 0.15rem;
  margin-left: ${props => props.$noMove ? 0 : '0.5rem'};
  margin-top: ${props => props.$noMove ? 0 : '0.5rem'};
  transform: ${props => props.$noMove ? 'none' : 'translateY(0.5rem)'};
`;

export const Input = styled.input`
  display: block;
  border-radius: 0.25rem;
  padding: 0.25rem;
  min-width: 15rem;

  &[data-has-errors="true"] {
    border-color: red;
  }
`;

export const ErrorSpan = styled.span`
  color: red;
  width: 100%;

  &:empty {
    display: none;
  }
`;

export const HelpSpan = styled.span`
  display: flex;
  align-items: center;
`;

const FormiflyField = (props) => {
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
        required,
        min,
        max,
    } = props;

    const ContainerComponent = props.containerComponent ?? FieldContainer;
    const LabelComponent = props.labelComponent ?? InputLabel;
    const InputComponent = props.inputComponent ?? Input;
    const ErrorComponent = props.errorComponent ?? ErrorSpan;
    const HelpComponent = props.helpComponent ?? HelpSpan;

    const labelNoMove = props.labelNoMove ?? ['range', 'checkbox', 'radio'].includes(type);

    return <ContainerComponent className={'formifly-field-container formifly-' + type + '-field-container ' + (className ?? '')}>
        <div>
            <LabelComponent htmlFor={id}
                            className={'formifly-field-label formifly-' + type + '-field-label ' + (labelClassName ?? '')}
                            $noMove={labelNoMove}>
                {label}
            </LabelComponent>
            <InputComponent type={type}
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
                            aria-invalid={props['aria-invalid']}/>
            <ErrorComponent id={id + '-errors'}
                            role="alert"
                            aria-live="polite"
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

export const fieldPropTypes = {
    'name': PropTypes.string.isRequired,
    'value': PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.array, PropTypes.bool]).isRequired,
    'onChange': PropTypes.func.isRequired,
    'onFocus': PropTypes.func.isRequired,
    'label': PropTypes.string.isRequired,
    'id': PropTypes.string.isRequired,
    'type': PropTypes.string.isRequired,
    'errors': PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    'help': PropTypes.string,
    'onBlur': PropTypes.func,
    'aria-invalid': PropTypes.bool,
    'aria-describedby': PropTypes.string,
    'className': PropTypes.string,
    'inputClassName': PropTypes.string,
    'labelClassName': PropTypes.string,
    'helpClassName': PropTypes.string,
    'errorClassName': PropTypes.string,
    'containerComponent': PropTypes.func,
    'inputComponent': PropTypes.func,
    'labelComponent': PropTypes.func,
    'errorComponent': PropTypes.func,
    'helpComponent': PropTypes.func,
    'labelNoMove': PropTypes.bool,
    'required': PropTypes.bool,
    'min': PropTypes.number,
    'max': PropTypes.number,
};

FormiflyField.propTypes = fieldPropTypes;

export default React.memo(FormiflyField);
