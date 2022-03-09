import React from 'react';
import PropTypes from 'prop-types';
import ArrayValidator from '../../classes/ArrayValidator';
import BooleanValidator from '../../classes/BooleanValidator';
import DateTimeValidator from '../../classes/DateTimeValidator';
import NumberValidator from '../../classes/NumberValidator';
import ObjectValidator from '../../classes/ObjectValidator';
import {
    completeDefaultValues, containsValuesThatAreNotFalse,
    convertDateObjectToInputString,
    getFieldValueFromKeyString,
    setFieldValueFromKeyString,
} from '../../helpers/generalHelpers';
import {findFieldValidatorFromName, unpackErrors} from '../../helpers/validationHelpers';

export const Context = React.createContext({});
Context.displayName = 'FormiflyContext';

export const FormiflyProvider = (props) => {
    const {shape, initialValues, children, disableNativeRequired, disableNativeMinMax} = props;

    const [values, setValues] = React.useState(() => {
        const defaultValues = shape.getDefaultValue();
        if (!initialValues) {
            return defaultValues;
        }

        return completeDefaultValues(defaultValues, initialValues);
    });

    const [errors, setErrors] = React.useState({});
    const [touched, setTouched] = React.useState({});
    const [submitting, setSubmitting] = React.useState(false);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);
    const [submitFailureReason, setSubmitFailureReason] = React.useState(null);

    const setFieldValue = (field, value) => {
        setValues(setFieldValueFromKeyString(field, value, values));
    };

    const hasErrors = (fieldName) => {
        try {
            const errorsRes = getFieldValueFromKeyString(fieldName, errors);
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

    const hasBeenTouched = (fieldName) => {
        try {
            return submitSuccess === true ? true : getFieldValueFromKeyString(fieldName, touched);
        } catch {
            return false;
        }
    };

    const handleChange = (event) => {
        setFieldValue(event.target.name, event.target.value);
    };

    const handleCheckChange = (event) => {
        setFieldValue(event.target.name, Boolean(event.target.checked));
        return validateField(event.target.name, event.target.checked);
    };

    const handleRadioChange = (event) => {
        setFieldValue(event.target.name, event.target.value);
        return validateField(event.target.name, event.target.value);
    };

    const handleMultiSelectChange = (name, newVal) => {
        setFieldValue(name, newVal);
        return validateField(name, newVal);
    };

    const handleBlur = (event) => {
        const name = event.target.name;
        return validateField(name, event.target.type === 'radio' || event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const validateField = (name, value) => {
        return new Promise((resolve) => {
            // TODO: also validate all fields that depend on this one.
            const fieldValidator = findFieldValidatorFromName(name, shape);
            const validated = fieldValidator.validate(value, values);
            if (validated[0]) {
                setErrors(setFieldValueFromKeyString(name, false, errors));
            } else {
                setErrors(setFieldValueFromKeyString(name, validated[1], errors));
            }
            setTouched(setFieldValueFromKeyString(name, true, touched));
            return resolve();
        });
    };

    const handleFocus = (event) => {
        setErrors(setFieldValueFromKeyString(event.target.name, false, errors));
    };

    /**
     * Returns all properties needed to render a Formifly field.
     * Use this function if the AutomagicFormiflyField does not work for your specific use case.
     * @param {String} name - The field name. If it is a child field of an object write like this: objectName.key, if it is a child of an array write like this arrayName.index
     * @param {String} [help] - Help text to display next to the field
     * @param {String} [type] - The field's type. This will usually be filled in automatically, however with radio fields you need to pass it.
     * @param {String} [value] - The field value. **Only used for radio fields**. This does not contain the value of the field within your data but instead the value of this specific radio option.
     * @param {String} [id] - The field's id. Usually IDs will be automatically generated like this: formifly-input-field-$name (or formifly-input-field-$name-radio-$value for radio buttons). Only pass an id if you want to override this.
     * @param {String} [additionalDescribedBy] - Use this to add additional ids to aria-describedby. (By default help and error displays are already connected.) This is especially useful when building a radio group without using the FormiflyRadioGroup component to add a title to the radio options.
     * @return {{onBlur: (function(*): Promise<unknown>), onChange: handleChange, name, id: string, type: string, value, errors: (*|boolean), onFocus: handleFocus}}
     */
    const getFieldProps = (name, help, type, value, id, additionalDescribedBy) => {
        const fieldValidator = findFieldValidatorFromName(name, shape);
        const fieldValue = getFieldValueFromKeyString(name, values);

        const guessedType = fieldValidator.defaultInputType;
        let additionalProps = {};

        if (type === 'radio') {
            additionalProps.onChange = handleRadioChange;
            additionalProps.checked = fieldValue === value;
            additionalProps.value = value;
            additionalProps.id = id ?? 'formifly-input-field-' + name + '-radio-' + value;
        } else if (type === 'radio-group') {
            additionalProps.onchange = handleRadioChange;
        } else if (fieldValidator instanceof DateTimeValidator) {
            if (fieldValue !== '') {
                additionalProps.value = convertDateObjectToInputString(new Date(fieldValue));
            }
        } else if (fieldValidator instanceof NumberValidator) {
            if (!disableNativeMinMax && fieldValidator.minNum !== undefined) {
                additionalProps.min = fieldValidator.minNum;
            }
            if (!disableNativeMinMax && fieldValidator.maxNum !== undefined) {
                additionalProps.max = fieldValidator.maxNum;
            }
        } else if (fieldValidator instanceof BooleanValidator) {
            additionalProps.checked = fieldValue;
            additionalProps.onChange = handleCheckChange;
        } else if (fieldValidator instanceof ArrayValidator) {
            additionalProps.onChange = handleMultiSelectChange;
            additionalProps.value = fieldValue.filter((value) => value !== '');
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

        const errors = hasErrors(name);
        additionalProps['aria-invalid'] = Boolean(hasBeenTouched(name) && errors);

        return {
            name: name,
            type: type ?? guessedType,
            value: fieldValue,
            id: id,
            errors: errors,
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
    const validateAll = () => {
        return new Promise((resolve, reject) => {
            const result = shape.validate(values, values, values);
            if (result[0]) {
                resolve(result[1]);
            } else {
                reject(unpackErrors(result));
            }
        });
    };

    const handleSubmit = (onSubmit, e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitSuccess(false);
        setSubmitFailureReason(null);
        validateAll().then((changedValues) => {
            onSubmit(changedValues, setErrors).then(() => {
                setSubmitting(false);
                setSubmitSuccess(true);
            }).catch(reason => setSubmitFailureReason(reason));
        }).catch((reason) => {
            let newErrors = {};
            Object.entries(reason).map(([key, value]) => {
                newErrors = setFieldValueFromKeyString(key, value, newErrors);
            });
            setErrors(newErrors);
            setSubmitSuccess(false);
            setSubmitting(false);
        });
    };

    const FormiflyContext = {
        shape,
        values,
        errors,
        submitting,
        setSubmitting,
        submitSuccess,
        submitFailureReason,
        handleSubmit,
        hasErrors,
        hasBeenTouched,
        setFieldValue,
        getFieldProps,
        validateField,
        validateAll,
    };
    return <Context.Provider value={FormiflyContext}>{children}</Context.Provider>;
};

FormiflyProvider.propTypes = {
    shape: PropTypes.object.isRequired,
    initialValues: PropTypes.object,
    disableNativeMinMax: PropTypes.bool,
    disableNativeRequired: PropTypes.bool,
};

export const useFormiflyContext = () => {
    const context = React.useContext(Context);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('Attempted to use formifly context outside of a provider. Only call useFormiflyContext from a component within a FormiflyForm.');
    }
    return context;
};
