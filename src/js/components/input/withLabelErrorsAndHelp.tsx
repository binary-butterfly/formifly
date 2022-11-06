import React from 'react';
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
  position: relative;
  z-index: 10;
  background-color: ${props => props.theme.inputBackgroundColor};
  width: max-content;
  padding: 0 0.1rem 0 0.15rem;
  margin-left: ${props => props.$noMove ? 0 : '0.5rem'};
  margin-top: ${props => props.$noMove ? 0 : '0.5rem'};
  transform: ${props => props.$noMove ? 'none' : 'translateY(0.5rem)'};
`;

export const ErrorSpan = styled.span`
  color: ${props => props.theme.errorColor};
  width: 100%;

  &:empty {
    display: none;
  }
`;

export const HelpSpan = styled.span`
  display: flex;
  align-items: center;
`;

const withLabelErrorsAndHelp = (WrappedComponent) => {
    return function LabelErrorsAndHelpInner(props) {
        const {
            label,
            help,
            type,
            errors,
            id,
            className,
            labelClassName,
            helpClassName,
            errorClassName,
        } = props;

        const ContainerComponent = props.containerComponent ?? FieldContainer;
        const LabelComponent = props.labelComponent ?? InputLabel;
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
                <WrappedComponent {...props} />
                <ErrorComponent id={id + '-errors'}
                                role="alert"
                                aria-live="polite"
                                className={'formifly-field-error formifly-' + type + '-field-error ' + (errorClassName ?? '')}>
                    {errors === false ? '' : errors}
                </ErrorComponent>
            </div>
            {!!help &&
                <HelpComponent id={id + '-help'}
                               className={'formifly-field-help formifly-' + type + '-field-help ' + (helpClassName ?? '')}>
                    {help}
                </HelpComponent>}
        </ContainerComponent>;
    };
};

export default withLabelErrorsAndHelp;
