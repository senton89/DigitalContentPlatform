// src/pages/SharedContentDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ShareButtons from '../components/shared/ShareButtons';
import './SharedContentViewPage.css'; // Теперь этот файл существует

const SharedContentDetailsPage: React.FC = () => {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get('/api/sharedcontent/1'); // пример ID
                setContent(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) return <div>Загрузка...</div>;
    if (!content) return <div>Контент не найден</div>;

    const shareUrl = `${window.location.origin}/content/${content.id}`;

    return (
        <div className="shared-content-details">
            <h2>{content.title}</h2>
            <p>{content.description}</p>
            <p><strong>Тип:</strong> {content.contentType}</p>
            <div className="share-section">
                <h4>Поделиться</h4>
                <ShareButtons url={shareUrl} title={content.title} />
            </div>
        </div>
    );
};

export default SharedContentDetailsPage;