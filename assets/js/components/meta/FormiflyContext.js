import React from 'react';
import PropTypes from 'prop-types';
import ArrayValidator from '../../classes/ArrayValidator';
import BooleanValidator from '../../classes/BooleanValidator';
import DateTimeValidator from '../../classes/DateTimeValidator';
import NumberValidator from '../../classes/NumberValidator';
import ObjectValidator from '../../classes/ObjectValidator';
import {
    convertDateObjectToInputString,
    getFieldValueFromKeyString,
    setFieldValueFromKeyString,
} from '../../helpers/generalHelpers';
import {findFieldValidatorFromName, unpackErrors} from '../../helpers/validationHelpers';

export const Context = React.createContext({});
Context.displayName = 'FormiflyContext';

export const FormiflyProvider = (props) => {
    const {shape, initialValues, children} = props;

    const [values, setValues] = React.useState(initialValues ?? shape.getDefaultValue());
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
            return getFieldValueFromKeyString(fieldName, errors);
        } catch {
            return false;
        }
    };

    const hasBeenTouched = (fieldName) => {
        try {
            return submitSuccess === false ? true : getFieldValueFromKeyString(fieldName, touched);
        } catch {
            return false;
        }
    };

    const handleChange = (event) => {
        setFieldValue(event.target.name, event.target.value);
    };

    const handleCheckChange = (event) => {
        setFieldValue(event.target.name, Boolean(event.target.checked));
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
            setTouched(setFieldValueFromKeyString(event.target.name, true, touched));
            return resolve();
        });
    };

    const handleFocus = (event) => {
        setErrors(setFieldValueFromKeyString(event.target.name, false, errors));
    };

    const getFieldProps = (name, help, type, id) => {
        const fieldValidator = findFieldValidatorFromName(name, shape);
        const fieldValue = getFieldValueFromKeyString(name, values);

        let guessedType = 'text';
        let additionalProps = {};

        if (fieldValidator instanceof DateTimeValidator) {
            guessedType = 'datetime-local';
            if (fieldValue !== '') {
                additionalProps.value = convertDateObjectToInputString(new Date(fieldValue));
            }
        } else if (fieldValidator instanceof NumberValidator) {
            guessedType = 'number';
            if (fieldValidator.minNum !== undefined) {
                additionalProps.min = fieldValidator.minNum;
            }
            if (fieldValidator.maxNum !== undefined) {
                additionalProps.max = fieldValidator.maxNum;
            }
        } else if (fieldValidator instanceof BooleanValidator) {
            additionalProps.checked = fieldValue;
            additionalProps.onChange = handleCheckChange;
            guessedType = 'checkbox';
        } else if (fieldValidator instanceof ArrayValidator || fieldValidator instanceof ObjectValidator) {
            throw new Error('Array and Object validators must not be used for input fields directly.');
        }

        additionalProps.required = fieldValidator.isRequired;

        id = id ?? 'formifly-input-field-' + name;

        if (help) {
            additionalProps.help = help;
            additionalProps['aria-describedby'] = id + '-help ' + id + '-errors';
        } else {
            additionalProps['aria-describedby'] = id + '-errors';
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

    const validateAll = () => {
        return new Promise((resolve, reject) => {
            const result = shape.validate(values);
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
            onSubmit(changedValues).then(() => {
                setSubmitting(false);
                setSubmitSuccess(true);
            });
        }).catch((reason) => {
            try {
                let newErrors = {};
                Object.entries(reason).map(([key, value]) => {
                    newErrors = setFieldValueFromKeyString(key, value, newErrors);
                });
                setErrors(newErrors);
            } catch {
                setSubmitFailureReason(reason);
            }
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
    };
    return <Context.Provider value={FormiflyContext}>{children}</Context.Provider>;
};

FormiflyProvider.propTypes = {
    shape: PropTypes.object.isRequired,
    initialValues: PropTypes.object,
};

export const useFormiflyContext = () => {
    const context = React.useContext(Context);
    if (!context) {
        throw new Error('Attempted to use formifly context outside of a provider. Only call useFormiflyContext from a component within a FormiflyForm.');
    }
    return context;
};
