
export interface AuthResponseInterface<T>{
    data: T;
    error?: boolean;
    message?: string;
    statusCode?: number;
}