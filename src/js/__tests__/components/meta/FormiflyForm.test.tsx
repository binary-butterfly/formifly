import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import ObjectValidator from '../../../classes/ObjectValidator';
import StringValidator from '../../../classes/StringValidator';
import FormiflyForm from '../../../components/meta/FormiflyForm';
import i18n from 'i18next';
import {initReactI18next, useTranslation} from 'react-i18next';
import AutomagicFormiflyField from '../../../components/input/AutomagicFormiflyField';
import NumberValidator from '../../../classes/NumberValidator';
import AnyOfValidator from '../../../classes/AnyOfValidator';
import {changeInputValue} from '../demo/DemoForm.test';
import {vitest} from 'vitest';

describe('FormiflyForm', () => {
    it('checks if user prefers reduced motion when no override is set', () => {
        vitest.spyOn(window, 'matchMedia').mockImplementation(() => {
            return {matches: true} as Partial<MediaQueryList> as MediaQueryList;
        });

        render(<FormiflyForm shape={new ObjectValidator({foo: new StringValidator()})} onSubmit={() => {
        }}>
            <b>Test</b>
        </FormiflyForm>);

        expect(window.matchMedia).toHaveBeenCalled();
    });

    it('can make use of a custom translation function', () => {
        const resources = {
            en: {
                formifly: {
                    required: 'Custom required string',
                },
            },
        };

        i18n.use(initReactI18next).init({
            resources,
            lng: 'en',
            interpolation: {
                escapeValue: false,
            },
        });

        const TestComponent = () => {
            const {t} = useTranslation(['formifly']);

            const shape = new ObjectValidator({
                test: new StringValidator().required(),
            });

            return <FormiflyForm onSubmit={vitest.fn()} shape={shape} t={t}>
                <AutomagicFormiflyField label="Test!" name="test"/>
                <button type="submit">Submit!</button>
            </FormiflyForm>;
        };

        render(<TestComponent/>);
        fireEvent.submit(screen.getByText('Submit!'));

        return expect(screen.findByText('Custom required string')).resolves.toBeTruthy();
    });

    it('Uses the translation correct namespace when given a translation function', () => {
        const resources = {
            en: {
                banana: {
                    whole_number: 'This is incorrect!',
                    any_of: 'This is also incorrect!',
                },
                formifly: {
                    whole_number: 'This must be a number!',
                    any_of: 'This must be any of!',
                },
            },
        };

        i18n.use(initReactI18next).init({
            resources,
            lng: 'en',
            interpolation: {
                escapeValue: false,
            },
        });

        const TestComponent = () => {
            const {t} = useTranslation(['banana', 'formifly']);

            const shape = new ObjectValidator({
                number: new NumberValidator(true),
                any_of: new AnyOfValidator([
                    new StringValidator()
                        .minLength(2)
                        .required(),
                    new NumberValidator().required(),
                ], 'a'),
            });

            return <FormiflyForm t={t} shape={shape} onSubmit={vitest.fn()}>
                <AutomagicFormiflyField label="Number" name="number"/>
                <AutomagicFormiflyField label="AnyOf" name="any_of"/>
                <button type="submit">Submit</button>
            </FormiflyForm>;
        };

        render(<TestComponent/>);
        changeInputValue(screen.getByLabelText('Number'), '1.23');

        return expect(
            screen.findByText('This must be a number!').then(() => {
                changeInputValue(screen.getByLabelText('AnyOf'), 'a');
                return screen.findByText('This must be any of!');
            }),
        ).resolves.toBeTruthy();
    });
});
