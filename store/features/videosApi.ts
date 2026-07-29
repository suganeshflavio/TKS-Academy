import { appApi } from "../api";
import type { PaginatedResponse } from "./coursesApi";

interface Course {
  courseName?: string;
}
export type VideoItem = {
  id: string;
  isActive?: boolean;
  IsActive?: boolean;
  courseId?: string;
  classKey?: string;
  course?: Course;
  subject?: string;
  chapter?: string;
  youtubeUrl?: string;
  notesFileName?: string;
  videoUrl?: string;
  topicName?: string;
  videoName?: string;
  title?: string;
  description?: string;
  notesUrl?: string;
  fileName?: string;
  videoFileId?: string;
  videoFileName?: string;
  videoSize?: number;
};

type VideoQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type VideoUploadUrlRequest = {
  fileName: string;
  courseId?: string;
};

export type VideoUploadUrlResponse = {
  uploadUrl: string;
  fileName: string;
  headers: Record<string, string>;
};

const unwrapVideo = (response: unknown): VideoItem => {
  if (response && typeof response === "object" && !Array.isArray(response)) {
    const data = (response as Record<string, unknown>).data;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as VideoItem;
    }
  }

  return response as VideoItem;
};

const unwrapVideoUploadUrl = (response: unknown): VideoUploadUrlResponse => {
  if (response && typeof response === "object" && !Array.isArray(response)) {
    const data = (response as Record<string, unknown>).data;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as VideoUploadUrlResponse;
    }
  }

  return response as VideoUploadUrlResponse;
};

export const videosApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideos: builder.query<PaginatedResponse<VideoItem>, VideoQueryParams>({
      query: ({ page = 1, limit = 20, search }) => ({
        url: "/videos",
        method: "GET",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Video"],
    }),
    createVideo: builder.mutation<VideoItem, FormData>({
      query: (body) => ({
        url: "/videos",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Video"],
    }),
    getVideoById: builder.query<VideoItem, string>({
      query: (id) => ({
        url: `/videos/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapVideo,
      providesTags: ["Video"],
    }),
    updateVideo: builder.mutation<VideoItem, { id: string; body: Partial<VideoItem> | FormData }>({
      query: ({ id, body }) => ({
        url: `/videos/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Video"],
    }),
    permanentDeleteVideo: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `/videos/${id}/permanent`,
        method: "DELETE",
      }),
      invalidatesTags: ["Video"],
    }),
    getVideoUploadUrl: builder.mutation<VideoUploadUrlResponse, VideoUploadUrlRequest>({
      query: (body) => ({
        url: "/videos/upload-url",
        method: "POST",
        body,
      }),
      transformResponse: unwrapVideoUploadUrl,
    }),
  }),
});

export const {
  useGetVideosQuery,
  useCreateVideoMutation,
  useGetVideoByIdQuery,
  useUpdateVideoMutation,
  usePermanentDeleteVideoMutation,
  useGetVideoUploadUrlMutation,
} = videosApi;
