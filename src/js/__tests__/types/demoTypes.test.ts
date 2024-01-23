import {validator} from '../../components/demo/DemoForm';
import {describe, expectTypeOf, it} from 'vitest';
import {DeepPartial, ValidationResult} from '../../types';
import {FormiflyFormProps} from '../../components/meta/FormiflyForm';

type ExpectedValueType = {
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
};

describe('DemoFormTypes', () => {
    it('demo validator defaultValues', () => {
        expectTypeOf(validator.defaultValue).toEqualTypeOf<ExpectedValueType>();

        expectTypeOf(validator.validate({})).toEqualTypeOf<ValidationResult<ExpectedValueType>>(); // Todo: make type narrower (and write it more explicit here)

        expectTypeOf<Parameters<FormiflyFormProps<typeof validator>['onSubmit']>[0]>().toMatchTypeOf<DeepPartial<ExpectedValueType> | undefined>();
        expectTypeOf<Parameters<NonNullable<FormiflyFormProps<typeof validator>['onSubmitValidationError']>>[0]>().toMatchTypeOf<DeepPartial<{
            number: false|string,
            wholeNumber: false|string,
            string: false|string,
            foo: false|string,
            date: false|string,
            onlyDate: false|string,
            laterDate: false|string,
            select: false|string,
            selectTwo: false|string,
            radioGroupOne: false|string
            radioGroupTwo: false|string,
            radioGroupThree: false|string,
            multi:(false|string)[],
            fruit: {name: false|string, tasty: false|string, expired: false|string}[]
        }>>();
    });
});
