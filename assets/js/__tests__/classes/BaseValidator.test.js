import BaseValidator from '../../classes/BaseValidator';

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
])('Test BaseValdiator required', (value, expected, msg, name) => {
    test(name, () => {
        const validator = new BaseValidator().required(msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});
