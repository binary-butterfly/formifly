import {vi} from 'vitest';
import ArrayOrSpecificStringValidator from '../../classes/ArrayOrSpecificStringValidator';
import StringValidator from '../../classes/StringValidator';

describe('ArrayOrSpecificStringValidatorWithoutMocks', () => {
    it('functions just like the ArrayValidator regarding recursiveOnError', () => {
        const onError = vi.fn();
        const validator = new ArrayOrSpecificStringValidator(new StringValidator().maxLength(1), undefined, undefined, onError, undefined, 'bla', true);

        validator.validate(['abc', 'a', 'foo']);
        expect(onError).toHaveBeenCalledOnce();

        validator.setRecursiveOnError(false);
        validator.validate(['abc', 'a', 'foo']);
        expect(onError).toHaveBeenCalledOnce();
    });

    it('can set on error function', () => {
        const onError1 = vi.fn();
        const validator = new ArrayOrSpecificStringValidator(new StringValidator(), undefined, undefined, onError1);
        validator.validate('banana');
        expect(onError1).toHaveBeenCalledOnce();

        const onError2 = vi.fn();
        validator.setOnError(onError2);
        validator.validate('apple');
        expect(onError2).toHaveBeenCalledOnce();
    });
});
