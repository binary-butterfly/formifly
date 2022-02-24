import StringValidator from './StringValidator';

const emailRegexp = /.+@.+/;

/**
 * This validator is only provided as an example for the documentation and should probably not be used in production.
 * It is included within this code (and covered by a unit test) to make sure we realize when the demo example breaks.
 */
class CustomEmailValidator extends StringValidator {
    defaultInputType = 'email';

    constructor(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);

        this.validateFuncs.push([
            value => {
                return emailRegexp.test(value);
            },
            defaultErrorMsg,
        ]);
    }

    notFromDomain(domain, msg = 'This domain is not allowed') {
        this.validateFuncs.push([
            value => {
                const splitString = value.split('@');
                return splitString[splitString.length - 1] !== domain;
            },
            msg
        ])
        return this;
    }
}

export default CustomEmailValidator;
