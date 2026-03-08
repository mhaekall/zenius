if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker Unregistered successfully.');
    }
  }).catch(function(err) {
    console.log('Service Worker unregistration failed: ', err);
  });
  
  // Clear caches just in case
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
}
