import ArrayOrSpecificStringValidator from '../../classes/ArrayOrSpecificStringValidator';
import StringValidator from '../../classes/StringValidator';

vitest.mock('../../classes/ArrayValidator');

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

    describe('forwards calls to its internal ArrayValidator', () => {
        it.each`
        call                |params
        ${'minLength'}      |${[6, 'message']}
        ${'maxLength'}      |${[3, 'hello']}
        ${'lengthRange'}    |${[4, 7, 'please remember to be kind']}
        ${'getDefaultValue'}|${[]}
        ${'validate'}       |${[['value'], 'other', 'siblings', undefined, true]}
        `('calls $call on its internal ArrayValidator', ({call, params}) => {
            const validator = new ArrayOrSpecificStringValidator(new StringValidator());
            (validator as any)[call](...params);

            expect((validator['internalArrayValidator'] as any)[call]).toBeCalledWith(...params);
        });
    });

    it('validates without recursion', () => {
        const value = 'value';
        const other = 'other';
        const siblings = 'siblings';

        const validator = new ArrayOrSpecificStringValidator(new StringValidator());
        validator.validate = vitest.fn();

        validator.validateWithoutRecursion(value, other, siblings);

        expect(validator.validate).toBeCalledWith(value, other, siblings, undefined, false);
    });
});
