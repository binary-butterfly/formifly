import StringValidator from '../../classes/StringValidator';

describe.each([
    ['123', /\d+/, true, 'returns true for matching regexp'],
    ['123', /[a-z]/, false, 'returns false for non matching regexp'],
    ['', /[a-z]/, true, 'skips validation since the value is not required'],
])('Test StringValidator regex', (value, expr, expected, name) => {
    test(name, () => {
        const validator = new StringValidator().regex(expr);
        expect(validator.validate(value)).toBe(expected);
    });
});

describe.each([
    ['abc', 1, true, 'returns true for a longer string'],
    ['a', 1, true, 'returns true for a string of the specified length'],
    ['abc', 4, false, 'returns false for a shorter string'],
])('Test StringValidator minLength', (value, minLength, expected, name) => {
    test(name, () => {
        const validator = new StringValidator().minLength(minLength);
        expect(validator.validate(value)).toBe(expected);
    });
});

describe.each([
    ['abc', 4, true, 'returns true for a shorter string'],
    ['abc', 3, true, 'returns true for a string of the specified length'],
    ['abc', 1, false, 'returns false for a longer string'],
])('Test StringValidator maxLength', (value, maxLength, expected, name) => {
    test(name, () => {
        const validator = new StringValidator().maxLength(maxLength);
        expect(validator.validate(value)).toBe(expected);
    });
});

describe.each([
    ['abc', 1, 4, true, 'returns true for a string that is longer than min and shorter than max'],
    ['abc', 1, 3, true, 'returns true for a string that is as long as maxLength'],
    ['a', 1, 3, true, 'returns true for a string that is as long as minLength'],
    ['a', 1, 1, true, 'returns true for a string that is as long as min and maxLength'],
    ['a', 2, 3, false, 'returns false for a string that is too short'],
    ['abc', 1, 2, false, 'returns false for a string that is too short'],
])('Test StringValidator lengthRange', (value, minLength, maxLength, expected, name) => {
    test(name, () => {
        const validator = new StringValidator().lengthRange(minLength, maxLength);
        expect(validator.validate(value)).toBe(expected);
    });
});

test('Test StringValidator validators can be chained', () => {
    const validator = new StringValidator().required().minLength(1).maxLength(2).regex(/[a-z]/);
    expect(validator.validate('a')).toBe(true);
});
