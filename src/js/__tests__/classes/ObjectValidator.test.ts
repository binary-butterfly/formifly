import PropTypes from 'prop-types';
import ArrayValidator from '../../classes/ArrayValidator';
import BooleanValidator from '../../classes/BooleanValidator';
import NumberValidator from '../../classes/NumberValidator';
import ObjectValidator from '../../classes/ObjectValidator';
import StringValidator from '../../classes/StringValidator';

describe.each([
    [{banana: new StringValidator().required()}, {banana: 'nom!'}, [true, {banana: 'nom!'}], 'validates child fields'],
    [
        {
            banana: new StringValidator().required(),
            apple: new StringValidator(),
        },
        {
            banana: '',
            apple: '',
        },
        [
            false,
            {
                banana: [false, 'required'],
                apple: [true, ''],
            },
        ],
        'validates child fields and can fail',
    ],
    [{decimal: new NumberValidator().decimalPlaces(2), banana: new StringValidator()},
        {banana: '', decimal: '2'},
        [
            true,
            {
                banana: '',
                decimal: '2.00',
            },
        ],
        'validates and can mutate children'],
])('Test ObjectValidator', (fields, value, expected, name) => {
    test(name, () => {
        const Validator = new ObjectValidator(fields, undefined, undefined, undefined, undefined, false);
        expect(Validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [
        {
            banana: new StringValidator(),
            apple: new BooleanValidator(),
        },
        {banana: '', apple: false},
        'works with flat structures',
    ],
    [
        {
            fruit: new ArrayValidator(
                new ObjectValidator({
                    tasty: new BooleanValidator(),
                }),
            ).minLength(1),
        },
        {
            fruit: [{tasty: false}],
        },
        'works with array fields',
    ],
    [
        {
            things: new ObjectValidator({
                cool: new ObjectValidator({
                    coolnessLevel: new NumberValidator(undefined, 0),
                }),
                tasty: new ObjectValidator({
                    tastinessLevel: new NumberValidator(undefined, 0),
                }),
            }),
        },
        {
            things: {
                cool: {
                    coolnessLevel: 0,
                },
                tasty: {
                    tastinessLevel: 0,
                },
            },
        },
        'works recursively',
    ],
])('Test ObjectValidator getDefaultValue', (fields, expected, name) => {
    test(name, () => {
        const Validator = new ObjectValidator(fields);
        expect(Validator.getDefaultValue()).toStrictEqual(expected);
    });
});

test('Test getPropType', () => {
    const validator = new ObjectValidator({foo: new StringValidator().required(), bar: new NumberValidator()});
    expect(String(validator.getPropType())).toBe(String(PropTypes.shape({foo: PropTypes.string.isRequired, bar: PropTypes.number})));
});

test('Test getPropType required', () => {
    const validator = new ObjectValidator({foo: new StringValidator().required(), bar: new NumberValidator()}).required();
    expect(String(validator.getPropType())).toBe(String(PropTypes.shape({
        foo: PropTypes.string.isRequired,
        bar: PropTypes.number,
    }).isRequired));
});

test('Test getPropType first', () => {
    const validator = new ObjectValidator({foo: new StringValidator().required(), bar: new NumberValidator()});
    expect(validator.getFirstPropType()).toStrictEqual({foo: PropTypes.string.isRequired, bar: PropTypes.number});
});

describe.each([
    [
        {
            foo: new StringValidator(),
            bar: new ArrayValidator(new StringValidator()),
            baz: new ArrayValidator(new StringValidator()),
        },
        {foo: '', bar: [], baz: ['']},
        true,
        [true, {}],
        'drops empty fields',
    ],
    [
        {
            foo: new StringValidator(),
            bar: new ArrayValidator(new StringValidator()),
            baz: new ArrayValidator(new StringValidator()),
        },
        {foo: '', bar: [], baz: ['']},
        false,
        [
            true,
            {
                foo: '',
                bar: [],
                baz: [''],
            },
        ],
        'does not drop empty fields when set false',
    ],
])('Test dropEmpty', (fields, value, dropEmtpy, expected, name) => {
    test(name, () => {
        const validator = new ObjectValidator(fields, undefined, undefined, undefined, undefined, dropEmtpy);
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

test('Test ObjectValidator works with alwaysFalse', () => {
    const validator = new ObjectValidator({foo: new StringValidator()}).alwaysFalse('test!');
    expect(validator.validate('banana' as any)).toStrictEqual([false, 'test!']);
});

describe.each([
    [{foo: 1, bar: 2}, undefined, [true, {foo: 1, bar: 2}], 'returns true for greater value'],
    [{foo: 2, bar: 1}, undefined, [false, {foo: [true, 2], bar: [false, 'greater_than_sibling']}], 'returns false for smaller value'],
    [{foo: 2, bar: 2}, 'banana', [false, {foo: [true, 2], bar: [false, 'banana']}], 'returns false for equal value'],
])('Test ObjectValidator greaterThanSibling', (value, msg, expected, name) => {
    test(name, () => {
        const validator = new ObjectValidator({
            foo: new NumberValidator(),
            bar: new NumberValidator().greaterThanSibling('foo', msg),
        });
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [{foo: 1, bar: 2}, undefined, [true, {foo: 1, bar: 2}], 'returns true for greater value'],
    [{foo: 2, bar: 2}, undefined, [true, {foo: 2, bar: 2}], 'returns true for equal value'],
    [{foo: 2, bar: 1}, 'banana', [false, {foo: [true, 2], bar: [false, 'banana']}], 'returns false for smaller value'],
])('Test ObjectValidator greaterOrEqualToSibling', (value, msg, expected, name) => {
    test(name, () => {
        const validator = new ObjectValidator({
            foo: new NumberValidator(),
            bar: new NumberValidator().greaterOrEqualToSibling('foo', msg),
        });
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [{foo: 2, bar: 1}, undefined, [true, {foo: 2, bar: 1}], 'returns true for smaller value'],
    [{foo: 1, bar: 2}, undefined, [false, {foo: [true, 1], bar: [false, 'less_than_sibling']}], 'returns false for greater value'],
    [{foo: 2, bar: 2}, 'banana', [false, {foo: [true, 2], bar: [false, 'banana']}], 'returns false for equal value'],
])('Test ObjectValidator lessThanSibling', (value, msg, expected, name) => {
    test(name, () => {
        const validator = new ObjectValidator({
            foo: new NumberValidator(),
            bar: new NumberValidator().lessThanSibling('foo', msg),
        });
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

describe.each([
    [{foo: 2, bar: 1}, undefined, [true, {foo: 2, bar: 1}], 'returns true for smaller value'],
    [{foo: 2, bar: 2}, 'banana', [true, {foo: 2, bar: 2}], 'returns true for equal value'],
    [{foo: 1, bar: 2}, undefined, [false, {foo: [true, 1], bar: [false, 'less_or_equal_to_sibling']}], 'returns false for greater value'],
])('Test ObjectValidator lessOrEqualToSibling', (value, msg, expected, name) => {
    test(name, () => {
        const validator = new ObjectValidator({
            foo: new NumberValidator(),
            bar: new NumberValidator().lessOrEqualToSibling('foo', msg),
        });
        expect(validator.validate(value)).toStrictEqual(expected);
    });
});

test('Test setDropEmpty', () => {
    const validator = new ObjectValidator({
        foo: new StringValidator(),
    });
    const values = {foo: ''};

    validator.setDropEmpty(false);
    expect(validator.validate(values)).toStrictEqual([true, values]);

    validator.setDropEmpty(true);
    expect(validator.validate(values)).toStrictEqual([true, {}]);
});

test('Test dropNotInShape', () => {
    const validator = new ObjectValidator({foo: new StringValidator()}, undefined, undefined, undefined, undefined, undefined, true);
    const values = {foo: 'bar', banana: 'tasty!'};

    expect(validator.validate(values)).toStrictEqual([true, {foo: 'bar'}]);

    validator.setDropNotInShape(false);
    expect(validator.validate(values)).toStrictEqual([true, values]);

    validator.setDropNotInShape(true);
    expect(validator.validate(values)).toStrictEqual([true, {foo: 'bar'}]);
});

test('Test ObjectValidator validateWithoutRecursion', () => {
    const validator = new ObjectValidator({
        foo: new StringValidator(),
        bar: new ArrayValidator(new StringValidator().minLength(10)),
        baz: new ObjectValidator({test: new StringValidator().minLength(10)}),
    });

    const values = {
        foo: 'abc',
        bar: ['def', 'ghi'],
        baz: {test: 'uff'},
    };

    expect(validator.validateWithoutRecursion(values)).toStrictEqual([true, values]);
});

test('Test ObjectValidator can validate empty objects successfully explicitly when not required', () => {
    const validator = new ObjectValidator({banana: new StringValidator().required()}).notRequired();
    expect(validator.validate({})).toStrictEqual([true, {}]);
});

test('Test ObjectValidator rejects empty objects if it is required', () => {
    const validator = new ObjectValidator({banana: new StringValidator()}).required('This has to be set.');
    expect(validator.validate({})).toStrictEqual([false, 'This has to be set.']);
});

test('Test ObjectValidator rejects empty objects if it has not been set to really not be required and a child field is required', () => {
    const validator = new ObjectValidator({banana: new StringValidator().required('Bla')});
    expect(validator.validate({})).toStrictEqual([false, {banana: [false, 'Bla']}]);
});

test('Test ObjectValidator rejects non set required child fields', () => {
    const validator = new ObjectValidator({banana: new StringValidator().required('This has to be set.'), apple: new StringValidator()});
    expect(validator.validate({apple: 'foo'})).toStrictEqual([false, {apple: [true, 'foo'], banana: [false, 'This has to be set.']}]);
});

test('Test ObjectValidator can handle undefined if explicitly not required', () => {
    const validator = new ObjectValidator({foo: new StringValidator()}).notRequired();

    expect(validator.validate(undefined)).toStrictEqual([true, undefined]);
});
