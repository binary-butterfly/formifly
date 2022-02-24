import PropTypes from 'prop-types';
import ArrayValidator from '../../classes/ArrayValidator';
import NumberValidator from '../../classes/NumberValidator';
import StringValidator from '../../classes/StringValidator';

describe.each([
    [[], [false, 'This field is required'], 'returns false on empty array'],
    [['abc'], [true, ['abc']], 'returns true on non empty array'],
])('Test ArrayValidator required', (value, expected, name) => {
    test(name, () => {
        const validator = new ArrayValidator(new StringValidator()).required();
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [['abc', 'def'], 1, undefined, [true, ['abc', 'def']], 'returns true for more entries'],
    [['abc'], 1, undefined, [true, ['abc']], 'returns true for specified entry count'],
    [['abc'], 2, undefined, [false, 'There must be at least 2 entries for this'], 'returns false for less entries'],
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
    [['abc', 'def'], 1, undefined, [false, 'There must be at most 1 entries for this'], 'returns false for less entries'],
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
    [['abc'], 2, 3, undefined, [false, 'There must be between 2 and 3 entries for this'], 'returns false for count outside of range'],
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
    expect(validator.validate([1, -2])).toStrictEqual([false, [[false, 'This value must be negative'], [true, -2]]]);
});

test('Test Array Validator getDefaultValue returns empty array if minLength is not set', () => {
    const validator = new ArrayValidator(new StringValidator());
    expect(validator.getDefaultValue()).toStrictEqual([]);
})

test('Test ArrayValidator getDefaultValue returns the children\'s default values', () => {
    const validator = new ArrayValidator(new NumberValidator(undefined, 0)).minLength(1);
    expect(validator.getDefaultValue()).toStrictEqual([0]);
});

test('Test ArrayValidator getDefaultValue returns as many default values as there are required children', () => {
    const validator = new ArrayValidator(new NumberValidator(undefined, 1)).minLength(3);
    expect(validator.getDefaultValue()).toStrictEqual([1, 1, 1]);
});

test('Test getPropType', () => {
    const validator = new ArrayValidator(new StringValidator());
    expect(String(validator.getPropType())).toBe(String(PropTypes.arrayOf(PropTypes.string)));
})

test('Test getPropType required', () => {
    const validator = new ArrayValidator(new StringValidator().required());
    expect(String(validator.getPropType())).toBe(String(PropTypes.arrayOf(PropTypes.string.isRequired).isRequired));
})
