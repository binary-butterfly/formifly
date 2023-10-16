import {render, waitFor} from '@testing-library/react';
import React from 'react';
import ArrayValidator from '../../../classes/ArrayValidator';
import ObjectValidator from '../../../classes/ObjectValidator';
import StringValidator from '../../../classes/StringValidator';
import AutomagicFormiflyField from '../../../components/input/AutomagicFormiflyField';
import FormiflyForm from '../../../components/meta/FormiflyForm';
import {css} from 'styled-components';
import 'jest-styled-components';


describe.each([
    [true, 'background-color 0s ease-in', 'reduces motion when reduceMotion is true'],
    [false, 'background-color 0.25s ease-in', 'does not reduce motion when reduceMotion is false'],
])('Test FormiflyMultiSelect', (reducedMotion, expectedStyle, name) => {
    test(name, async () => {
        const shape = new ObjectValidator({foo: new ArrayValidator(new StringValidator())});
        render(<FormiflyForm shape={shape} onSubmit={() => {}} theme={{reducedMotion: reducedMotion}}>
            <AutomagicFormiflyField label="test" name="foo" options={[{value: 'bla', label: 'blub'}]}/>
        </FormiflyForm>);

        const options: HTMLCollectionOf<Element> = await waitFor(
            () => document.getElementsByClassName('formifly-multi-select-container')
        );

        expect(options[0]).toHaveStyleRule('transition', expectedStyle, {
            modifier: css`menu li`,
        });

    });
});
