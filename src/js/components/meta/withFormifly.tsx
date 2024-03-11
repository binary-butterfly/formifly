import React from 'react';
import {FormiflyContextType, useFormiflyContext} from './FormiflyContext';
import ObjectValidator from '../../classes/ObjectValidator';

export interface WithFormiflyProps extends FormiflyContextType<ObjectValidator<any>> {
}

const withFormifly = <T extends WithFormiflyProps = WithFormiflyProps>(
    WrappedComponent: React.ComponentType<T>,
): (props: Omit<T, keyof WithFormiflyProps>) => React.JSX.Element => {
    return function WithFormiflyInner(props: Omit<T, keyof WithFormiflyProps>) {
        const context = useFormiflyContext();
        return <WrappedComponent {...props as T} {...context}/>;
    };
};

export default withFormifly;
