// src/components/shared/SharedContentCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import ShareButtons from '../components/shared/ShareButtons';
import './SharedContentCard.css';

interface SharedContentCardProps {
    item: {
        id: string;
        title: string;
        description: string;
        url: string;
        contentType: string;
        createdAt: string;
    };
}

const SharedContentCard: React.FC<SharedContentCardProps> = ({ item }) => {
    const shareUrl = `${window.location.origin}/shared/${item.id}`;

    const getIcon = () => {
        switch (item.contentType) {
            case 'image': return '🖼️';
            case 'video': return '🎥';
            case 'document': return '📄';
            default: return '📎';
        }
    };

    return (
        <div className="content-card">
            <div className="content-icon">{getIcon()}</div>
            <h3>{item.title}</h3>
            <p>{item.description || 'Описание отсутствует'}</p>
            <p className="type"><strong>Тип:</strong> {item.contentType}</p>
            <Link to={`/shared/${item.id}`}>Подробнее →</Link>
            <div className="card-actions">
                <ShareButtons url={shareUrl} title={item.title} />
            </div>
        </div>
    );
};

export default SharedContentCard;