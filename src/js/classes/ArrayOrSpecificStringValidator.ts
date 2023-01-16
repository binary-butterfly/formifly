import ArrayValidator from './ArrayValidator';
import BaseValidator from './BaseValidator';
import {Dependent, ErrorFunction, MutationFunction, ValidationResult, Value, ValueOfValidator} from '../types';
import {TFunction} from 'i18next';

/**
 * A validator that allows you to validate array fields that may also contain a string instead of an array value.
 * @extends BaseValidator
 *
 */
class ArrayOrSpecificStringValidator<T extends BaseValidator<any>> extends BaseValidator<Array<ValueOfValidator<T>> | string> {
    private readonly allowedString: string;
    private readonly internalArrayValidator: ArrayValidator<T>;

    /**
     * Validate an array of fields
     * @param {BaseValidator} of
     * @param {String} [defaultMessage]
     * @param {MutationFunction} [mutationFunc]
     * @param {ErrorFunction} [onError]
     * @param {Dependent} [dependent]
     * @param {String} [allowedString
     */
    constructor(of: T,
                defaultMessage: string = 'This field has to be an array',
                mutationFunc?: MutationFunction,
                onError?: ErrorFunction,
                dependent?: Dependent,
                allowedString: string = '_any') {
        super([], defaultMessage, mutationFunc, onError, dependent);
        this.internalArrayValidator = new ArrayValidator<T>(of, defaultMessage, mutationFunc, onError, dependent);
        this.allowedString = allowedString;
    }

    public validate(
        values: Array<ValueOfValidator<T>> | string, otherValues = {}, siblings = {}, t?: TFunction, recursion = true,
    ): ValidationResult<Array<ValueOfValidator<T>> | string> {
        if (values === this.allowedString) {
            return [true, values];
        }
        if (typeof values === 'string') {
            return [false, 'This field has to be an array'];
        }
        return this.internalArrayValidator.validate(values, otherValues, siblings, t, recursion);
    }

    /**
     * Enforce a minimum count (inclusive) of entries
     * @param {Number} num
     * @param {String} [msg]
     * @return {this}
     */
    public minLength(num: number, msg?: string): this {
        this.internalArrayValidator.minLength(num, msg);
        return this;
    }

    /**
     * Enforce a maximum count (inclusive) of entries
     * @param {Number} num
     * @param {String} [msg]
     * @return {this}
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
     * @return {this}
     */
    public lengthRange(min: number, max: number, msg?: string): this {
        this.internalArrayValidator.lengthRange(min, max, msg);
        return this;
    }


    /**
     * Get the default value for the array's children
     * @return {*[]}
     */
    public getDefaultValue(): Array<ValueOfValidator<T>> {
        return this.internalArrayValidator.getDefaultValue();
    }

    /**
     * This function allows you to validate all child fields non recursively.
     * Nothing will change if this.of is not an Array or ObjectValidator since it only applies to those.
     * This means that all of their fields except those that are either Array or ObjectValidators are validated.
     * @param {Array} values
     * @param {Object} [otherValues]
     * @param {any} [siblings]
     * @param {TFunction} [t]
     * @return {*|[boolean, *[]]|[boolean, *[]]}
     */
    public validateWithoutRecursion(
        values: Array<ValueOfValidator<T>> | string,
        otherValues?: Value,
        siblings?: Value,
        t?: TFunction,
    ): ValidationResult<Array<ValueOfValidator<T>> | string> {
        return this.validate(values, otherValues, siblings, t, false);
    }
}

export default ArrayOrSpecificStringValidator;
