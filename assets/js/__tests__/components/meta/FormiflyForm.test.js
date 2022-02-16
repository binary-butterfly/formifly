import React from 'react';
import {render} from '@testing-library/react';
import ObjectValidator from '../../../classes/ObjectValidator';
import StringValidator from '../../../classes/StringValidator';
import FormiflyForm from '../../../components/meta/FormiflyForm';

describe('FormiflyForm', () => {
    it('checks if user prefers reduced motion when no override is set', () => {
        const matchFn = jest.fn().mockImplementation(() => {
            return {matches: true};
        });
        global.window.matchMedia = matchFn;

        render(<FormiflyForm shape={new ObjectValidator({foo: new StringValidator()})} onSubmit={() => null}>
            <b>Test</b>
        </FormiflyForm>);
        
        expect(matchFn).toHaveBeenCalled();
    });
});
