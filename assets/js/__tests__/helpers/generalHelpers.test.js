import {getFieldValueFromKeyString} from '../../helpers/generalHelpers';

describe.each([
    ['banana', {banana: 'apple'}, 'apple', 'works with shallow objects'],
    ['fruit.tasty.banana', {fruit: {tasty: {banana: 'nom!'}}}, 'nom!', 'works with objects that are not shallow']
])('Test getFieldValueFromKeyString', (keyString,values, expected, name) => {
    test(name, () => {
        expect(getFieldValueFromKeyString(keyString, values)).toStrictEqual(expected);
    });
});

test('Test getFieldValueFromKeyString throws error when it cannot find the value', () => {
    function find() {
        getFieldValueFromKeyString('banana', {});
    }

    expect(find).toThrowError('Could not find value for banana')
})
