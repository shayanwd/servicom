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
            gsap.set(menuItems, { x: 20, opacity: 0 });
            
            // Simplified and faster animation
            gsap.fromTo(sideMenu, 
                { x: "-100%" },
                {
                    x: "0%",
                    duration: 0.4,
                    ease: "power2.out",
                    onComplete: () => {
                        // Animate menu items one by one with reduced stagger
                        gsap.to(menuItems, 
                            { 
                                x: 0, 
                                opacity: 1, 
                                duration: 0.3, 
                                stagger: 0.04, 
                                ease: "power2.out",
                                onComplete: () => {
                                    isAnimating = false;
                                }
                            }
                        );
                    }
                }
            );
    
            // Fade in overlay faster
            gsap.to(overlay, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    
        // Close Menu
        function closeMenu() {
            if (isAnimating) return;
            isAnimating = true;
            
            const menuItems = document.querySelectorAll('.menu-content li');
            
            gsap.to(menuItems, {
                x: 20,
                opacity: 0,
                duration: 0.2,
                stagger: 0.02,
                ease: "power2.in",
                onComplete: () => {
                    gsap.to(sideMenu, {
                        x: "-100%",
                        duration: 0.3,
                        ease: "power2.inOut",
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
    
            // Fade out overlay faster
            gsap.to(overlay, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut"
            });
            
            // Hide image section with faster animation
            gsap.to(menuImage, {
                x: "100%",
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut"
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
            gsap.set(nextMenuItems, { x: 20, opacity: 0 });
            
            // Animate current menu to the left faster
            gsap.to(currentMenuElement, {
                x: "-100%",
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut"
            });
            
            // Animate next menu from the right faster
            gsap.fromTo(nextMenuElement,
                { x: "100%", opacity: 0 },
                { 
                    x: "0%", 
                    opacity: 1,
                    duration: 0.3, 
                    ease: "power2.inOut",
                    onComplete: () => {
                        // Animate menu items one by one with reduced stagger
                        gsap.to(nextMenuItems, 
                            { 
                                x: 0, 
                                opacity: 1, 
                                duration: 0.2, 
                                stagger: 0.04, 
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
            
            // Always hide image section when going back
            gsap.to(menuImage, {
                x: "100%",
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut"
            });
            
            // Hide view more link
            if (viewMoreLink) {
                viewMoreLink.classList.remove('visible');
            }
            
            // If going back to main menu, restore blur effect
            if (menuStack.length === 0) {
                menuWrapper.classList.remove('blur-removed');
            }
            
            // Reset previous menu items to initial state
            const previousMenuItems = previousMenuElement.querySelectorAll('li');
            gsap.set(previousMenuItems, { x: 20, opacity: 0 });
            
            // Animate current menu to the right faster
            gsap.to(currentMenuElement, {
                x: "100%",
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut"
            });
            
            // Animate previous menu from the left faster
            gsap.fromTo(previousMenuElement,
                { x: "-100%", opacity: 0 },
                { 
                    x: "0%", 
                    opacity: 1,
                    duration: 0.3, 
                    ease: "power2.inOut",
                    onComplete: () => {
                        // Animate menu items one by one with reduced stagger
                        gsap.to(previousMenuItems, 
                            { 
                                x: 0, 
                                opacity: 1, 
                                duration: 0.2, 
                                stagger: 0.04, 
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
                    gsap.set(menuItems, { x: 20, opacity: 0 });
                    
                    // Animate menu items one by one
                    gsap.to(menuItems, 
                        { 
                            x: 0, 
                            opacity: 1, 
                            duration: 0.3, 
                            stagger: 0.04, 
                            ease: "power2.out"
                        }
                    );
                } else {
                    gsap.set(menu, { x: "100%", opacity: 0 });
                    
                    // Reset submenu items for animation
                    const menuItems = menu.querySelectorAll('li');
                    gsap.set(menuItems, { x: 20, opacity: 0 });
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
    
        // Change Image/Video with faster fade effect
        function changeImage(mediaPath, pageLink) {
            if (!mediaPath) {
                // Hide image section with faster animation
                gsap.to(menuImage, {
                    x: "100%",
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.inOut"
                });
                
                if (viewMoreLink) {
                    viewMoreLink.classList.remove('visible');
                }
                
                return;
            }
            
            // Show image section with faster animation
            gsap.fromTo(menuImage, 
                { x: "100%", opacity: 0 },
                { 
                    x: "0%", 
                    opacity: 1, 
                    duration: 0.4, 
                    ease: "power2.out",
                    onComplete: () => {
                        // Animate image wrapper faster
                        gsap.to(imageWrapper, {
                            opacity: 0,
                            duration: 0.2,
                            onComplete: () => {
                                // Clear existing content
                                const existingMedia = imageWrapper.querySelector('img, video');
                                if (existingMedia) {
                                    existingMedia.remove();
                                }
                                
                                // Check if the path is for a video
                                const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
                                
                                // Use preloaded media if available
                                if (preloadedMedia[mediaPath]) {
                                    const media = preloadedMedia[mediaPath].cloneNode();
                                    imageWrapper.insertBefore(media, imageWrapper.firstChild);
                                    
                                    // Add active class immediately
                                    media.classList.add('active');
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
                                        
                                        // Add active class immediately
                                        video.classList.add('active');
                                    } else {
                                        const img = document.createElement('img');
                                        img.src = mediaPath;
                                        img.alt = "";
                                        imageWrapper.insertBefore(img, imageWrapper.firstChild);
                                        
                                        // Add active class immediately
                                        img.classList.add('active');
                                    }
                                }
                                
                                gsap.to(imageWrapper, {
                                    opacity: 1,
                                    duration: 0.2
                                });
                                
                                if (viewMoreLink) {
                                    // Update the View More link
                                    viewMoreLink.href = pageLink || '#';
                                    
                                    // Animate the view more link faster
                                    viewMoreLink.classList.add('visible');
                                    
                                    // Add a subtle animation to the button
                                    gsap.fromTo(viewMoreLink, 
                                        { scale: 0.9, opacity: 0 },
                                        { 
                                            scale: 1, 
                                            opacity: 1, 
                                            duration: 0.3, 
                                            ease: "power2.out" 
                                        }
                                    );
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
            const isMobile = () => window.innerWidth <= 768;
            
            link.addEventListener('click', (e) => {
                const submenu = link.dataset.submenu;
                const image = link.dataset.image;
                const pageLink = link.dataset.pageLink;
                const href = link.getAttribute('href');
                const isViewPageLink = link.classList.contains('view-page-link');
                
                // Handle View Page links (always navigate directly)
                if (isViewPageLink && href && href !== '#') {
                    window.location.href = href;
                    return;
                }
                
                // For mobile: handle parent pages with submenus differently
                if (isMobile()) {
                    // If it has both submenu and pageLink, show submenu first
                    if (submenu && pageLink) {
                        e.preventDefault();
                        setActiveMenuItem(link);
                        showSubmenu(submenu);
                        return;
                    }
                    
                    // If it has only pageLink (no submenu), navigate directly
                    if (pageLink && !submenu) {
                        window.location.href = pageLink;
                        return;
                    }
                    
                    // If it has only submenu (no pageLink), show submenu
                    if (submenu && !pageLink) {
                        e.preventDefault();
                        setActiveMenuItem(link);
                        showSubmenu(submenu);
                        return;
                    }
                    
                    // For regular links without submenu or pageLink
                    if (href && href !== '#' && !submenu) {
                        window.location.href = href;
                        return;
                    }
                }
                
                // For desktop: keep existing behavior
                if (href && href !== '#' && !submenu) {
                    window.location.href = href;
                    return;
                }
                
                e.preventDefault();
                
                // Set active menu item
                setActiveMenuItem(link);
                
                // Show image only on desktop
                if (!isMobile() && image) {
                    changeImage(image, pageLink);
                }
                
                // Open submenu on click
                if (submenu) {
                    showSubmenu(submenu);
                }
            });
    
            // Update href for mobile on load and resize
            const updateMobileHref = () => {
                // Don't update href for View Page links or items with submenus
                if (isMobile() && link.dataset.pageLink && !link.dataset.submenu && !link.classList.contains('view-page-link')) {
                    // Only update href for items that have pageLink but no submenu
                    link.href = link.dataset.pageLink;
                } else if (!isMobile() && link.dataset.pageLink) {
                    link.href = '#';
                }
            };
    
            // Initial update
            updateMobileHref();
    
            // Update on resize
            window.addEventListener('resize', updateMobileHref);
        });
    
        // Preload media when DOM is loaded
        preloadedMedia = preloadMedia();
    
        // Initialize the menu
        resetMenu();
    }); 
        