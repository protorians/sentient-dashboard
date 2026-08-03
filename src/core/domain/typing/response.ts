export interface FetchResponseInterface<T> {
    data: T;
    error?: boolean;
    message?: string;
    statusCode?: number;
    errorCode?: number | string;
}

export interface FetchResponseMetaProps {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
}

export interface FetchResponseWithMetaInterface<T> extends FetchResponseInterface<T> {
    meta?: FetchResponseMetaProps
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