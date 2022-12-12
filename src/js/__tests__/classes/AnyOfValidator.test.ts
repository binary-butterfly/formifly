import AnyOfValidator from '../../classes/AnyOfValidator';
import DateTimeValidator from '../../classes/DateTimeValidator';
import NumberValidator from '../../classes/NumberValidator';
import StringValidator from '../../classes/StringValidator';
import {TFunction} from 'i18next';

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
        const onError = jest.fn();

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
        expect(validator.validate('foo', {}, {}, jest.fn(() => 'bla') as any as TFunction)).toStrictEqual([false, 'bla']);
    });
});
