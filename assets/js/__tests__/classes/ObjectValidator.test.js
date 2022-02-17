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
                banana: [false, 'This field is required'],
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
        const Validator = new ObjectValidator(fields);
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
            ),
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
    expect(validator.getPropType(true)).toStrictEqual({foo: PropTypes.string.isRequired, bar: PropTypes.number});
});
