import axios from 'axios';
import { CreateSharedContentDto, SharedContentDto } from '../types/sharedContent';

const API_URL = 'http://localhost:5268/api/SharedContent';

export const sharedContentApi = {
    getAll: async (): Promise<SharedContentDto[]> => {
        const response = await axios.get(`${API_URL}`);
        return response.data.$values || response.data;
    },

    getById: async (id: string): Promise<SharedContentDto> => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },

    upload: async (dto: CreateSharedContentDto): Promise<SharedContentDto> => {
        const formData = new FormData();
        formData.append('title', dto.title);
        formData.append('description', dto.description);
        if (dto.file) {
            formData.append('file', dto.file);
        }
        if (dto.contentType) {
            formData.append('contentType', dto.contentType);
        }

        const response = await axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    }
};