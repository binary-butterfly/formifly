import React from 'react';
import {FormiflyContextType, useFormiflyContext} from './FormiflyContext';

const withFormifly = (WrappedComponent: React.ComponentType<FormiflyContextType>): (props: React.PropsWithChildren<any>) => JSX.Element => {
    return function WithFormiflyInner(props) {
        const context = useFormiflyContext();
        return <WrappedComponent {...props} {...context}/>;
    };
};

export default withFormifly;
