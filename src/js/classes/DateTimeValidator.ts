import PropTypes from 'prop-types';
import {ensureValueIsDateObject} from '../helpers/developerInputValidators';
import {getFieldValueFromKeyString, isInvalidDate} from '../helpers/generalHelpers';
import BaseValidator from './BaseValidator';
import {Dependent, ErrorFunction, InputType, MutationFunction} from '../types';

const dateRegex = /^\d{4}-((0[1-9])|(1[0-2]))-(([0-2][0-9])|(3[0-1]))T(([0-1][0-9])|(2[0-3]))(:[0-5][0-9]){1,2}(.\d{3})?Z?$/s;

/**
 * A validator that allows you to validate datetime-local fields.
 * @extends BaseValidator
 */
class DateTimeValidator extends BaseValidator<Date | string> {
    public defaultInputType: InputType = 'datetime-local';
    protected propType: PropTypes.Requireable<any> = PropTypes.object;

    /**
     * Validate a datetime input
     * @param {Date|String} [defaultValue]
     * @param {String} [defaultMsg]
     * @param {MutationFunction} [mutationFunc]
     * @param {ErrorFunction} [onError]
     * @param {Dependent} [dependent]
     */
    constructor(defaultValue: Date | string = '',
                defaultMsg?: string,
                mutationFunc?: MutationFunction,
                onError?: ErrorFunction,
                dependent?: Dependent) {
        super(defaultValue, defaultMsg, mutationFunc, onError, dependent);

        this.validateFuncs.push((value) => {
            if (value instanceof Date) {
                return {success: true, errorMsg: defaultMsg, msgName: 'date_time'};
            }
            const success = dateRegex.test(value);
            return {success, changedValue: new Date(value), errorMsg: defaultMsg, msgName: 'date_time'};
        });
    }

    /**
     * Enforce a minimum date (inclusive)
     * @param {Date} date
     * @param {String} [msg]
     * @return {this}
     */
    public minDate(date: Date, msg?: string): this {
        ensureValueIsDateObject(date, 'minDate', 'DateTimeValidator', 'date');

        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{date}}', date.toLocaleString());
        }

        this.validateFuncs.push(value => ({
            success: value >= date,
            errorMsg,
            msgName: 'min_date',
            translationContext: {date: date.toLocaleString()},
        }));
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

        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{date}}', date.toLocaleString());
        }

        this.validateFuncs.push(value => ({
            success: value <= date,
            errorMsg,
            msgName: 'max_date',
            translationContext: {date: date.toLocaleString()},
        }));
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


        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{minDate}}', minDate.toLocaleString()).replace('{{maxDate}}', maxDate.toLocaleString());
        }

        this.validateFuncs.push(value => ({
            success: value >= minDate && value <= maxDate,
            errorMsg,
            msgName: 'date_range',
            translationContext: {minDate: minDate.toLocaleString(), maxDate: maxDate.toLocaleString()},
        }));
        return this;
    }

    /**
     * Check if the fields value is greater than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public greaterThan(name: string, msg?: string): this {
        this.validateFuncs.push(
            (value, otherValues) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, otherValues) as Date | number);
                return {
                    success: isInvalidDate(otherVal) || value > otherVal,
                    errorMsg: msg,
                    msgName: 'greater_than_date',
                    translationContext: {name: name},
                };
            },
        );

        return this;
    }

    /**
     * Check if the fields value is less than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessThan(name: string, msg?: string): this {
        this.validateFuncs.push(
            (value, otherValues) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, otherValues) as Date | number);
                return {
                    success: isInvalidDate(otherVal) || value < otherVal,
                    errorMsg: msg,
                    msgName: 'less_than_date',
                    translationContext: {name: name},
                };
            },
        );

        return this;
    }

    /**
     * Check if the fields value is greater than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public greaterOrEqualTo(name: string, msg?: string): this {
        this.validateFuncs.push(
            (value, otherValues) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, otherValues) as Date | number);
                return {
                    success: isInvalidDate(otherVal) || value >= otherVal,
                    errorMsg: msg,
                    msgName: 'greater_or_equal_to_date',
                    translationContext: {name: name},
                };
            },
        );

        return this;
    }

    /**
     * Check if the fields value is less than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessOrEqualTo(name: string, msg?: string): this {
        this.validateFuncs.push(
            (value, otherValues) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, otherValues) as Date | number);
                return {
                    success: isInvalidDate(otherVal) || value <= otherVal,
                    errorMsg: msg,
                    msgName: 'less_or_equal_to_date',
                    translationContext: {name: name},
                };
            },
        );

        return this;
    }

    /**
     * Check if the fields value is greater than the value of one of its siblings
     * @param {String|Number} name
     * @param {String} [msg]
     * @return {this}
     */
    public greaterThanSibling(name: string | number, msg?: string): this {
        this.validateFuncs.push(
            (value, otherValues, siblings) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, siblings) as Date | number);
                return {
                    success: isInvalidDate(otherVal) || value > otherVal,
                    errorMsg: msg,
                    msgName: 'greater_than_sibling_date',
                    translationContext: {name: name},
                };
            },
        );

        return this;
    }

    /**
     * Check if the fields value is less than the value of one of its siblings
     * @param {String|Number} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessThanSibling(name: string | number, msg?: string): this {
        this.validateFuncs.push(
            (value, otherValues, siblings) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, siblings) as Date | number);
                return {
                    success: isInvalidDate(otherVal) || value < otherVal,
                    errorMsg: msg,
                    msgName: 'less_than_sibling_date',
                    translationContext: {name: name},
                };
            },
        );

        return this;
    }

    /**
     * Check if the fields value is greater or equal to the value of one of its siblings
     * @param {String|Number} name
     * @param {String} [msg]
     * @return {this}
     */
    public greaterOrEqualToSibling(name: string | number, msg?: string): this {
        this.validateFuncs.push(
            (value, otherValues, siblings) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, siblings) as Date | number);
                return {
                    success: isInvalidDate(otherVal) || value >= otherVal,
                    errorMsg: msg,
                    msgName: 'greater_or_equal_to_sibling_date',
                    translationContext: {name: name},
                };
            },
        );

        return this;
    }

    /**
     * Check if the fields value is less than or equal to the value of one of its siblings
     * @param {String|Number} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessOrEqualToSibling(name: string | number, msg?: string): this {
        this.validateFuncs.push(
            (value, otherValues, siblings) => {
                const otherVal = new Date(getFieldValueFromKeyString(name, siblings) as Date | number);
                return {
                    success: isInvalidDate(otherVal) || value <= otherVal,
                    errorMsg: msg,
                    msgName: 'less_or_equal_to_sibling_date',
                    translationContext: {name: name},
                };
            },
        );

        return this;
    }
}

export default DateTimeValidator;
