import BaseValidator from './BaseValidator';
import {Dependent, ErrorFunction, MutationFunction, ValidationResult, Value} from '../types';
import {TFunction} from 'i18next';

/**
 * A "meta" validator that allows you to check if a value can be successfully validated by any of a given list of validators.
 * @extends BaseValidator
 *
 * @property {Array<BaseValidator|AnyOfValidator|ArrayValidator|BooleanValidator|EmailValidator|NumberValidator|ObjectValidator|PhoneNumberValidator|StringValidator>} validatorOptions - The validators that the value is checked against
 */
class AnyOfValidator extends BaseValidator<any> {
    private readonly validatorOptions: Array<BaseValidator<any>>;
    private passThroughErrorIndex?: Number;

    /**
     * Validates something against an array of different validators and returns true if any of them match.
     * @param {Array<BaseValidator<any>>} validatorOptions
     * @param {Any} [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {MutationFunction} [mutationFunc]
     * @param {ErrorFunction} [onError]
     * @param {Dependent} [dependent]
     * @param {Number} [passThroughErrorIndex] - Set this to return the errors of a specific validatorOption rather than a generic one
     */
    constructor(
        validatorOptions: Array<BaseValidator<any>>,
        defaultValue?: any,
        defaultErrorMsg?: string,
        mutationFunc?: MutationFunction,
        onError?: ErrorFunction,
        dependent?: Dependent,
        passThroughErrorIndex?: Number,
    ) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);
        this.validatorOptions = validatorOptions;
        this.passThroughErrorIndex = passThroughErrorIndex;
    }

    public getDefaultValue(): any {
        if (this.defaultValue === undefined) {
            return this.validatorOptions[0].getDefaultValue();
        }
        return this.defaultValue;
    }

    public setPassThroughErrorIndex(newIndex: Number): void {
        this.passThroughErrorIndex = newIndex;
    }

    public validate(value: Value, otherValues = {}, siblings = {}, t?: TFunction): ValidationResult<any> {
        if (!this.isRequired && !this.validateRequired(value)) {
            return [true, value];
        }

        const preValidate = super.validate(value, otherValues, siblings);
        if (!preValidate[0]) {
            return preValidate;
        }

        let passedThroughError;
        for (let c = 0; c < this.validatorOptions.length; c++) {
            const validatorOption = this.validatorOptions[c];
            const test = validatorOption.validate(value, otherValues, siblings);
            if (test[0]) {
                if (typeof this.mutationFunc === 'function') {
                    return [true, this.mutationFunc(test[1], otherValues, siblings)];
                }
                return test;
            } else if (c === this.passThroughErrorIndex) {
                passedThroughError = test;
            }
        }

        if (typeof this.onError === 'function') {
            this.onError(value, otherValues);
        }

        if (passedThroughError !== undefined) {
            return passedThroughError;
        }

        if (t) {
            return [false, t('formifly:any_of') as string];
        }

        return [false, this.defaultErrorMsg ?? 'any_of'];
    }
}

export default AnyOfValidator;
