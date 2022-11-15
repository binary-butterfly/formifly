import React from 'react';
import {FormiflyContextType, useFormiflyContext} from './FormiflyContext';
import BaseValidator from '../../classes/BaseValidator';

const withFormifly = <T extends BaseValidator<any>>(
    WrappedComponent: React.ComponentType<FormiflyContextType<T>>
): (props: React.PropsWithChildren<any>) => JSX.Element => {
    return function WithFormiflyInner(props) {
        const context = useFormiflyContext();
        return <WrappedComponent {...props} {...context}/>;
    };
};

export default withFormifly;
