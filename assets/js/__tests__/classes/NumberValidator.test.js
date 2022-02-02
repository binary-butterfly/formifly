import NumberValidator from '../../classes/NumberValidator';

describe.each([
    ['1,23', [true, 1.23], 'Test NumberValidator delocalizes input'],
    ['-1,23', [true, -1.23], 'Test NumberValidator delocalizes negative input'],
    ['banana', [false, 'This field must be a number'], 'Test NumberValidator does not accept non numeric input'],
    ['', [true, ''], 'Test NumberValidator does accept empty strings if it is not required'],
])('Test NumberValidator', (value, expected, name) => {
    test(name, () => {
        const validator = new NumberValidator();
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

test('Test NumberValidator uses correct error msg for numbers with decimal places', () => {
    const validator = new NumberValidator(false, false, 'banana is no number');
    expect(validator.validate('banana')).toStrictEqual([false, 'banana is no number']);
});

test('Test NumberValidator does not accept empty strings if it is required', () => {
    // Here we test this behaviour even though it may seem redundant.
    // This is done to make sure the delocalization step does not error out on empty strings.
    const validator = new NumberValidator().required();
    expect(validator.validate('')).toStrictEqual([false, 'This field must be a number']);
});

describe.each([
    ['1', undefined, [true, 1], 'Returns true on whole numbers'],
    ['1.31', undefined, [false, 'This field must be a whole number'], 'returns false on number with decimal places'],
    [1.31, 'banana', [false, 'banana'], 'uses correct error msg'],
])('Test NumberValidator wholeNumber', (value, msg, expected, name) => {
    test(name, () => {
        const validator = new NumberValidator(true, false, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [1, 0, undefined, [true, 1], 'returns true for larger numbers'],
    [1, 1, undefined, [true, 1], 'returns true for the specified number'],
    [0, 1, undefined, [false, 'This value must be at least 1'], 'returns false for smaller numbers'],
    [-1, 0, 'banana {{num}}', [false, 'banana 0'], 'uses the correct error message'],
])('Test NumberValidator min', (value, min, msg, expected, name) => {
    test(name, () => {
        const validator = new NumberValidator().min(min, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [1, 1, undefined, [true, 1], 'returns true for smaller numbers'],
    [1, 1, undefined, [true, 1], 'returns true for the specified number'],
    [2, 1, undefined, [false, 'This value must be at most 1'], 'returns false for larger numbers'],
    [0, -1, 'banana {{num}}', [false, 'banana -1'], 'uses the correct error message'],
])('Test NumberValidator max', (value, max, msg, expected, name) => {
    test(name, () => {
        const validator = new NumberValidator().max(max, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    ['1', [true, 1], 'returns true for positive numbers'],
    ['0', [false, 'This value must be positive'], 'returns false for zero'],
    ['-1.23', [false, 'This value must be positive'], 'returns false for negative numbers'],
])('Test NumberValidator positive', (value, expected, name) => {
    test(name, () => {
        const validator = new NumberValidator().positive();
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    ['1', [false, 'This value must be negative'], 'returns false for positive numbers'],
    ['0', [false, 'This value must be negative'], 'returns false for zero'],
    ['-1', [true, -1], 'returns true for negative numbers'],
])('Test NumberValidator negative', (value, expected, name) => {
    test(name, () => {
        const validator = new NumberValidator().negative();
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    ['1', 0, 2, undefined, [true, 1], 'returns true for numbers between min and max'],
    ['1', 0, 1, undefined, [true, 1], 'returns true for numbers that equal max'],
    ['0', 0, 1, undefined, [true, 0], 'returns true for numbers that equal min'],
    ['-1.23', 0, 1, undefined, [false, 'This value must be between 0 and 1'], 'returns false for numbers outside the range'],
    ['-1.23', 0, 1, 'banana {{min}} {{max}}', [false, 'banana 0 1'], 'uses correct error message'],
])('Test NumberValidator range', (value, minNum, maxNum, msg, expected, name) => {
    test(name, () => {
        const validator = new NumberValidator().range(minNum, maxNum, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [0, 2, [true, '0.00'], 'adds decimal places where none are given.'],
    [0.1, 2, [true, '0.10'], 'adds decimal places when not enough are given.'],
    [0.1234, 2, [true, '0.12'], 'removes decimal places where too many are given.'],
    [0.1234, 0, [true, '0'], 'can remove all decimal places.'],
    [-1.23, 2, [true, '-1.23'], 'works with negative numbers'],
])('Test NumberValidator decimalPlaces', (value, count, expected, name) => {
    test(name, () => {
        const validator = new NumberValidator().decimalPlaces(count);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});
