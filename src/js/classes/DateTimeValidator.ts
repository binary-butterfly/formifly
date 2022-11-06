import PropTypes from 'prop-types';
import {ensureValueIsDateObject} from '../helpers/developerInputValidators';
import {getFieldValueFromKeyString, isInvalidDate} from '../helpers/generalHelpers';
import BaseValidator, {Dependent, ErrorFunction, InputType, MutationFunction} from './BaseValidator';

const dateRegex = /^\d{4}-((0[1-9])|(1[0-2]))-(([0-2][0-9])|(3[0-1]))T(([0-1][0-9])|(2[0-3]))(:[0-5][0-9]){1,2}(.\d{3})?[Z]?$/s;

/**
 * A validator that allows you to validate datetime-local fields.
 * @extends BaseValidator
 */
class DateTimeValidator extends BaseValidator {
    protected defaultInputType: InputType = 'datetime-local';
    protected propType: PropTypes.Requireable<any> = PropTypes.object;

    /**
     * Validate a datetime input
     * @param {String} [defaultValue]
     * @param {String} [defaultMsg]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     */
    constructor(defaultValue = '', defaultMsg = 'This field must contain a date/time', mutationFunc?: MutationFunction, onError?: ErrorFunction, dependent?: Dependent) {
        super(defaultValue, defaultMsg, mutationFunc, onError, dependent);

        this.validateFuncs.push([(value: string|Date) => {
            return value instanceof Date ? value : dateRegex.test(value) ? new Date(value) : false;
        }, defaultMsg]);
    }

    /**
     * Enforce a minimum date (inclusive)
     * @param {Date} date
     * @param {String} [msg]
     * @return {this}
     */
    public minDate(date: Date, msg?: string): this {
        ensureValueIsDateObject(date, 'minDate', 'DateTimeValidator', 'date');
        if (msg === undefined) {
            msg = 'This date must be at least ' + date.toLocaleString();
        } else {
            msg = msg.replace('{{date}}', date.toLocaleString());
        }

        this.validateFuncs.push([value => value >= date, msg]);
        return this;
    }

    /**
     * Enforce a maximum date (inclusive)
     * @param {Date} date
     * @param {String} [msg]
     * @return {this}
     */
    public maxDate(date: Date, msg?: string): this {
        ensureValueIsDateObject(date, 'maxDate', 'DateTimeValidator', 'date');
        if (msg === undefined) {
            msg = 'This date must be ' + date.toLocaleString() + ' at the latest';
        } else {
            msg = msg.replace('{{date}}', date.toLocaleString());
        }

        this.validateFuncs.push([value => value <= date, msg]);
        return this;
    }

    /**
     * Enforce an (inclusive) date range
     * @param {Date} minDate
     * @param {Date} maxDate
     * @param {String} [msg]
     * @return {this}
     */
    public dateRange(minDate: Date, maxDate: Date, msg?: string): this {
        ensureValueIsDateObject(minDate, 'dateRange', 'DateTimeValidator', 'minDate');
        ensureValueIsDateObject(maxDate, 'dateRange', 'DateTimeValidator', 'maxDate');

        if (msg === undefined) {
            msg = 'This date must be between ' + minDate.toLocaleString() + ' and ' + maxDate.toLocaleString();
        } else {
            msg = msg.replace('{{minDate}}', minDate.toLocaleString());
            msg = msg.replace('{{maxDate}}', maxDate.toLocaleString());
        }

        this.validateFuncs.push([value => value >= minDate && value <= maxDate, msg]);
        return this;
    }

    /**
     * Check if the fields value is greater than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public greaterThan(name: string, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be greater than the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, otherValues));
                return isInvalidDate(otherVal) || value > otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessThan(name: string, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be less than the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, otherValues));
                return isInvalidDate(otherVal) || value < otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is greater than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public greaterOrEqualTo(name: string, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be greater than or equal to the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, otherValues));
                return isInvalidDate(otherVal) || value >= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessOrEqualTo(name: string, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be less than or equal to the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, otherValues));
                return isInvalidDate(otherVal) || value <= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is greater than the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public greaterThanSibling(key: string | number, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be greater than the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = new Date(getFieldValueFromKeyString(key, siblings));
                return isInvalidDate(otherVal) || value > otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public lessThanSibling(key: string | number, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be less than the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = new Date(getFieldValueFromKeyString(key, siblings));
                return isInvalidDate(otherVal) || value < otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is greater or equal to the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public greaterOrEqualToSibling(key: string | number, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be greater than or equal to the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = new Date(getFieldValueFromKeyString(key, siblings));
                return isInvalidDate(otherVal) || value >= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than or equal to the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public lessOrEqualToSibling(key: string | number, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be less than or equal to the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = new Date(getFieldValueFromKeyString(key, siblings));
                return isInvalidDate(otherVal) || value <= otherVal;
            },
            msg,
        ]);

        return this;
    }
}

export default DateTimeValidator;
