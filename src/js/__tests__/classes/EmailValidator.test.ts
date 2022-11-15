import EmailValidator from '../../classes/EmailValidator';

describe('EmailValidator', () => {
    it('returns true for something that contains an @ in the middle', () => {
        const validator = new EmailValidator();
        expect(validator.validate('email@example.com')).toStrictEqual([true, 'email@example.com']);
    });

    it('returns false for something that only has an @ at the start', () => {
        const validator = new EmailValidator();
        expect(validator.validate('@email')).toStrictEqual([false, 'This must be a valid email address']);
    });

    it('returns false for something that only has an @ at the end', () => {
        const validator = new EmailValidator(undefined, 'banana');
        expect(validator.validate('email@')).toStrictEqual([false, 'banana']);
    });

    it('returns false for something that does not contain an @ at all', () => {
        const validator = new EmailValidator();
        expect(validator.validate('EMAIL')).toStrictEqual([false, 'This must be a valid email address']);
    });

    it('sets the correct default input type', () => {
        const validator = new EmailValidator();
        expect(validator['defaultInputType']).toStrictEqual('email');
    });
});
