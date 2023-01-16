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
class NumberValidator extends BaseValidator<number | string> {
    public defaultInputType: InputType = 'number';
    protected propType: PropTypes.Requireable<any> = PropTypes.number;

    protected _minNum?: number;
    protected _maxNum?: number;

    /**
     * Validate a numeric input field
     * @param wholeNumber - Set to true to only allow whole numbers
     * @param {String|Number} [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {MutationFunction} [mutationFunc]
     * @param {ErrorFunction} [onError]
     * @param {Dependent} [dependent]
     */
    constructor(
        wholeNumber = false,
        defaultValue: string | number = '',
        defaultErrorMsg?: string,
        mutationFunc?: MutationFunction,
        onError?: ErrorFunction,
        dependent?: Dependent,
    ) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);

        let regexpInUse: RegExp;
        let msgName = 'number';
        if (wholeNumber) {
            msgName = 'whole_number';
            regexpInUse = wholeNumRegexp;
        } else {
            regexpInUse = numRegexp;
        }

        this.validateFuncs.push(
            (value) => {
                const success = regexpInUse.test(String(value));
                return {success, errorMsg: defaultErrorMsg, changedValue: success ? delocalize(value) : undefined, msgName: msgName};
            },
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

        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{num}}', String(num));
        }

        this.validateFuncs.push(value => ({
            success: value >= num,
            errorMsg,
            msgName: 'min_number',
            translationContext: {num: num},
        }));
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

        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{num}}', String(num));
        }

        this.validateFuncs.push(value => ({
            success: value <= num,
            errorMsg,
            msgName: 'max_number',
            translationContext: {num: num},
        }));
        this._maxNum = num;
        return this;
    }

    public get maxNum(): number | undefined {
        return this._maxNum;
    }

    /**
     * Only allow positive numbers. (Excluding 0)
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public positive(msg?: string): this {
        this.validateFuncs.push(value => ({success: value > 0, errorMsg: msg, msgName: 'positive'}));
        return this;
    }

    /**
     * Only allow negative numbers. (Excluding 0)
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public negative(msg?: string): this {
        this.validateFuncs.push(value => ({success: value < 0, errorMsg: msg, msgName: 'negative'}));
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
        ensureValueIsNumeric(min, 'range', 'NumberValidator', 'min');
        ensureValueIsNumeric(max, 'range', 'NumberValidator', 'max');


        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{min}}', String(min)).replace('{{max}}', String(max));
        }

        this.validateFuncs.push(value => ({
            success: value >= min && value <= max,
            errorMsg,
            msgName: 'number_range',
            translationContext: {min: min, max: max},
        }));
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
                msgName: '',
            }),
        );
        return this;
    }
}

export default NumberValidator;
