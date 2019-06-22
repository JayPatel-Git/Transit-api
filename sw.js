let sw = "first-v3";
let itemsToCache = [
    'index.html',
    'style.css',
    'main.js'
];

self.addEventListener('install', function(e) {
    e.waitUntill(
        caches.open(sw).then(function(cache) {
            return cache.addAll(itemsToCache);
        })
    )
});

self.addEventListener('activate', function(e) {
    e.waitUntill(
        caches.keys().then((arr) => {
           return Promise.all(
                arr.filter(function(cache) {
                    return cache != sw;
                }).map(function (cache) {
                    return caches.delete(cache);
                })
           )    
           }));

});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.open(sw).then(
            function(cache) {
                return cache.match(e.request).then((res) => {
                    return res || fetch(e.request).then((response) => {
                        cache.put(e.request, response.clone());
                        return response;
                    })
                    .catch((rej) => {
                        console.log("Failed to load the cache! Please enable cache in your browser.");
                    })
                })
            }
        )
    )
});


