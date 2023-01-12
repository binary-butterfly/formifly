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
                defaultErrorMsg?: string,
                mutationFunc?: MutationFunction,
                onError?: ErrorFunction,
                dependent?: Dependent) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);

        this.validateFuncs.push(
            value => ({success: emailRegexp.test(value), errorMsg: defaultErrorMsg, msgName: 'email'})
        );
    }

}

export default EmailValidator;
