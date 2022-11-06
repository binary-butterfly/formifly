import EmailValidator from './EmailValidator';
import {InputType} from './BaseValidator';

/**
 * This validator is only provided as an example for the documentation and should probably not be used in production.
 * It is included within this code (and covered by a unit test) to make sure we realize when the demo example breaks.
 * @extends EmailValidator
 */
class CustomEmailValidator extends EmailValidator {
    protected defaultInputType: InputType = 'email';

    public notFromDomain(domain: string, msg = 'This domain is not allowed'): this {
        this.validateFuncs.push([
            (value: string) => {
                const splitString = value.split('@');
                return splitString[splitString.length - 1] !== domain;
            },
            msg,
        ]);
        return this;
    }
}

export default CustomEmailValidator;
