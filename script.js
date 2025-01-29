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
        
        gsap.fromTo(sideMenu, 
            { x: "-100%" },
            {
                x: "0%",
                duration: 0.6,
                ease: "power4.out"
            }
        );

        gsap.fromTo(
            `.menu-content[data-menu="${currentMenu}"] li`,
            {
                x: -30,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.4,
                stagger: 0.05,
                ease: "power2.out",
                delay: 0.2
            }
        );

        gsap.to(overlay, {
            opacity: 1,
            duration: 0.6,
            ease: "power4.out"
        });
    }

    // Close Menu
    function closeMenu() {
        gsap.to(
            `.menu-content[data-menu="${currentMenu}"] li`,
            {
                x: -30,
                opacity: 0,
                duration: 0.3,
                stagger: 0.05,
                ease: "power2.in"
            }
        );

        gsap.to(sideMenu, {
            x: "-100%",
            duration: 0.6,
            ease: "power4.inOut",
            delay: 0.2,
            onComplete: () => {
                overlay.classList.remove('active');
                sideMenu.classList.remove('active');
                document.body.style.overflow = '';
                resetMenu();
            }
        });

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
        
        if (!nextMenuElement) return; // Guard clause for invalid submenu
        
        gsap.to(currentMenuElement.querySelectorAll('li'), {
            x: -30,
            opacity: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.in"
        });
        
        gsap.to(currentMenuElement, {
            x: "-100%",
            duration: 0.6,
            ease: "power3.inOut"
        });
        
        menuStack.push(currentMenu);
        currentMenu = submenuId;
        
        gsap.fromTo(nextMenuElement,
            { x: "100%" },
            { x: "0%", duration: 0.6, ease: "power3.inOut" }
        );
        
        gsap.fromTo(
            nextMenuElement.querySelectorAll('li'),
            {
                x: 30,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.4,
                stagger: 0.05,
                ease: "power2.out",
                delay: 0.3
            }
        );
        
        backButton.classList.add('visible');
    }

    // Go Back
    function goBack() {
        if (menuStack.length === 0) return;
        
        const currentMenuElement = document.querySelector(`.menu-content[data-menu="${currentMenu}"]`);
        const previousMenu = menuStack.pop();
        const previousMenuElement = document.querySelector(`.menu-content[data-menu="${previousMenu}"]`);
        
        gsap.to(currentMenuElement.querySelectorAll('li'), {
            x: 30,
            opacity: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.in"
        });
        
        gsap.to(currentMenuElement, {
            x: "100%",
            duration: 0.6,
            ease: "power3.inOut"
        });
        
        currentMenu = previousMenu;
        
        gsap.fromTo(previousMenuElement,
            { x: "-100%" },
            { x: "0%", duration: 0.6, ease: "power3.inOut" }
        );
        
        gsap.fromTo(
            previousMenuElement.querySelectorAll('li'),
            {
                x: -30,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.4,
                stagger: 0.05,
                ease: "power2.out",
                delay: 0.3
            }
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
                gsap.set(menu.querySelectorAll('li'), { x: 0, opacity: 1 });
            } else {
                gsap.set(menu, { x: "100%" });
                gsap.set(menu.querySelectorAll('li'), { x: 0, opacity: 0 });
            }
        });
    }

    // Change Image
    function changeImage(imagePath) {
        const newImage = document.createElement('div');
        newImage.className = 'image-wrapper';
        newImage.style.backgroundImage = `url(${imagePath})`;
        
        gsap.to(imageWrapper, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                imageWrapper.style.backgroundImage = `url(${imagePath})`;
                gsap.to(imageWrapper, {
                    opacity: 1,
                    duration: 0.3
                });
            }
        });
    }

    // Event Listeners
    menuToggle.addEventListener('click', openMenu);
    closeButton.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    backButton.addEventListener('click', goBack);

    // Menu Item Click Handler
    document.querySelectorAll('.menu-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const submenu = link.dataset.submenu;
            if (submenu) {
                showSubmenu(submenu);
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