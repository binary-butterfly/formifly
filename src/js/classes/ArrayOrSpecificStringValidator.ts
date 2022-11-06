import ArrayValidator from './ArrayValidator';
import BaseValidator, {Dependent, ErrorFunction, MutationFunction, ValidationResult} from './BaseValidator';

/**
 * A validator that allows you to validate array fields that may also contain a string instead of an array value.
 * @extends BaseValidator
 *
 * @property {BaseValidator|AnyOfValidator|ArrayValidator|BooleanValidator|EmailValidator|NumberValidator|ObjectValidator|PhoneNumberValidator|StringValidator} of  - The validator of what this is an array of
 * @property {String} allowedString - The string that is allowed instead of an array value
 */
class ArrayOrSpecificStringValidator extends ArrayValidator {
    private readonly allowedString: string;

    /**
     * Validate an array of fields
     * @param {BaseValidator} of
     * @param {String} [defaultMessage]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     * @param {String} [allowedString
     */
    constructor(of: BaseValidator, defaultMessage?: string, mutationFunc?: MutationFunction, onError?: ErrorFunction, dependent?: Dependent, allowedString = '_any') {
        super(of, defaultMessage, mutationFunc, onError, dependent);
        this.allowedString = allowedString;
    }

    public validate(values, otherValues = {}, siblings = {}, recursion = true): ValidationResult {
        if (values === this.allowedString) {
            return [true, values];
        }
        return super.validate(values, otherValues, siblings, recursion);
    }
}

export default ArrayOrSpecificStringValidator;
