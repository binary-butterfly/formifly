import StringValidator from './StringValidator';

const emailRegexp = /.+@.+/;

/**
 * A very simple email validator.
 * @extends StringValidator
 */
class EmailValidator extends StringValidator {
    defaultInputType = 'email';

    constructor(defaultValue, defaultErrorMsg = 'This must be a valid email address', mutationFunc, onError, dependent) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);

        this.validateFuncs.push([
            value => {
                return emailRegexp.test(value);
            },
            defaultErrorMsg,
        ]);
    }

}

export default EmailValidator;
