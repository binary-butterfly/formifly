import {validator} from '../../components/demo/DemoForm';
import {describe, expectTypeOf, it} from 'vitest';
import {ValueOfObjectValidatorFields} from '../../types';

describe('DemoFormTypes', () => {
    it('demo validator defaultValues', () => {
        expectTypeOf(validator.defaultValue).toEqualTypeOf<{
            number: number|string,
            wholeNumber: number|string,
            string: string,
            foo: string,
            date: Date|string,
            onlyDate: string,
            laterDate: Date|string,
            select: string,
            selectTwo: string,
            radioGroupOne: string
            radioGroupTwo: string,
            radioGroupThree: string,
            multi: string[],
            fruit: {name: string, tasty: string|boolean, expired: string|boolean}[]
        }>();
    });

    it('demo validator actual values', () => {
        const values = {} as {
            number: number|string,
            wholeNumber: number|string,
            string: string,
            foo: string,
            date: string|Date,
            onlyDate: string,
            laterDate: string|Date,
            select: string,
            selectTwo: string,
            radioGroupOne: string
            radioGroupTwo: string,
            radioGroupThree: string,
            multi: string[],
            fruit: {name: string, tasty: string|boolean, expired: string|boolean}[]
        };

        expectTypeOf(values).toEqualTypeOf<ValueOfObjectValidatorFields<typeof validator.fields>>();
    });
});
