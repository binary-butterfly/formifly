import EmailValidator from './EmailValidator';

/**
 * This validator is only provided as an example for the documentation and should probably not be used in production.
 * It is included within this code (and covered by a unit test) to make sure we realize when the demo example breaks.
 * @extends EmailValidator
 */
class CustomEmailValidator extends EmailValidator {
    defaultInputType = 'email';

    notFromDomain(domain, msg = 'This domain is not allowed') {
        this.validateFuncs.push([
            (value) => {
                const splitString = value.split('@');
                return splitString[splitString.length - 1] !== domain;
            },
            msg,
        ]);
        return this;
    }
}

export default CustomEmailValidator;
