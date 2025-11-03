declare module 'virtual:pwa-register' {
  interface UpdateSWResult {
    updateSW: (reloadPage?: boolean) => Promise<void>
  }

  interface RegisterSWOptions {
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }

  export function registerSW(options?: RegisterSWOptions): UpdateSWResult
}