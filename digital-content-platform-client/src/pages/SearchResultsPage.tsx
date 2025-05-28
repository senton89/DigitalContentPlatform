import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {useLocation, useNavigate} from 'react-router-dom';
import { RootState } from '../store';
import { filterItems } from '../store/slices/searchSlice';
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import DigitalItemCard from '../components/catalog/DigitalItemCard';
import './SearchResultsPage.css';
import {addToCart} from "../store/slices/cartSlice";

const SearchResultsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { searchResults, filterParams, loading, error } = useAppSelector((state: RootState) => state.search);

    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

    useEffect(() => {
        // If we have a search query in the URL, update the filter params
        const searchParams = new URLSearchParams(location.search);
        const queryParam = searchParams.get('query');
        
        if (queryParam && queryParam !== filterParams.searchQuery) {
            dispatch(filterItems({
                ...filterParams,
                searchQuery: queryParam,
                page: 1
            }));
        } else if (!searchResults) {
            // If no search results yet, fetch with current filter params
            dispatch(filterItems(filterParams));
        }
    }, [dispatch, location.search, filterParams.searchQuery]);

    const handlePageChange = (newPage: number) => {
        dispatch(filterItems({
            ...filterParams,
            page: newPage
        }));
        window.scrollTo(0, 0);
    };

    const handleAddToCart = (id: string) => {
        if (!isAuthenticated) {
            // Если пользователь не авторизован, перенаправляем на страницу входа
            navigate('/login', { state: { from: location } });
            return;
        }

        dispatch(addToCart(id))
            .unwrap()
            .then(() => {
                // Показываем уведомление об успешном добавлении
                toast.success('Item added to cart successfully');
            })
            .catch((error) => {
                // Показываем уведомление об ошибке
                toast.error(error || 'Failed to add item to cart');
            });
    };

    return (
        <div className="search-results-page">
            <div className="search-header">
                <h1>Результаты поиска</h1>
                <SearchBar 
                    initialQuery={filterParams.searchQuery || ''} 
                    className="search-results-searchbar"
                />
            </div>
            
            <div className="search-content">
                <aside className="search-sidebar">
                    <FilterPanel />
                </aside>
                
                <main className="search-main">
                    {loading ? (
                        <div className="loading">Загрузка результатов поиска...</div>
                    ) : error ? (
                        <div className="error">Ошибка: {error}</div>
                    ) : searchResults && searchResults.items.length > 0 ? (
                        <>
                            <div className="search-info">
                                <p>
                                    Найдено {searchResults.totalItems} результатов
                                    {filterParams.searchQuery && ` по запросу "${filterParams.searchQuery}"`}
                                </p>
                            </div>
                            
                            <div className="search-results-grid">
                                {searchResults.items.map(item => (
                                    <DigitalItemCard 
                                        key={item.id} 
                                        item={item} 
                                        onAddToCart={handleAddToCart} 
                                    />
                                ))}
                            </div>
                            
                            {searchResults.totalPages > 1 && (
                                <div className="pagination">
                                    <button 
                                        onClick={() => handlePageChange(filterParams.page - 1)} 
                                        disabled={filterParams.page === 1} 
                                        className="pagination-button"
                                    >
                                        Назад
                                    </button>
                                    <span className="pagination-info">
                                        Страница {filterParams.page} из {searchResults.totalPages}
                                    </span>
                                    <button 
                                        onClick={() => handlePageChange(filterParams.page + 1)} 
                                        disabled={filterParams.page === searchResults.totalPages} 
                                        className="pagination-button"
                                    >
                                        Вперед
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-results">
                            <h2>Результаты не найдены</h2>
                            <p>
                                {filterParams.searchQuery 
                                    ? `Нет товаров, соответствующих вашему запросу "${filterParams.searchQuery}".` 
                                    : "Нет товаров, соответствующих вашим критериям фильтрации."}
                            </p>
                            <p>Попробуйте изменить параметры поиска или фильтра.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SearchResultsPage;
