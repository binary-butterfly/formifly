import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import ArrayValidator from '../../../classes/ArrayValidator';
import BooleanValidator from '../../../classes/BooleanValidator';
import NumberValidator from '../../../classes/NumberValidator';
import ObjectValidator from '../../../classes/ObjectValidator';
import StringValidator from '../../../classes/StringValidator';
import AutomagicFormiflyField from '../../../components/input/AutomagicFormiflyField';
import {useFormiflyContext} from '../../../components/meta/FormiflyContext';
import FormiflyForm from '../../../components/meta/FormiflyForm';
import withFormifly from '../../../components/meta/withFormifly';

const ObjectComponent = withFormifly((props) => {
    const {getFieldProps} = props;
    getFieldProps('foo');
    return <b>Test</b>;
});

const NotInProviderComponent = () => {
    const {getFieldProps} = useFormiflyContext();
    return <b {...getFieldProps('foo')}>Test</b>;
};

const SubmitErrorDisplay = withFormifly((props) => {
    return <>
        <p>{props.submitSuccess ? 'Submission succeeded' : 'Submission did not succeed'}</p>
        <p>{JSON.stringify(props.submitFailureReason)}</p>
    </>;
});

describe('FormiflyContext', () => {
    it('throws an error when trying to get field props for an object validator', () => {
        const failingFunc = () => {
            const shape = new ObjectValidator({foo: new ObjectValidator({bar: new StringValidator()})});
            render(<FormiflyForm shape={shape} onSubmit={() => null}>
                <ObjectComponent/>
            </FormiflyForm>);
        };
        const error = jest.fn();
        global.console.error = error;
        expect(failingFunc).toThrowError('Object validators must not be used for input fields directly');
        expect(error).toHaveBeenCalledTimes(2);
    });

    it('throws an error when trying to get context outside of a provider', () => {
        const failingFunc = () => {
            render(<NotInProviderComponent/>);
        };
        const error = jest.fn();
        global.console.error = error;
        expect(failingFunc).toThrowError('Attempted to use formifly context outside of a provider. Only call useFormiflyContext from a component within a FormiflyForm.');
        expect(error).toHaveBeenCalledTimes(2);
    });

    it('sets failure reason when onSubmit promise is rejected', () => {
        const shape = new ObjectValidator({foo: new StringValidator()});

        render(<FormiflyForm shape={shape} onSubmit={() => new Promise(
                (resolve, reject) => reject({status: 400}),
            )}>
                <SubmitErrorDisplay/>
                <AutomagicFormiflyField label={'foo'} name={'foo'}/>
                <button type="submit">Submit</button>
            </FormiflyForm>,
        );

        fireEvent.click(screen.getByText('Submit'));
        return screen.findByText('{"status":400}').then(() => {
            expect(screen.getByText('Submission did not succeed')).not.toBeNull();
        }).catch((reason) => {
            expect(reason).toBeNull();
        });
    });

    it('completes default values', () => {
        const shape = new ObjectValidator({
            fruit: new ArrayValidator(new ObjectValidator({
                name: new StringValidator(),
                tasty: new BooleanValidator(),
            })),
            foo: new StringValidator('bar'),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => null} defaultValues={{fruit: [{name: 'banana', tasty: true}]}}>
            <AutomagicFormiflyField label="Name" name="fruit.0.name"/>
            <AutomagicFormiflyField label="Tasty" name="fruit.0.tasty"/>
            <AutomagicFormiflyField label="Foo" name="foo"/>
        </FormiflyForm>);

        expect(screen.getByLabelText('Name').value).toStrictEqual('banana');
        expect(screen.getByLabelText('Tasty').checked).toBe(true);
        expect(screen.getByLabelText('Foo').value).toStrictEqual('bar');
    });

    it('can check if objects have errors or touched fields within them', async () => {
        const shape = new ObjectValidator({
            stepOne: new ObjectValidator({
                field: new NumberValidator().positive().required(),
            }),
            stepTwo: new ObjectValidator({
                field: new StringValidator(),
            }),
        });

        const SubFormThing = () => {
            const {hasErrors, hasBeenTouched} = useFormiflyContext();
            return <>
                {hasErrors('stepOne') && <b>Step one has errors</b>}
                {hasBeenTouched('stepOne') && <b>Step one has been touched</b>}
                {!hasErrors('stepTwo') && <b>Step two has no errors</b>}
                {!hasBeenTouched('stepTwo') && <b>Step two has not been touched</b>}
                <AutomagicFormiflyField label={'field one'} name={'stepOne.field'}/>
                <AutomagicFormiflyField label={'field two'} name={'stepTwo.field'}/>
            </>;
        };

        render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()}>
            <SubFormThing/>
            <button type="submit">Submit</button>
        </FormiflyForm>);

        expect(screen.getByText('Step two has not been touched')).not.toBeNull();

        const fieldOne = screen.getByLabelText('field one');
        fireEvent.focus(fieldOne);
        fireEvent.change(fieldOne, {target: {value: 0}});
        fireEvent.blur(fieldOne);

        expect(screen.getByText('Step one has been touched')).not.toBeNull();
        expect(screen.getByText('Step one has errors')).not.toBeNull();
        expect(screen.getByText('Step two has no errors')).not.toBeNull();
    });

    it('can disable the required prop', () => {
        const shape = new ObjectValidator({
            foo: new StringValidator().required(),
        });

        render(<FormiflyForm disableNativeRequired={true} shape={shape} onSubmit={() => null}>
            <AutomagicFormiflyField label="Foo" name="foo"/>
        </FormiflyForm>);

        const input = screen.getByLabelText('Foo');
        expect(input.required).toBe(false);
        expect(input.attributes['aria-required']).toBeTruthy();
    });

    it('can disable the native min and max props', () => {
        const shape = new ObjectValidator({
            foo: new NumberValidator().min(0).max(1),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => null} disableNativeMinMax={true}>
            <AutomagicFormiflyField label="Foo" name="foo"/>
        </FormiflyForm>);

        const input = screen.getByLabelText('Foo');
        expect(input.attributes.min).toBeUndefined();
        expect(input.attributes.max).toBeUndefined();
    });

    it('can trigger field validation', () => {
        const CheckForm = withFormifly((props) => {
            const {validateField} = props;
            const [valid1, setValid1] = React.useState();
            const [valid2, setValid2] = React.useState();

            const handleTestButtonClick = () => validateField('foo').then((valid) => {
                setValid1(valid);
                validateField('bar').then(valid2 => {
                    setValid2(valid2);
                });
            });

            return <>
                <p>Valid1: {valid1}</p>
                <p>Valid2: {valid2}</p>
                <AutomagicFormiflyField label="foo" name="foo"/>
                <AutomagicFormiflyField label="bar" name="bar"/>
                <button onClick={handleTestButtonClick}>Click</button>
            </>;
        });

        const shape = new ObjectValidator({
            foo: new StringValidator(),
            bar: new StringValidator().required(),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => null}>
            <CheckForm/>
        </FormiflyForm>);

        fireEvent.click(screen.getByText('Click'));
        expect(screen.findByText('Valid1: true')).not.toBeNull();
        expect(screen.findByText('Valid2: false')).not.toBeNull();
    });

    it('returns a promise with the new values from setFieldValue', async () => {
        const FormThatMakesNoSense = withFormifly((props) => {
            const {setFieldValue} = props;
            const [fooText, setFooText] = React.useState();

            const handleCoolButtonClick = () => {
                setFieldValue('foo', 'foo').then((newValues) => {
                    setFooText(newValues.foo);
                });
            };

            return <>
                <p>{fooText}</p>
                <AutomagicFormiflyField label='fooField' name='foo'/>
                <button onClick={handleCoolButtonClick}>Cool button m8</button>
            </>;
        });

        const shape = new ObjectValidator({
            foo: new StringValidator(),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => null}>
            <FormThatMakesNoSense/>
        </FormiflyForm>);

        fireEvent.click(screen.getByText('Cool button m8'));
        expect(screen.findByText('foo')).not.toBeNull();
        await (waitFor(() => expect(screen.getByLabelText('fooField').value).toBe('foo')));
    });

    it('can set multiple field values at once', async () => {
        const AwesomeForm = withFormifly((props) => {
            const {setMultipleFieldValues} = props;
            const [fooText, setFooText] = React.useState();


            const handleButtonClick = () => {
                setMultipleFieldValues([['foo', 'foo'], ['bar', 'bar']]).then((newValues) => {
                    setFooText(newValues.foo);
                });
            };

            return <>
                <p>Foo: {fooText}</p>
                <AutomagicFormiflyField label="barField" name="bar"/>
                <button onClick={handleButtonClick}>Button</button>
            </>;
        });

        const shape = new ObjectValidator({
            foo: new StringValidator(),
            bar: new StringValidator(),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => null}>
            <AwesomeForm/>
        </FormiflyForm>);

        fireEvent.click(screen.getByText('Button'));
        expect(screen.findByText('Foo: foo')).not.toBeNull();
        await (waitFor(() => expect(screen.getByLabelText('barField').value).toBe('bar')));
    });
});
