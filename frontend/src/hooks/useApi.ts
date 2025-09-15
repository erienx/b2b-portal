/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useRef, useState } from 'react';
import api from '../api/axios';

type UseApiResponse<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    fetch: (config?: AxiosRequestConfig) => Promise<T | undefined>;
    cancel: () => void;
};

export function useApi<T = any>(axiosConfig: AxiosRequestConfig | null): UseApiResponse<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const controllerRef = useRef<AbortController | null>(null);

    const fetch = useCallback(
        async (overrideConfig?: AxiosRequestConfig) => {
            if (!axiosConfig && !overrideConfig) {
                return;
            }
            setLoading(true);
            setError(null);
            controllerRef.current = new AbortController();

            try {
                const response: AxiosResponse<T> = await api.request({
                    ...axiosConfig,
                    ...overrideConfig,
                    signal: controllerRef.current.signal,
                });

                setData(response.data);
                return response.data;
            } catch (err: any) {
                if (err.code === 'ERR_CANCELED') return;

                const errorMessage = typeof err.response?.data === "string"
                    ? (err.response.data.startsWith("<!doctype") ? "Unexpected server error" : err.response.data)
                    : err.response?.data?.message ?? err.message ?? "Something went wrong";
                setError(errorMessage);

                throw new Error(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [axiosConfig]
    );

    const cancel = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
    };

    return { data, loading, error, fetch, cancel };
}