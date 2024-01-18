import React from 'react';
import styled from 'styled-components';
import ArrayValidator from '../../classes/ArrayValidator';
import DateTimeValidator from '../../classes/DateTimeValidator';
import BooleanValidator from '../../classes/BooleanValidator';
import NumberValidator from '../../classes/NumberValidator';
import ObjectValidator from '../../classes/ObjectValidator';
import StringValidator from '../../classes/StringValidator';
import AutomagicFormiflyField from '../input/AutomagicFormiflyField';
import {useFormiflyContext} from '../meta/FormiflyContext';
import FormiflyForm from '../meta/FormiflyForm';
import {DeepPartial, Dependent, ErrorFunction, MutationFunction, ValueOfValidator} from '../../types';
import DateValidator from '../../classes/DateValidator';

const Button = styled.button`
  background-color: transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  padding: 0.25rem;
  margin: 0.5rem 0 0.5rem 0;

  &:focus-visible {
    box-shadow: 0 0 5px black;
  }
`;

const FruitContainer = styled.div`
  margin: 1rem 0 1rem 0;
  display: flex;
  flex-direction: column;

  & > button {
    width: 10rem;
  }
`;

const FruitError = styled.p`
  color: red;
`;

const DemoFormContent = (props: { shape: typeof validator }) => {
    const {shape} = props;
    const {values, setFieldValue, errors, validateField} = useFormiflyContext<typeof shape>();

    const handleRemoveFruitClick = (index: number) => {
        const newFruitValue = [...values.fruit.filter((_: any, fIndex: number) => fIndex !== index)];
        setFieldValue('fruit', newFruitValue);
        validateField('fruit', newFruitValue);
    };

    const handleAddAnotherFruitClick = () => {
        const newFruitValue = [...values.fruit];
        newFruitValue.push(shape.fields.fruit.getDefaultValue()[0]);
        setFieldValue('fruit', newFruitValue);
        validateField('fruit', newFruitValue);
    };

    const addFruitDisabled = values.fruit.length >= shape.fields.fruit.maxChildCount;
    return <>
        <AutomagicFormiflyField name="number" label="Enter a number"/>
        <AutomagicFormiflyField name="wholeNumber" help="Only numbers without decimal places are allowed here"
                                label="Enter a whole number"/>
        <AutomagicFormiflyField name="string" label="Enter a string" help="Only lowercase characters are allowed here."/>
        <AutomagicFormiflyField label="This input does not have the fancy label effect" labelNoMove={true} name="foo"/>
        <AutomagicFormiflyField name="date" help="Only dates in the future are allowed here." label="Select a date/time"/>
        <AutomagicFormiflyField label="Select a date" name="onlyDate"/>
        <AutomagicFormiflyField name="laterDate" label="Select a later date/time"/>
        <AutomagicFormiflyField label="Select something" name="select" options={[
            {label: 'Option 1', value: 'option1'},
            {label: 'Option 2', value: 'option2'},
        ]}/>
        <AutomagicFormiflyField label="Select something else" name="selectTwo" help="Isn't it great to have choices?" options={[
            {label: 'Foo 1', value: 'foo1'},
            {label: 'Foo 2', value: 'foo2'},
        ]}/>

        <p id="radiogroup-1-title">Please select one of these fields</p>
        <AutomagicFormiflyField additionalDescribedBy="radiogroup-1-title" label="This is a radio option" name="radioGroupOne" type="radio"
                                value="radio-option-1"/>
        <AutomagicFormiflyField additionalDescribedBy="radiogroup-1-title" label="This is another radio option" name="radioGroupOne"
                                type="radio" value="radio-option-2"/>

        <AutomagicFormiflyField label="Please select one of these fields as well"
                                name="radioGroupTwo"
                                type="radio-group"
                                help="This radio group uses the FormiflyRadioGroup component, which creates an accessible field set to hold the options."
                                options={[
                                    {label: 'First option', value: 'first-option'}, {label: 'Second option', value: 'second-option'},
                                ]}/>
        <AutomagicFormiflyField label="Also select one of these horizontal fields please"
                                name="radioGroupThree"
                                type="radio-group"
                                horizontal={true}
                                options={[
                                    {label: 'Cool option', value: 'cool'}, {label: 'Cooler option', value: 'cooler'},
                                ]}/>
        <AutomagicFormiflyField name="multi"
                                label="Select one or more options"
                                options={[
                                    {label: 'Select me', value: 'multi1'},
                                    {label: 'Select me too', value: 'multi2'},
                                    {label: 'So many options', value: 'multi3'},
                                    {label: 'Try selecting all of them', value: 'multi4'},
                                    {label: 'Or try selecting all but one', value: 'multi5'},
                                ]}/>
        <FruitError aria-live="polite" aria-relevant="additions" role="alert">
            {!!errors.fruit && typeof errors.fruit === 'string' && errors.fruit}
        </FruitError>
        {values.fruit.map((_: unknown, index: number) => {
            const disabled = values.fruit.length <= shape.fields.fruit.minChildCount;
            return <FruitContainer key={'fruit-input' + index}>
                <Button onClick={() => handleRemoveFruitClick(index)} type="button"
                        title={disabled ? 'There must be at least ' + shape.fields.fruit.minChildCount + ' fruit.' : ''}>
                    Remove this fruit
                </Button>
                <AutomagicFormiflyField name={'fruit.' + index + '.name'} label="Name"/>
                <AutomagicFormiflyField name={'fruit.' + index + '.tasty'} label="Tasty"/>
                <AutomagicFormiflyField name={'fruit.' + index + '.expired'}
                                        label="Expired"
                                        help="Fruit may be still edible long after it's best before date, however once it expires, you should no longer eat it."/>
            </FruitContainer>;
        })}
        <Button onClick={handleAddAnotherFruitClick}
                type="button"
                disabled={addFruitDisabled}
                title={addFruitDisabled ? 'There must be at most ' + shape.fields.fruit.maxChildCount + ' fruit.' : ''}>
            Add another fruit
        </Button>
        <br/>
        <br/>
        <Button type="submit">Submit Form</Button>
    </>;
};

