import React, {useEffect, useState} from 'react';
import axios from 'axios';
import SharedContentCard from './SharedContentCard';
import './SharedContentListPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5268/api';

const SharedContentListPage: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get(`${API_URL}/sharedcontent`);
                setItems(res.data.$values || res.data);
            } catch (err) {
                setError('Не удалось загрузить контент');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div style={{ textAlign: 'center' }}>{error}</div>;

    return (
        <div className="shared-content-list">
            <h2>Общий контент</h2>
            <div className="content-grid">
                {items.map((item) => (
                    <SharedContentCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default SharedContentListPage;