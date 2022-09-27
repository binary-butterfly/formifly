import {render} from '@testing-library/react';
import React from 'react';
import ObjectValidator from '../../../classes/ObjectValidator';
import StringValidator from '../../../classes/StringValidator';
import FormiflyForm from '../../../components/meta/FormiflyForm';
import withFormifly from '../../../components/meta/withFormifly';

const ComponentThatUsesHoc = withFormifly((props) => {
    const {
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
    } = props;

    expect(shape).not.toBeUndefined();
    expect(values).toStrictEqual({foo: ''});
    expect(errors).toStrictEqual({});
    expect(submitting).toEqual(false);
    expect(typeof setSubmitting).toBe('function');
    expect(submitSuccess).toBe(false);
    expect(submitFailureReason).toBeNull();
    expect(typeof handleSubmit).toBe('function');
    expect(typeof hasErrors).toBe('function');
    expect(typeof hasBeenTouched).toBe('function');
    expect(typeof setFieldValue).toBe('function');
    expect(typeof getFieldProps).toBe('function');
    expect(typeof validateField).toBe('function');
    return <>
        Foo
    </>;
});

test('withFormifly', () => {
    const shape = new ObjectValidator({
        foo: new StringValidator(),
    });
    render(<FormiflyForm shape={shape} onSubmit={() => null}>
        <ComponentThatUsesHoc/>
    </FormiflyForm>);
});
