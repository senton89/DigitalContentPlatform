import React, { useState } from 'react';
import './UploadSharedContentForm.css';

interface UploadSharedContentFormProps {
    onSubmit: (dto: { title: string; description: string; file: File | null }) => void;
    loading: boolean;
}

const UploadSharedContentForm: React.FC<UploadSharedContentFormProps> = ({ onSubmit, loading }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert('Выберите файл для загрузки');
            return;
        }

        onSubmit({ title, description, file });
    };

    return (
        <form onSubmit={handleSubmit} className="upload-form">
            <input
                type="text"
                placeholder="Заголовок"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                    marginBottom: '10px',
                    marginRight: '10px',
                    height: '20px'
                }}
            />
            <textarea
                placeholder="Описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                    marginBottom: '-16px',
                    marginRight: '10px',
                    height: '20px'
                }}
            />
            <input
                type="file"
                onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFile(selectedFile);
                }}
                required
            />
            <button type="submit" disabled={loading}
                    style={{
                        marginTop: '10px',
                    }}>
                {loading ? 'Загрузка...' : 'Загрузить'}
            </button>
        </form>
    );
};

export default UploadSharedContentForm;