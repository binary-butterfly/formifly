import ArrayValidator from '../../classes/ArrayValidator';
import BooleanValidator from '../../classes/BooleanValidator';
import NumberValidator from '../../classes/NumberValidator';
import ObjectValidator from '../../classes/ObjectValidator';
import StringValidator from '../../classes/StringValidator';
import {
    findFieldValidatorAndSiblingsFromName,
    findFieldValidatorFromName,
    unpackErrors,
} from '../../helpers/validationHelpers';
import {ValidationResult} from '../../types';

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
        expect(unpackErrors(errors as ValidationResult<any>)).toStrictEqual(expected);
    });
});

describe('Test findFieldValidatorAndSiblingsFromName', () => {
    it('can unpack a very complicated object', () => {
        const shape = new ObjectValidator({
            foo: new ObjectValidator({
                bar: new ArrayValidator(new ObjectValidator({
                    baz: new StringValidator(),
                })),
            }),
        });

        const values = {foo: {bar: [{baz: 'bla', bla: 'blub'}, {baz: 'foo', bla: 'banana'}]}};

        const [validator, siblings] = findFieldValidatorAndSiblingsFromName('foo.bar.0.baz', shape, values);
        expect(validator).toBeInstanceOf(StringValidator);
        expect(siblings).toStrictEqual({baz: 'bla', bla: 'blub'});
    });

    it('works with flat objects', () => {
        const shape = new ObjectValidator({foo: new StringValidator(), bar: new StringValidator()});
        const values = {foo: 'bla', bar: 'blub'};
        const [validator, siblings] = findFieldValidatorAndSiblingsFromName('foo', shape, values);
        expect(validator).toBeInstanceOf(StringValidator);
        expect(siblings).toStrictEqual({foo: 'bla', bar: 'blub'});
    });

    it('throws on non existing fields', () => {
        const shape = new ObjectValidator({foo: new StringValidator()});
        const values = {foo: 'bla'};

        function find() {
            findFieldValidatorAndSiblingsFromName('bar', shape, values);
        }

        expect(find).toThrowError('Could not find validator for bar');
    });

});
