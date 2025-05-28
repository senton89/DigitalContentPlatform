import React from 'react';
import { UploadFileForm } from '../components/shared/UploadFileForm';

export const UploadPage: React.FC = () => {
    return (
        <div className="upload-page">
            <h1>Загрузите свой файл</h1>
            <UploadFileForm />
        </div>
    );
};