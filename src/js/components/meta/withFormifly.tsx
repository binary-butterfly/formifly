import React from 'react';
import {FormiflyContextType, useFormiflyContext} from './FormiflyContext';
import {ObjectValidatorFields} from '../../types';

const withFormifly = <T extends ObjectValidatorFields>(
    WrappedComponent: React.ComponentType<FormiflyContextType<T>>
): (props: React.PropsWithChildren<any>) => JSX.Element => {
    return function WithFormiflyInner(props) {
        const context = useFormiflyContext();
        return <WrappedComponent {...props} {...context}/>;
    };
};

export default withFormifly;
