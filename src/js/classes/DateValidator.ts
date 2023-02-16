import {Dependent, ErrorFunction, InputType, MutationFunction} from '../types';
import StringValidator from './StringValidator';
import {ensureRegexMatches} from '../helpers/developerInputValidators';

class DateValidator extends StringValidator {
    protected dateRegex = /^\d{4}-((0[1-9])|(1[0-2]))-(([0-2][0-9])|(3[0-1]))$/;
    defaultInputType: InputType = 'date';

    /**
     * Validate a date string input
     * @param {String} [defaultValue]
     * @param {String} [defaultMsg]
     * @param {MutationFunction} [mutationFunc]
     * @param {ErrorFunction} [onError]
     * @param {Dependent} [dependent]
     */
    constructor(defaultValue: string = '',
                defaultMsg?: string,
                mutationFunc?: MutationFunction,
                onError?: ErrorFunction,
                dependent?: Dependent) {
        super(defaultValue, defaultMsg, mutationFunc, onError, dependent);

        this.validateFuncs.push((value) => {
            const success = this.dateRegex.test(value);
            return {success, changedValue: value, errorMsg: defaultMsg, msgName: 'date'};
        });
    }

    public minDate(date: string, msg?: String) {
        ensureRegexMatches(date, this.dateRegex, 'minDate', 'DateValidator', 'date', 'be a date string.');

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

    public maxDate(date: string, msg?: String) {
        ensureRegexMatches(date, this.dateRegex, 'maxDate', 'DateValidator', 'date', 'be a date string.');

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

    public dateRange(minDate: string, maxDate: string, msg?: String) {
        ensureRegexMatches(minDate, this.dateRegex, 'dateRange', 'DateValidator', 'minDate', 'be a date string.');
        ensureRegexMatches(maxDate, this.dateRegex, 'dateRange', 'DateValidator', 'maxDate', 'be a date string.');

        let errorMsg: string | undefined;
        if (msg) {
            errorMsg = msg.replace('{{minDate}}', minDate.toLocaleString()).replace('{{maxDate}}', maxDate.toLocaleString());
        }

        this.validateFuncs.push(value => ({
            success: value >= minDate && value <= maxDate,
            errorMsg,
            msgName: 'date_range',
            translationContext: {minDate: minDate, maxDate: maxDate},
        }));
        return this;
    }
}

export default DateValidator;
