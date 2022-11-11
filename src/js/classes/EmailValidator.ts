import StringValidator from './StringValidator';
import {Dependent, ErrorFunction, InputType, MutationFunction} from '../types';

const emailRegexp = /.+@.+/;

/**
 * A very simple email validator.
 * @extends StringValidator
 */
class EmailValidator extends StringValidator {
    public defaultInputType: InputType = 'email';

    constructor(defaultValue?: string,
                defaultErrorMsg = 'This must be a valid email address',
                mutationFunc?: MutationFunction,
                onError?: ErrorFunction,
                dependent?: Dependent) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);

        this.validateFuncs.push(
            value => ({success: value !== undefined && emailRegexp.test(value), errorMsg: defaultErrorMsg})
        );
    }

}

export default EmailValidator;
