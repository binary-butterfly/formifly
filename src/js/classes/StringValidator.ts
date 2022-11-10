import PropTypes from 'prop-types';
import {ensureValueIsNumeric, ensureValueIsRegexp} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';
import {InputType} from '../types';

/**
 * A validator that allows you to validate string fields.
 * @extends BaseValidator
 */
class StringValidator extends BaseValidator<string> {
    public defaultInputType: InputType = 'text';
    protected propType = PropTypes.string;

    /**
     * Match the string against a regular expression
     * @param {RegExp} expr
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public regex(expr: RegExp, msg: string = 'This value is malformed') {
        ensureValueIsRegexp(expr, 'regex', 'StringValidator', 'expr');
        this.validateFuncs.push(value => ({success: value !== undefined && expr.test(value), errorMsg: msg}));
        return this;
    }

    /**
     * Enforce a minimum length (inclusive) of the string
     * @param {Number} num
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public minLength(num: number, msg?: string): this {
        let errorMsg = msg ?? 'This string must be at least ' + num + ' characters long';
        errorMsg = errorMsg.replace('{{num}}', String(num));
        ensureValueIsNumeric(num, 'minLength', 'StringValidator', 'num');
        this.validateFuncs.push(value => ({success: value !== undefined && value.length >= num, errorMsg}));
        return this;
    }

    /**
     * Enforce a maximum length (inclusive) of the string
     * @param {Number} num
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    public maxLength(num: number, msg?: string): this {
        let errorMsg = msg ?? 'This string must be no longer than ' + num + ' characters';
        errorMsg = errorMsg.replace('{{num}}', String(num));

        ensureValueIsNumeric(num, 'maxLength', 'StringValidator', 'num');
        this.validateFuncs.push(value => ({success: value !== undefined && value.length <= num, errorMsg}));
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
        let errorMsg = msg ?? 'This string must be between ' + min + ' and ' + max + ' characters long';
        errorMsg = errorMsg.replace('{{min}}', String(min));
        errorMsg = errorMsg.replace('{{max}}', String(max));

        ensureValueIsNumeric(min, 'lengthRange', 'StringValidator', 'min');
        ensureValueIsNumeric(max, 'lengthRange', 'StringValidator', 'max');
        this.validateFuncs.push(value => ({success: value !== undefined && value.length >= min && value.length <= max, errorMsg}));
        return this;
    }
}

export default StringValidator;
