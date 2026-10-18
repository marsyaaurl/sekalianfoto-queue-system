const SERVICE_WORKER_PATH = "/sw.js"

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null

  try {
    await navigator.serviceWorker.register(SERVICE_WORKER_PATH)
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

// Does nothing unless the user granted permission. Mobile browsers only allow
// notifications through a service worker, so that is tried first.
export async function showBrowserNotification(
  title: string,
  body: string,
): Promise<void> {
  if (typeof Notification === "undefined") return
  if (Notification.permission !== "granted") return

  const registration = await getServiceWorkerRegistration()

  try {
    if (registration) {
      await registration.showNotification(title, { body })
      return
    }
    new Notification(title, { body })
  } catch {
    // The browser refused both ways of showing it, so there is nothing left to try.
  }
}
