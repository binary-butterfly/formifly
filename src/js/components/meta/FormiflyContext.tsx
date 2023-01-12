import React from 'react';
import ArrayValidator from '../../classes/ArrayValidator';
import BooleanValidator from '../../classes/BooleanValidator';
import DateTimeValidator from '../../classes/DateTimeValidator';
import NumberValidator from '../../classes/NumberValidator';
import ObjectValidator from '../../classes/ObjectValidator';
import {
    completeDefaultValues,
    containsValuesThatAreNotFalse,
    convertDateObjectToInputString,
    getFieldValueFromKeyString,
    setFieldValueFromKeyString,
} from '../../helpers/generalHelpers';
import {findFieldValidatorAndSiblingsFromName, findFieldValidatorFromName, unpackErrors} from '../../helpers/validationHelpers';
import BaseValidator from '../../classes/BaseValidator';
import {FormiflyFieldProps} from '../input/FormiflyField';
import {SubmitFunction, SubmitValidationErrorFunction, UnpackedErrors, Value, ValueOfValidator} from '../../types';
import {TFunction} from 'i18next';
import {useTranslation} from 'react-i18next';

export type FormiflyContextType<T extends BaseValidator<any>> = {
    setSubmitting: (value: (((prevState: boolean) => boolean) | boolean)) => void;
    handleBlur: (event: React.ChangeEvent<HTMLInputElement>) => Promise<boolean>;
    submitting: boolean;
    getFieldProps: (
        name: string,
        help?: string,
        type?: string,
        value?: string,
        id?: string,
        additionalDescribedBy?: string,
    ) => FormiflyFieldProps;
    validateMultipleFields: (pairs: [string, Value?][]) => Promise<boolean>;
    hasErrors: (fieldName: string) => false | string;
    shape: T;
    setFieldValue: <V extends Value>(
        field: string, value: V, oldValues?: ValueOfValidator<T>,
    ) => Promise<ValueOfValidator<T>>;
    values: ValueOfValidator<T>;
    handleRadioChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<boolean>;
    handleMultiSelectChange: (name: string, newVal: Value) => Promise<boolean>;
    hasBeenTouched: (fieldName: string) => (any | boolean);
    submitSuccess: boolean;
    validateField: (name: string, value?: Value) => Promise<boolean>;
    handleSubmit: (
        onSubmit: SubmitFunction,
        onSubmitValidationError: SubmitValidationErrorFunction<T>,
        e: React.FormEvent<HTMLFormElement>,
    ) => void;
    handleFocus: (event: React.ChangeEvent<HTMLInputElement>) => void;
    validateAll: () => Promise<string | ValueOfValidator<T> | undefined>;
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    submitFailureReason: any;
    setMultipleFieldValues: <V extends Value>(
        pairs: [string, V][], oldValues?: ValueOfValidator<T>,
    ) => Promise<ValueOfValidator<T>>;
    handleCheckChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<boolean>;
    errors: UnpackedErrors<T>;
};

// see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/24509#issuecomment-382213106 for why we need to cast here
export const Context = React.createContext<FormiflyContextType<any>>(undefined as any);
Context.displayName = 'FormiflyContext';

