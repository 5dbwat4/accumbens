let registrationPromise = null;

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  if (registrationPromise) {
    return registrationPromise;
  }

  registrationPromise = navigator.serviceWorker
    .register("/cranium.js", { scope: "/" })
    .then((registration) => {
      return registration;
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
      return null;
    });

  return registrationPromise;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    registerServiceWorker();
  });
}
