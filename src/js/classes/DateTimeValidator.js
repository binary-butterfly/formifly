import PropTypes from 'prop-types';
import {ensureValueIsDateObject} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';

const dateRegex = /^\d{4}-((0[1-9])|(1[0-2]))-(([0-2][0-9])|(3[0-1]))T(([0-1][0-9])|(2[0-3]))(:[0-5][0-9]){1,2}(.\d{3})?[Z]?$/s;

/**
 * A validator that allows you to validate datetime-local fields.
 * @extends BaseValidator
 */
class DateTimeValidator extends BaseValidator {
    defaultInputType = 'datetime-local';
    propType = PropTypes.object;

    /**
     * Validate a datetime input
     * @param {String} [defaultValue]
     * @param {String} [defaultMsg]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     */
    constructor(defaultValue = '', defaultMsg = 'This field must contain a date/time', mutationFunc, onError, dependent) {
        super(defaultValue, defaultMsg,mutationFunc, onError, dependent);

        this.validateFuncs.push([(value) => {
            return dateRegex.test(value) ? new Date(value) : false;
        }, defaultMsg]);
    }

    /**
     * Enforce a minimum date (inclusive)
     * @param {Date} date
     * @param {String} [msg]
     * @return {this}
     */
    minDate(date, msg) {
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
    maxDate(date, msg) {
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
    dateRange(minDate, maxDate, msg) {
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
}

export default DateTimeValidator;
