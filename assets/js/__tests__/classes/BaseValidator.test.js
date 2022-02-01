import BaseValidator from '../../classes/BaseValidator';

describe.each([
    ['abc', true, 'returns true for random value'],
    ['', true, 'returns true for empty string'],
    [null, true, 'returns true for null'],
    [undefined, true, 'returns true for undefined'],
])('Test BaseValidator not required', (value, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator();
        expect(validator.validate(value)).toEqual([expected, value]);
    });
});

describe.each([
    ['abc', true, 'returns true for random value'],
    ['', false, 'returns false for empty string'],
    [null, false, 'returns false for null'],
    [undefined, false, 'returns false for undefined'],
])('Test BaseValdiator required', (value, expected, name) => {
    test(name, () => {
        const validator = new BaseValidator().required();
        expect(validator.validate(value)).toEqual([expected, value]);
    });
});
