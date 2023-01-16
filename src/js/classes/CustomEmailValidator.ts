import EmailValidator from './EmailValidator';
import {InputType} from '../types';

/**
 * This validator is only provided as an example for the documentation and should probably not be used in production.
 * It is included within this code (and covered by a unit test) to make sure we realize when the demo example breaks.
 * @extends EmailValidator
 */
class CustomEmailValidator extends EmailValidator {
    public defaultInputType: InputType = 'email';

    public notFromDomain(domain: string, msg?: string): this {
        this.validateFuncs.push(
            (value) => {
                const splitString = value.split('@');
                return {success: splitString[splitString.length - 1] !== domain, errorMsg: msg, msgName: 'custom_email_validator'};
            },
        );
        return this;
    }
}

export default CustomEmailValidator;
