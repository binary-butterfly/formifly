import StringValidator from '../../classes/StringValidator';

describe.each([
    ['123', /\d+/, undefined, [true, '123'], 'returns true for matching regexp'],
    ['123', /[a-z]/, undefined, [false, 'This value is malformed'], 'returns false for non matching regexp'],
    ['123', /[a-z]/, 'This value must be a char', [false, 'This value must be a char'], 'uses correct error msg'],
    ['', /[a-z]/, undefined, [true, ''], 'skips validation since the value is not required'],
])('Test StringValidator regex', (value, expr, msg, expected, name) => {
    test(name, () => {
        const validator = new StringValidator().regex(expr, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    ['abc', 1, undefined, [true, 'abc'], 'returns true for a longer string'],
    ['a', 1, undefined, [true, 'a'], 'returns true for a string of the specified length'],
    ['abc', 4, undefined, [false, 'This string must be at least 4 characters long'], 'returns false for a shorter string'],
    ['abc', 4, 'banana {{num}}', [false, 'banana 4'], 'uses correct error message'],
])('Test StringValidator minLength', (value, minLength, msg, expected, name) => {
    test(name, () => {
        const validator = new StringValidator().minLength(minLength, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    ['abc', 4, undefined, [true, 'abc'], 'returns true for a shorter string'],
    ['abc', 3, undefined, [true, 'abc'], 'returns true for a string of the specified length'],
    ['abc', 1, undefined, [false, 'This string must be no longer than 1 characters'], 'returns false for a longer string'],
    ['abc', 1, 'banana {{num}}', [false, 'banana 1'], 'uses correct error message'],
])('Test StringValidator maxLength', (value, maxLength, msg, expected, name) => {
    test(name, () => {
        const validator = new StringValidator().maxLength(maxLength, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    ['abc', 1, 4, undefined, [true, 'abc'], 'returns true for a string that is longer than min and shorter than max'],
    ['abc', 1, 3, undefined, [true, 'abc'], 'returns true for a string that is as long as maxLength'],
    ['a', 1, 3, undefined, [true, 'a'], 'returns true for a string that is as long as minLength'],
    ['a', 1, 1, undefined, [true, 'a'], 'returns true for a string that is as long as min and maxLength'],
    ['a', 2, 3, 'foo {{min}} {{max}}', [false, 'foo 2 3'], 'returns false for a string that is too short'],
    [
        'abc',
        1,
        2,
        undefined,
        [false, 'This string must be between 1 and 2 characters long'],
        'returns false for a string that is too short',
    ],
])('Test StringValidator lengthRange', (value, minLength, maxLength, msg, expected, name) => {
    test(name, () => {
        const validator = new StringValidator().lengthRange(minLength, maxLength, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

test('Test StringValidator validators can be chained', () => {
    const validator = new StringValidator()
        .required()
        .minLength(1)
        .maxLength(2)
        .lengthRange(1, 2)
        .regex(/[a-z]/);
    expect(validator.validate('a')).toStrictEqual([true, 'a']);
});
