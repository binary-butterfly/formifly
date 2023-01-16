import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import ObjectValidator from '../../../classes/ObjectValidator';
import StringValidator from '../../../classes/StringValidator';
import FormiflyForm from '../../../components/meta/FormiflyForm';
import i18n from 'i18next';
import {initReactI18next, useTranslation} from 'react-i18next';
import AutomagicFormiflyField from '../../../components/input/AutomagicFormiflyField';

describe('FormiflyForm', () => {
    it('checks if user prefers reduced motion when no override is set', () => {
        const matchFn = jest.fn().mockImplementation(() => {
            return {matches: true};
        });
        global.window.matchMedia = matchFn;

        render(<FormiflyForm shape={new ObjectValidator({foo: new StringValidator()})} onSubmit={() => {
        }}>
            <b>Test</b>
        </FormiflyForm>);

        expect(matchFn).toHaveBeenCalled();
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

            return <FormiflyForm onSubmit={jest.fn()} shape={shape} t={t}>
                <AutomagicFormiflyField label="Test!" name="test"/>
                <button type="submit">Submit!</button>
            </FormiflyForm>;
        };

        render(<TestComponent/>);
        fireEvent.click(screen.getByText('Submit!'));

        return expect(screen.findByText('Custom required string')).resolves.toBeTruthy();
    });
});
