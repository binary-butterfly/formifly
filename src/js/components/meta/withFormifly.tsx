import React from 'react';
import {useFormiflyContext} from './FormiflyContext';

const withFormifly = (WrappedComponent) => {
    return function WithFormiflyInner(props) {
        const context = useFormiflyContext();
        return <WrappedComponent {...props} {...context}/>;
    };
};

export default withFormifly;
