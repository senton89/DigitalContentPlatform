import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateSharedContentDto } from '../../types/sharedContent';
import { useAppDispatch } from '../../store/hooks';
import { uploadSharedContent } from '../../store/slices/sharedContentSlice';
import './UploadSharedContentForm.css';

interface SharedContentFormProps {
    onSuccess?: () => void;
}

const SharedContentForm: React.FC<SharedContentFormProps> = ({ onSuccess }) => {
    const dispatch = useAppDispatch();

    const validationSchema = Yup.object({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
        file: Yup.mixed().required('File is required')
    });

    const formik = useFormik<CreateSharedContentDto>({
        initialValues: {
            title: '',
            description: '',
            file: null,
            contentType: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            await dispatch(uploadSharedContent(values)).unwrap();
            if (onSuccess) onSuccess();
        }
    });

    return (
        <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
            <div className="form-group">
                <label>Title</label>
                <input
                    type="text"
                    name="title"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.title}
                />
                {formik.touched.title && formik.errors.title ? (
                    <div className="error">{formik.errors.title}</div>
                ) : null}
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea
                    name="description"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.description}
                />
                {formik.touched.description && formik.errors.description ? (
                    <div className="error">{formik.errors.description}</div>
                ) : null}
            </div>

            <div className="form-group">
                <label>File</label>
                <input
                    type="file"
                    name="file"
                    onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        formik.setFieldValue('file', file);
                    }}
                />
                {formik.touched.file && formik.errors.file ? (
                    <div className="error">{formik.errors.file}</div>
                ) : null}
            </div>

            <div className="form-group">
                <label>Content Type</label>
                <select
                    name="contentType"
                    onChange={formik.handleChange}
                    value={formik.values.contentType}
                >
                    <option value="">Select type...</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                </select>
            </div>

            <button type="submit" disabled={formik.isSubmitting}>
                Upload
            </button>
        </form>
    );
};

export default SharedContentForm;