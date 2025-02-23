document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const overlay = document.querySelector('.overlay');
    const closeButton = document.querySelector('.close-menu');
    const backButton = document.querySelector('.back-button');
    const menuWrapper = document.querySelector('.menu-wrapper');
    const imageWrapper = document.querySelector('.image-wrapper');

    // State
    let currentMenu = 'main';
    let menuStack = [];

    // Initialize GSAP
    gsap.config({ force3D: true });

    // Open Menu
    function openMenu() {
        overlay.classList.add('active');
        sideMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Simplified animation
        gsap.fromTo(sideMenu, 
            { x: "-100%" },
            {
                x: "0%",
                duration: 0.6,
                ease: "power4.out"
            }
        );

        // Fade in overlay
        gsap.to(overlay, {
            opacity: 1,
            duration: 0.6,
            ease: "power4.out"
        });
    }

    // Close Menu
    function closeMenu() {
        gsap.to(sideMenu, {
            x: "-100%",
            duration: 0.6,
            ease: "power4.inOut",
            onComplete: () => {
                overlay.classList.remove('active');
                sideMenu.classList.remove('active');
                document.body.style.overflow = '';
                resetMenu();
            }
        });

        // Fade out overlay
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.6,
            ease: "power4.inOut"
        });
    }

    // Show Submenu
    function showSubmenu(submenuId) {
        const currentMenuElement = document.querySelector(`.menu-content[data-menu="${currentMenu}"]`);
        const nextMenuElement = document.querySelector(`.menu-content[data-menu="${submenuId}"]`);
        
        menuStack.push(currentMenu);
        currentMenu = submenuId;
        
        gsap.to(currentMenuElement, {
            x: "-100%",
            duration: 0.6,
            ease: "power3.inOut"
        });
        
        gsap.fromTo(nextMenuElement,
            { x: "100%" },
            { x: "0%", duration: 0.6, ease: "power3.inOut" }
        );
        
        backButton.classList.add('visible');
    }

    // Go Back
    function goBack() {
        if (menuStack.length === 0) return;
        
        const currentMenuElement = document.querySelector(`.menu-content[data-menu="${currentMenu}"]`);
        const previousMenu = menuStack.pop();
        const previousMenuElement = document.querySelector(`.menu-content[data-menu="${previousMenu}"]`);
        
        currentMenu = previousMenu;
        
        gsap.to(currentMenuElement, {
            x: "100%",
            duration: 0.6,
            ease: "power3.inOut"
        });
        
        gsap.fromTo(previousMenuElement,
            { x: "-100%" },
            { x: "0%", duration: 0.6, ease: "power3.inOut" }
        );
        
        if (menuStack.length === 0) {
            backButton.classList.remove('visible');
        }
    }

    // Reset Menu
    function resetMenu() {
        menuStack = [];
        currentMenu = 'main';
        backButton.classList.remove('visible');
        
        document.querySelectorAll('.menu-content').forEach(menu => {
            if (menu.dataset.menu === 'main') {
                gsap.set(menu, { x: "0%" });
            } else {
                gsap.set(menu, { x: "100%" });
            }
        });
    }

    // Change Image/Video with fade effect
    function changeImage(mediaPath) {
        if (!mediaPath) return;
        
        gsap.to(imageWrapper, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                // Clear existing content
                imageWrapper.querySelector('img, video')?.remove();
                
                // Check if the path is for a video (common video extensions)
                const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
                
                if (isVideo) {
                    const video = document.createElement('video');
                    video.src = mediaPath;
                    video.autoplay = true;
                    video.loop = true;
                    video.muted = true;
                    video.playsInline = true;
                    imageWrapper.insertBefore(video, imageWrapper.firstChild);
                } else {
                    const img = document.createElement('img');
                    img.src = mediaPath;
                    img.alt = "";
                    imageWrapper.insertBefore(img, imageWrapper.firstChild);
                }
                
                gsap.to(imageWrapper, {
                    opacity: 1,
                    duration: 0.3
                });
            }
        });
    }

    // Event Listeners
    menuToggle.addEventListener('click', () => {
        openMenu();
        resetMenu();
    });
    closeButton.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    backButton.addEventListener('click', goBack);

    // Menu Item Click Handler
    document.querySelectorAll('.menu-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const submenu = link.dataset.submenu;
            const image = link.dataset.image;
            
            if (image) {
                changeImage(image);
            }
            
            if (submenu) {
                showSubmenu(submenu);
            }
        });

        // New hover handlers
        link.addEventListener('mouseenter', () => {
            const image = link.dataset.image;
            if (image) {
                changeImage(image);
            }
        });

        // Optional: Restore parent menu image when mouse leaves
        link.addEventListener('mouseleave', () => {
            const parentMenu = link.closest('.menu-content');
            const parentLink = document.querySelector(`a[data-submenu="${parentMenu.dataset.menu}"]`);
            if (parentLink && parentLink.dataset.image) {
                changeImage(parentLink.dataset.image);
            }
        });
    });

    const menuStructure = {
        'About Us': {
            items: [
                'Corporate Information',
                'Our People'
            ]
        },
        'Aesthetic & Medical Equipment': {
            items: [
                {
                    name: 'AccuVein',
                    subitems: ['AV500 Vein Visualization Finder']
                },
                {
                    name: 'AMP',
                    subitems: ['AQUAFIRMExs', 'DE|RIVE', 'EXO|E']
                },
                {
                    name: 'Conmed',
                    subitems: ['Hyfrecator 2000']
                },
                {
                    name: 'Dermalux',
                    subitems: ['Compact Lite', 'Flex MD', 'Tri-Wave MD']
                },
                {
                    name: 'Fotona',
                    subitems: ['StarWalker MaQX', 'StarWalker PQX', 'FotonaSmooth XS']
                },
                {
                    name: 'GME',
                    subitems: ['FlexSys', 'LinScan', 'Twinscan']
                },
                {
                    name: 'Natus',
                    subitems: ['NicView', 'Retcam Envision™']
                },
                {
                    name: 'Sciton',
                    subitems: ['JouleX', 'mJoule']
                },
                {
                    name: 'SNJ Medical',
                    subitems: ['Blue Eva', 'Blue Ice', 'Finexel']
                },
                'Swift Microwave Therapy',
                {
                    name: 'Walker Filtration',
                    subitems: ['LaserVac750 Smoke Evacuation Unit']
                },
                {
                    name: 'Zimmer',
                    subitems: ['Cryo 6']
                }
            ]
        },
        'Skincare & Professional Products': {
            items: [
                'Endor Technologies',
                'Gold PTT',
                {
                    name: 'Universkin',
                    subitems: ['Skincare', 'Universkin S.TEP']
                }
            ]
        },
        'Engineering Services': {
            items: []
        },
        'Contact Us': {
            items: []
        }
    };
}); 