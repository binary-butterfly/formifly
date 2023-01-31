/**
 * The demo form contains all input elements that the library provides.
 * Since it is encouraged to only write integration tests for react components, these tests should cover almost all of the react components.
 * It also serves as the place where the classes are integration tested in addition to their unit tests.
 */
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import DemoForm from '../../../components/demo/DemoForm';
import {convertDateObjectToInputString} from '../../../helpers/generalHelpers';

/**
 * Changes an element value and triggers the blur event.
 * This is needed because validators are only re-run after a blur to increase performance.
 * @param element
 * @param newValue
 */
export const changeInputValue = (element: HTMLElement, newValue: any) => {
    fireEvent.change(element, {target: {value: newValue}});
    fireEvent.blur(element);
};

function checkIfRoleEqualsAndContentNotEmpty(role: string, element: HTMLElement) {
    return role === 'alert' && element.textContent !== '';
}

const queryAllAlertsWithContent = () => {
    return screen.queryAllByRole(checkIfRoleEqualsAndContentNotEmpty);
};

/**
 * Asynchronously search for all alerts with content.
 * Note that this function must not be used to assert no elements existing since this will slow down the test suite substantially
 * @return {*}
 */
const findAllAlertsWithContent = () => {
    return screen.findAllByRole(checkIfRoleEqualsAndContentNotEmpty);
};

