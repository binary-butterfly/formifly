import DateValidator from '../../classes/DateValidator';

describe('DateValidator', () => {
    it('can work with date strings', () => {
        const validator = new DateValidator();
        expect(validator.validate('2020-01-01')).toStrictEqual([true, '2020-01-01']);
    });

    it('rejects strings with time', () => {
        const validator = new DateValidator(undefined, 'error!');
        expect(validator.validate('2020-01-01T13:37:00')).toStrictEqual([false, 'error!']);
    });

    it('can check for a minDate', () => {
        const validator = new DateValidator().minDate('2023-01-01');
        expect(validator.validate('2024-01-01')).toStrictEqual([true, '2024-01-01']);
        expect(validator.validate('2020-01-01')).toStrictEqual([false, 'min_date']);
    });

    it('can use a custom error message for minDate', () => {
        const validator = new DateValidator().minDate('2023-01-01', 'Banana {{date}}');
        expect(validator.validate('2020-01-01')).toStrictEqual([false, 'Banana 2023-01-01']);
    });

    it('validates date string input for minDate', () => {
        const test = () => {
            const validator = new DateValidator().minDate('banana');
            validator.validate('2020-01-01');
        };
        expect(test).toThrowError(new Error('Cannot add minDate to DateValidator: date has to be a date string.'));
    });

    it('can check for a maxDate', () => {
        const validator = new DateValidator().maxDate('2023-01-01');
        expect(validator.validate('2024-01-01')).toStrictEqual([false, 'max_date']);
        expect(validator.validate('2020-01-01')).toStrictEqual([true, '2020-01-01']);
    });

    it('can use a custom error message for maxDate', () => {
        const validator = new DateValidator().maxDate('2020-01-01', 'Banana {{date}}');
        expect(validator.validate('2023-01-01')).toStrictEqual([false, 'Banana 2020-01-01']);
    });

    it('validates date string input for maxDate', () => {
        const test = () => {
            const validator = new DateValidator().maxDate('banana');
            validator.validate('2020-01-01');
        };
        expect(test).toThrowError(new Error('Cannot add maxDate to DateValidator: date has to be a date string.'));
    });

    it('can check for a dateRange', () => {
        const validator = new DateValidator().dateRange('2020-01-01', '2022-01-01');
        expect(validator.validate('2021-01-01')).toStrictEqual([true, '2021-01-01']);
        expect(validator.validate('2023-01-01')).toStrictEqual([false, 'date_range']);
        expect(validator.validate('2019-01-01')).toStrictEqual([false, 'date_range']);
    });

    it('can use a custom error message for dateRange', () => {
        const validator = new DateValidator().dateRange('2023-01-01', '2023-01-02', 'BANANA {{minDate}} {{maxDate}}');
        expect(validator.validate('2020-01-01')).toStrictEqual([false, 'BANANA 2023-01-01 2023-01-02']);
    });

    it('validates minDate string input for dateRange', () => {
        const test = () => {
            const validator = new DateValidator().dateRange('banana', '2020-01-01');
            validator.validate('2020-01-01');
        };

        expect(test).toThrowError(new Error('Cannot add dateRange to DateValidator: minDate has to be a date string.'));
    });

    it('validates maxDate string input for dateRange', () => {
        const test = () => {
            const validator = new DateValidator().dateRange('2020-01-01', 'banana');
            validator.validate('2020-01-01');
        };

        expect(test).toThrowError(new Error('Cannot add dateRange to DateValidator: maxDate has to be a date string.'));
    });
});
