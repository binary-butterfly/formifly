import DateTimeValidator from '../../classes/DateTimeValidator';
import ObjectValidator from '../../classes/ObjectValidator';

test('Test DateTimeValidator returns false on malformed dates', () => {
    const validator = new DateTimeValidator();
    expect(validator.validate('banana')).toStrictEqual([false, 'date_time']);
});

describe.each([
    ['2020-01-01T00:00:00', 'when omitted'],
    ['2020-01-01T00:00:00Z', 'when given'],
])('Test DateTimeValidator handles trailing Z', (input, name) => {
    test(name, () => {
        const validator = new DateTimeValidator();
        expect(validator.validate(input)).toStrictEqual([true, new Date(input)]);
    });
});

describe.each([
    ['2020-01-01T00:00', new Date('2019-01-01'), undefined, [true, new Date('2020-01-01T00:00')], 'returns true on later date'],
    [
        '2020-01-01T00:00',
        new Date('2021-01-01'),
        undefined,
        [false, 'min_date'],
        'returns false on earlier date',
    ],
    [
        '2020-01-01T00:00',
        new Date('2021-01-01'),
        'banana {{date}}',
        [false, 'banana ' + new Date('2021-01-01').toLocaleString()],
        'uses correct error msg',
    ],
])('Test DateTimeValidator minDate', (value, minDate, msg, expected, name) => {
    test(name, () => {
        const validator = new DateTimeValidator().minDate(minDate, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    ['2020-01-01T00:00', new Date('2021-01-01'), undefined, [true, new Date('2020-01-01T00:00')], 'returns true on earlier date'],
    [
        '2020-01-01T00:00',
        new Date('2019-01-01'),
        undefined,
        [false, 'max_date'],
        'returns false on later date',
    ],
    [
        '2020-01-01T00:00',
        new Date('2019-01-01'),
        'banana {{date}}',
        [false, 'banana ' + new Date('2019-01-01').toLocaleString()],
        'uses correct error msg',
    ],
])('Test DateTimeValidator maxDate', (value, maxDate, msg, expected, name) => {
    test(name, () => {
        const validator = new DateTimeValidator().maxDate(maxDate, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [
        '2021-01-01T00:00',
        new Date('2020-01-01'),
        new Date('2022-01-01'),
        undefined,
        [true, new Date('2021-01-01T00:00')],
        'returns true on earlier date',
    ],
    [
        '2020-01-01T00:00',
        new Date('2019-01-01'),
        new Date('2019-06-01'),
        undefined,
        [false, 'date_range'],
        'returns false on date outside the range',
    ],
    [
        '2020-01-01T00:00',
        new Date('2019-01-01'),
        new Date('2019-06-01'),
        'banana {{minDate}} {{maxDate}}',
        [false, 'banana ' + new Date('2019-01-01').toLocaleString() + ' ' + new Date('2019-06-01').toLocaleString()],
        'uses correct error msg',
    ],
])('Test DateTimeValidator dateRange', (value, minDate, maxDate, msg, expected, name) => {
    test(name, () => {
        const validator = new DateTimeValidator().dateRange(minDate, maxDate, msg);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe('Test DateTimeValidator greaterThanSibling', () => {
    it('works with a valid smaller sibling', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator(),
            end: new DateTimeValidator().greaterThanSibling('begin', 'bla'),
        });
        const values = {begin: '2020-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2020-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid greater sibling', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator(), end: new DateTimeValidator().greaterThanSibling('begin')});
        const values = {begin: '2022-01-01T00:00:00Z', end: '2020-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [true, new Date('2022-01-01T00:00:00Z')],
            end: [false, 'greater_than_sibling_date'],
        }]);
    });

    it('works with an invalid sibling', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator(), end: new DateTimeValidator().greaterThanSibling('begin')});
        const values = {begin: 'banana', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [false, 'date_time'],
            end: [true, new Date('2022-01-01T00:00:00Z')],
        }]);
    });
});

describe('Test DateTimeValidator greaterOrEqualToSibling', () => {
    it('works with a valid smaller sibling', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator(),
            end: new DateTimeValidator().greaterOrEqualToSibling('begin', 'bla'),
        });
        const values = {begin: '2020-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2020-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid equal sibling', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator(),
            end: new DateTimeValidator().greaterOrEqualToSibling('begin'),
        });
        const values = {begin: '2022-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2022-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid greater sibling', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator(),
            end: new DateTimeValidator().greaterOrEqualToSibling('begin'),
        });
        const values = {begin: '2022-01-01T00:00:00Z', end: '2020-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [true, new Date('2022-01-01T00:00:00Z')],
            end: [false, 'greater_or_equal_to_sibling_date'],
        }]);
    });

    it('works with an invalid sibling', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator(),
            end: new DateTimeValidator().greaterOrEqualToSibling('begin'),
        });
        const values = {begin: 'banana', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [false, 'date_time'],
            end: [true, new Date('2022-01-01T00:00:00Z')],
        }]);
    });
});

describe('Test DateTimeValidator lessThanSibling', () => {
    it('works with a valid greater sibling', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator().lessThanSibling('end', 'bla'),
            end: new DateTimeValidator(),
        });
        const values = {begin: '2020-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2020-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid smaller sibling', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessThanSibling('end'), end: new DateTimeValidator()});
        const values = {begin: '2022-01-01T00:00:00Z', end: '2020-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [false, 'less_than_sibling_date'],
            end: [true, new Date('2020-01-01T00:00:00Z')],
        }]);
    });

    it('works with an invalid sibling', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessThanSibling('end'), end: new DateTimeValidator()});
        const values = {begin: '2022-01-01T00:00:00Z', end: 'banana'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [true, new Date('2022-01-01T00:00:00Z')],
            end: [false, 'date_time'],
        }]);
    });
});

