// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Satirical response
            const responses = [
                "Welcome to the network! Your bandwidth allocation has been optimized.",
                "Connection established! You'll receive updates at fiber-optic speed.",
                "Subscription successful! Your digital harvest awaits.",
                "You're now part of our server farm community!",
                "Thanks for joining! Your connection is now enterprise-grade."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            // Create success message
            const successDiv = document.createElement('div');
            successDiv.style.cssText = `
                background: #4facfe;
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
                text-align: center;
                font-weight: 500;
                animation: slideIn 0.5s ease-out;
            `;
            successDiv.textContent = randomResponse;
            
            // Add CSS animation
            if (!document.querySelector('#slideInAnimation')) {
                const style = document.createElement('style');
                style.id = 'slideInAnimation';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateY(-20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.appendChild(successDiv);
            this.querySelector('input[type="email"]').value = '';
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successDiv.remove();
            }, 5000);
        });
    }

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        });
    }

    // Counter animation for hero stats
    function animateCounters() {
        const stats = document.querySelectorAll('.stat h3');
        
        stats.forEach(stat => {
            const target = stat.textContent;
            const isPercentage = target.includes('%');
            const isTB = target.includes('TB');
            const isTime = target.includes('/');
            
            if (isPercentage) {
                animateNumber(stat, 0, 99.99, 2000, (num) => num.toFixed(2) + '%');
            } else if (isTB) {
                animateNumber(stat, 0, 10, 2000, (num) => Math.floor(num) + 'TB');
            } else if (isTime) {
                // Special case for 24/7
                stat.textContent = '24/7';
            }
        });
    }
    
    function animateNumber(element, start, end, duration, formatter) {
        let startTime = null;
        
        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;
            
            if (progress < 1) {
                const current = start + (end - start) * easeOutCubic(progress);
                element.textContent = formatter(current);
                requestAnimationFrame(animate);
            } else {
                element.textContent = formatter(end);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Animate counters when hero stats come into view
                if (entry.target.classList.contains('hero-stats')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const animateElements = document.querySelectorAll('.event-card, .ticket-card, .hero-stats');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Easter egg: Konami code for developers
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.keyCode);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.length === konamiSequence.length && 
            konamiCode.every((code, i) => code === konamiSequence[i])) {
            
            // Activate developer mode
            document.body.style.background = 'linear-gradient(45deg, #000, #111)';
            document.body.style.color = '#00ff00';
            
            const devMessage = document.createElement('div');
            devMessage.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #000;
                color: #00ff00;
                padding: 30px;
                border-radius: 10px;
                border: 2px solid #00ff00;
                font-family: monospace;
                font-size: 14px;
                z-index: 9999;
                text-align: center;
            `;
            devMessage.innerHTML = `
                <h3>🚀 DEVELOPER MODE ACTIVATED 🚀</h3>
                <p>Welcome to the Matrix, Neo.</p>
                <p>You've discovered the secret developer portal.</p>
                <p>Frederick County's digital future awaits...</p>
                <button onclick="this.parentElement.remove(); document.body.style.background=''; document.body.style.color='';">
                    Exit Matrix
                </button>
            `;
            
            document.body.appendChild(devMessage);
            konamiCode = []; // Reset
        }
    });

    // Add subtle animations to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Typing effect for the hero subtitle
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        const text = subtitle.textContent;
        subtitle.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                subtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Start typing effect after a brief delay
        setTimeout(typeWriter, 1000);
    }

    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';
        }
    });
});

// Add some console fun for developers
console.log(`
    🌾🖥️ SHENANDOAH DATACENTER FESTIVAL 🖥️🌾
    
    Welcome, fellow developer!
    
    You've discovered the satirical heart of Frederick County's 
    agricultural vs. digital future debate.
    
    This website is a loving parody of festival marketing,
    designed to highlight the contrast between rural heritage
    and modern datacenter development.
    
    Try the Konami code for a special surprise! 
    (↑ ↑ ↓ ↓ ← → ← → B A)
    
    Built with 💚 for preserving rural landscapes.
`);

// Performance monitoring (satirical)
const performanceMetrics = {
    serverFarmYield: Math.floor(Math.random() * 1000) + 500,
    digitalHarvestRate: Math.floor(Math.random() * 100) + 50,
    bandwidthGrowth: Math.floor(Math.random() * 25) + 75
};

console.log('🚜 Current Farm Metrics:', performanceMetrics);