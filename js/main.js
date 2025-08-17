// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const mobileNavToggle = document.querySelector('#mobile-nav-toggle');
const navList = document.querySelector('.nav-list');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    navList.classList.toggle('open');
  });
}

// Mobile logo navigation toggle
if (mobileNavToggle && navList) {
  mobileNavToggle.addEventListener('click', (e) => {
    // Only toggle on mobile devices
    if (window.innerWidth <= 768) {
      e.preventDefault(); // Prevent navigation to home page
      navList.classList.toggle('open');
      
      // Update hamburger button state if it exists
      if (navToggle) {
        const expanded = navList.classList.contains('open');
        navToggle.setAttribute('aria-expanded', expanded);
      }
    }
  });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (navList && navList.classList.contains('open')) {
    if (!e.target.closest('.navbar') && !e.target.closest('#mobile-nav-toggle')) {
      navList.classList.remove('open');
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  }
});

// Close mobile menu on window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navList) {
    navList.classList.remove('open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }
});

// Portfolio filter
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');
if (filterBtns.length && portfolioItems.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      portfolioItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// Form validation and Netlify form submission
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    let valid = true;
    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value.trim()) {
        input.setAttribute('aria-invalid', 'true');
        valid = false;
      } else {
        input.removeAttribute('aria-invalid');
      }
    });
    
    if (!valid) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return false;
    }

    try {
      // Use Netlify's built-in form handling
      const formData = new FormData(form);
      
      // Submit to our form handler function
      const response = await fetch('/.netlify/functions/form-handler', {
        method: 'POST',
        body: new URLSearchParams(formData)
      });
      
      if (response.ok) {
        // Show success message
        form.style.display = 'none';
        const success = form.querySelector('.form-success') || document.createElement('div');
        success.className = 'form-success';
        success.textContent = 'Thanks! We\'ll get back to you soon.';
        success.style.display = 'block';
        form.parentNode.appendChild(success);
        
        // Reset form
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'form-error';
      errorDiv.textContent = 'Failed to send. Please try again later.';
      errorDiv.style.color = '#dc2626';
      errorDiv.style.backgroundColor = '#fef2f2';
      errorDiv.style.padding = 'var(--spacing-3)';
      errorDiv.style.borderRadius = 'var(--radius)';
      errorDiv.style.marginTop = 'var(--spacing-3)';
      errorDiv.style.textAlign = 'center';
      
      form.appendChild(errorDiv);
      
      // Remove error message after 5 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.remove();
        }
      }, 5000);
    } finally {
      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// === Futuristic Gallery Interactivity ===
// Dark mode toggle (auto or manual)
(function() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const setDark = (on) => document.body.classList.toggle('dark-mode', on);
  setDark(prefersDark);
  // Optional: add a button for manual toggle
  let btn = document.getElementById('darkModeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }
})();

// Card tilt effect
function addCardTilt(selector = '.gallery-card') {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `scale(1.04) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.boxShadow = `0 12px 48px 0 #00f0ffcc, 0 0 32px 4px #0ff, 0 0 0 2px #fff2`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}
document.addEventListener('DOMContentLoaded', function () {
  addCardTilt();
  const hero = document.querySelector('.hero');
  const heroCtas = document.querySelector('.hero-ctas');
  if (hero && heroCtas && 'IntersectionObserver' in window) {
    let isInView = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            heroCtas.style.opacity = '1';
            heroCtas.style.pointerEvents = 'auto';
            isInView = true;
          } else {
            heroCtas.style.opacity = '0';
            heroCtas.style.pointerEvents = 'none';
            isInView = false;
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(hero);

    // Show on mouseover/focus, hide on mouseleave/blur if not in view
    heroCtas.addEventListener('mouseenter', () => {
      heroCtas.style.opacity = '1';
      heroCtas.style.pointerEvents = 'auto';
    });
    heroCtas.addEventListener('mouseleave', () => {
      if (!isInView) {
        heroCtas.style.opacity = '0';
        heroCtas.style.pointerEvents = 'none';
      }
    });
    heroCtas.addEventListener('focusin', () => {
      heroCtas.style.opacity = '1';
      heroCtas.style.pointerEvents = 'auto';
    });
    heroCtas.addEventListener('focusout', () => {
      if (!isInView) {
        heroCtas.style.opacity = '0';
        heroCtas.style.pointerEvents = 'none';
      }
    });
  }
  const ctaBand = document.querySelector('.cta-band');
  if (ctaBand) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        ctaBand.classList.add('hide');
      } else {
        ctaBand.classList.remove('hide');
      }
    });
  }
  if (hero) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 0) {
        hero.classList.add('hide');
      } else {
        hero.classList.remove('hide');
      }
    });
  }
});

