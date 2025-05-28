import React, { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { searchItems, setFilterParams } from '../../store/slices/searchSlice';
import './SearchBar.css';

interface SearchBarProps {
    onSearch?: () => void;
    initialQuery?: string;
    className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialQuery = '', className = '' }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [query, setQuery] = useState(initialQuery);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (query.trim()) {
            dispatch(setFilterParams({ searchQuery: query }));
            dispatch(searchItems({ query, page: 1, pageSize: 10 }))
                .unwrap()
                .then(() => {
                    navigate('/search');
                    if (onSearch) onSearch();
                })
                .catch(error => {
                    console.error('Search failed:', error);
                });
        }
    };

    return (
        <form onSubmit={handleSearch} className={`search-bar ${className}`} role="form">
            <input
                type="text"
                placeholder="Искать цифровой контент..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
            />
            <button type="submit" className="search-button">
                Search
            </button>
        </form>
    );
};

export default SearchBar;