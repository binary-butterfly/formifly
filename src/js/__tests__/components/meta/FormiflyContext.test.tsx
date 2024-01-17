import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import ArrayValidator from '../../../classes/ArrayValidator';
import BooleanValidator from '../../../classes/BooleanValidator';
import NumberValidator from '../../../classes/NumberValidator';
import ObjectValidator from '../../../classes/ObjectValidator';
import StringValidator from '../../../classes/StringValidator';
import AutomagicFormiflyField from '../../../components/input/AutomagicFormiflyField';
import {useFormiflyContext} from '../../../components/meta/FormiflyContext';
import FormiflyForm from '../../../components/meta/FormiflyForm';
import withFormifly from '../../../components/meta/withFormifly';
import {Value} from '../../../types';

const ObjectComponent = withFormifly((props) => {
    const {getFieldProps} = props;
    getFieldProps('foo');
    return <b>Test</b>;
});

const NotInProviderComponent = () => {
    const {getFieldProps} = useFormiflyContext();
    return <b {...getFieldProps('foo') as any}>Test</b>;
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
            render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()}>
                <ObjectComponent/>
            </FormiflyForm>);
        };
        const error = vitest.fn();
        global.console.error = error;
        expect(failingFunc).toThrowError('Object validators must not be used for input fields directly');
        expect(error).toHaveBeenCalledTimes(2);
    });

    it('throws an error when trying to get context outside of a provider', () => {
        const failingFunc = () => {
            render(<NotInProviderComponent/>);
        };
        const error = vitest.fn();
        global.console.error = error;
        expect(failingFunc)
            .toThrowError(
                'Attempted to use formifly context outside of a provider. '
                + 'Only call useFormiflyContext from a component within a FormiflyForm.',
            );
        expect(error).toHaveBeenCalledTimes(2);
    });

    it('sets failure reason when onSubmit promise is rejected', () => {
        const shape = new ObjectValidator({foo: new StringValidator()});

        render(
            <FormiflyForm shape={shape} onSubmit={() => new Promise(
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
        })
            .catch((reason) => {
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

        render(<FormiflyForm shape={shape} onSubmit={() => {}} defaultValues={{fruit: [{name: 'banana', tasty: true}]}}>
            <AutomagicFormiflyField label="Name" name="fruit.0.name"/>
            <AutomagicFormiflyField label="Tasty" name="fruit.0.tasty"/>
            <AutomagicFormiflyField label="Foo" name="foo"/>
        </FormiflyForm>);

        expect((screen.getByLabelText('Name') as HTMLInputElement).value).toStrictEqual('banana');
        expect((screen.getByLabelText('Tasty') as HTMLInputElement).checked).toBe(true);
        expect((screen.getByLabelText('Foo') as HTMLInputElement).value).toStrictEqual('bar');
    });

    it('completes array default values', () => {
        const shape = new ObjectValidator({
            array: new ArrayValidator(
                new ObjectValidator({
                    foo: new StringValidator(),
                    subArray: new ArrayValidator(new StringValidator('apple')).minLength(1),
                }),
            ),
        });

        const defaultValues = {
            array: [{'foo': 'banana'}, {'foo': 'cucumber'}],
        };

        render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()} defaultValues={defaultValues}>
            <AutomagicFormiflyField label="Foo" name="array.0.foo"/>
            <AutomagicFormiflyField label="Sub Array Text" name="array.0.subArray.0"/>
            <AutomagicFormiflyField label="Foo2" name="array.1.foo"/>
            <AutomagicFormiflyField label="Sub Array Text2" name="array.1.subArray.0"/>
        </FormiflyForm>);

        expect((screen.getByLabelText('Foo') as HTMLInputElement).value).toStrictEqual('banana');
        expect((screen.getByLabelText('Sub Array Text') as HTMLInputElement).value).toStrictEqual('apple');
        expect((screen.getByLabelText('Foo2') as HTMLInputElement).value).toStrictEqual('cucumber');
        expect((screen.getByLabelText('Sub Array Text2') as HTMLInputElement).value).toStrictEqual('apple');
    });

    it('can check if objects have errors or touched fields within them', async () => {
        const shape = new ObjectValidator({
            stepOne: new ObjectValidator({
                field: new NumberValidator().positive()
                    .required(),
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

        render(<FormiflyForm disableNativeRequired={true} shape={shape} onSubmit={() => Promise.resolve()}>
            <AutomagicFormiflyField label="Foo" name="foo"/>
        </FormiflyForm>);

        const input = screen.getByLabelText('Foo');
        expect((input as HTMLInputElement).required).toBe(false);
        expect(input.attributes.getNamedItem('aria-required')).toBeTruthy();
    });

    it('can disable the native min and max props', () => {
        const shape = new ObjectValidator({
            foo: new NumberValidator().min(0)
                .max(1),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()} disableNativeMinMax={true}>
            <AutomagicFormiflyField label="Foo" name="foo"/>
        </FormiflyForm>);

        const input = screen.getByLabelText('Foo');
        expect(input.attributes.getNamedItem('min')).toBeNull();
        expect(input.attributes.getNamedItem('max')).toBeNull();
    });

    it('can enable the native min and max props', () => {
        const shape = new ObjectValidator({
            foo: new NumberValidator().min(0)
                .max(1),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()} disableNativeMinMax={false}>
            <AutomagicFormiflyField label="Foo" name="foo"/>
        </FormiflyForm>);

        const input = screen.getByLabelText('Foo');
        expect(input.attributes.getNamedItem('min')).not.toBeNull();
        expect(input.attributes.getNamedItem('max')).not.toBeNull();
    });

    it('can trigger field validation', () => {
        const CheckForm = withFormifly((props) => {
            const {validateField} = props;
            const [valid1, setValid1] = React.useState<boolean>();
            const [valid2, setValid2] = React.useState<boolean>();

            const handleTestButtonClick = () => validateField('foo', '').then((valid) => {
                setValid1(valid);
                validateField('bar', '').then((newValid2) => {
                    setValid2(newValid2);
                });
            });

            return <>
                <p>Valid1: {String(valid1)}</p>
                <p>Valid2: {String(valid2)}</p>
                <AutomagicFormiflyField label="foo" name="foo"/>
                <AutomagicFormiflyField label="bar" name="bar"/>
                <button type="button" onClick={handleTestButtonClick}>Click</button>
            </>;
        });

        const shape = new ObjectValidator({
            foo: new StringValidator(),
            bar: new StringValidator().required(),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()}>
            <CheckForm/>
        </FormiflyForm>);

        fireEvent.click(screen.getByText('Click'));

        return screen.findByText('Valid1: true').then((found) => {
            expect(found).not.toBeNull();
            expect(screen.getByText('Valid2: false')).not.toBeNull();
        });
    });

    it('returns a promise with the new values from setFieldValue', async () => {
        const FormThatMakesNoSense = withFormifly((props) => {
            const {setFieldValue} = props;
            const [fooText, setFooText] = React.useState<Value>();

            const handleCoolButtonClick = () => {
                setFieldValue('foo', 'foo').then((newValues) => {
                    setFooText(newValues.foo);
                });
            };

            return <>
                <p>{fooText}</p>
                <AutomagicFormiflyField label="fooField" name="foo"/>
                <button onClick={handleCoolButtonClick}>Cool button m8</button>
            </>;
        });

        const shape = new ObjectValidator({
            foo: new StringValidator(),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()}>
            <FormThatMakesNoSense/>
        </FormiflyForm>);

        fireEvent.click(screen.getByText('Cool button m8'));
        expect(await screen.findByText('foo')).not.toBeNull();
        await (waitFor(() => expect((screen.getByLabelText('fooField') as HTMLInputElement).value).toBe('foo')));
    });

    it('can set multiple field values at once', async () => {
        const AwesomeForm = withFormifly((props) => {
            const {setMultipleFieldValues} = props;
            const [fooText, setFooText] = React.useState<Value>();


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

        render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()}>
            <AwesomeForm/>
        </FormiflyForm>);

        fireEvent.click(screen.getByText('Button'));
        expect(await screen.findByText('Foo: foo')).not.toBeNull();
        await (waitFor(() => expect((screen.getByLabelText('barField') as HTMLInputElement).value).toBe('bar')));
    });

    it('runs onSubmitValidationError handler', () => {
        const Form = () => {
            const [submitError, setSubmitError] = React.useState(false);

            const shape = new ObjectValidator({
                foo: new StringValidator().required(),
            });

            return <FormiflyForm shape={shape} onSubmit={() => Promise.resolve()} onSubmitValidationError={() => setSubmitError(true)}>
                {submitError && <p>Submission has failed</p>}
                <button type="submit">Submit</button>
            </FormiflyForm>;
        };

        render(<Form/>);

        expect(screen.queryByText('Submission has failed')).toBeNull();
        fireEvent.click(screen.getByText('Submit'));

        return screen.findByText('Submission has failed')
            .then((result) => {
                return expect(result).not.toBeNull();
            });
    });

    it('can get the field value if it is not passed to validateField', () => {
        const Form = withFormifly((props) => {
            const [fieldValid, setFieldValid] = React.useState(false);
            const {validateField} = props;

            const handleClick = () => {
                validateField('foo').then((valid) => {
                    setFieldValid(valid);
                });
            };

            return <>
                {fieldValid && <p>That field is valid!</p>}
                <button onClick={handleClick}>Validate that field!</button>
            </>;
        });

        const shape = new ObjectValidator({
            foo: new StringValidator().required(),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()} defaultValues={{foo: 'bar'}}>
            <Form/>
        </FormiflyForm>);

        expect(screen.queryByText('That field is valid!')).toBeNull();
        fireEvent.click(screen.getByText('Validate that field!'));

        return screen.findByText('That field is valid!').then(found => expect(found).not.toBeNull());
    });

    it('can validate multiple fields at once', () => {
        const NotReallyAForm = withFormifly((props) => {
            const {validateMultipleFields} = props;
            const [allPassed, setAllPassed] = React.useState(true);

            const handleClick = () => {
                validateMultipleFields([['foo', ''], ['bar']]).then(newAllPassed => setAllPassed(newAllPassed));
            };

            return <>
                {!allPassed && <p>Not all fields have passed validation</p>}
                <AutomagicFormiflyField label="foo" name="foo" id="foo-input"/>
                <AutomagicFormiflyField label="bar" name="bar" id="bar-input"/>
                <button onClick={handleClick}>Validate those fields!</button>
            </>;
        });

        const shape = new ObjectValidator({
            foo: new StringValidator(),
            bar: new StringValidator().required('this would have been required'),
        });

        render(<FormiflyForm shape={shape} onSubmit={() => Promise.resolve()}>
            <NotReallyAForm/>
        </FormiflyForm>);

        expect(screen.queryByText('Not all fields have passed validation')).toBeNull();
        fireEvent.click(screen.getByText('Validate those fields!'));

        return screen.findByText('this would have been required').then((found) => {
            expect(found).not.toBeNull();
            expect(screen.getByText('Not all fields have passed validation')).not.toBeNull();
            expect(document.getElementById('foo-input')?.getAttribute('aria-invalid')).toBe('false');
            expect(document.getElementById('bar-input')?.getAttribute('aria-invalid')).toBe('true');
        });
    });

    it('Does not call on onSubmitValidationError if a user supplied synchronous onSubmit function throws an error', () => {
        const onSubmitValidationError = vitest.fn();
        const handleSubmit = vitest.fn().mockImplementation(() => {
            throw 'Test error';
        });

        const TestComponent = withFormifly((props) => {
            const {submitFailureReason} = props;
            return <>
                <p>{JSON.stringify(submitFailureReason)}</p>
                <button type="submit">Submit Form!</button>
            </>;
        });

        render(<FormiflyForm onSubmit={handleSubmit} onSubmitValidationError={onSubmitValidationError}
                             shape={new ObjectValidator({foo: new StringValidator()})}>
            <TestComponent/>
        </FormiflyForm>);

        fireEvent.click(screen.getByText('Submit Form!'));

        return screen.findByText('"Test error"', undefined, {timeout: 4000}).then(() => {
            expect(handleSubmit).toHaveBeenCalledTimes(1);
            return expect(onSubmitValidationError).toHaveBeenCalledTimes(0);
        });
    });

    it('Does not call on onSubmitValidationError if a user supplied async onSubmit function throws an error', () => {
        const onSubmitValidationError = vitest.fn();
        const handleSubmit = vitest.fn().mockImplementation(() => {
            return new Promise((resolve, reject) => {
                reject('Test error');
            });
        });

        const TestComponent = withFormifly((props) => {
            const {submitFailureReason} = props;
            return <>
                <p>{submitFailureReason}</p>
                <button type="submit">Submit Form!</button>
            </>;
        });

        render(<FormiflyForm onSubmit={handleSubmit} onSubmitValidationError={onSubmitValidationError}
                             shape={new ObjectValidator({foo: new StringValidator()})}>
            <TestComponent/>
        </FormiflyForm>);

        fireEvent.click(screen.getByText('Submit Form!'));

        return screen.findByText('Test error', undefined, {timeout: 4000}).then(() => {
            expect(handleSubmit).toHaveBeenCalledTimes(1);
            return expect(onSubmitValidationError).toHaveBeenCalledTimes(0);
        });
    });

    it('Sets submitting to false if onSubmit function is synchronous', () => {
        const handleSubmit = vitest.fn().mockImplementation(() => true);

        const NotARealForm = withFormifly((props) => {
            const {submitSuccess} = props;
            return <>
                {submitSuccess && <p>Submission successful!</p>}
                <button type="submit">Submit!</button>
            </>;
        });

        render(<FormiflyForm onSubmit={handleSubmit} shape={new ObjectValidator({foo: new StringValidator()})}>
            <NotARealForm/>
        </FormiflyForm>);

        fireEvent.click(screen.getByText('Submit!'));

        return screen.findByText('Submission successful!')
            .then(() => {
                return expect(handleSubmit).toHaveBeenCalledTimes(1);
            });
    });
});
