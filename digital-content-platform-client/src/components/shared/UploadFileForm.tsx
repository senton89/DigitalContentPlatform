import React, { useState } from 'react';
import axios from 'axios';
import ShareButtons from "./ShareButtons";
import SendEmailForm from "./SendEmailForm";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5268/api';

export const UploadFileForm: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/file/upload`, formData);
            setUrl(response.data.url);
        } catch (error) {
            alert('Ошибка при загрузке файла');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-form">
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} required />
                <button type="submit" disabled={loading}>
                    {loading ? 'Загрузка...' : 'Загрузить'}
                </button>
            </form>

            {url && (
                <div className="share-section">
                    <h4>Ваша ссылка:</h4>
                    <p><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
                    <ShareButtons url={url} title="Файл" />
                    <SendEmailForm url={url} itemName="Файл от меня" />
                </div>
            )}
        </div>
    );
};