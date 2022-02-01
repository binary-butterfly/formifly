import {ensureValueIsNumeric} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';

const numRegexp = /^-?\d+([.,]\d+)?$/s;

const delocalize = (value) => {
    return parseFloat(String(value).replace(',', '.'));
};

class NumberValidator extends BaseValidator {
    constructor(defaultErrorMsg = 'This field must be a number') {
        super(defaultErrorMsg);
        this.validateFuncs.push([
            value => {
                return numRegexp.test(value) ? delocalize(value) : false;
            },
            defaultErrorMsg,
        ]);
    }

    /**
     * Only allow positive numbers. (Excluding 0)
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {NumberValidator}
     */
    positive(msg = 'This value must be positive') {
        this.validateFuncs.push([value => value > 0, msg]);
        return this;
    }

    /**
     * Only allow negative numbers. (Excluding 0)
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {NumberValidator}
     */
    negative(msg = 'This value must be negative') {
        this.validateFuncs.push([value => value < 0, msg]);
        return this;
    }

    /**
     * Only allow numbers within an (inclusive) range
     * @param {Number} min
     * @param {Number} max
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {NumberValidator}
     */
    range(min, max, msg) {
        if (msg === undefined) {
            msg = 'This value must be between ' + min + ' and ' + max;
        } else {
            msg = msg.replace('{{min}}', String(min));
            msg = msg.replace('{{max}}', String(max));
        }

        ensureValueIsNumeric(min, 'range', 'NumberValidator', 'min');
        ensureValueIsNumeric(max, 'range', 'NumberValidator', 'max');
        this.validateFuncs.push([value => value >= min && value <= max, msg]);
        return this;
    }

    /**
     * Converts the input number into a decimal string.
     * @param {Number} count
     * @returns {NumberValidator}
     */
    decimalPlaces(count) {
        ensureValueIsNumeric(count, 'decimalPlaces', 'NumberValidator', 'count');
        this.validateFuncs.push([
            value => {
                const str = value.toString();
                const splits = str.split('.');

                if (count > 0) {
                    let pastDecimal = splits[1];
                    if (pastDecimal === undefined) {
                        pastDecimal = '';
                        for (let c = 0; c < count; c++) {
                            pastDecimal += '0' + '';
                        }
                    } else {
                        if (pastDecimal.length > count) {
                            pastDecimal = pastDecimal.substr(0, count);
                        } else if (pastDecimal.length < count) {
                            for (let c = pastDecimal.length; c < count; c++) {
                                pastDecimal += '0' + '';
                            }
                        }
                    }
                    return splits[0] + '.' + pastDecimal;
                }
                return splits[0];
            },
            'This is not a validator and should not return false.',
        ]);
        return this;
    }
}

export default NumberValidator;
