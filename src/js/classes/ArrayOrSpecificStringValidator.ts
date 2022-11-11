import ArrayValidator from './ArrayValidator';
import BaseValidator from './BaseValidator';
import {Dependent, ErrorFunction, MutationFunction, ValidationResult, Value} from '../types';

/**
 * A validator that allows you to validate array fields that may also contain a string instead of an array value.
 * @extends BaseValidator
 *
 * @property {BaseValidator|AnyOfValidator|ArrayValidator|BooleanValidator|EmailValidator|NumberValidator|ObjectValidator|PhoneNumberValidator|StringValidator} of  - The validator of what this is an array of
 * @property {String} allowedString - The string that is allowed instead of an array value
 */
class ArrayOrSpecificStringValidator<T extends Value> extends BaseValidator<Array<T>|string> {
    private readonly allowedString: string;
    private readonly internalArrayValidator: ArrayValidator<T>;

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
                defaultMessage: string = 'This field has to be an array',
                mutationFunc?: MutationFunction,
                onError?: ErrorFunction,
                dependent?: Dependent,
                allowedString = '_any') {
        super([], defaultMessage, mutationFunc, onError, dependent);
        this.internalArrayValidator = new ArrayValidator<T>(of, defaultMessage, mutationFunc, onError, dependent);
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
        return this.internalArrayValidator.validate(values, otherValues, siblings, recursion);
    }

    /**
     * Enforce a minimum count (inclusive) of entries
     * @param {Number} num
     * @param {String} [msg]
     * @return {ArrayValidator}
     */
    public minLength(num: number, msg?: string): this {
        this.internalArrayValidator.minLength(num, msg);
        return this;
    }

    /**
     * Enforce a maximum count (inclusive) of entries
     * @param {Number} num
     * @param {String} [msg]
     * @return {ArrayValidator}
     */
    public maxLength(num: number, msg?: string): this {
        this.internalArrayValidator.maxLength(num, msg);
        return this;
    }

    /**
     * Enforce an entry count within an (inclusive) range
     * @param {Number} min
     * @param {Number} max
     * @param {String} [msg]
     * @return {ArrayValidator}
     */
    public lengthRange(min: number, max: number, msg?: string): this {
        this.internalArrayValidator.lengthRange(min, max, msg);
        return this;
    }


    /**
     * Get the default value for the array's children
     * @return {*[]}
     */
    public getDefaultValue(): Array<T> {
        return this.internalArrayValidator.getDefaultValue();
    }

    /**
     * This function allows you to validate all child fields non recursively.
     * Nothing will change if this.of is not an Array or ObjectValidator since it only applies to those.
     * This means that all of their fields except those that are either Array or ObjectValidators are validated.
     * @param {Array} values
     * @param {Object} [otherValues]
     * @param {any} [siblings]
     * @return {*|[boolean, *[]]|[boolean, *[]]}
     */
    public validateWithoutRecursion(
        values: Array<T>|string,
        otherValues?: Value,
        siblings?: Value
    ): ValidationResult<Array<T>|string> {
        return this.validate(values, otherValues, siblings, false);
    }
}

export default ArrayOrSpecificStringValidator;
