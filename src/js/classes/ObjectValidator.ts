import PropTypes from 'prop-types';
import ArrayValidator from './ArrayValidator';
import BaseValidator from './BaseValidator';
import {Dependent, ErrorFunction, MutationFunction, ObjectValue, ValidationResult, ValueType} from '../types';


/**
 * A validator that allows you to validate object fields. It is also used as the base for any validation shape.
 * @extends BaseValidator
 *
 * @property {BaseValidator|AnyOfValidator|ArrayValidator|BooleanValidator|EmailValidator|NumberValidator|ObjectValidator|PhoneNumberValidator|StringValidator} fields  - The fields of the object
 */
class ObjectValidator extends BaseValidator<ObjectValue | string> {
    public readonly fields: Record<string, BaseValidator<any>> = {};
    private dropEmpty: boolean;
    private dropNotInShape: boolean;
    private reallyNotRequired: boolean = false;

    /**
     * @param {Object} fields
     * @param {String} [defaultMessage]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     * @param {Boolean} [dropEmpty]
     * @param {Boolean} [dropNotInShape]
     */
    constructor(
        fields: Record<string, BaseValidator<any>>,
        defaultMessage?: string,
        mutationFunc?: MutationFunction<ObjectValue | string>,
        onError?: ErrorFunction,
        dependent?: Dependent,
        dropEmpty = true,
        dropNotInShape = false
    ) {
        super({}, defaultMessage, mutationFunc, onError, dependent);
        this.fields = fields;
        this.dropEmpty = dropEmpty;
        this.dropNotInShape = dropNotInShape;
    }

    /**
     * Sets the object validator as non required
     * @returns {ObjectValidator}
     */
    public notRequired(): this {
        this._isRequired = false;
        this.reallyNotRequired = true;
        return this;
    }

    /**
     * Make the validator drop empty keys
     * @param {Boolean} newDropEmpty
     */
    public setDropEmpty(newDropEmpty: boolean): void {
        this.dropEmpty = newDropEmpty;
    }

    /**
     * Make the validator drop values that are not defined as a child field
     * @param {Boolean} newDropNotInShape
     */
    public setDropNotInShape(newDropNotInShape: boolean): void {
        this.dropNotInShape = newDropNotInShape;
    }

    /**
     * @return {{}}
     */
    public getDefaultValue(): ObjectValue {
        const ret: Record<string, ObjectValue> = {};
        for (const fieldName in this.fields) {
            ret[fieldName] = this.fields[fieldName].getDefaultValue();
        }
        return ret;
    }

    protected validateRequired(value?: ObjectValue): boolean {
        if (typeof value === 'object') {
            return Object.keys(value).length > 0;
        } else {
            return super.validateRequired(value);
        }
    }

    /**
     * This function allows you to validate the ObjectValidator's child fields without validating any sub objects or array children.
     * @param {Object} value
     * @param {Object} [otherValues]
     * @param {Object} [siblings]
     * @return {*|[boolean, *]|[boolean, {}]}
     */
    public validateWithoutRecursion(
        value: ObjectValue,
        otherValues?: ValueType,
        siblings?: ValueType
    ): ValidationResult<ObjectValue> {
        return this.validate(value, otherValues, siblings, false);
    }

    public validate(value?: ObjectValue,
                    otherValues?: ValueType,
                    siblings?: ValueType,
                    recursion = true): ValidationResult<ObjectValue> {
        if (this.reallyNotRequired && !this.validateRequired(value)) {
            return [true, value];
        }

        const preValidate = super.validate(value, otherValues, siblings);
        if (!preValidate[0]) {
            return preValidate;
        }

        // Unpack the test value to avoid mutating the original object
        const testValue: ObjectValue = {...value};
        let allOk = true;
        const tests: Record<string, ValidationResult<ObjectValue>> = {};
        for (const fieldName in this.fields) {
            if (!recursion) {
                if (this.fields[fieldName] instanceof ArrayValidator || this.fields[fieldName] instanceof ObjectValidator) {
                    continue;
                }
            }

            const test = this.fields[fieldName].validate(testValue[fieldName], otherValues, testValue);
            tests[fieldName] = test;
            if (test[0] === false) {
                allOk = false;
            } else if (allOk) {
                if (this.dropEmpty) {
                    if (Array.isArray(test[1])) {
                        const filtered = test[1].filter(val => val !== '');
                        if (filtered.length > 0) {
                            testValue[fieldName] = filtered;
                            continue;
                        }
                    } else if (test[1] !== '') {
                        testValue[fieldName] = test[1];
                        continue;
                    }
                    delete testValue[fieldName];
                } else {
                    testValue[fieldName] = test[1];
                }
            }
        }

        if (allOk && this.dropNotInShape) {
            for (const key in testValue) {
                if (this.fields[key] === undefined) {
                    delete testValue[key];
                }
            }
        }

        return allOk ? [true, testValue] : [false, tests];
    }

    /**
     * Returns the PropTypes representation of the validator.
     * @return {any}
     */
    public getPropType(): PropTypes.Validator<any> {
        const types: Record<string, PropTypes.Validator<any>> = {};
        for (const fieldName in this.fields) {
            types[fieldName] = this.fields[fieldName].getPropType();
        }
        const shape = PropTypes.shape(types);
        return this.isRequired ? shape.isRequired : shape;

    }

    /**
     * Returns the PropTypes representation of the validator.
     *
     * Return an object instead of PropTypes.shape. This is useful if you want to assign this validator's PropType to the PropTypes of a component.
     * @return {any}
     */
    public getFirstPropType(): Record<string, PropTypes.Validator<any>> {
        const types: Record<string, PropTypes.Validator<any>> = {};
        for (const fieldName in this.fields) {
            types[fieldName] = this.fields[fieldName].getPropType();
        }

        return types;
    }
}

export default ObjectValidator;
