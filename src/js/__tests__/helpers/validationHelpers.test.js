import StringValidator from '../../classes/StringValidator';
import NumberValidator from '../../classes/NumberValidator';
import ObjectValidator from '../../classes/ObjectValidator';
import ArrayValidator from '../../classes/ArrayValidator';
import BooleanValidator from '../../classes/BooleanValidator';
import {findFieldValidatorFromName, unpackErrors} from '../../helpers/validationHelpers';

describe.each([
    [
        'banana',
        new ObjectValidator({
            banana: new StringValidator(),
            apple: new NumberValidator(),
        }),
        StringValidator,
        'Works with flat data structures',
    ],
    [
        'fruit.banana.tasty',
        new ObjectValidator({
            fruit: new ObjectValidator({
                banana: new ObjectValidator({
                    tasty: new BooleanValidator(),
                    color: new StringValidator(),
                }),
            }),
            vegetables: new ObjectValidator({
                tastinessLevel: new NumberValidator(),
            }),
        }),
        BooleanValidator,
        'works with non flat data structures',
    ],
    [
        'fruit.tasty',
        new ObjectValidator({
            fruit: new ArrayValidator(new ObjectValidator({
                tasty: new BooleanValidator(),
            })),
        }),
        BooleanValidator,
        'works with array fields',
    ],
    [
        'fruit.0',
        new ObjectValidator({
            fruit: new ArrayValidator(new ObjectValidator({
                tasty: new BooleanValidator(),
            })),
        }),
        ObjectValidator,
        'works with flat array fields',
    ],
])('Test findFieldValidatorFromName', (keyName, shape, expectedClass, name) => {
    test(name, () => {
        expect(findFieldValidatorFromName(keyName, shape)).toBeInstanceOf(expectedClass);
    });
});

test('Test findFieldValidatorFromName throws error on non existent field', () => {
    function find() {
        findFieldValidatorFromName('banana', new ObjectValidator({'apple': new StringValidator()}));
    }

    expect(find).toThrowError('Could not find validator for banana');
});

test('Test findFieldValidatorFromName throws error on non existent array field', () => {
    function find() {
        findFieldValidatorFromName(
            'apple.banana',
            new ObjectValidator({'apple': new ArrayValidator(new ObjectValidator({foo: new BooleanValidator()}))}),
        );
    }

    expect(find).toThrowError('Could not find validator for apple.banana');
});

describe.each([
    [[true, {banana: 'nom'}], {}, 'returns empty object when no errors exist'],
    [[false, {abc: [true, 'abc'], def: [false, 'banana']}], {def: 'banana'}, 'works with flat structures'],
    [[false, {
        fruit: [false, {
            banana: [true, 'nom'],
            apple: [false, 'sour'],
        }],
    }], {fruit: {apple: 'sour'}}, 'works with non flat structures'],
    [[false, {people: [false, [[false, 'bla'], [true, 'blub']]]}], {people: {0: 'bla'}}, 'works with arrays'],
    [
        [
            false,
            {
                people:
                    [
                        false,
                        [
                            [
                                true,
                                {
                                    name: 'Vlad',
                                    likesBananas: true,
                                },
                            ],
                            [
                                false,
                                {
                                    name: [true, 'Dima'],
                                    likesBananas: [false, 'does not like bananas'],
                                },
                            ],
                        ],
                    ],
            },
        ],
        {
            people:
                {
                    1:
                        {likesBananas: 'does not like bananas'},
                },
        },
        'works with objects within arrays',
    ],
])('Test unpackErrors', (errors, expected, name) => {
    test(name, () => {
        expect(unpackErrors(errors)).toStrictEqual(expected);
    });
});
