"use client"

import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {PaginationState} from "@tanstack/react-table";
import {AppConfig} from "@/core/domain/config/app.config";
import {FetchResponseMetaProps} from "@/core/domain/typing/response";
import {NotificationsApiService} from "@/modules/notifications/application/service/notifications-api-service";
import {NotificationsSocketService} from "@/modules/notifications/application/service/notifications-socket-service";
import {NotificationInterface} from "@/modules/notifications/domain/entities/notification.interface";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";

export type NotificationCategory = "user" | "organization";

export interface NotificationsQuery {
    data: NotificationInterface[];
    meta: FetchResponseMetaProps;
}

export interface UseNotificationsOptions {
    limit?: number;
    enabled?: boolean;
    manualPagination?: boolean;
    read?: boolean;
}

export interface UseNotificationsResult extends NotificationsQuery {
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    pageCount: number;
    pagination: PaginationState;
    setPagination: (pagination: PaginationState) => void;
    refetch: () => void;
}

function normalizeResponse(payload: any): NotificationsQuery {
    const empty: NotificationsQuery = {data: [], meta: {}};

    if (!payload) return empty;

    if (Array.isArray(payload)) {
        return {data: payload, meta: {}};
    }

    if (Array.isArray(payload.data)) {
        return {data: payload.data, meta: payload.meta || {}};
    }

    if (Array.isArray(payload.items)) {
        return {
            data: payload.items,
            meta: {
                total: payload.total,
                page: payload.page,
                limit: payload.limit,
                totalPages: payload.totalPages,
            },
        };
    }

    if (Array.isArray(payload.notifications)) {
        return {
            data: payload.notifications,
            meta: {
                total: payload.total,
                page: payload.page,
                limit: payload.limit,
                totalPages: payload.totalPages,
            },
        };
    }

    return empty;
}

export function useNotifications(
    category: NotificationCategory,
    options: UseNotificationsOptions = {}
): UseNotificationsResult {
    const {currentOrganization} = useAuth();
    const {limit = 10, enabled = true, manualPagination = true} = options;
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: limit,
    });


    const query = useQuery<NotificationsQuery>({
        queryKey: ['notifications', category, pagination.pageIndex, pagination.pageSize],
        enabled,
        queryFn: async () => {
            const page = manualPagination ? pagination.pageIndex + 1 : 1;
            const pageSize = manualPagination ? pagination.pageSize : limit;
            const params = {page, limit: pageSize, read: options.read}

            const payload = category === "user"
                ? await NotificationsApiService.getAll(params)
                : (
                    currentOrganization?.id
                        ? await NotificationsApiService.getAllByOrganization(currentOrganization.id, params)
                        : null
                )
            ;

            const body = category === "user" ? payload?.data : payload;
            return normalizeResponse(body);
        },
        refetchInterval: AppConfig.APP_REFRESH_UI,
        refetchOnWindowFocus: false,
    });

    const pageCount = query.data?.meta?.total && query.data?.meta?.limit
        ? Math.ceil(query.data.meta.total / query.data.meta.limit)
        : 0;

    return {
        data: query.data?.data ?? [],
        meta: query.data?.meta ?? {},
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        pageCount,
        pagination,
        setPagination,
        refetch: query.refetch,
    };
}
