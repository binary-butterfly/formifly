import PropTypes from 'prop-types';
import BaseValidator from '../../classes/BaseValidator';
import NumberValidator from '../../classes/NumberValidator';
import StringValidator from '../../classes/StringValidator';

describe.each([
    ['abc', true, 'returns true for random value'],
    ['', true, 'returns true for empty string'],
    [null, true, 'returns true for null'],
    [undefined, true, 'returns true for undefined'],
])('Test BaseValidator not required', (value, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator();
        expect(validator.validate(value)).toStrictEqual([expected, value]);
    });
});

describe.each([
    ['abc', [true, 'abc'], undefined, 'returns true for random value'],
    ['', [false, 'This field is required'], undefined, 'returns false for empty string'],
    [null, [false, 'There is an error within this field'], null, 'returns false for null'],
    [undefined, [false, 'banana'], 'banana', 'returns false for undefined'],
])('Test BaseValidator required', (value, expected, msg, name) => {
    test(name, () => {
        const validator = new BaseValidator().required(msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

test('Test always false validator', () => {
    const validator = new BaseValidator().alwaysFalse();
    expect(validator.validate('banana')).toStrictEqual([false, 'This validator will never return true']);
});

describe.each([
    ['', {banana: 'food'}, [true, ''], 'uses independent validator if dependent condition is not met'],
    ['', {banana: 'apple'}, [false, 'This field is required'], 'uses dependent validator when condition is met'],
    ['abc', {banana: 'apple'}, [true, 'abc'], 'uses dependent validator and can pass when condition is met'],
])('Test dependent validator', (value, otherValues, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator(undefined, undefined, undefined, undefined, [
            'banana',
            thisValue => thisValue === 'apple',
            new BaseValidator().required(),
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
                ['country', country => country === 'de', new StringValidator().regex(/^\d{5}$/)],
                ['country', country => country === 'us', new StringValidator().regex(/^\d{5}-\d{4}$/)],
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
                ['country', country => country === 'de', new StringValidator().regex(/^\d{5}$/)],
                ['country', country => country === 'us', new StringValidator().regex(/^\d{5}-\d{4}$/, 'no us zip code :(')],
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
                ['country', country => country === 'de', new NumberValidator(true)],
                ['country', country => country === 'invalid', new BaseValidator().alwaysFalse()],
            ],
        ],
        [true, '12345'],
        'will use default validator if no dependent check matches',
    ],
])('Test dependent validator with multiple dependents', (value, otherValues, dependent, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator();
        validator.setDependent(dependent);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    [undefined, '', 'defaults to empty string'],
    ['banana', 'banana', 'is set correctly'],
])('Test defaultValue', (defaultValue, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator(defaultValue);
        expect(validator.getDefaultValue()).toStrictEqual(expected);
    });
});

test('Test onError callback is called on error', () => {
    const callback = jest.fn();
    const validator = new BaseValidator(undefined, undefined, undefined, callback).alwaysFalse();
    validator.validate(false, {foo: 'bar'});
    expect(callback).toHaveBeenCalledWith(false, {foo: 'bar'});
});

test('Test getPropType', () => {
    const validator = new BaseValidator();
    expect(validator.getPropType()).toBe(PropTypes.any);
});

test('Test getPropType required', () => {
    const validator = new BaseValidator().required();
    expect(validator.getPropType()).toBe(PropTypes.any.isRequired);
});

test('Test mutationFunc', () => {
    const mutation = (value) => {
        return value + 'banana';
    };
    const validator = new BaseValidator(undefined, undefined, mutation);

    expect(validator.validate('my favourite fruit is the ')).toStrictEqual([true, 'my favourite fruit is the banana']);
});

describe.each([
    [2, {foo: 2, banana: 1}, 'banana', undefined, [true, 2], 'Returns true for greater value'],
    [1, {
        foo: 1,
        banana: 2,
    }, 'banana', undefined, [false, 'This value must be greater than the value of banana'], 'returns false for smaller value'],
    [2, {foo: 2, banana: 2}, 'banana', 'apple', [false, 'apple'], 'returns false for same value'],
])('Test greaterThan', (value, otherValues, otherName, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator().greaterThan(otherName, msg);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    [1, {foo: 1, banana: 2}, 'banana', undefined, [true, 1], 'Returns true for smaller value'],
    [2, {
        foo: 2,
        banana: 1,
    }, 'banana', undefined, [false, 'This value must be less than the value of banana'], 'returns false for greater value'],
    [2, {foo: 2, banana: 2}, 'banana', 'apple', [false, 'apple'], 'returns false for same value'],
])('Test lessThan', (value, otherValues, otherName, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator().lessThan(otherName, msg);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    [2, {foo: 2, banana: 1}, 'banana', undefined, [true, 2], 'Returns true for greater value'],
    [2, {foo: 2, banana: 2}, 'banana', undefined, [true, 2], 'returns false for same value'],
    [1, {foo: 1, banana: 2}, 'banana', 'apple', [false, 'apple'], 'returns false for smaller value'],
])('Test greaterOrEqualTo', (value, otherValues, otherName, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator().greaterOrEqualTo(otherName, msg);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    [1, {foo: 1, banana: 2}, 'banana', undefined, [true, 1], 'Returns true for smaller value'],
    [2, {foo: 2, banana: 2}, 'banana', undefined, [true, 2], 'returns false for same value'],
    [2, {foo: 2, banana: 1}, 'banana', 'apple', [false, 'apple'], 'returns false for greater value'],
])('Test lessOrEqualTo', (value, otherValues, otherName, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator().lessOrEqualTo(otherName, msg);
        expect(validator.validate(value, otherValues)).toStrictEqual(expected);
    });
});

