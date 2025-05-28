import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register, clearError } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { RegisterRequest } from '../../types/auth';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css'


const RegisterForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state: RootState) => state.auth);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, 'Минимум 3 символа')
        .max(20, 'Максимум 20 символов')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Допустимы только буквы, цифры, подчеркивания и дефисы')
        .required('Обязательно'),
      email: Yup.string()
        .email('Неверный адрес электронной почты')
        .required('Обязательно'),
      password: Yup.string()
        .min(6, 'Минимум 6 символов')
        .matches(/[A-Z]/, 'Должна содержать хотя бы одну заглавную букву')
        .matches(/[0-9]/, 'Должна содержать хотя бы одну цифру')
        .matches(/[^a-zA-Z0-9]/, 'Должна содержать хотя бы один специальный символ')
        .required('Обязательно'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Пароли должны совпадать')
        .required('Обязательно')

    }),
    onSubmit: (values: RegisterRequest) => {
      dispatch(clearError());
      dispatch(register(values))
        .unwrap()
        .then(() => {
          navigate('/');
        })
        .catch(() => {
          // Ошибка уже обработана в слайсе
        });
    }
  });

  return (
    <div className="register-form">
      <h2>Регистрация</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя</label>
          <input
            id="username"
            name="username"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
          />
          {formik.touched.username && formik.errors.username ? (
            <div className="error">{formik.errors.username}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="email">Электронная почта</label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="error">{formik.errors.email}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="error">{formik.errors.password}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Подтвердите пароль</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <div className="error">{formik.errors.confirmPassword}</div>
          ) : null}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};


export default RegisterForm;