describe('DemoForm', () => {
    beforeEach(() => {
        render(<DemoForm/>);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders a number input with min value 2', () => {
        expect(screen.queryByText('This field must be a number')).toBeNull();
        const numberInput = screen.getByLabelText('Enter a number');

        fireEvent.focus(numberInput);
        fireEvent.blur(numberInput);
        expect(screen.getByText('This field is required')).not.toBeNull();

        changeInputValue(numberInput, 3);
        expect(screen.queryByText('This field must be a number')).toBeNull();

        changeInputValue(numberInput, 1);
        expect(screen.getByText('This value must be at least 2')).not.toBeNull();
    });

    it('renders a number input that only allows whole numbers with a max value of 5', () => {
        const wholeNumberInput = screen.getByLabelText('Enter a whole number');

        changeInputValue(wholeNumberInput, '2.5');
        expect(screen.getByText('This field must be a whole number')).not.toBeNull();

        changeInputValue(wholeNumberInput, '2');
        expect(screen.queryByText('This field must be a whole number')).toBeNull();

        changeInputValue(wholeNumberInput, '10');
        expect(screen.getByText('This value must be at most 5')).not.toBeNull();
    });

    it('renders a string input that only allows lowercase letters', () => {
        const stringInput = screen.getByLabelText('Enter a string');

        changeInputValue(stringInput, 'Banana');
        expect(screen.getByText('This value is malformed')).not.toBeNull();

        changeInputValue(stringInput, 'banana');
        expect(screen.queryByText('This value is malformed')).toBeNull();
    });

    it('renders a date input field', () => {
        const dateInput = screen.getByLabelText('Select a date/time');

        const currentTime = new Date().getTime();

        changeInputValue(dateInput, convertDateObjectToInputString(new Date('2020-01-01')));
        expect(queryAllAlertsWithContent()).not.toStrictEqual([]);
        changeInputValue(dateInput, convertDateObjectToInputString(new Date(currentTime + 60000)));
        expect(queryAllAlertsWithContent()).toStrictEqual([]);
    });

    it('renders a second date input which must be later than the first', () => {
        const firstDateInput = screen.getByLabelText('Select a date/time');
        const secondDateInput = screen.getByLabelText('Select a later date/time');
        const currentTime = new Date().getTime();
        changeInputValue(firstDateInput, convertDateObjectToInputString(new Date(currentTime + 60000)));
        changeInputValue(secondDateInput, convertDateObjectToInputString(new Date(currentTime)));
        expect(screen.getByText('This date must be after the value for its sibling date')).not.toBeNull();
        changeInputValue(secondDateInput, convertDateObjectToInputString(new Date(currentTime + 70000)));
        expect(screen.queryByText('This date must be after the value for its sibling date')).toBeNull();
    });

    it('renders a required select field', () => {
        const selectField = screen.getByLabelText('Select something');

        fireEvent.blur(selectField);
        expect(screen.getByText('This field is required')).not.toBeNull();

        changeInputValue(selectField, 'option1');
        expect(screen.queryByText('This field is required')).toBeNull();
    });

    it('renders a radio group outside a fieldset', () => {
        const firstOption = screen.getByLabelText('This is a radio option') as HTMLInputElement;
        const secondOption = screen.getByLabelText('This is another radio option') as HTMLInputElement;

        fireEvent.click(firstOption);
        expect(firstOption.checked).toEqual(true);

        fireEvent.click(secondOption);
        expect(firstOption.checked).toEqual(false);
        return waitFor(() => secondOption.checked);
    });

    it('renders a vertical radio group', () => {
        const firstOption = screen.getByLabelText('First option') as HTMLInputElement;
        const secondOption = screen.getByLabelText('Second option') as HTMLInputElement;

        fireEvent.click(firstOption);
        expect(firstOption.checked).toEqual(true);

        fireEvent.click(secondOption);
        expect(firstOption.checked).toEqual(false);
        expect(secondOption.checked).toEqual(true);

        return expect(
            screen.findByText(
                'This radio group uses the FormiflyRadioGroup component, which creates an accessible field set to hold the options.',
            ),
        ).resolves.not.toBeNull();
    });

    it('renders a horizontal radio group', () => {
        const firstOption = screen.getByLabelText('Cool option') as HTMLInputElement;
        const secondOption = screen.getByLabelText('Cooler option') as HTMLInputElement;

        fireEvent.click(firstOption);
        expect(firstOption.checked).toEqual(true);

        fireEvent.click(secondOption);
        expect(firstOption.checked).toEqual(false);
        expect(secondOption.checked).toEqual(true);

        return expect(screen.findByText('Also select one of these horizontal fields please')).resolves.not.toBeNull();
    });

    it('renders a functional multi select', () => {
        const selectAnchor = screen.getByText('Nothing selected');
        fireEvent.focus(selectAnchor);

        const selectAllOption = screen.getByLabelText('Select all');
        fireEvent.click(selectAllOption);
        expect(screen.getByText('All selected')).not.toBeNull();

        fireEvent.click(selectAllOption);
        expect(screen.getByText('Nothing selected')).not.toBeNull();

        fireEvent.click(screen.getByLabelText('Select me'));
        expect(screen.queryAllByText('Select me').length).toBe(2);

        fireEvent.click(screen.getByLabelText('Select me too'));
        expect(screen.getByText('Select me, Select me too')).not.toBeNull();

        fireEvent.click(screen.getByLabelText('So many options'));
        expect(screen.getByText('Select me, Select me too, So many options')).not.toBeNull();

        const trySelectingAll = screen.getByLabelText('Try selecting all of them');
        fireEvent.click(trySelectingAll);
        expect(screen.getByText('4 selected')).not.toBeNull();

        fireEvent.click(trySelectingAll);
        expect(screen.getByText('Select me, Select me too, So many options')).not.toBeNull();

        fireEvent.click(trySelectingAll);
        fireEvent.click(screen.getByLabelText('Or try selecting all but one'));

        return expect(screen.findByText('All selected')).resolves.not.toBeNull();
    });

    it('allows adding and removing fruit', () => {
        const removeButton = screen.getByText('Remove this fruit') as HTMLInputElement;
        const addButton = screen.getByText('Add another fruit') as HTMLInputElement;

        expect(addButton.disabled).toBe(false);

        fireEvent.click(addButton);
        expect(screen.queryAllByText('Remove this fruit').length).toBe(2);
        fireEvent.click(addButton);
        fireEvent.click(addButton);
        fireEvent.click(addButton);

        expect(addButton.disabled).toBe(true);

        fireEvent.click(removeButton);
        expect(screen.queryAllByText('Remove this fruit').length).toBe(4);
        expect(addButton.disabled).toBe(false);
    });

    it('shows an error message when not enough fruit are created', () => {
        fireEvent.click(screen.getByText('Remove this fruit'));
        screen.findByText('You must create at least one fruit').then((result) => {
            expect(result).toBeTruthy();
        });
    });

    it('renders a checkbox that can be interacted with', () => {
        const tastyCheck = screen.getByLabelText('Tasty') as HTMLInputElement;

        expect(tastyCheck.checked).toBe(true);
        fireEvent.click(tastyCheck);

        return waitFor(() => !tastyCheck.checked);
    });

    it('renders a form that can not be submitted while values are missing', () => {
        const submitButton = screen.getByText('Submit Form');

        fireEvent.click(submitButton);
        return findAllAlertsWithContent().then((result) => {
            expect(result).not.toStrictEqual([]);
        });
    });

    it('renders a form that can be submitted when all values are filled in', () => {
        changeInputValue(screen.getByLabelText('Enter a number'), 3);
        changeInputValue(screen.getByLabelText('Enter a whole number'), 1);
        changeInputValue(screen.getByLabelText('Enter a string'), 'banana');
        changeInputValue(screen.getByLabelText('Select something'), 'option2');
        changeInputValue(screen.getByLabelText('Name'), 'banana');

        fireEvent.focus(screen.getByText('Nothing selected'));
        fireEvent.click(screen.getByLabelText('Select me'));

        fireEvent.click(screen.getByLabelText('Second option'));

        fireEvent.click(screen.getByText('Submit Form'));

        return screen.findByText('Submission successful').then((result) => {
            expect(result).not.toBeNull();
        });
    });

    it('can show error messages for checkboxes', () => {
        const expiredCheck = screen.getByLabelText('Expired');
        fireEvent.click(expiredCheck);
        fireEvent.blur(expiredCheck);
        return expect(screen.findByText('You cannot add expired food.')).resolves.not.toBeNull();
    });
});
