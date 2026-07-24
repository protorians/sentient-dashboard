export const AuthConfig = {
    storages: {
        sessionKey: '@auth-session'
    },
    services: {
        api: "AuthApiService"
    },
    routes: {
        login: '/auth/sign-in',
        logout: '/auth/disconnect',
        register: '/auth/sign-up',
        selectOrganization: '/auth/select-organization',
        verifyPhone: '/auth/sign-up/check-phone',
    },
    excludes: [
        '/auth',
        '/intl'
    ]
};