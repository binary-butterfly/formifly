import PhoneNumberValidator from '../../classes/PhoneNumberValidator';

describe('PhoneNumberValidator', () => {
    it('sets the correct default input type', () => {
        const validator = new PhoneNumberValidator();
        expect(validator.defaultInputType).toStrictEqual('tel');
    });

    it('validates basically everything as a valid phone number', () => {
        const validator = new PhoneNumberValidator();
        expect(validator.validate('☎️🏳️‍⚧️')).toStrictEqual([true, '☎️🏳️‍⚧️']);
    });
});
