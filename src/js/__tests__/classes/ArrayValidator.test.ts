import PropTypes from 'prop-types';
import ArrayValidator from '../../classes/ArrayValidator';
import BooleanValidator from '../../classes/BooleanValidator';
import NumberValidator from '../../classes/NumberValidator';
import ObjectValidator from '../../classes/ObjectValidator';
import StringValidator from '../../classes/StringValidator';
import {TFunction} from 'i18next';

describe.each([
    [[], [false, 'This field is required'], 'returns false on empty array'],
    [['abc'], [true, ['abc']], 'returns true on non empty array'],
])('Test ArrayValidator required', (value, expected, name) => {
    test(name, () => {
        const validator = new ArrayValidator(new StringValidator()).required('This field is required');
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [['abc', 'def'], 1, undefined, [true, ['abc', 'def']], 'returns true for more entries'],
    [['abc'], 1, undefined, [true, ['abc']], 'returns true for specified entry count'],
    [['abc'], 2, undefined, [false, 'min_length_array'], 'returns false for less entries'],
    [[], 1, 'banana {{num}}', [false, 'banana 1'], 'setting a min value > 0 makes the array required'],
    [[], 0, undefined, [true, []], 'setting a min range of 0 does not make the array required'],
])('Test ArrayValidator minLength', (value, minLength, msg, expected, name) => {
    test(name, () => {
        const validator = new ArrayValidator(new StringValidator()).minLength(minLength, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [['abc', 'def'], 3, undefined, [true, ['abc', 'def']], 'returns true for less entries'],
    [['abc'], 1, undefined, [true, ['abc']], 'returns true for specified entry count'],
    [['abc', 'def'], 1, undefined, [false, 'max_length_array'], 'returns false for less entries'],
    [['abc', 'def'], 1, 'banana {{num}}', [false, 'banana 1'], 'uses correct error msg'],
])('Test ArrayValidator maxLength', (value, maxLength, msg, expected, name) => {
    test(name, () => {
        const validator = new ArrayValidator(new StringValidator()).maxLength(maxLength, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [['abc', 'def'], 1, 3, undefined, [true, ['abc', 'def']], 'returns true for count in range'],
    [['abc'], 1, 2, undefined, [true, ['abc']], 'returns true for count equaling lower bound'],
    [['abc'], 0, 1, undefined, [true, ['abc']], 'returns true for count equaling higher bound'],
    [['abc'], 2, 3, undefined, [false, 'length_range_array'], 'returns false for count outside of range'],
    [[], 2, 3, 'banana {{min}} {{max}}', [false, 'banana 2 3'], 'setting a minLength > 0 sets the array required'],
    [[], 0, 3, undefined, [true, []], 'setting a minLength of 0 does not set the array required'],
])('Test ArrayValidator lengthRange', (value, minLength, maxLength, msg, expected, name) => {
    test(name, () => {
        const validator = new ArrayValidator(new StringValidator()).lengthRange(minLength, maxLength, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

test('Test ArrayValidator can mutate children', () => {
    const validator = new ArrayValidator(new NumberValidator().decimalPlaces(2));
    expect(validator.validate([2, '1.00'])).toStrictEqual([true, ['2.00', '1.00']]);
});

test('Test ArrayValidator can fail on child fail', () => {
    const validator = new ArrayValidator(new NumberValidator().negative());
    expect(validator.validate([1, -2])).toStrictEqual([false, [[false, 'negative'], [true, -2]]]);
});

test('Test Array Validator getDefaultValue returns empty array if minLength is not set', () => {
    const validator = new ArrayValidator(new StringValidator());
    expect(validator.getDefaultValue()).toStrictEqual([]);
});

test('Test ArrayValidator getDefaultValue returns the children\'s default values', () => {
    const validator = new ArrayValidator(new NumberValidator(undefined, 0)).minLength(1);
    expect(validator.getDefaultValue()).toStrictEqual([0]);
});

test('Test ArrayValidator getDefaultValue returns as many default values as there are required children', () => {
    const validator = new ArrayValidator(new NumberValidator(undefined, 1)).minLength(3);
    expect(validator.getDefaultValue()).toStrictEqual([1, 1, 1]);
});

test('Test ArrayValidator getPropType', () => {
    const validator = new ArrayValidator(new StringValidator());
    expect(String(validator.getPropType())).toBe(String(PropTypes.arrayOf(PropTypes.string)));
});

test('Test ArrayValidator getPropType required', () => {
    const validator = new ArrayValidator(new StringValidator().required());
    expect(String(validator.getPropType())).toBe(String(PropTypes.arrayOf(PropTypes.string.isRequired).isRequired));
});

test('Test ArrayValidator does not mutate children', () => {
    const array = [{foo: true}];
    const validator = new ArrayValidator(new ObjectValidator({foo: new BooleanValidator()}));
    validator.validate(array);
    expect(array[0].foo).toBe(true);
});

test('Test ArrayValidator validateWithoutRecursion', () => {
    const validator = new ArrayValidator(new ObjectValidator({
        foo: new StringValidator(),
        bar: new ObjectValidator({test: new StringValidator().minLength(10)}),
        baz: new ArrayValidator(new StringValidator().minLength(10)),
    }));

    const values = [
        {foo: 'abc', bar: {test: 'def'}, baz: ['ghi']},
    ];

    expect(validator.validateWithoutRecursion(values)).toStrictEqual([true, values]);
});

test('Test ArrayValidator validateWithoutRecursion works with array child fields', () => {
    const validator = new ArrayValidator(new ArrayValidator(new ObjectValidator({
        foo: new StringValidator(),
        bar: new ObjectValidator({test: new StringValidator().minLength(10)}),
        baz: new ArrayValidator(new StringValidator().minLength(10)),
    })));

    const values = [[{foo: 'abc', bar: {test: 'def'}, baz: ['ghi']}]];
    expect(validator.validateWithoutRecursion(values)).toStrictEqual([true, values]);
});

test('Test ArrayValidator does not allow values that are not arrays', () => {
    const validator = new ArrayValidator(new StringValidator(), 'That is not an array :o');

    expect(validator.validate('string' as any)).toStrictEqual([false, 'That is not an array :o']);
});

test('Test ArrayValidator has a default return value for non array values', () => {
    const validator = new ArrayValidator(new StringValidator());

    expect(validator.validate('string' as any)).toStrictEqual([false, 'array']);
});

test('Test ArrayValidator can use translation functions', () => {
    const validator = new ArrayValidator(new StringValidator());

    expect(validator.validate('string' as any, {}, {}, jest.fn(() => 'That ain\'t no array') as unknown as TFunction)).toStrictEqual([false, 'That ain\'t no array']);
});

test('Test ArrayValidator uses correct translation namespace', () => {
    const validator = new ArrayValidator(new StringValidator());
    const t = jest.fn();

    validator.validate('string' as any, {}, {}, t as unknown as TFunction);
    expect(t).toHaveBeenCalledWith('formifly:array');
});
