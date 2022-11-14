import PropTypes from 'prop-types';
import {ensureValueIsNumeric} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';
import ObjectValidator from './ObjectValidator';
import {
    Dependent,
    ErrorFunction,
    InputType,
    MutationFunction,
    ValidationResult,
    Value,
    ValueOfValidator,
} from '../types';

/**
 * A validator that allows you to validate array fields.
 * @extends BaseValidator
 *
 * @property {BaseValidator} of  - The validator of which this is an array of
 */
class ArrayValidator<T extends BaseValidator<any>> extends BaseValidator<ValueOfValidator<T>[]> {
    public readonly of: T;
    public minChildCount: number = 0;
    public maxChildCount: number = Number.POSITIVE_INFINITY;
    public defaultInputType: InputType = 'select';

    /**
     * Validate an array of fields
     * @param {BaseValidator} of
     * @param {String} [defaultMessage]
     * @param {MutationFunction} [mutationFunc]
     * @param {ErrorFunction} [onError]
     * @param {Dependent} [dependent]
     */
    constructor(of: T,
                          defaultMessage: string = 'This field has to be an array',
                          mutationFunc?: MutationFunction,
                          onError?: ErrorFunction,
                          dependent?: Dependent) {
        super([], defaultMessage, mutationFunc, onError, dependent);
        this.of = of;
        this.propType = PropTypes.arrayOf(of.getPropType());
    }

    /**
     * Enforce a minimum count (inclusive) of entries
     * @param {Number} num
     * @param {String} [msg]
     * @return {this}
     */
    public minLength(num: number, msg?: string): this {
        ensureValueIsNumeric(num, 'minLength', 'ArrayValidator', 'num');
        let errorMsg = msg ?? 'There must be at least ' + num + ' entries for this';
        errorMsg = errorMsg.replace('{{num}}', String(num));
        this.validateFuncs.push(values => ({success: values !== undefined && values.length >= num, errorMsg}));

        if (num > 0) {
            this.required(errorMsg);
        }
        this.minChildCount = num;
        return this;
    }

    /**
     * Enforce a maximum count (inclusive) of entries
     * @param {Number} num
     * @param {String} [msg]
     * @return {this}
     */
    public maxLength(num: number, msg?: string): this {
        ensureValueIsNumeric(num, 'maxLength', 'ArrayValidator', 'num');
        let errorMsg = msg ?? 'There must be at most ' + num + ' entries for this';
        errorMsg = errorMsg.replace('{{num}}', String(num));
        this.validateFuncs.push(values => ({success: values !== undefined && values.length <= num, errorMsg}));
        this.maxChildCount = num;
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
        ensureValueIsNumeric(min, 'lengthRange', 'ArrayValidator', 'min');
        ensureValueIsNumeric(max, 'lengthRange', 'ArrayValidator', 'max');
        let errorMsg = msg ?? 'There must be between ' + min + ' and ' + max + ' entries for this';
        errorMsg = errorMsg.replace('{{min}}', String(min));
        errorMsg = errorMsg.replace('{{max}}', String(max));
        this.validateFuncs.push(values => ({success: values !== undefined && values.length >= min && values.length <= max, errorMsg}));

        if (min > 0) {
            this.required(errorMsg);
        }
        this.minChildCount = min;
        this.maxChildCount = max;
        return this;
    }

    /**
     * Get the default value for the array's children
     * @return {*[]}
     */
    public getDefaultValue(): Array<ValueOfValidator<T>> {
        const fieldDefault = this.of.getDefaultValue();
        const ret: Array<ValueOfValidator<T>> = [];
        for (let c = 0; c < this.minChildCount; c++) {
            ret.push(fieldDefault);
        }
        return ret;
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
        values: Array<ValueOfValidator<T>>,
        otherValues?: Value,
        siblings?: Value
    ): ValidationResult<Array<ValueOfValidator<T>>> {
        return this.validate(values, otherValues, siblings, false);
    }

    public validate(
        values: Array<ValueOfValidator<T>>,
        otherValues = {},
        siblings = {},
        recursion = true
    ): ValidationResult<Array<ValueOfValidator<T>>> {
        // First we validate the amount of entries as well as dependent filters and requirement filters
        const preValidate = super.validate(values, otherValues, siblings);
        if (preValidate[0] === false) {
            return preValidate;
        }

        if (Array.isArray(values) === false) {
            return [false, this.defaultErrorMsg];
        }

        // Then, if the amount is correct, we validate the specific entries
        const tests: Array<ValidationResult<ValueOfValidator<T>>> = [];

        let testFunc;
        if (recursion || !(this.of instanceof ObjectValidator || this.of instanceof ArrayValidator)) {
            testFunc = this.of.validate.bind(this.of);
        } else {
            testFunc = this.of.validateWithoutRecursion.bind(this.of);
        }

        // Unpack to avoid mutations
        const testValues = [...values];
        let allOk = true;
        for (const index in testValues) {
            const value = testValues[index];

            const test = testFunc(value, otherValues, testValues) as ValidationResult<ValueOfValidator<T>>;
            tests.push(test);
            if (test[0] === false) {
                allOk = false;
            } else if (allOk) {
                testValues[index] = test[1]!;
            }
        }

        return allOk ? [true, testValues] : [false, tests];
    }
}

export default ArrayValidator;