export const FormiflyProvider = <T extends BaseValidator<any>>(props: FormiflyProviderProps<T>) => {
    const {shape, initialValues, children, disableNativeRequired, disableNativeMinMax} = props;
    const builtInTranslation = useTranslation(['formifly']);
    const t = props.t ?? builtInTranslation.t;

    const [values, setValues] = React.useState<ValueOfValidator<T>>(() => {
        const defaultValues = shape.getDefaultValue();
        if (!initialValues) {
            return defaultValues;
        }

        return completeDefaultValues(defaultValues, initialValues, shape);
    });

    const [errors, setErrors] = React.useState<UnpackedErrors<T>>({} as any);
    const [touched, setTouched] = React.useState<Value>({});
    const [submitting, setSubmitting] = React.useState(false);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);
    const [submitFailureReason, setSubmitFailureReason] = React.useState<any>(null);

    const setFieldValue = <V extends Value>(
        field: string, value: V, oldValues: ValueOfValidator<T> = values,
    ): Promise<ValueOfValidator<T>> => {
        return new Promise((resolve) => {
            const newValues = setFieldValueFromKeyString(field, value, oldValues);
            setValues(newValues);
            resolve(newValues);
        });
    };

    const setMultipleFieldValues = <V extends Value>(
        pairs: [string, V][], oldValues: ValueOfValidator<T> = values,
    ): Promise<ValueOfValidator<T>> => {
        return new Promise((resolve) => {
            let newValues = oldValues;
            for (const pair of pairs) {
                newValues = setFieldValueFromKeyString(pair[0], pair[1], newValues);
            }
            setValues(newValues);
            resolve(newValues);
        });
    };

    const hasErrors = (fieldName: string): string | false => {
        try {
            const errorsRes = getFieldValueFromKeyString(fieldName, errors) as false | string;
            if (Array.isArray(errorsRes) || (typeof errorsRes === 'object' && errorsRes !== null)) {
                if (!containsValuesThatAreNotFalse(errorsRes)) {
                    return false;
                }
            }
            return errorsRes;
        } catch {
            return false;
        }
    };

    const hasBeenTouched = (fieldName: string): boolean => {
        try {
            return submitSuccess ? true : getFieldValueFromKeyString(fieldName, touched) as boolean;
        } catch {
            return false;
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFieldValue(event.target.name, event.target.value);
    };

    const handleCheckChange = (event: React.ChangeEvent<HTMLInputElement>): Promise<boolean> => {
        setFieldValue(event.target.name, Boolean(event.target.checked));
        return validateField(event.target.name, event.target.checked);
    };

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>): Promise<boolean> => {
        setFieldValue(event.target.name, event.target.value);
        return validateField(event.target.name, event.target.value);
    };

    const handleMultiSelectChange = (name: string, newVal: Value): Promise<boolean> => {
        setFieldValue(name, newVal);
        return validateField(name, newVal);
    };

    const handleBlur = (event: React.ChangeEvent<HTMLInputElement>): Promise<boolean> => {
        const name = event.target.name;
        return validateField(
            name,
            event.target.type === 'radio' || event.target.type === 'checkbox' ? event.target.checked : event.target.value,
        );
    };

    const validateField = (name: string, value?: Value): Promise<boolean> => {
        if (value === undefined) {
            value = getFieldValueFromKeyString(name, values);
        }

        return new Promise((resolve) => {
            setTouched(setFieldValueFromKeyString(name, true, touched));

            const [fieldValidator, siblings] = findFieldValidatorAndSiblingsFromName(name, shape, values);
            const validated = fieldValidator.validate(value, values, siblings, t);
            if (validated[0]) {
                setErrors(setFieldValueFromKeyString(name, false, errors));
                return resolve(true);
            } else {
                setErrors(setFieldValueFromKeyString(name, validated[1] as string, errors));
                return resolve(false);
            }
        });
    };

    const validateMultipleFields = (pairs: [string, Value?][]): Promise<boolean> => {
        return new Promise((resolve) => {
            let allValid = true;
            let newTouched = touched;
            let newErrors = errors;
            for (const pair of pairs) {
                const name = pair[0];
                const value = pair[1] ?? getFieldValueFromKeyString(name, values);
                const [fieldValidator, siblings] = findFieldValidatorAndSiblingsFromName(name, shape, values);
                const validated = fieldValidator.validate(value, values, siblings, t);
                if (validated[0]) {
                    newErrors = setFieldValueFromKeyString(name, false, newErrors);
                } else {
                    newErrors = setFieldValueFromKeyString(name, validated[1] as string, newErrors);
                    allValid = false;
                }
                newTouched = setFieldValueFromKeyString(name, true, newTouched);
            }
            setTouched(newTouched);
            setErrors(newErrors);
            resolve(allValid);
        });
    };

    const handleFocus = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setErrors(setFieldValueFromKeyString(event.target.name, false, errors));
    };

    /**
     * Returns all properties needed to render a Formifly field.
     * Use this function if the AutomagicFormiflyField does not work for your specific use case.
     * @param {String} name - The field name. If it is a child field of an object write like this: objectName.key, if it is a child of an array write like this arrayName.index
     * @param {String=} help - Help text to display next to the field
     * @param {String=} type - The field's type. This will usually be filled in automatically, however with radio fields you need to pass it.
     * @param {String=} value - The field value. **Only used for radio fields**. This does not contain the value of the field within your data but instead the value of this specific radio option.
     * @param {String=} id - The field's id. Usually IDs will be automatically generated like this: formifly-input-field-$name (or formifly-input-field-$name-radio-$value for radio buttons). Only pass an id if you want to override this.
     * @param {String=} additionalDescribedBy - Use this to add additional ids to aria-describedby. (By default help and error displays are already connected.) This is especially useful when building a radio group without using the FormiflyRadioGroup component to add a title to the radio options.
     * @return {{onBlur: (function(*): Promise<unknown>), onChange: handleChange, name, id: string, type: string, value, errors: (*|boolean), onFocus: handleFocus}}
     */
    const getFieldProps = (
        name: string, help?: string, type?: string, value?: string, id?: string, additionalDescribedBy?: string,
    ): FormiflyFieldProps => {
        const fieldValidator = findFieldValidatorFromName(name, shape) as ObjectValidator<any> | ArrayValidator<any> | BaseValidator<any>;
        const fieldValue = getFieldValueFromKeyString(name, values);

        const guessedType = fieldValidator.defaultInputType;
        // any isn't ideal, but I couldn't bring typescript to accept any other type easily and this is function internally at least anyway
        const additionalProps: any = {};

        if (type === 'radio') {
            additionalProps.onChange = handleRadioChange;
            additionalProps.checked = fieldValue === value;
            additionalProps.value = value;
            additionalProps.id = id ?? 'formifly-input-field-' + name + '-radio-' + value;
        } else if (type === 'radio-group') {
            additionalProps.onChange = handleRadioChange;
        } else if (fieldValidator instanceof DateTimeValidator) {
            if (fieldValue !== '') {
                additionalProps.value = convertDateObjectToInputString(new Date(fieldValue as string | Date));
            }
        } else if (fieldValidator instanceof NumberValidator) {
            if (!disableNativeMinMax && fieldValidator.minNum !== undefined) {
                additionalProps.min = fieldValidator.minNum;
            }
            if (!disableNativeMinMax && fieldValidator.maxNum !== undefined) {
                additionalProps.max = fieldValidator.maxNum;
            }
        } else if (fieldValidator instanceof BooleanValidator) {
            additionalProps.checked = Boolean(fieldValue);
            additionalProps.onChange = handleCheckChange;
        } else if (fieldValidator instanceof ArrayValidator<any>) {
            additionalProps.onChange = handleMultiSelectChange;
            additionalProps.value = (fieldValue as Array<Value>).filter((thisValue: Value) => thisValue !== '');
            additionalProps.multiple = true;
        } else if (fieldValidator instanceof ObjectValidator) {
            throw new Error('Object validators must not be used for input fields directly.');
        }

        if (disableNativeRequired) {
            additionalProps['aria-required'] = fieldValidator.isRequired;
        } else {
            additionalProps.required = fieldValidator.isRequired;
        }

        id = id ?? 'formifly-input-field-' + name;

        additionalProps['aria-describedby'] = id + '-errors';

        if (help) {
            additionalProps.help = help;
            additionalProps['aria-describedby'] += ' ' + id + '-help';
        }

        if (!!additionalDescribedBy) {
            additionalProps['aria-describedby'] += ' ' + additionalDescribedBy;
        }

        const iCanHazErrors = hasErrors(name);
        additionalProps['aria-invalid'] = Boolean(hasBeenTouched(name) && iCanHazErrors);

        return {
            name: name,
            type: type ?? guessedType,
            value: fieldValue,
            id: id,
            errors: iCanHazErrors,
            onChange: handleChange,
            onBlur: handleBlur,
            onFocus: handleFocus,
            ...additionalProps,
        };
    };

    /**
     * Validates all fields
     * @return {Promise<unknown>}
     */
    const validateAll = (): Promise<string | ValueOfValidator<T> | undefined> => {
        return new Promise((resolve, reject) => {
            const result = shape.validate(values, values, values, t);
            if (result[0]) {
                resolve(result[1]);
            } else {
                reject(unpackErrors(result));
            }
        });
    };

    const handleSubmit = (
        onSubmit: SubmitFunction,
        onSubmitValidationError: SubmitValidationErrorFunction<T>,
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitSuccess(false);
        setSubmitFailureReason(null);
        validateAll()
            .then((changedValues) => {
                try {
                    const submitResult = onSubmit(changedValues, setErrors);
                    if (submitResult instanceof Promise) {
                        return submitResult
                            .then(() => {
                                setSubmitting(false);
                                setSubmitSuccess(true);
                            })
                            .catch((reason) => {
                                setSubmitFailureReason(reason);
                            });
                    } else {
                        setSubmitting(false);
                        setSubmitSuccess(true);
                    }
                    return;
                } catch (err) {
                    setSubmitFailureReason(err);
                    return;
                }
            })
            .catch((reason: UnpackedErrors<T>) => {
                setErrors(reason);
                setSubmitSuccess(false);
                setSubmitting(false);

                if (typeof onSubmitValidationError === 'function') {
                    onSubmitValidationError(reason, reason);
                }
            });
    };

    const FormiflyContext: FormiflyContextType<T> = {
        shape,
        values,
        errors,
        submitting,
        setSubmitting,
        submitSuccess,
        submitFailureReason,
        handleSubmit,
        handleBlur,
        handleChange,
        handleCheckChange,
        handleRadioChange,
        handleMultiSelectChange,
        handleFocus,
        hasErrors,
        hasBeenTouched,
        setFieldValue,
        getFieldProps,
        validateField,
        validateAll,
        setMultipleFieldValues,
        validateMultipleFields,
    };

    return <Context.Provider value={FormiflyContext}>{children}</Context.Provider>;
};

type FormiflyProviderProps<T extends BaseValidator<any>> = {
    shape: T;
    initialValues?: Partial<ValueOfValidator<T>>;
    disableNativeMinMax?: boolean;
    disableNativeRequired?: boolean;
    children: JSX.Element[] | JSX.Element;
    t?: TFunction,
}

export const useFormiflyContext = <T extends BaseValidator<any>>(): FormiflyContextType<T> => {
    const context = React.useContext<FormiflyContextType<T>>(Context);
    if (!context || Object.keys(context).length === 0) {
        throw new Error(
            'Attempted to use formifly context outside of a provider. Only call useFormiflyContext from a component within a FormiflyForm.',
        );
    }
    return context;
};
