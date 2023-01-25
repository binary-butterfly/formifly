import React from 'react';
import {FormiflyContextType, useFormiflyContext} from './FormiflyContext';
import ObjectValidator from '../../classes/ObjectValidator';

const withFormifly = <T extends ObjectValidator<any>>(
    WrappedComponent: React.ComponentType<FormiflyContextType<T>>
): (props: React.PropsWithChildren<any>) => JSX.Element => {
    return function WithFormiflyInner(props) {
        const context = useFormiflyContext();
        return <WrappedComponent {...props} {...context}/>;
    };
};

export default withFormifly;
