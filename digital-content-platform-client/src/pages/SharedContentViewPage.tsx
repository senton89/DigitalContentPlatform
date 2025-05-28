import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchSharedContentById } from '../store/slices/sharedContentSlice';
import './SharedContentViewPage.css';

const SharedContentViewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const { currentItem, loading, error } = useAppSelector((state) => state.sharedContent);

    useEffect(() => {
        if (id) {
            dispatch(fetchSharedContentById(id));
        }
    }, [dispatch, id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!currentItem) return <div>Not found</div>;

    return (
        <div className="shared-content-view">
            <h1>{currentItem.title}</h1>
            <p>{currentItem.description}</p>
            <p>Type: {currentItem.contentType}</p>
            <p>Created: {new Date(currentItem.createdAt).toLocaleDateString()}</p>

            {currentItem.contentType === 'image' && (
                <img src={currentItem.url} alt={currentItem.title} style={{ maxWidth: '100%' }} />
            )}

            {currentItem.contentType === 'video' && (
                <video controls src={currentItem.url} style={{ width: '100%' }}>
                    Your browser does not support the video tag.
                </video>
            )}

            {currentItem.contentType === 'document' && (
                <iframe src={currentItem.url} style={{ width: '100%', height: '600px' }} />
            )}
        </div>
    );
};

export default SharedContentViewPage;