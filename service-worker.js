const CACHE_NAME = 'ariarysim-cache-v1';
// Liste des fichiers à mettre en cache pour le mode hors ligne
const URLS_TO_CACHE = [
    './', // Le dossier racine
    './AriarySim.html',
    './manifest.json',
    // Ajoutez ici le chemin vers votre dossier d'icônes si vous l'avez créé (ex: 'icons/ariarysim-192.png')
    // Pour l'instant, on se contente des fichiers principaux
];

// Installation : Mise en cache des ressources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache ouvert, ajout des ressources.');
                return cache.addAll(URLS_TO_CACHE);
            })
            .catch(error => {
                console.error('Échec de la mise en cache lors de l\'installation:', error);
            })
    );
});

// Récupération : Servir les ressources à partir du cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Le fichier est dans le cache, on le sert immédiatement
                if (response) {
                    return response;
                }
                // Si non, on fait une requête réseau (et on met en cache si possible)
                return fetch(event.request).then(
                    (response) => {
                        // S'assurer que c'est une réponse valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cloner la réponse pour la mettre dans le cache et la retourner
                        const responseToCache = response.clone();
                        
                        // Si l'URL n'est pas dans la liste à cacher, on l'ignore (utile pour les données externes)
                        if (!URLS_TO_CACHE.includes(event.request.url.replace(location.origin, './'))) {
                            return response;
                        }
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Activation : Suppression des anciens caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});