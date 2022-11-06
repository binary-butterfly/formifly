import StringValidator from './StringValidator';
import {Dependent, ErrorFunction, InputType, MutationFunction, ValueType} from './BaseValidator';

const emailRegexp = /.+@.+/;

/**
 * A very simple email validator.
 * @extends StringValidator
 */
class EmailValidator extends StringValidator {
    protected defaultInputType: InputType = 'email';

    constructor(defaultValue?: ValueType, defaultErrorMsg = 'This must be a valid email address', mutationFunc?: MutationFunction, onError?: ErrorFunction, dependent?: Dependent) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);

        this.validateFuncs.push([
            (value: string) => {
                return emailRegexp.test(value);
            },
            defaultErrorMsg,
        ]);
    }

}

export default EmailValidator;
