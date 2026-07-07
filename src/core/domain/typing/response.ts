
export interface FetchResponseInterface<T>{
    data: T;
    error?: boolean;
    message?: string;
    statusCode?: number;
}