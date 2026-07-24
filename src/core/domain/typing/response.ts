export interface FetchResponseInterface<T> {
    data: T;
    error?: boolean;
    message?: string;
    statusCode?: number;
    errorCode?: number | string;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface SearchOptions {
    search?: string;
}

export interface PaginationWithSearchOptions extends PaginationOptions, SearchOptions {
}