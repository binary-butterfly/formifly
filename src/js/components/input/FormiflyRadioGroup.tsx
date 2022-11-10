import React from 'react';
import styled, {StyledComponent} from 'styled-components';
import {CheckLabel} from './FormiflyCheckField';
import {ErrorSpan, HelpSpan} from './withLabelErrorsAndHelp';
import {FormiflyFieldProps} from './FormiflyField';

export const RadioGroupContainer = styled.fieldset<{'$horizontal': boolean}>`
  display: flex;
  flex-wrap: wrap;
  width: fit-content;
  margin: 0.5rem;
  border-radius: 0.25rem;

  & > div {
    flex-direction: ${props => props.$horizontal ? 'row' : 'column'};
    display: flex;
    min-width: 10rem;
  }
`;

const FormiflyRadioGroup = (props: FormiflyRadioGroupProps) => {
    const {
        className,
        horizontal,
        options,
        value,
        name,
        help,
        helpClassName,
        id,
        inputClassName,
        labelClassName,
        errors,
        errorClassName,
        label,
        legendClassName,
        onChange,
        onBlur,
        required,
    } = props;

    const ContainerComponent = props.containerComponent ?? RadioGroupContainer;
    const InputComponent = props.inputComponent ?? 'input';
    const HelpComponent = props.helpComponent ?? HelpSpan;
    const ErrorComponent = props.errorComponent ?? ErrorSpan;
    const LegendComponent = props.legendComponent ?? 'legend';
    const LabelComponent = props.labelComponent ?? CheckLabel;

    return <ContainerComponent $horizontal={horizontal}
                               className={'formifly-field-container formifly-radio-group-container ' + (className ?? '')}>
        {!!label && <LegendComponent className={'formifly-fieldset-legend ' + (legendClassName ?? '')}>{label}</LegendComponent>}
        <div>
            {options.map((option, index) => <LabelComponent key={'radio-group-option-' + index}
                                                            className={'formifly-field-label formifly-radio-field-label '
                                                                + (labelClassName ?? '')}>
                <InputComponent name={name}
                                type="radio"
                                checked={value === option.value}
                                className={'formifly-field-input formifly-radio-field-input ' + (inputClassName ?? '')}
                                aria-describedby={props['aria-describedby']}
                                aria-invalid={props['aria-invalid']}
                                onChange={onChange}
                                onBlur={onBlur}
                                required={required}
                                aria-required={props['aria-required']}
                                value={option.value}/>
                {option.label}
            </LabelComponent>)}
            <ErrorComponent id={id + '-errors'}
                            role="alert"
                            aria-live="polite"
                            className={'formifly-field-error formifly-radio-field-error ' + (errorClassName ?? '')}>
                {errors === false ? '' : errors}
            </ErrorComponent>
        </div>
        {!!help &&
            <HelpComponent id={id + '-help'} className={'formifly-field-help formifly-radio-field-help ' + (helpClassName ?? '')}>
                {help}
            </HelpComponent>}
    </ContainerComponent>;
};

export type FormiflyRadioGroupProps = FormiflyFieldProps & {
    options: {
        label: string,
        value: any,
    }[],
    legendComponent?: StyledComponent<any, any>,
    legendClassName?: string
}

export default React.memo(FormiflyRadioGroup);
