import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
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
        expect(failingFunc).toThrowError('Object validators must not be used for input fields directly');
    });

    it('throws an error when trying to get context outside of a provider', () => {
        const failingFunc = () => {
            render(<NotInProviderComponent/>);
        };
        expect(failingFunc).toThrowError('Attempted to use formifly context outside of a provider. Only call useFormiflyContext from a component within a FormiflyForm.');
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
});
