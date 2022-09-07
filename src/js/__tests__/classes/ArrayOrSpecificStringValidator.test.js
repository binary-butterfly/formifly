import ArrayOrSpecificStringValidator from '../../classes/ArrayOrSpecificStringValidator';
import StringValidator from '../../classes/StringValidator';

describe('ArrayOrSpecificStringValidator', () => {
    it('allows the specific string', () => {
        const validator = new ArrayOrSpecificStringValidator(
            new StringValidator(), undefined, undefined, undefined, undefined, 'string',
        );

        expect(validator.validate('string')).toStrictEqual([true, 'string']);
    });

    it('does not allow string values that do not equal the allowed one', () => {
        const validator = new ArrayOrSpecificStringValidator(new StringValidator());

        expect(validator.validate('not correct')).toStrictEqual([false, 'This field has to be an array']);
    });
});
