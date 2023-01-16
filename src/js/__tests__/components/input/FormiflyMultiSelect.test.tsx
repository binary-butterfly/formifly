import {render} from '@testing-library/react';
import React from 'react';
import ArrayValidator from '../../../classes/ArrayValidator';
import ObjectValidator from '../../../classes/ObjectValidator';
import StringValidator from '../../../classes/StringValidator';
import AutomagicFormiflyField from '../../../components/input/AutomagicFormiflyField';
import FormiflyForm from '../../../components/meta/FormiflyForm';

describe.each([
    [true, 'background-color 0s ease-in', 'reduces motion when reduceMotion is true'],
    [false, 'background-color 0.25s ease-in', 'does not reduce motion when reduceMotion is false'],
])('Test FormiflyMultiSelect', (reducedMotion, expectedStyle, name) => {
    test(name, () => {
        const shape = new ObjectValidator({foo: new ArrayValidator(new StringValidator())});
        render(<FormiflyForm shape={shape} onSubmit={() => {}} theme={{reducedMotion: reducedMotion}}>
            <AutomagicFormiflyField label="test" name="foo" options={[{value: 'bla', label: 'blub'}]}/>
        </FormiflyForm>);

        const options = document.getElementsByClassName('formifly-multi-select-option');
        const style = window.getComputedStyle(options[0]);

        expect(style.transition).toStrictEqual(expectedStyle);

    });
});
