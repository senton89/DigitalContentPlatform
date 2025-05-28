// src/components/catalog/DigitalItemForm.tsx
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { createItem, updateItem, clearError } from '../../store/slices/digitalItemSlice';
import { DigitalItemCreateDto, DigitalItemUpdateDto, CategoryDto } from '../../types/digitalItem';
import { categoryApi } from '../../api/digitalItemApi';
import './DigitalItemForm.css';

interface DigitalItemFormProps {
  itemId?: string;
  initialData?: DigitalItemUpdateDto;
  onSuccess?: () => void;
}

const DigitalItemForm: React.FC<DigitalItemFormProps> = ({ itemId, initialData, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: RootState) => state.digitalItem);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories(data);
        setIsLoadingCategories(false);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: initialData || {
      title: '',
      description: '',
      price: 0,
      categoryId: '',
      file: null,
      thumbnail: null,
      status: 'Active'
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Required').min(3, 'Must be at least 3 characters'),
      description: Yup.string().required('Required').min(10, 'Must be at least 10 characters'),
      price: Yup.number().required('Required').min(0, 'Price cannot be negative'),
      categoryId: Yup.string().required('Required'),
      file: itemId ? Yup.mixed().notRequired() : Yup.mixed().required('File is required'),
      thumbnail: itemId ? Yup.mixed().notRequired() : Yup.mixed().required('Thumbnail is required'),
      status: Yup.string().required('Required')
    }),
    onSubmit: (values: DigitalItemCreateDto | DigitalItemUpdateDto) => {
      dispatch(clearError());
      if (itemId) {
        dispatch(updateItem({ id: itemId, data: values as DigitalItemUpdateDto }))
          .unwrap()
          .then(() => {
            if (onSuccess) onSuccess();
          })
          .catch(() => {});
      } else {
        dispatch(createItem(values as DigitalItemCreateDto))
          .unwrap()
          .then(() => {
            if (onSuccess) onSuccess();
          })
          .catch(() => {});
      }
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue(field, file);
    }
  };

  return (
    <div className="digital-item-form-container">
      <h2>{itemId ? 'Редактировать цифровой товар' : 'Создать новый цифровой товар'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="title">Название</label>
          <input
            id="title"
            name="title"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
          />
          {formik.touched.title && formik.errors.title ? (
            <div className="error">{formik.errors.title}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.description}
            rows={4}
          />
          {formik.touched.description && formik.errors.description ? (
            <div className="error">{formik.errors.description}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="price">Цена ($)</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.price}
          />
          {formik.touched.price && formik.errors.price ? (
            <div className="error">{formik.errors.price}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Категория</label>
          {isLoadingCategories ? (
            <div>Загрузка категорий...</div>
          ) : (
            <select
              id="categoryId"
              name="categoryId"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.categoryId}
            >
              <option value="">Выберите категорию</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
          {formik.touched.categoryId && formik.errors.categoryId ? (
            <div className="error">{formik.errors.categoryId}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="file">Файл</label>
          <input
            id="file"
            name="file"
            type="file"
            onChange={(event) => handleFileChange(event, 'file')}
            onBlur={formik.handleBlur}
          />
          {formik.touched.file && formik.errors.file ? (
            <div className="error">{formik.errors.file}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">Миниатюра</label>
          <input
            id="thumbnail"
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={(event) => handleFileChange(event, 'thumbnail')}
            onBlur={formik.handleBlur}
          />
          {formik.touched.thumbnail && formik.errors.thumbnail ? (
            <div className="error">{formik.errors.thumbnail}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="status">Статус</label>
          <select
            id="status"
            name="status"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.status}
          >
            <option value="Active">Активен</option>
            <option value="Draft">Черновик</option>
            <option value="Archived">Архив</option>
          </select>
          {formik.touched.status && formik.errors.status ? (
            <div className="error">{formik.errors.status}</div>
          ) : null}
        </div>

        <button type="submit" disabled={loading || isLoadingCategories}>
          {loading ? 'Отправка...' : itemId ? 'Обновить товар' : 'Создать товар'}
        </button>
      </form>
    </div>
  );
};


export default DigitalItemForm;
