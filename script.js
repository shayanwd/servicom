document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const overlay = document.querySelector('.overlay');
    const closeButton = document.querySelector('.close-menu');
    const backButton = document.querySelector('.back-button');
    const menuWrapper = document.querySelector('.menu-wrapper');
    const imageWrapper = document.querySelector('.image-wrapper');
    const viewMoreLink = document.querySelector('.image-wrapper a');
    const menuImage = document.querySelector('.menu-image');

    // State
    let currentMenu = 'main';
    let menuStack = [];
    let isAnimating = false;
    let activeMenuItem = null;

    // Initialize GSAP
    gsap.config({ force3D: true });

    // Preload all images and videos
    function preloadMedia() {
        // Preload main video - only target the specific menu video
        const mainVideo = document.querySelector('.menu-container video');
        if (mainVideo) {
            mainVideo.preload = 'auto';
            mainVideo.load();
        }
        
        // Preload all images and videos from menu items - only target menu-specific media
        const menuItems = document.querySelectorAll('.menu-content a[data-image]');
        const preloadedMedia = {};
        
        menuItems.forEach(item => {
            const mediaPath = item.getAttribute('data-image');
            if (!mediaPath) return;
            
            // Skip if the media path is from WordPress content
            if (mediaPath.includes('/wp-content/uploads/') && !mediaPath.includes('menu-')) {
                return;
            }
            
            // Check if it's a video
            const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
            
            if (isVideo) {
                // Preload video
                const video = document.createElement('video');
                video.preload = 'auto';
                video.src = mediaPath;
                video.load();
                preloadedMedia[mediaPath] = video;
            } else {
                // Preload image
                const img = new Image();
                img.src = mediaPath;
                preloadedMedia[mediaPath] = img;
            }
        });
        
        return preloadedMedia;
    }

    // Initialize preloaded media
    let preloadedMedia = {};

    // Open Menu
    function openMenu() {
        if (isAnimating) return;
        isAnimating = true;
        
        overlay.classList.add('active');
        sideMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset menu items to initial state before animation
        const menuItems = document.querySelectorAll('.menu-content[data-menu="main"] li');
        gsap.set(menuItems, { x: 30, opacity: 0 });
        
        // Simplified animation
        gsap.fromTo(sideMenu, 
            { x: "-100%" },
            {
                x: "0%",
                duration: 0.8,
                ease: "power4.out",
                onComplete: () => {
                    // Animate menu items one by one
                    gsap.to(menuItems, 
                        { 
                            x: 0, 
                            opacity: 1, 
                            duration: 0.6, 
                            stagger: 0.08, 
                            ease: "power2.out",
                            onComplete: () => {
                                isAnimating = false;
                            }
                        }
                    );
                }
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
        if (isAnimating) return;
        isAnimating = true;
        
        const menuItems = document.querySelectorAll('.menu-content li');
        
        gsap.to(menuItems, {
            x: 30,
            opacity: 0,
            duration: 0.4,
            stagger: 0.03,
            ease: "power2.in",
            onComplete: () => {
                gsap.to(sideMenu, {
                    x: "-100%",
                    duration: 0.6,
                    ease: "power4.inOut",
                    onComplete: () => {
                        overlay.classList.remove('active');
                        sideMenu.classList.remove('active');
                        document.body.style.overflow = '';
                        resetMenu();
                        isAnimating = false;
                    }
                });
            }
        });

        // Fade out overlay
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.6,
            ease: "power4.inOut"
        });
        
        // Hide image section with animation
        gsap.to(menuImage, {
            x: "100%",
            opacity: 0,
            duration: 0.6,
            ease: "power4.inOut"
        });
        
        // Restore blur effect
        menuWrapper.classList.remove('blur-removed');
    }

    // Show Submenu
    function showSubmenu(submenuId) {
        if (isAnimating) return;
        isAnimating = true;
        
        const currentMenuElement = document.querySelector(`.menu-content[data-menu="${currentMenu}"]`);
        const nextMenuElement = document.querySelector(`.menu-content[data-menu="${submenuId}"]`);
        
        menuStack.push(currentMenu);
        currentMenu = submenuId;
        
        // Remove blur effect
        menuWrapper.classList.add('blur-removed');
        
        // Reset next menu items to initial state
        const nextMenuItems = nextMenuElement.querySelectorAll('li');
        gsap.set(nextMenuItems, { x: 30, opacity: 0 });
        
        // Animate current menu to the left
        gsap.to(currentMenuElement, {
            x: "-100%",
            opacity: 0,
            duration: 0.6,
            ease: "power3.inOut"
        });
        
        // Animate next menu from the right
        gsap.fromTo(nextMenuElement,
            { x: "100%", opacity: 0 },
            { 
                x: "0%", 
                opacity: 1,
                duration: 0.6, 
                ease: "power3.inOut",
                onComplete: () => {
                    // Animate menu items one by one
                    gsap.to(nextMenuItems, 
                        { 
                            x: 0, 
                            opacity: 1, 
                            duration: 0.5, 
                            stagger: 0.08, 
                            ease: "power2.out",
                            onComplete: () => {
                                isAnimating = false;
                            }
                        }
                    );
                }
            }
        );
        
        backButton.classList.add('visible');
    }

    // Go Back
    function goBack() {
        if (menuStack.length === 0 || isAnimating) return;
        isAnimating = true;
        
        const currentMenuElement = document.querySelector(`.menu-content[data-menu="${currentMenu}"]`);
        const previousMenu = menuStack.pop();
        const previousMenuElement = document.querySelector(`.menu-content[data-menu="${previousMenu}"]`);
        
        currentMenu = previousMenu;
        
        // If going back to main menu, restore blur effect and hide image section
        if (menuStack.length === 0) {
            menuWrapper.classList.remove('blur-removed');
            
            // Hide image section with animation
            gsap.to(menuImage, {
                x: "100%",
                opacity: 0,
                duration: 0.6,
                ease: "power4.inOut"
            });
            
            // Hide view more link
            if (viewMoreLink) {
                viewMoreLink.classList.remove('visible');
            }
        }
        
        // Reset previous menu items to initial state
        const previousMenuItems = previousMenuElement.querySelectorAll('li');
        gsap.set(previousMenuItems, { x: 30, opacity: 0 });
        
        // Animate current menu to the right
        gsap.to(currentMenuElement, {
            x: "100%",
            opacity: 0,
            duration: 0.6,
            ease: "power3.inOut"
        });
        
        // Animate previous menu from the left
        gsap.fromTo(previousMenuElement,
            { x: "-100%", opacity: 0 },
            { 
                x: "0%", 
                opacity: 1,
                duration: 0.6, 
                ease: "power3.inOut",
                onComplete: () => {
                    // Animate menu items one by one
                    gsap.to(previousMenuItems, 
                        { 
                            x: 0, 
                            opacity: 1, 
                            duration: 0.5, 
                            stagger: 0.08, 
                            ease: "power2.out",
                            onComplete: () => {
                                isAnimating = false;
                            }
                        }
                    );
                }
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
        
        // Restore blur effect
        menuWrapper.classList.remove('blur-removed');
        
        document.querySelectorAll('.menu-content').forEach(menu => {
            if (menu.dataset.menu === 'main') {
                gsap.set(menu, { x: "0%", opacity: 1 });
                
                // Reset main menu items for animation
                const menuItems = menu.querySelectorAll('li');
                gsap.set(menuItems, { x: 30, opacity: 0 });
                
                // Animate menu items one by one
                gsap.to(menuItems, 
                    { 
                        x: 0, 
                        opacity: 1, 
                        duration: 0.5, 
                        stagger: 0.08, 
                        ease: "power2.out"
                    }
                );
            } else {
                gsap.set(menu, { x: "100%", opacity: 0 });
                
                // Reset submenu items for animation
                const menuItems = menu.querySelectorAll('li');
                gsap.set(menuItems, { x: 30, opacity: 0 });
            }
        });
        
        // Reset image section
        gsap.set(menuImage, { x: "100%", opacity: 0 });
        
        // Hide view more link
        if (viewMoreLink) {
            viewMoreLink.classList.remove('visible');
        }
        
        // Reset active menu item
        if (activeMenuItem) {
            activeMenuItem.classList.remove('active');
            activeMenuItem = null;
        }
    }

    // Change Image/Video with fade effect
    function changeImage(mediaPath) {
        if (!mediaPath) {
            // Hide image section with animation
            gsap.to(menuImage, {
                x: "100%",
                opacity: 0,
                duration: 0.6,
                ease: "power4.inOut"
            });
            
            if (viewMoreLink) {
                viewMoreLink.classList.remove('visible');
            }
            
            return;
        }
        
        // Show image section with Rolls-Royce style animation
        gsap.fromTo(menuImage, 
            { x: "100%", opacity: 0 },
            { 
                x: "0%", 
                opacity: 1, 
                duration: 0.8, 
                ease: "power4.out",
                onComplete: () => {
                    // Animate image wrapper
                    gsap.to(imageWrapper, {
                        opacity: 0,
                        duration: 0.4,
                        onComplete: () => {
                            // Clear existing content
                            const existingMedia = imageWrapper.querySelector('img, video');
                            if (existingMedia) {
                                existingMedia.remove();
                            }
                            
                            // Check if the path is for a video (common video extensions)
                            const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
                            
                            // Use preloaded media if available
                            if (preloadedMedia[mediaPath]) {
                                if (isVideo) {
                                    const video = preloadedMedia[mediaPath].cloneNode(true);
                                    video.autoplay = true;
                                    video.loop = true;
                                    video.muted = true;
                                    video.playsInline = true;
                                    imageWrapper.insertBefore(video, imageWrapper.firstChild);
                                    
                                    // Add active class after a short delay
                                    setTimeout(() => {
                                        video.classList.add('active');
                                    }, 50);
                                } else {
                                    const img = preloadedMedia[mediaPath].cloneNode(true);
                                    imageWrapper.insertBefore(img, imageWrapper.firstChild);
                                    
                                    // Add active class after a short delay
                                    setTimeout(() => {
                                        img.classList.add('active');
                                    }, 50);
                                }
                            } else {
                                // Fallback to original loading method if not preloaded
                                if (isVideo) {
                                    const video = document.createElement('video');
                                    video.src = mediaPath;
                                    video.autoplay = true;
                                    video.loop = true;
                                    video.muted = true;
                                    video.playsInline = true;
                                    imageWrapper.insertBefore(video, imageWrapper.firstChild);
                                    
                                    // Add active class after a short delay
                                    setTimeout(() => {
                                        video.classList.add('active');
                                    }, 50);
                                } else {
                                    const img = document.createElement('img');
                                    img.src = mediaPath;
                                    img.alt = "";
                                    imageWrapper.insertBefore(img, imageWrapper.firstChild);
                                    
                                    // Add active class after a short delay
                                    setTimeout(() => {
                                        img.classList.add('active');
                                    }, 50);
                                }
                            }
                            
                            gsap.to(imageWrapper, {
                                opacity: 1,
                                duration: 0.4
                            });
                            
                            if (viewMoreLink) {
                                // Animate the view more link with a slight delay
                                setTimeout(() => {
                                    viewMoreLink.classList.add('visible');
                                    
                                    // Add a subtle animation to the button
                                    gsap.fromTo(viewMoreLink, 
                                        { scale: 0.9, opacity: 0 },
                                        { 
                                            scale: 1, 
                                            opacity: 1, 
                                            duration: 0.5, 
                                            ease: "back.out(1.2)" 
                                        }
                                    );
                                }, 400);
                            }
                        }
                    });
                }
            }
        );
    }

    // Set active menu item
    function setActiveMenuItem(menuItem) {
        // Remove active class from previous active item
        if (activeMenuItem) {
            activeMenuItem.classList.remove('active');
        }
        
        // Set new active item
        activeMenuItem = menuItem;
        activeMenuItem.classList.add('active');
    }

    // Event Listeners
    menuToggle.addEventListener('click', () => {
        openMenu();
    });
    
    closeButton.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    backButton.addEventListener('click', goBack);

    // Add hover effect to back button
    backButton.addEventListener('mouseenter', () => {
        gsap.to(backButton, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    backButton.addEventListener('mouseleave', () => {
        gsap.to(backButton, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    // Add hover effect to view more link
    if (viewMoreLink) {
        viewMoreLink.addEventListener('mouseenter', () => {
            gsap.to(viewMoreLink, {
                y: -5,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        viewMoreLink.addEventListener('mouseleave', () => {
            gsap.to(viewMoreLink, {
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    // Menu Item Click Handler
    document.querySelectorAll('.menu-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            const submenu = link.dataset.submenu;
            const image = link.dataset.image;
            const href = link.getAttribute('href');
            
            // If it's a direct link (not #), close menu first then navigate
            if (href && href !== '#' && !submenu) {
                e.preventDefault();
                const targetUrl = href;
                
                // Set active menu item
                setActiveMenuItem(link);
                
                // Show image only on click, not on hover
                if (image) {
                    changeImage(image);
                }
                
                // Close menu and then navigate
                closeMenu();
                
                // Wait for menu to close before navigating
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 800); // Match this with the menu close animation duration
                return;
            }
            
            e.preventDefault();
            
            // Set active menu item
            setActiveMenuItem(link);
            
            // Show image only on click, not on hover
            if (image) {
                changeImage(image);
            }
            
            // Open submenu on click
            if (submenu) {
                showSubmenu(submenu);
            }
        });
    });

    // Preload media when DOM is loaded
    preloadedMedia = preloadMedia();

    // Initialize the menu
    resetMenu();
}); 