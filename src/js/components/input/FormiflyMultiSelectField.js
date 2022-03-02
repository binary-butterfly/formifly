import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {CheckLabel} from './FormiflyCheckField';
import withLabelErrorsAndHelp from './withLabelErrorsAndHelp';
import {fieldPropTypes} from './FormiflyField';

export const OptionsMenu = styled.menu`
  background-color: ${props => props.theme.inputBackgroundColor};
  position: absolute;
  margin: 0;
  z-index: 1000;
  padding: 0.25rem 0 0.25rem 0;
  list-style: none;
  width: 100%;

  li {
    padding: 0 0.25rem 0 0.25rem;

    label {
      width: 100%;
      display: block;
      cursor: pointer;
    }
  }

  li:hover, li:focus-within {
    background-color: ${props => props.theme.highlightColor};
  }
`;

export const OptionsAnchor = styled.a`
  text-decoration: none;
  display: inline-block;
  width: 100%;
  overflow: hidden;
  color: ${props => props.theme.inputTextColor};

  &:focus-visible {
    outline: none;
    text-decoration: underline;
  }

  &:visited {
    color: black;
  }
`;

export const SelectContainer = styled.div`
  cursor: pointer;
  border: 1px solid ${props => props.theme.inputBorderColor};
  border-radius: 0.25rem;
  padding: 0.25rem;
  min-width: 15rem;
  position: relative;

  menu {
    visibility: hidden;
  }

  &:hover menu:not(:empty), &:focus menu:not(:empty), &:focus-within menu:not(:empty) {
    cursor: pointer;
    visibility: visible;
    display: block;
  }

  & menu li {
    transition: background-color ${props => props.theme.reduceMotion ? ' 0s' : ' 0.25s'} ease-in;
  }
`;

export const Option = (props) => {
    const {onChange, label, checked, className} = props;
    return <li className={className}>
        <CheckLabel><input onChange={onChange} type="checkbox" checked={checked}/>{label}</CheckLabel>
    </li>;
};

Option.propTypes = {
    checked: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const FormiflyMultiSelectField = (props) => {
    const {
        value,
        options,
        onChange,
        name,
        selectContainerComponent,
        selectContainerClassName,
        selectedDisplayComponent,
        selectedDisplayClassName,
        menuComponent,
        optionComponent,
        menuClassName,
        optionClassName,
    } = props;
    const selectAllText = props.selectAllText ?? 'Select all';
    const nothingSelectedText = props.nothingSelectedText ?? 'Nothing selected';
    const numSelectedText = props.numSelectedText ?? '{{num}} selected';
    const allSelectedText = props.allSelectedText ?? 'All selected';
    const selectionDisplayCutoff = props.selectionDisplayCutoff ?? 3;

    const [allSelected, setAllSelected] = React.useState(false);

    React.useEffect(() => {
        setAllSelected(value.length === options.length);
    }, [value]);

    const handleSelectAllClick = () => {
        if (allSelected) {
            onChange(name, []);
        } else {
            onChange(name, options.map(option => option.value));
        }
    };

    const handleOptionChange = (optionValue) => {
        if (value.includes(optionValue)) {
            onChange(name, value.filter((val) => val !== optionValue));
        } else {
            onChange(name, [...value, optionValue]);
        }
    };

    const getSelectedLabels = () => {
        let labels = [];
        options.forEach((option) => {
            if (value.includes(option.value)) {
                labels.push(option.label);
            }
        });
        return labels;
    };

    const ContainerComponent = selectContainerComponent ?? SelectContainer;
    const SelectedDisplay = selectedDisplayComponent ?? OptionsAnchor;
    const MenuComponent = menuComponent ?? OptionsMenu;
    const OptionComponent = optionComponent ?? Option;

    return <ContainerComponent className={'formifly-multi-select-container ' + (selectContainerClassName ?? '')}>
        <SelectedDisplay href="#" className={'formifly-multi-select-display ' + (selectedDisplayClassName ?? '')}>
            {allSelected
                ? allSelectedText
                : value.length === 0
                    ? nothingSelectedText
                    : value.length > selectionDisplayCutoff
                        ? numSelectedText.replace('{{num}}', String(value.length))
                        : getSelectedLabels().join(', ')}</SelectedDisplay>
        <MenuComponent className={'formifly-multi-select-menu ' + (menuClassName ?? '')} aria-required={props["aria-required"]}>
            <OptionComponent className={'formifly-multi-select-option formifly-multi-select-all-option ' + (optionClassName ?? '')}
                             label={selectAllText}
                             onChange={handleSelectAllClick}
                             checked={allSelected}/>
            {options.map((option, key) => <Option key={'multiSelectOption' + key}
                                                  onChange={() => handleOptionChange(option.value)}
                                                  className={'formifly-multi-select-option ' + (optionClassName ?? '')} Q
                                                  checked={value.includes(option.value)}
                                                  label={option.label}/>)}
        </MenuComponent>
    </ContainerComponent>;
};

FormiflyMultiSelectField.propTypes = {
    ...fieldPropTypes,
    options: PropTypes.array.isRequired,
    value: PropTypes.array.isRequired,
    selectAllText: PropTypes.string,
    nothingSelectedText: PropTypes.string,
    numSelectedText: PropTypes.string,
    allSelectedText: PropTypes.string,
    optionComponent: PropTypes.func,
    optionClassName: PropTypes.string,
    selectionDisplayCutoff: PropTypes.number,
    selectedDisplayComponent: PropTypes.func,
    selectedDisplayClassName: PropTypes.string,
    menuComponent: PropTypes.func,
    menuClassName: PropTypes.string,
    selectContainerComponent: PropTypes.func,
    selectContainerClassName: PropTypes.string,
};

export default React.memo(withLabelErrorsAndHelp(FormiflyMultiSelectField));
