import React from 'react';
import ReactDOM from 'react-dom';
import DemoForm from './DemoForm';

const Root = () => {
    return <DemoForm/>;
};

const DomContainer = document.getElementById('root');
ReactDOM.render(<Root/>, DomContainer);
