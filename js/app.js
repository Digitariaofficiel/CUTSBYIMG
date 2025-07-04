// Écouteurs d'événements pour détecter les changements de hash et le chargement initial
window.addEventListener("hashchange", navigue);
window.addEventListener("load", navigue);

/**
 * Fonction principale de navigation
 * Gère le changement de vue et l'initialisation des contrôleurs en fonction du hash de l'URL.
 */
async function navigue() {
    try {
        // Récupération du hash de l'URL
        const hash = location.hash.slice(1);

        // Cache le contenu principal pendant le chargement
        const spaContainer = document.querySelector(".spa");
        const mainContent = document.getElementById("main-content");
        
        if (spaContainer) {
            spaContainer.style.opacity = "0.5";
            spaContainer.style.transition = "opacity 0.3s ease";
        }

        // Si pas de hash ou hash = top ou about, ne rien faire
        if (!hash || ['top', 'about'].includes(hash)) {
            if (spaContainer) {
                // S'assurer que le contenu principal est visible
                if (mainContent) {
                    mainContent.style.display = "block";
                }
                spaContainer.style.opacity = "1";
            }
            return;
        }

        // Si le hash est "services", retour à la page d'accueil et navigation vers services
        if (hash === 'services') {
            if (mainContent) {
                // Si on a déjà le contenu principal, on l'affiche simplement
                mainContent.style.display = "block";
                
                // Nettoyer tout autre contenu qui n'est pas mainContent
                const children = Array.from(spaContainer.children);
                children.forEach(child => {
                    if (child !== mainContent) {
                        child.remove();
                    }
                });
                
                // Défiler vers la section services
                const servicesSection = document.getElementById('services');
                if (servicesSection) {
                    const headerOffset = 80;
                    const elementPosition = servicesSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
                
                spaContainer.style.opacity = "1";
                return;
            } else {
                // Si on n'a pas le contenu principal, on recharge la page
                window.location.href = "index.html#services";
                return;
            }
        }

        // Séparation du hash pour gérer les paramètres
        const [hash2, condition] = hash.split("?");

        let view = null;
        let viewUrl = null;

        // Récupération de la route correspondante
        if (hash2 === "moins20Barbe") {
            viewUrl = "reservation-moins-20-ans-barbe.html";
        } else if (hash2 === "plus20Barbe") {
            viewUrl = "reservation-plus-20-ans-barbe.html";
        } else if (hash2 === "moins20") {
            viewUrl = "reservation-moins-20-ans.html";
        } else if (hash2 === "plus20") {
            viewUrl = "reservation-plus-20-ans.html";
        } else {
            // Si le hash ne correspond à aucune page connue, on ne fait rien
            if (spaContainer) {
                spaContainer.style.opacity = "1";
                if (mainContent) {
                    mainContent.style.display = "block";
                }
            }
            return;
        }

        // Chargement de la vue
        if (viewUrl) {
            try {
                const response = await fetch(viewUrl);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                view = await response.text();
            } catch (error) {
                console.error(`Erreur lors du chargement de ${viewUrl}:`, error);
                alert("Erreur lors du chargement de la page. Veuillez réessayer.");
                window.location.hash = "#services";
                return;
            }
        }

        // Mise à jour du contenu si une vue a été chargée
        if (view && spaContainer) {
            // Défiler vers le haut immédiatement avant de changer le contenu
            window.scrollTo(0, 0);
            
            // Cacher le contenu principal
            if (mainContent) {
                mainContent.style.display = "none";
            }

            // Nettoyer le contenu précédent (sauf mainContent)
            const children = Array.from(spaContainer.children);
            children.forEach(child => {
                if (child !== mainContent) {
                    child.remove();
                }
            });
            
            // Extraire juste le contenu nécessaire de la page de réservation
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = view;
            
            // Chercher le header et section pour les ajouter
            const reservationHeader = tempDiv.querySelector('header');
            const reservationSection = tempDiv.querySelector('section');
            
            // Ajouter les éléments nécessaires
            if (reservationHeader) {
                spaContainer.appendChild(reservationHeader);
            }
            
            if (reservationSection) {
                spaContainer.appendChild(reservationSection);
                
                // Assurez-vous que la section a le padding nécessaire
                if (!reservationSection.classList.contains('pt-mobile')) {
                    reservationSection.classList.add('pt-mobile');
                }
            } else {
                console.error("Section de réservation non trouvée dans la vue chargée");
            }
            
            // S'assurer que le contenu est visible
            document.body.style.height = "auto";
            document.body.style.overflow = "auto";
            
            // Restaurer l'opacité
            setTimeout(() => {
                spaContainer.style.opacity = "1";
                
                // Initialiser AOS pour les nouveaux éléments
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
                
                // Ajouter les gestionnaires d'événements pour les nouveaux éléments
                initializeReservationEvents();
            }, 100);
        }
    } catch (error) {
        console.error("Erreur lors de la navigation:", error);
        alert("Une erreur s'est produite. Retour à l'accueil.");
        window.location.hash = "#services";
    }
}

/**
 * Initialise les événements pour les pages de réservation
 */
function initializeReservationEvents() {
    // Détection iOS (iPhone, iPad, iPod)
    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    
    // Redirection en fonction du hash actuel si iOS est détecté
    if (isIOS()) {
        const hash = location.hash.slice(1);
        let calUrl = "";
        
        if (hash === "moins20Barbe") {
            calUrl = "https://cal.com/cuts.by.img/coupe-transformation";
        } else if (hash === "plus20Barbe") {
            calUrl = "https://cal.com/cuts.by.img/coupe-barbe";
        } else if (hash === "moins20") {
            calUrl = "https://cal.com/cuts.by.img/coupe-etudiant";
        } else if (hash === "plus20") {
            calUrl = "https://cal.com/cuts.by.img/coupe";
        }
        
        if (calUrl) {
            window.location.href = calUrl;
            return;
        }
    }
    
    // Gérer les boutons de retour dans les pages de réservation
    const backButtons = document.querySelectorAll('.back-button');
    if (backButtons.length > 0) {
        backButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.hash = "#services";
            });
        });
    }
    
    // On s'assure que les liens dans le header fonctionnent correctement
    const headerLinks = document.querySelectorAll('header a[href^="#"]');
    headerLinks.forEach(link => {
        if (!link.classList.contains('back-button')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.hash = this.getAttribute('href');
            });
        }
    });
    
    // Redimensionner l'iframe si présent
    const resizeIframe = () => {
        const iframes = document.querySelectorAll('.reservation-iframe');
        const width = window.innerWidth;
        
        iframes.forEach(iframe => {
            if (width <= 640) {
                iframe.style.height = '550px';
            } else if (width <= 768) {
                iframe.style.height = '600px';
            } else {
                iframe.style.height = '700px';
            }
        });
    };
    
    // Exécuter le redimensionnement et ajouter l'écouteur d'événement
    if (document.querySelectorAll('.reservation-iframe').length > 0) {
        resizeIframe();
        window.addEventListener('resize', resizeIframe);
    }
    
    console.log('Page de réservation chargée avec succès');
}
