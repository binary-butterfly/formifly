import PropTypes from 'prop-types';
import {ensureValueIsNumeric} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';
import {Dependent, ErrorFunction, InputType, MutationFunction} from '../types';

const numRegexp = /^-?\d+([.,]\d+)?$/s;
const wholeNumRegexp = /^-?\d+$/s;

const delocalize = (value: string | number): number => {
    return parseFloat(String(value).replace(',', '.'));
};

/**
 * A validator that allows you to validate numbers.
 * @extends BaseValidator
 */
class NumberValidator extends BaseValidator<number|string> {
    public defaultInputType: InputType = 'number';
    protected propType: PropTypes.Requireable<any> = PropTypes.number;

    protected _minNum?: number;
    protected _maxNum?: number;

    /**
     * Validate a numeric input field
     * @param wholeNumber - Set to true to only allow whole numbers
     * @param [defaultValue]
     * @param [defaultErrorMsg]
     * @param [mutationFunc]
     * @param [onError]
     * @param [dependent]
     */
    constructor(
        wholeNumber = false,
        defaultValue: string | number = '',
        defaultErrorMsg?: string,
        mutationFunc?: MutationFunction,
        onError?: ErrorFunction,
        dependent?: Dependent
    ) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);

        let regexpInUse: RegExp;
        let errorMsg = defaultErrorMsg ?? '';
        if (wholeNumber) {
            if (defaultErrorMsg === undefined) {
                errorMsg = 'This field must be a whole number';
            }
            regexpInUse = wholeNumRegexp;
        } else {
            if (defaultErrorMsg === undefined) {
                 errorMsg = 'This field must be a number';
            }
            regexpInUse = numRegexp;
        }

        this.validateFuncs.push(
            (value) => {
                const success = value !== undefined && regexpInUse.test(String(value));
                return {success, errorMsg, changedValue: success ? delocalize(value) : undefined};
            }
        );
    }

    /**
     * Ensure a minimum number (inclusive)
     * @param {Number} num
     * @param {String} [msg]
     * @return {this}
     */
    public min(num: number, msg?: string): this {
        ensureValueIsNumeric(num, 'min', 'NumberValidator', 'num');

        let errorMsg = msg ?? 'This value must be at least ' + num;
        errorMsg = errorMsg.replace('{{num}}', String(num));

        this.validateFuncs.push(value => ({success: value !== undefined && value >= num, errorMsg}));
        this._minNum = num;
        return this;
    }

    public get minNum(): number | undefined {
        return this._minNum;
    }

    /**
     * Enforce a maximum value
     * @param {Number} num
     * @param {String} [msg]
     * @return {this}
     */
    public max(num: number, msg?: string): this {
        ensureValueIsNumeric(num, 'max', 'NumberValidator', 'num');
        let errorMsg = msg ?? 'This value must be at most ' + num;
        errorMsg = errorMsg.replace('{{num}}', String(num));

        this.validateFuncs.push(value => ({success: value !== undefined && value <= num, errorMsg}));
        this._maxNum = num;
        return this;
    }

    public get maxNum(): number | undefined {
        return this._minNum;
    }

    /**
     * Only allow positive numbers. (Excluding 0)
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public positive(msg = 'This value must be positive'): this {
        this.validateFuncs.push(value => ({success: value !== undefined && value > 0, errorMsg: msg}));
        return this;
    }

    /**
     * Only allow negative numbers. (Excluding 0)
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public negative(msg = 'This value must be negative'): this {
        this.validateFuncs.push(value => ({success: value !== undefined && value < 0, errorMsg: msg}));
        return this;
    }

    /**
     * Only allow numbers within an (inclusive) range
     * @param {Number} min
     * @param {Number} max
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public range(min: number, max: number, msg?: string): this {

        let errorMsg = msg ?? 'This value must be between ' + min + ' and ' + max;
        errorMsg = errorMsg.replace('{{min}}', String(min));
        errorMsg = errorMsg.replace('{{max}}', String(max));

        ensureValueIsNumeric(min, 'range', 'NumberValidator', 'min');
        ensureValueIsNumeric(max, 'range', 'NumberValidator', 'max');
        this.validateFuncs.push(value => ({success: value !== undefined && value >= min && value <= max, errorMsg}));
        this._minNum = min;
        this._maxNum = max;
        return this;
    }

    /**
     * Converts the input number into a decimal string.
     * @param {Number} count
     * @returns {this}
     */
    public decimalPlaces(count: number): this {
        ensureValueIsNumeric(count, 'decimalPlaces', 'NumberValidator', 'count');
        this.validateFuncs.push(
            value => ({
                success: true,
                changedValue: Number(value).toFixed(count),
                errorMsg: 'This is not a validator and should not return false.',
            })
        );
        return this;
    }
}

export default NumberValidator;
