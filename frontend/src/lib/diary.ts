import { apiClient } from './axios';

export interface DiaryPhoto {
  photoId: string;
  thumbnailPath: string;
  order: number;
}

export interface Diary {
  diaryId: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  photos: DiaryPhoto[];
}

export interface DiaryListResponse {
  diaries: Diary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DiaryDetailResponse {
  diary: Diary;
}

/**
 * Get list of diaries with pagination
 */
export const getDiaries = async (
  page: number = 1,
  limit: number = 10
): Promise<DiaryListResponse> => {
  try {
    const response = await apiClient.get('/diaries', {
      params: {
        page,
        limit,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch diaries:', error);
    throw error;
  }
};

/**
 * Get a single diary by ID
 */
export const getDiary = async (diaryId: string): Promise<DiaryDetailResponse> => {
  try {
    const response = await apiClient.get(`/diaries/${diaryId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch diary ${diaryId}:`, error);
    throw error;
  }
};

/**
 * Create a new diary with optional photos
 */
export const createDiary = async (
  title: string,
  content: string,
  date: string,
  uploadId?: string
): Promise<DiaryDetailResponse> => {
  try {
    const response = await apiClient.post('/diaries', {
      title,
      content,
      date,
      uploadId,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to create diary:', error);
    throw error;
  }
};

/**
 * Update a diary
 */
export const updateDiary = async (
  diaryId: string,
  title?: string,
  content?: string,
  date?: string
): Promise<DiaryDetailResponse> => {
  try {
    const response = await apiClient.put(`/diaries/${diaryId}`, {
      title,
      content,
      date,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update diary ${diaryId}:`, error);
    throw error;
  }
};

/**
 * Delete a diary
 */
export const deleteDiary = async (diaryId: string): Promise<void> => {
  try {
    await apiClient.delete(`/diaries/${diaryId}`);
  } catch (error) {
    console.error(`Failed to delete diary ${diaryId}:`, error);
    throw error;
  }
};

/**
 * Create upload session for photos
 */
export const createUploadSession = async (
  fileCount: number,
  fileNames: string[]
): Promise<{
  uploadId: string;
  expiresAt: string;
  presignedUrls: Array<{ fileId: string; uploadUrl: string; filePath: string }>;
}> => {
  try {
    const response = await apiClient.post('/diaries/upload-session', {
      fileCount,
      fileNames,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to create upload session:', error);
    throw error;
  }
};

/**
 * Confirm file upload
 */
export const confirmUpload = async (
  uploadId: string,
  fileId: string,
  filePath: string,
  fileSize: number,
  mimeType: string
): Promise<void> => {
  try {
    await apiClient.post('/diaries/upload-confirm', {
      uploadId,
      fileId,
      filePath,
      fileSize,
      mimeType,
    });
  } catch (error) {
    console.error('Failed to confirm upload:', error);
    throw error;
  }
};

/**
 * Get upload session status
 */
export const getUploadSession = async (uploadId: string) => {
  try {
    const response = await apiClient.get(`/diaries/upload-session/${uploadId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to get upload session ${uploadId}:`, error);
    throw error;
  }
};
