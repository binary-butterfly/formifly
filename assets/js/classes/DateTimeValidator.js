import {ensureValueIsDateObject} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';

const dateRegex = /^\d{4}-((0[1-9])|(1[0-2]))-(([0-2][0-9])|(3[0-1]))T(([0-1][0-9])|(2[0-3]))(:[0-5][0-9]){1,2}$/s;

class DateTimeValidator extends BaseValidator {
    constructor(dependent, defaultMsg = 'This field must contain a date/time') {
        super(dependent, defaultMsg);

        this.validateFuncs.push([(value) => {
            return dateRegex.test(value) ? new Date(value) : false;
        }, defaultMsg]);
    }

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
