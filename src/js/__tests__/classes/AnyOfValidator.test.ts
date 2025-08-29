import AnyOfValidator from '../../classes/AnyOfValidator';
import DateTimeValidator from '../../classes/DateTimeValidator';
import NumberValidator from '../../classes/NumberValidator';
import StringValidator from '../../classes/StringValidator';
import {TFunction} from 'i18next';
import ObjectValidator from '../../classes/ObjectValidator';
import {findFieldValidatorFromName} from '../../helpers/validationHelpers';
import ArrayValidator from '../../classes/ArrayValidator';

describe('AnyOfValidator', () => {
    it('validates successfully if any of the validators match', () => {
        const validator = new AnyOfValidator([new NumberValidator(), new StringValidator()]);
        expect(validator.validate('banana')).toStrictEqual([true, 'banana']);
    });

    it('does not validate successfully if none of the validators match', () => {
        const validator = new AnyOfValidator([new NumberValidator(), new DateTimeValidator()]);
        expect(validator.validate('banana')).toStrictEqual([false, 'any_of']);
    });

    it('runs the mutate function if validation is successful', () => {
        const mutate = (value: any) => {
            return value + 'apple';
        };

        const validator = new AnyOfValidator([new StringValidator()], undefined, undefined, mutate);
        expect(validator.validate('my second favourite fruit is an ')).toStrictEqual([true, 'my second favourite fruit is an apple']);
    });

    it('runs the onError callback if the validation fails', () => {
        const onError = vitest.fn();

        const validator = new AnyOfValidator([new NumberValidator()], undefined, undefined, undefined, onError);
        const otherValues = {};
        validator.validate('banana', otherValues);
        expect(onError).toHaveBeenCalledWith('banana', otherValues);
    });

    it('skips validation if it is not required and the value is empty', () => {
        const validator = new AnyOfValidator([new NumberValidator()]);
        expect(validator.validate('')).toStrictEqual([true, '']);
    });

    it('works with alwaysFalse', () => {
        const validator = new AnyOfValidator([new StringValidator()]).alwaysFalse('Test!');
        expect(validator.validate('foo')).toStrictEqual([false, 'Test!']);
    });

    it('can use a translation function', () => {
        const validator = new AnyOfValidator([new StringValidator().alwaysFalse()]);
        expect(validator.validate('foo', {}, {}, vitest.fn(() => 'bla') as any as TFunction)).toStrictEqual([false, 'bla']);
    });

    it('returns the correct default value when none is set explicitly', () => {
        const validator = new AnyOfValidator(
            [new ObjectValidator({foo: new StringValidator('banana')}), new StringValidator('banana')]
        );

        expect(validator.getDefaultValue()).toStrictEqual({foo: 'banana'});
    });

    it('can set an explicit default value', () => {
        const validator = new AnyOfValidator([new StringValidator('banana'), new NumberValidator()], 'apple');
        expect(validator.getDefaultValue()).toBe('apple');
    });

    it('can pass through a specific error', () => {
        const validator = new AnyOfValidator(
            [new NumberValidator(), new ObjectValidator({bla: new NumberValidator()})],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            1
        );

        expect(validator.validate({bla: 'banana'})).toStrictEqual([false, {bla: [false, 'number']}]);
    });

    it('can set the passed through error index using a setter function', () => {
        const validator = new AnyOfValidator([new ObjectValidator({foo: new NumberValidator()}), new NumberValidator()]);
        validator.setPassThroughErrorIndex(0);

        expect(validator.validate({foo: 'NaN'})).toStrictEqual([false, {foo: [false, 'number']}]);
    });

    it('can pass through a validator option\'s of value', () => {
        const validator = new ObjectValidator(
            {
                foo:
                    new AnyOfValidator(
                        [new ArrayValidator(new ObjectValidator({bar: new StringValidator()}))],
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        0,
                    ),
            }
        );

        expect(findFieldValidatorFromName('foo.0.bar', validator)).toBeInstanceOf(StringValidator);
    });

    it('throws an error when trying to set passThroughOfIndex to the index of a validator that is not an array validator', () => {
        const testFunc = () => {
            return new AnyOfValidator(
                [new StringValidator()],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                0,
            );
        };

        expect(testFunc).toThrowError('Attempted to access of value of a validator that is not an array validator.');
    });

    it('can pass through a validator option\'s fields value', () => {
        const validator = new ObjectValidator(
            {
                foo:
                    new AnyOfValidator(
                        [new ObjectValidator({bar: new StringValidator()})],
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        0,
                    ),
            }
        );

        expect(findFieldValidatorFromName('foo.bar', validator)).toBeInstanceOf(StringValidator);
    });

    it('throws an error when trying to set passThroughFieldsIndex on the index of a validator that is not an ObjectValidator', () => {
        const testFunc = () => {
            return new AnyOfValidator(
                [new StringValidator()],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                0
            );
        };

        expect(testFunc).toThrowError('Attempted to access fields value of a validator that is not an object validator.');
    });
});
