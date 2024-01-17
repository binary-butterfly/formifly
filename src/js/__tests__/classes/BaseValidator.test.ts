import PropTypes from 'prop-types';
import BaseValidator from '../../classes/BaseValidator';
import NumberValidator from '../../classes/NumberValidator';
import StringValidator from '../../classes/StringValidator';
import {Dependent} from '../../types';

describe.each([
    ['abc', true, 'returns true for random value'],
    ['', true, 'returns true for empty string'],
    [null, true, 'returns true for null'],
    [undefined, true, 'returns true for undefined'],
])('Test BaseValidator not required', (value, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator(undefined as any);
        expect(validator.validate(value)).toStrictEqual([expected, value]);
    });
});

describe.each([
    ['abc', [true, 'abc'], undefined, 'returns true for random value'],
    ['', [false, 'required'], undefined, 'returns false for empty string'],
    [null, [false, 'required'], null, 'returns false for null'],
    [undefined, [false, 'banana'], 'banana', 'returns false for undefined'],
])('Test BaseValidator required', (value, expected, msg, name) => {
    test(name, () => {
        // todo: this case is kinda obsolete. TS doesn't like null here and assumes only strings or undefined are passed
        const validator = new BaseValidator(undefined as any).required(msg as any);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

test('Test always false validator', () => {
    const validator = new BaseValidator(undefined as any).alwaysFalse();
    expect(validator.validate('banana')).toStrictEqual([false, 'always_false']);
});

describe.each([
    ['', {banana: 'food'}, [true, ''], 'uses independent validator if dependent condition is not met'],
    ['', {banana: 'apple'}, [false, 'required'], 'uses dependent validator when condition is met'],
    ['abc', {banana: 'apple'}, [true, 'abc'], 'uses dependent validator and can pass when condition is met'],
])('Test dependent validator', (value, otherValues, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator(undefined as any, undefined, undefined, undefined, [
            'banana',
            thisValue => thisValue === 'apple',
            new BaseValidator(undefined as any).required(),
        ]);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    [
        '12345',
        {country: 'de', zip: '12345'},
        [
            [
                ['country', (country: string) => country === 'de', new StringValidator().regex(/^\d{5}$/)],
                ['country', (country: string) => country === 'us', new StringValidator().regex(/^\d{5}-\d{4}$/)],
            ],
        ],
        [true, '12345'],
        'can validate first dependent',
    ],
    [
        '12345',
        {country: 'us', zip: '12345'},
        [
            [
                ['country', (country: string) => country === 'de', new StringValidator().regex(/^\d{5}$/)],
                ['country', (country: string) => country === 'us', new StringValidator().regex(/^\d{5}-\d{4}$/, 'no us zip code :(')],
            ],
        ],
        [false, 'no us zip code :('],
        'can validate second dependent',
    ],
    [
        '12345',
        {country: 'ch', zip: '12345'},
        [
            [
                ['country', (country: string) => country === 'de', new NumberValidator(true)],
                ['country', (country: string) => country === 'invalid', new BaseValidator(undefined as any).alwaysFalse()],
            ],
        ],
        [true, '12345'],
        'will use default validator if no dependent check matches',
    ],
])('Test dependent validator with multiple dependents', (value, otherValues, dependent, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator<string>('');
        validator.setDependent(dependent as Dependent);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    [undefined, undefined, 'does not set a default'],
    ['banana', 'banana', 'is set correctly'],
])('Test defaultValue', (defaultValue, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator<string>(defaultValue as any);
        expect(validator.getDefaultValue()).toStrictEqual(expected);
    });
});

test('Test onError callback is called on error', () => {
    const callback = vitest.fn();
    const validator = new BaseValidator<boolean>(true, undefined, undefined, callback).alwaysFalse();
    validator.validate(false, {foo: 'bar'});
    expect(callback).toHaveBeenCalledWith(false, {foo: 'bar'});
});

test('Test getPropType', () => {
    const validator = new BaseValidator(undefined as any);
    expect(validator.getPropType()).toBe(PropTypes.any);
});

test('Test getPropType required', () => {
    const validator = new BaseValidator(undefined as any).required();
    expect(validator.getPropType()).toBe(PropTypes.any.isRequired);
});

test('Test mutationFunc', () => {
    const mutation = (value: any) => {
        return value + 'banana';
    };
    const validator = new BaseValidator(undefined as any, undefined, mutation);

    expect(validator.validate('my favourite fruit is the ')).toStrictEqual([true, 'my favourite fruit is the banana']);
});

describe.each([
    [2, {foo: 2, banana: 1}, 'banana', undefined, [true, 2], 'Returns true for greater value'],
    [1, {foo: 1, banana: 2}, 'banana', undefined, [false, 'greater_than'], 'returns false for smaller value'],
    [2, {foo: 2, banana: 2}, 'banana', 'apple', [false, 'apple'], 'returns false for same value'],
])('Test greaterThan', (value, otherValues, otherName, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator(undefined as any).greaterThan(otherName, msg);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    [1, {foo: 1, banana: 2}, 'banana', undefined, [true, 1], 'Returns true for smaller value'],
    [2, {foo: 2, banana: 1}, 'banana', undefined, [false, 'less_than'], 'returns false for greater value'],
    [2, {foo: 2, banana: 2}, 'banana', 'apple', [false, 'apple'], 'returns false for same value'],
])('Test lessThan', (value, otherValues, otherName, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator(undefined as any).lessThan(otherName, msg);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    [2, {foo: 2, banana: 1}, 'banana', undefined, [true, 2], 'Returns true for greater value'],
    [2, {foo: 2, banana: 2}, 'banana', undefined, [true, 2], 'returns false for same value'],
    [1, {foo: 1, banana: 2}, 'banana', 'apple', [false, 'apple'], 'returns false for smaller value'],
])('Test greaterOrEqualTo', (value, otherValues, otherName, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator(undefined as any).greaterOrEqualTo(otherName, msg);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    [1, {foo: 1, banana: 2}, 'banana', undefined, [true, 1], 'Returns true for smaller value'],
    [2, {foo: 2, banana: 2}, 'banana', undefined, [true, 2], 'returns false for same value'],
    [2, {foo: 2, banana: 1}, 'banana', 'apple', [false, 'apple'], 'returns false for greater value'],
])('Test lessOrEqualTo', (value, otherValues, otherName, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator(undefined as any).lessOrEqualTo(otherName, msg);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    ['foo', ['foo', 'bar', 'blub'], undefined, [true, 'foo'], 'returns true for included value'],
    ['foo', ['banana', 'apple'], undefined, [false, 'one_of'], 'returns false for non included value'],
    ['foo', ['fo', 'fooo'], 'banana', [false, 'banana'], 'uses correct error message'],
])('Test oneOf', (value, values, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator(undefined as any).oneOf(values, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

test('Test set default input type', () => {
    const validator = new BaseValidator(undefined as any);
    validator.setDefaultInputType('number');
    expect(validator['defaultInputType']).toStrictEqual('number');
});

test('Test set default value', () => {
    const validator = new BaseValidator(undefined as any);
    validator.setDefaultValue('banana');
    expect(validator['defaultValue']).toStrictEqual('banana');
});

test('Test set onError', () => {
    const handler = vitest.fn();
    const validator = new BaseValidator(undefined as any);
    validator.setOnError(handler);

    validator['onError']!('', {});
    expect(handler).toHaveBeenCalledTimes(1);
});

test('Test set dependent', () => {
    const validator = new BaseValidator(undefined as any);
    validator.setDependent([]);
    expect(validator['dependent']).toStrictEqual([]);
});

test('Test setDefaultErrorMsg', () => {
    const validator = new BaseValidator(undefined as any);
    validator.setDefaultErrorMsg('banana');
    expect(validator['defaultErrorMsg']).toStrictEqual('banana');
});

test('Test setMutationFunc', () => {
    const mutationFunc = vitest.fn();
    const validator = new BaseValidator(undefined as any);

    validator.setMutationFunc(mutationFunc);
    validator['mutationFunc']!('');

    expect(mutationFunc).toHaveBeenCalledTimes(1);
});

describe('Test oneOfArrayFieldValues', () => {
    it('Can return true if the value is included', () => {
        const validator = new BaseValidator(undefined as any).oneOfArrayFieldValues('array');
        expect(validator.validate('foo', {array: ['foo', 'bar', 'baz']})).toStrictEqual([true, 'foo']);
    });

    it('Can return fasle if the value is not included', () => {
        const validator = new BaseValidator(undefined as any).oneOfArrayFieldValues('array', undefined, 'err');
        expect(validator.validate('banana', {array: ['foo', 'bar']})).toStrictEqual([false, 'err']);
    });

    it('Works with custom check functions and can return true', () => {
        const validator = new BaseValidator(undefined as any).oneOfArrayFieldValues('array', (compare, value) => {
            for (const val of compare) {
                if ((val as any).id === value) {
                    return true;
                }
            }
            return false;
        });

        expect(validator.validate('abc', {array: [{id: 'abc'}, {id: 'def'}]})).toStrictEqual([true, 'abc']);
    });

    it('Works with custom check functions and can return false', () => {
        const validator = new BaseValidator(undefined as any).oneOfArrayFieldValues('array', (compare, value) => {
            for (const val of compare) {
                if ((val as any).id === value) {
                    return true;
                }
            }
            return false;
        });

        expect(validator.validate('banana', {array: [{id: 'abc'}, {id: 'def'}]})).toStrictEqual([false, 'one_of_array_field_values']);
    });

    it('Warns the user if the field that is compared against is not an array field', () => {
        const warn = vitest.fn();
        global.console.warn = warn;
        const validator = new BaseValidator(undefined as any).oneOfArrayFieldValues('notAnArray');
        expect(validator.validate('foo', {notAnArray: 'banana'})).toStrictEqual([false, 'one_of_array_field_values']);
        expect(warn).toHaveBeenCalledWith('Attempted to use oneOfArrayFieldValues validator on a non array field. This is not possible.');
        warn.mockRestore();
    });
});

describe('Test oneOfArraySiblingFieldValues', () => {
    it('Can return true if the value is included', () => {
        const validator = new BaseValidator(undefined as any).oneOfArraySiblingFieldValues('array');
        expect(validator.validate('foo', {array: ['foo', 'bar', 'baz']}, {array: ['foo', 'bar', 'baz']})).toStrictEqual([true, 'foo']);
    });

    it('Can return false if the value is not included', () => {
        const validator = new BaseValidator(undefined as any).oneOfArraySiblingFieldValues('array', undefined, 'err');
        expect(validator.validate('banana', {array: ['foo', 'bar']}, {array: ['foo', 'bar']})).toStrictEqual([false, 'err']);
    });

    it('Works with custom check functions and can return true', () => {
        const validator = new BaseValidator(undefined as any).oneOfArraySiblingFieldValues('array', (compare, value) => {
            for (const val of compare) {
                if ((val as any).id === value) {
                    return true;
                }
            }
            return false;
        });

        expect(validator.validate('abc', {array: [{id: 'abc'}, {id: 'def'}]}, {array: [{id: 'abc'}, {id: 'def'}]}))
            .toStrictEqual([true, 'abc']);
    });

    it('Works with custom check functions and can return false', () => {
        const validator = new BaseValidator(undefined as any).oneOfArraySiblingFieldValues('array', (compare, value) => {
            for (const val of compare) {
                if ((val as any).id === value) {
                    return true;
                }
            }
            return false;
        });

        expect(
            validator.validate('banana', {array: [{id: 'abc'}, {id: 'def'}]}, {array: [{id: 'abc'}, {id: 'def'}]}),
        )
            .toStrictEqual([false, 'one_of_array_sibling_field_values']);
    });

    it('Warns the user if the field that is compared against is not an array field', () => {
        const warn = vitest.fn();
        global.console.warn = warn;
        const validator = new BaseValidator(undefined as any).oneOfArraySiblingFieldValues('notAnArray');
        expect(validator.validate('foo', {notAnArray: 'banana'}, {notAnArray: 'banana'}))
            .toStrictEqual([false, 'one_of_array_sibling_field_values']);
        expect(warn)
            .toHaveBeenCalledWith('Attempted to use oneOfArraySiblingFieldValues validator on a non array field. This is not possible.');
        warn.mockRestore();
    });
});
