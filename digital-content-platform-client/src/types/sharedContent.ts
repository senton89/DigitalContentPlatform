export interface SharedContentDto {
    id: string;
    title: string;
    description: string;
    url: string;
    contentType: string; // например: "image", "video", "document"
    createdAt: string;
}

export interface CreateSharedContentDto {
    title: string;
    description: string;
    file: File | null;
    contentType: string;
}