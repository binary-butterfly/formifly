import {
    completeDefaultValues,
    convertDateObjectToInputString,
    getFieldValueFromKeyString,
    setFieldValueFromKeyString,
} from '../../helpers/generalHelpers';

describe.each([
    ['banana', {banana: 'apple'}, 'apple', 'works with shallow objects'],
    ['fruit.tasty.banana', {fruit: {tasty: {banana: 'nom!'}}}, 'nom!', 'works with objects that are not shallow'],
])('Test getFieldValueFromKeyString', (keyString, values, expected, name) => {
    test(name, () => {
        expect(getFieldValueFromKeyString(keyString, values)).toStrictEqual(expected);
    });
});

test('Test getFieldValueFromKeyString throws error when it cannot find the value', () => {
    function find() {
        getFieldValueFromKeyString('banana', {});
    }

    expect(find).toThrowError('Could not find value for banana');
});

describe.each([
    [new Date(2020, 1, 1, 1, 0, 0, 0), '2020-02-01T01:00:00', 'works as intended'],
])('Test convertDateObjectToInputString', (date, expected, name) => {
    test(name, () => {
        expect(convertDateObjectToInputString(date)).toEqual(expected);
    });
});

describe.each([
    ['banana', 'apple', {banana: 'food'}, {banana: 'apple'}, 'works with flat structures that contain the key value'],
    ['banana', 'apple', {food: 'nom'}, {food: 'nom', banana: 'apple'}, 'works with flat structures that do not contain the value'],
    [
        'fruit.banana.tasty',
        true,
        {
            fruit:
                {
                    banana: {
                        tasty: false,
                        extinct: false,
                    },
                },
        },
        {
            fruit: {
                banana: {
                    tasty: true,
                    extinct: false,
                },
            },
        }, 'works with non flat structures that contain the key value',
    ],
    [
        'fruit.banana.tasty',
        true,
        {
            fruit: {
                apple: {tasty: true},
            },
        },
        {
            fruit: {
                apple: {tasty: true},
                banana: {tasty: true},
            },
        },
        'works with non flat structures that contain the key values',
    ],
    [
        'fruit.0.tasty',
        true,
        {
            fruit: [
                {tasty: false},
            ],
        },
        {
            fruit: [
                {tasty: true},
            ],
        },
        'works with arrays',
    ],
])('Test setFieldValueFromKeyString', (fieldName, newValue, oldValues, expected, name) => {
    test(name, () => {
        expect(setFieldValueFromKeyString(fieldName, newValue, oldValues)).toStrictEqual(expected);
    });
});

describe.each([
    [
        {
            fruit:
                [
                    {name: '', tasty: false}], foo: 'bar',
        },
        {
            fruit:
                [
                    {name: 'banana', tasty: true},
                    {name: 'apple', tasty: true},
                ],
        },
        {
            fruit:
                [
                    {name: 'banana', tasty: true},
                    {name: 'apple', tasty: true},
                ],
            foo: 'bar',
        },
        'does its job'],
    [
        {
            fruit: [],
        },
        {
            fruit:
                [
                    {name: 'banana', tasty: true},
                ],
        },
        {
            fruit: [
                {name: 'banana', tasty: true},
            ],
        },
        'works with empty arrays from validatorDefaults'],
    [{}, {fruit: [{name: 'banana'}]}, {fruit: [{name: 'banana'}]}, 'works with empty validatorDefaults'],
    [{fruit: []}, {fruit: null}, {fruit: []}, 'skips null values'],
])('Test completeDefaultValues', (validatorDefaults, userDefaults, expected, name) => {
    test(name, () => {
        expect(completeDefaultValues(validatorDefaults, userDefaults)).toStrictEqual(expected);
    });
});
