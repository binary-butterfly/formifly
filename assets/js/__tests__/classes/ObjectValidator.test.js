import NumberValidator from '../../classes/NumberValidator';
import ObjectValidator from '../../classes/ObjectValidator';
import StringValidator from '../../classes/StringValidator';

describe.each([
    [{banana: new StringValidator().required()}, {banana: 'nom!'}, [true, {banana: 'nom!'}], 'validates child fields'],
    [{banana: new StringValidator().required()}, {banana: ''}, [false, 'This field is required'], 'validates child fields and can fail'],
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
