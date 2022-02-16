import CustomEmailValidator from '../../classes/CustomEmailValidator';

describe.each([
    ['returns true for existing domain', 'mail@email.foo', undefined, [true, 'mail@email.foo']],
    ['returns false for invalid domain', 'mail@competitor.com', undefined, [false, 'This domain is not allowed']],
    ['uses correct error msg', 'mail@competitor.com', 'banana', [false, 'banana']],
])('Test custom email validator', (name, value, msg, expected) => {
    test(name, () => {
        const validator = new CustomEmailValidator().notFromDomain('competitor.com', msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});
