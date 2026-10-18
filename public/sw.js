// Needed so notifications also work in browsers that only allow them through a service worker.
self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        const [existingWindow] = windows
        return existingWindow ? existingWindow.focus() : self.clients.openWindow("/")
      }),
  )
})
