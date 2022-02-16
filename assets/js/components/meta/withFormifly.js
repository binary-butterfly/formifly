import React from 'react';
import {useFormiflyContext} from './FormiflyContext';

const withFormifly = (WrappedComponent) => {
    return (props) => {
        const context = useFormiflyContext();
        return <WrappedComponent {...props} {...context}/>;
    };
};

export default withFormifly;
