import DateTimeValidator from '../../classes/DateTimeValidator';

test('Test DateTimeValidator returns false on malformed dates', () => {
    const validator = new DateTimeValidator();
    expect(validator.validate('banana')).toStrictEqual([false, 'This field must contain a date/time']);
});

describe.each([
    ['2020-01-01T00:00', new Date('2019-01-01'), undefined, [true, new Date('2020-01-01T00:00')], 'returns true on later date'],
    ['2020-01-01T00:00', new Date('2021-01-01'), undefined, [false, 'This date must be at least ' + new Date('2021-01-01').toLocaleString()], 'returns false on earlier date'],
    ['2020-01-01T00:00', new Date('2021-01-01'), 'banana {{date}}', [false, 'banana ' + new Date('2021-01-01').toLocaleString()], 'uses correct error msg'],
])('Test DateTimeValidator minDate', (value, minDate, msg, expected, name) => {
    test(name, () => {
        const validator = new DateTimeValidator().minDate(minDate, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    ['2020-01-01T00:00', new Date('2021-01-01'), undefined, [true, new Date('2020-01-01T00:00')], 'returns true on earlier date'],
    ['2020-01-01T00:00', new Date('2019-01-01'), undefined, [false, 'This date must be ' + new Date('2019-01-01').toLocaleString() + ' at the latest'], 'returns false on later date'],
    ['2020-01-01T00:00', new Date('2019-01-01'), 'banana {{date}}', [false, 'banana ' + new Date('2019-01-01').toLocaleString()], 'uses correct error msg'],
])('Test DateTimeValidator maxDate', (value, maxDate, msg, expected, name) => {
    test(name, () => {
        const validator = new DateTimeValidator().maxDate(maxDate, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    ['2021-01-01T00:00', new Date('2020-01-01'), new Date('2022-01-01'), undefined, [true, new Date('2021-01-01T00:00')], 'returns true on earlier date'],
    ['2020-01-01T00:00', new Date('2019-01-01'), new Date('2019-06-01'), undefined, [false, 'This date must be between ' + new Date('2019-01-01').toLocaleString() + ' and ' + new Date('2019-06-01').toLocaleString()], 'returns false on date outside the range'],
    ['2020-01-01T00:00', new Date('2019-01-01'), new Date('2019-06-01'), 'banana {{minDate}} {{maxDate}}', [false, 'banana ' + new Date('2019-01-01').toLocaleString() + ' ' + new Date('2019-06-01').toLocaleString()], 'uses correct error msg'],
])('Test DateTimeValidator dateRange', (value, minDate, maxDate, msg, expected, name) => {
    test(name, () => {
        const validator = new DateTimeValidator().dateRange(minDate, maxDate, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});