describe.each([
    ['foo', ['foo', 'bar', 'blub'], undefined, [true, 'foo'], 'returns true for included value'],
    [
        'foo',
        ['banana', 'apple'],
        undefined,
        [false, 'This value must be one of these: banana, apple'],
        'returns false for non included value',
    ],
    ['foo', ['fo', 'fooo'], 'banana', [false, 'banana'], 'uses correct error message'],
])('Test oneOf', (value, values, msg, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator().oneOf(values, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

test('Test set default input type', () => {
    const validator = new BaseValidator();
    validator.setDefaultInputType('number');
    expect(validator.defaultInputType).toStrictEqual('number');
});

test('Test set default value', () => {
    const validator = new BaseValidator();
    validator.setDefaultValue('banana');
    expect(validator.defaultValue).toStrictEqual('banana');
});

test('Test set onError', () => {
    const handler = jest.fn();
    const validator = new BaseValidator();
    validator.setOnError(handler);

    validator.onError();
    expect(handler).toHaveBeenCalledTimes(1);
});

test('Test set dependent', () => {
    const validator = new BaseValidator();
    validator.setDependent([]);
    expect(validator.dependent).toStrictEqual([]);
});

test('Test setDefaultErrorMsg', () => {
    const validator = new BaseValidator();
    validator.setDefaultErrorMsg('banana');
    expect(validator.defaultErrorMsg).toStrictEqual('banana');
});

test('Test setMutationFunc', () => {
    const mutationFunc = jest.fn();
    const validator = new BaseValidator();

    validator.setMutationFunc(mutationFunc);
    validator.mutationFunc();

    expect(mutationFunc).toHaveBeenCalledTimes(1);
});

describe('Test oneOfArrayFieldValues', () => {
    it('Can return true if the value is included', () => {
        const validator = new BaseValidator().oneOfArrayFieldValues('array');
        expect(validator.validate('foo', {array: ['foo', 'bar', 'baz']})).toStrictEqual([true, 'foo']);
    });

    it('Can return fasle if the value is not included', () => {
        const validator = new BaseValidator().oneOfArrayFieldValues('array', undefined, 'err');
        expect(validator.validate('banana', {array: ['foo', 'bar']})).toStrictEqual([false, 'err']);
    });

    it('Works with custom check functions and can return true', () => {
        const validator = new BaseValidator().oneOfArrayFieldValues('array', (compare, value) => {
            for (const val of compare) {
                if (val.id === value) {
                    return true;
                }
            }
            return false;
        });

        expect(validator.validate('abc', {array: [{id: 'abc'}, {id: 'def'}]})).toStrictEqual([true, 'abc']);
    });

    it('Works with custom check functions and can return false', () => {
        const validator = new BaseValidator().oneOfArrayFieldValues('array', (compare, value) => {
            for (const val of compare) {
                if (val.id === value) {
                    return true;
                }
            }
            return false;
        });

        expect(validator.validate('banana', {array: [{id: 'abc'}, {id: 'def'}]})).toStrictEqual([false, 'This value is not allowed.']);
    });

    it('Warns the user if the field that is compared against is not an array field', () => {
        const warn = jest.fn();
        global.console.warn = warn;
        const validator = new BaseValidator().oneOfArrayFieldValues('notAnArray');
        expect(validator.validate('foo', {notAnArray: 'banana'})).toStrictEqual([false, 'This value is not allowed.']);
        expect(warn).toHaveBeenCalledWith('Attempted to use oneOfArrayFieldValues validator on a non array field. This is not possible.');
        warn.mockRestore();
    });
});

describe('Test oneOfArraySiblingFieldValues', () => {
    it('Can return true if the value is included', () => {
        const validator = new BaseValidator().oneOfArraySiblingFieldValues('array');
        expect(validator.validate('foo', {array: ['foo', 'bar', 'baz']}, {array: ['foo', 'bar', 'baz']})).toStrictEqual([true, 'foo']);
    });

    it('Can return false if the value is not included', () => {
        const validator = new BaseValidator().oneOfArraySiblingFieldValues('array', undefined, 'err');
        expect(validator.validate('banana', {array: ['foo', 'bar']}, {array: ['foo', 'bar']})).toStrictEqual([false, 'err']);
    });

    it('Works with custom check functions and can return true', () => {
        const validator = new BaseValidator().oneOfArraySiblingFieldValues('array', (compare, value) => {
            for (const val of compare) {
                if (val.id === value) {
                    return true;
                }
            }
            return false;
        });

        expect(validator.validate('abc', {array: [{id: 'abc'}, {id: 'def'}]}, {array: [{id: 'abc'}, {id: 'def'}]}))
            .toStrictEqual([true, 'abc']);
    });

    it('Works with custom check functions and can return false', () => {
        const validator = new BaseValidator().oneOfArraySiblingFieldValues('array', (compare, value) => {
            for (const val of compare) {
                if (val.id === value) {
                    return true;
                }
            }
            return false;
        });

        expect(
            validator.validate('banana', {array: [{id: 'abc'}, {id: 'def'}]}, {array: [{id: 'abc'}, {id: 'def'}]}),
        )
            .toStrictEqual([false, 'This value is not allowed.']);
    });

    it('Warns the user if the field that is compared against is not an array field', () => {
        const warn = jest.fn();
        global.console.warn = warn;
        const validator = new BaseValidator().oneOfArraySiblingFieldValues('notAnArray');
        expect(validator.validate('foo', {notAnArray: 'banana'}, {notAnArray: 'banana'}))
            .toStrictEqual([false, 'This value is not allowed.']);
        expect(warn)
            .toHaveBeenCalledWith('Attempted to use oneOfArraySiblingFieldValues validator on a non array field. This is not possible.');
        warn.mockRestore();
    });
});
