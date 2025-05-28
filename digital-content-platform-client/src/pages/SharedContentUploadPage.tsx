import React, { useState } from 'react';
import UploadSharedContentForm from '../components/shared/UploadSharedContentForm';
import './SharedContentUploadPage.css'; // ✅ Теперь он существует

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5268/api';

const SharedContentUploadPage: React.FC = () => {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (dto: { title: string; description: string; file: File | null }) => {
        if (!dto.file) {
            alert('Выберите файл');
            return;
        }

        const formData = new FormData();
        formData.append('Title', dto.title);
        formData.append('Description', dto.description);
        formData.append('File', dto.file);

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/sharedcontent/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            setUrl(data.url);
        } catch (err) {
            alert('Ошибка при загрузке файла');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-shared-content-page">
            <h2>Загрузить общий контент</h2>
            <UploadSharedContentForm onSubmit={handleSubmit} loading={loading} />

            {url && (
                <div className="success-message" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p>Файл загружен: <a href={url} target="_blank" rel="noopener noreferrer">🔗 Открыть</a></p>
                </div>
            )}
        </div>
    );
};

export default SharedContentUploadPage;