class NotTrueValidator extends BooleanValidator {
    constructor(
        defaultValue: boolean | undefined,
        defaultErrorMsg: string,
        mutationFunc?: MutationFunction,
        onError?: ErrorFunction,
        dependent?: Dependent,
    ) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);
        this.validateFuncs.push(value => ({
            success: value !== 'true' && value !== true,
            errorMsg: defaultErrorMsg,
            msgName: 'not_true',
            changedValue: Boolean(value),
        }));
    }
}

export const validator = new ObjectValidator({
    number: new NumberValidator()
        .min(2)
        .required()
        .decimalPlaces(2),
    wholeNumber: new NumberValidator(true).max(5),
    string: new StringValidator()
        .required()
        .regex(/^[a-z]+$/),
    foo: new StringValidator(),
    date: new DateTimeValidator().minDate(new Date()),
    onlyDate: new DateValidator(),
    laterDate: new DateTimeValidator().greaterThanSibling('date'),
    select: new StringValidator().required(),
    selectTwo: new StringValidator(),
    radioGroupOne: new StringValidator(),
    radioGroupTwo: new StringValidator().required(),
    radioGroupThree: new StringValidator(),
    multi: new ArrayValidator(new StringValidator()).minLength(1, 'You must select at least one option.'),
    fruit: new ArrayValidator(new ObjectValidator({
        name: new StringValidator().required(),
        tasty: new BooleanValidator(true),
        expired: new NotTrueValidator(undefined, 'You cannot add expired food.'),
    })).minLength(1, 'You must create at least one fruit.')
        .maxLength(5, 'There can not be more than 5 fruit.'),
});

const DemoForm = () => {

    const [successText, setSuccessText] = React.useState('');

    const onSubmit = (values: DeepPartial<ValueOfValidator<typeof validator>> | undefined) => {
        return new Promise<void>((resolve) => {
            setSuccessText(JSON.stringify(values));
            resolve();
        });
    };

    return <FormiflyForm shape={validator} onSubmit={onSubmit}>
        {successText !== '' && <>
            <p>Submission successful</p>
            <p>Result: {successText}</p>
        </>}
        <DemoFormContent shape={validator}/>
    </FormiflyForm>;

};

export default DemoForm;
