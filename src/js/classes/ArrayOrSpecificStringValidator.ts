import ArrayValidator from './ArrayValidator';
import BaseValidator, {Dependent, ErrorFunction, MutationFunction, ValidationResult, ValueType,} from './BaseValidator';

/**
 * A validator that allows you to validate array fields that may also contain a string instead of an array value.
 * @extends BaseValidator
 *
 * @property {BaseValidator|AnyOfValidator|ArrayValidator|BooleanValidator|EmailValidator|NumberValidator|ObjectValidator|PhoneNumberValidator|StringValidator} of  - The validator of what this is an array of
 * @property {String} allowedString - The string that is allowed instead of an array value
 */
class ArrayOrSpecificStringValidator<T extends ValueType> extends ArrayValidator<T> {
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
    constructor(of: BaseValidator<any>,
                defaultMessage?: string,
                mutationFunc?: MutationFunction<Array<T>|string>,
                onError?: ErrorFunction,
                dependent?: Dependent,
                allowedString = '_any') {
        super(of, defaultMessage, mutationFunc, onError, dependent);
        this.allowedString = allowedString;
    }

    public validate(
        values: Array<T>|string, otherValues = {}, siblings = {}, recursion = true
    ): ValidationResult<Array<T>|string> {
        if (values === this.allowedString) {
            return [true, values];
        }
        if (typeof values === 'string') {
            return [false, 'This field has to be an array'];
        }
        return super.validate(values, otherValues, siblings, recursion);
    }
}

export default ArrayOrSpecificStringValidator;
