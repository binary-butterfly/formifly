import PropTypes from 'prop-types';
import {ensureValueIsNumeric, ensureValueIsRegexp} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';
import {Dependent, ErrorFunction, InputType, MutationFunction} from '../types';

/**
 * A validator that allows you to validate string fields.
 * @extends BaseValidator
 */
class StringValidator extends BaseValidator<string> {
    public defaultInputType: InputType = 'text';
    protected propType = PropTypes.string;


    /**
     * @param {String} defaultValue
     * @param {String} [defaultErrorMsg]
     * @param {MutationFunction} [mutationFunc]
     * @param {ErrorFunction} [onError]
     * @param {Dependent} [dependent]
     */
    constructor(defaultValue: string = '',
                defaultErrorMsg?: string,
                mutationFunc?: MutationFunction,
                onError?: ErrorFunction,
                dependent?: Dependent) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);
    }

    /**
     * Match the string against a regular expression
     * @param {RegExp} expr
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public regex(expr: RegExp, msg?: string) {
        ensureValueIsRegexp(expr, 'regex', 'StringValidator', 'expr');
        this.validateFuncs.push(value => ({success: expr.test(value), errorMsg: msg, msgName: 'regex'}));
        return this;
    }

    /**
     * Enforce a minimum length (inclusive) of the string
     * @param {Number} num
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public minLength(num: number, msg?: string): this {
        ensureValueIsNumeric(num, 'minLength', 'StringValidator', 'num');

        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{num}}', String(num));
        }

        this.validateFuncs.push(value => ({
            success: value.length >= num,
            errorMsg,
            msgName: 'min_length_string',
            translationContext: {num: num},
        }));
        return this;
    }

    /**
     * Enforce a maximum length (inclusive) of the string
     * @param {Number} num
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public maxLength(num: number, msg?: string): this {
        ensureValueIsNumeric(num, 'maxLength', 'StringValidator', 'num');

        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{num}}', String(num));
        }

        this.validateFuncs.push(value => ({
            success: value.length <= num,
            errorMsg,
            msgName: 'max_length_string',
            translationContext: {num: num},
        }));
        return this;
    }

    /**
     * Enforce a string length between two numbers (inclusive)
     * @param {Number} min
     * @param {Number} max
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public lengthRange(min: number, max: number, msg?: string): this {
        ensureValueIsNumeric(min, 'lengthRange', 'StringValidator', 'min');
        ensureValueIsNumeric(max, 'lengthRange', 'StringValidator', 'max');

        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{min}}', String(min)).replace('{{max}}', String(max));
        }

        this.validateFuncs.push(value => ({
            success: value.length >= min && value.length <= max,
            errorMsg,
            msgName: 'length_range_string',
            translationContext: {min: min, max: max},
        }));
        return this;
    }
}

export default StringValidator;
