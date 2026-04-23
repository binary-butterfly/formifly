import React from 'react';
import {createRoot} from 'react-dom/client';
import DemoForm from './DemoForm';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <DemoForm/>
    </React.StrictMode>,
);
