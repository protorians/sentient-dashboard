export const AppConfig = {
    APP_HOST: process.env.NEXT_PUBLIC_APP_HOST as unknown as string,
    APP_SLUG: process.env.NEXT_PUBLIC_APP_SLUG as unknown as string,
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME as unknown as string,
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION as unknown as string,
    APP_VERSION_NUMBER: process.env.NEXT_PUBLIC_APP_VERSION_NUMBER as unknown as number,
    APP_REFRESH_UI: process.env.NEXT_PUBLIC_APP_REFRESH_UI as unknown as number,
    SOCKET_HOST: process.env.NEXT_PUBLIC_SOCKET_HOST as unknown as string,
    API_HOST: process.env.NEXT_PUBLIC_API_HOST as unknown as string,
    API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT as unknown as number,
    VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as unknown as string,
    AUTH_CHECK_SESSION_TIMEOUT: process.env.NEXT_PUBLIC_AUTH_CHECK_SESSION_TIMEOUT as unknown as number,
    COPYRIGHT_YEAR: new Intl.DateTimeFormat('fr-FR', {year: 'numeric'}).format(new Date()),

}