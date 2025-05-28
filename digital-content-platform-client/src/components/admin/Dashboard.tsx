import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { dashboardStats, loading, error } = useAppSelector((state: RootState) => state.admin);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    if (loading) return <div className="loading">Загрузка статистики панели...</div>;
    if (error) return <div className="error">Ошибка: {error}</div>;
    if (!dashboardStats) return <div className="error">Данные панели недоступны</div>;

    return (
        <div className="dashboard">
            <h1>Панель администратора</h1>
            
            <div className="stats-cards">
                <div className="stat-card">
                    <h3>Всего пользователей</h3>
                    <p className="stat-value">{dashboardStats.totalUsers}</p>
                </div>
                <div className="stat-card">
                    <h3>Всего товаров</h3>
                    <p className="stat-value">{dashboardStats.totalItems}</p>
                </div>
                <div className="stat-card">
                    <h3>Всего заказов</h3>
                    <p className="stat-value">{dashboardStats.totalOrders}</p>
                </div>
                <div className="stat-card">
                    <h3>Общий доход</h3>
                    <p className="stat-value">${dashboardStats.totalRevenue.toFixed(2)}</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-box">
                    <h3>Регистрация пользователей по месяцам</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardStats.userRegistrationsByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Пользователи" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="chart-box">
                    <h3>Продажи по месяцам</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardStats.salesByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Продажи" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="top-categories">
                <h3>Топ категории</h3>
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th>Категория</th>
                            <th>Товары</th>
                            <th>Заказы</th>
                            <th>Доход</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardStats.topCategories.map((category, index) => (
                            <tr key={index}>
                                <td>{category.categoryName}</td>
                                <td>{category.itemCount}</td>
                                <td>{category.orderCount}</td>
                                <td>${category.revenue.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default Dashboard;