describe('Test DateTimeValidator lessOrEqualToSibling', () => {
    it('works with a valid greater sibling', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator().lessOrEqualToSibling('end', 'bla'),
            end: new DateTimeValidator(),
        });
        const values = {begin: '2020-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2020-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid smaller sibling', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessOrEqualToSibling('end'), end: new DateTimeValidator()});
        const values = {begin: '2022-01-01T00:00:00Z', end: '2020-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [false, 'less_or_equal_to_sibling_date'],
            end: [true, new Date('2020-01-01T00:00:00Z')],
        }]);
    });

    it('works with a valid equal sibling', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator().lessOrEqualToSibling('end'),
            end: new DateTimeValidator(),
        });
        const values = {begin: '2022-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2022-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with an invalid sibling', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessOrEqualToSibling('end'), end: new DateTimeValidator()});
        const values = {begin: '2022-01-01T00:00:00Z', end: 'banana'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [true, new Date('2022-01-01T00:00:00Z')],
            end: [false, 'date_time'],
        }]);
    });
});

describe('Test DateTimeValidator greaterThan', () => {
    it('works with a valid smaller field', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator(), end: new DateTimeValidator().greaterThan('begin', 'bla')});
        const values = {begin: '2020-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2020-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid greater field', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator(), end: new DateTimeValidator().greaterThan('begin')});
        const values = {begin: '2022-01-01T00:00:00Z', end: '2020-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [true, new Date('2022-01-01T00:00:00Z')],
            end: [false, 'greater_than_date'],
        }]);
    });

    it('works with an invalid field', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator(), end: new DateTimeValidator().greaterThan('begin')});
        const values = {begin: 'banana', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [false, 'date_time'],
            end: [true, new Date('2022-01-01T00:00:00Z')],
        }]);
    });
});

describe('Test DateTimeValidator greaterOrEqualTo', () => {
    it('works with a valid smaller field', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator(),
            end: new DateTimeValidator().greaterOrEqualTo('begin', 'bla'),
        });
        const values = {begin: '2020-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2020-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid equal field', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator(),
            end: new DateTimeValidator().greaterOrEqualTo('begin'),
        });
        const values = {begin: '2022-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2022-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid greater field', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator(),
            end: new DateTimeValidator().greaterOrEqualTo('begin'),
        });
        const values = {begin: '2022-01-01T00:00:00Z', end: '2020-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [true, new Date('2022-01-01T00:00:00Z')],
            end: [false, 'greater_or_equal_to_date'],
        }]);
    });

    it('works with an invalid field', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator(),
            end: new DateTimeValidator().greaterOrEqualTo('begin'),
        });
        const values = {begin: 'banana', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [false, 'date_time'],
            end: [true, new Date('2022-01-01T00:00:00Z')],
        }]);
    });
});

describe('Test DateTimeValidator lessThan', () => {
    it('works with a valid greater field', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessThan('end', 'bla'), end: new DateTimeValidator()});
        const values = {begin: '2020-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2020-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid smaller field', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessThan('end'), end: new DateTimeValidator()});
        const values = {begin: '2022-01-01T00:00:00Z', end: '2020-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [false, 'less_than_date'],
            end: [true, new Date('2020-01-01T00:00:00Z')],
        }]);
    });

    it('works with an invalid field', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessThan('end'), end: new DateTimeValidator()});
        const values = {begin: '2022-01-01T00:00:00Z', end: 'banana'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [true, new Date('2022-01-01T00:00:00Z')],
            end: [false, 'date_time'],
        }]);
    });
});

describe('Test DateTimeValidator lessOrEqualTo', () => {
    it('works with a valid greater field', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessOrEqualTo('end', 'bla'), end: new DateTimeValidator()});
        const values = {begin: '2020-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2020-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with a valid smaller field', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessOrEqualTo('end'), end: new DateTimeValidator()});
        const values = {begin: '2022-01-01T00:00:00Z', end: '2020-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [false, 'less_or_equal_to_date'],
            end: [true, new Date('2020-01-01T00:00:00Z')],
        }]);
    });

    it('works with a valid equal field', () => {
        const validator = new ObjectValidator({
            begin: new DateTimeValidator().lessOrEqualTo('end'),
            end: new DateTimeValidator(),
        });
        const values = {begin: '2022-01-01T00:00:00Z', end: '2022-01-01T00:00:00Z'};
        expect(validator.validate(values, values, values)).toStrictEqual([true, {
            begin: new Date('2022-01-01T00:00:00Z'),
            end: new Date('2022-01-01T00:00:00Z'),
        }]);
    });

    it('works with an invalid field', () => {
        const validator = new ObjectValidator({begin: new DateTimeValidator().lessOrEqualTo('end'), end: new DateTimeValidator()});
        const values = {begin: '2022-01-01T00:00:00Z', end: 'banana'};
        expect(validator.validate(values, values, values)).toStrictEqual([false, {
            begin: [true, new Date('2022-01-01T00:00:00Z')],
            end: [false, 'date_time'],
        }]);
    });
});

test('Test DateTimeValidator allows date objects as input', () => {
    const validator = new DateTimeValidator();
    const date = new Date();
    expect(validator.validate(date)).toStrictEqual([true, date]);
});
