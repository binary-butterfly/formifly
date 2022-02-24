import BooleanValidator from '../../classes/BooleanValidator';

describe.each([
    [true, [true, 'true'], 'returns true on bool true'],
    [false, [true, 'false'], 'returns true on bool false'],
    ['true', [true, 'true'], 'returns true on string true'],
    ['false', [true, 'false'], 'returns true on string false'],
    ['banana', [false, 'This field has to be a boolean'], 'returns false on non bool value']
])('Test BooleanValidator', (value, expected, name) => {
    test(name, () => {
        const validator = new BooleanValidator();
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});
