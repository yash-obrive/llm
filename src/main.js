import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AOS from 'aos';
import { initThreeScene } from './three-scene.js';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Three.js WebGL Scene
  initThreeScene();

  // 2. Initialize AOS (Animate on Scroll)
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 70
  });

  // 3. Obrive Default Light Mint/Teal Branding
  const html = document.documentElement;
  html.setAttribute('data-theme', 'light');

  // 4. Floating Navbar Scroll Effect
  const siteHeader = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      siteHeader?.classList.add('header-scrolled');
    } else {
      siteHeader?.classList.remove('header-scrolled');
    }
  });

  // 5. Mobile Menu Navigation
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.textContent = '☰';
      });
    });
  }

  // 6. GSAP Hero Stagger Entrance (Smooth & Safe fromTo)
  gsap.fromTo(
    ['.hero-content .obrive-badge', '.hero-content h1', '.hero-lede', '.hero-actions', '.ticker-badge'],
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out' }
  );
  gsap.fromTo(
    '.hero-bottom-item',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.35, ease: 'power2.out' }
  );

  // 7. GSAP ScrollTrigger Effects on Process Steps
  gsap.utils.toArray('.process-step').forEach((step, idx) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(step, {
          y: 0,
          opacity: 1,
          borderColor: idx === 0 ? '#0b7c73' : undefined,
          duration: 0.5
        });
      }
    });
  });

  // 9. Service & Engagement Card Pre-fill Link Handler
  const serviceSelect = document.getElementById('serviceSelect');
  document.querySelectorAll('[data-service], [data-scope]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-service') || btn.getAttribute('data-scope');
      if (serviceSelect && val) {
        for (let i = 0; i < serviceSelect.options.length; i++) {
          if (serviceSelect.options[i].text.toLowerCase().includes(val.toLowerCase()) ||
              val.toLowerCase().includes(serviceSelect.options[i].text.toLowerCase())) {
            serviceSelect.selectedIndex = i;
            break;
          }
        }
      }
    });
  });

  // 10. FAQ Accordion Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(other => other.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  if (faqItems.length > 0) {
    faqItems[0].classList.add('active');
  }

  // 11. Google Sheets API & Lead Form Submission Handler
  const GOOGLE_SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL || 'https://sheetdb.io/api/v1/t0sosmwm1jaji';

  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!leadForm.checkValidity()) {
        leadForm.reportValidity();
        return;
      }

      const submitBtn = leadForm.querySelector('button[type="submit"]');
      const labelSpan = submitBtn.querySelector('.btn__label');
      const originalLabel = labelSpan ? labelSpan.textContent : 'Send project enquiry';

      if (labelSpan) labelSpan.textContent = 'Submitting enquiry…';
      submitBtn.disabled = true;

      const customerData = {
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        name: leadForm.elements['name']?.value?.trim() || '',
        email: leadForm.elements['email']?.value?.trim() || '',
        company: leadForm.elements['company']?.value?.trim() || '',
        country: leadForm.elements['country']?.value || '',
        service: leadForm.elements['service']?.value || '',
        budget: leadForm.elements['budget']?.value || '',
        brief: leadForm.elements['brief']?.value?.trim() || ''
      };

      // Always save a local copy in browser localStorage as fail-safe
      try {
        const saved = JSON.parse(localStorage.getItem('obrive_customer_leads') || '[]');
        saved.push(customerData);
        localStorage.setItem('obrive_customer_leads', JSON.stringify(saved));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      try {
        if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL.trim() !== '') {
          let targetUrl = GOOGLE_SHEET_URL.trim();
          let fetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          };

          // Support SheetDB API Key directly (e.g. if user pastes just their SheetDB key or full SheetDB url)
          if (!targetUrl.startsWith('http') && targetUrl.length > 4) {
            targetUrl = `https://sheetdb.io/api/v1/${targetUrl}`;
          }

          if (targetUrl.includes('sheetdb.io')) {
            // SheetDB API format
            fetchOptions.body = JSON.stringify({
              data: [{
                Timestamp: customerData.timestamp,
                "Full Name": customerData.name,
                "Work Email": customerData.email,
                Company: customerData.company,
                Country: customerData.country,
                "Service Required": customerData.service,
                "Estimated Budget": customerData.budget,
                "Project Brief": customerData.brief
              }]
            });
          } else {
            // Google Apps Script Web App format (mode: 'no-cors' prevents browser CORS issues)
            fetchOptions.mode = 'no-cors';
            fetchOptions.body = JSON.stringify(customerData);
          }

          await fetch(targetUrl, fetchOptions);
        } else {
          // Brief animation delay if URL/API Key is not yet configured
          await new Promise((resolve) => setTimeout(resolve, 800));
          console.info(
            '%c[Google Sheets Integration]%c Data saved locally! To connect your live Google Sheet, paste your SheetDB API Key or Google Apps Script URL in .env (VITE_GOOGLE_SHEET_URL) or src/main.js. See GOOGLE_SHEETS_SETUP.md for instructions.',
            'color: #074139; font-weight: bold; background: #B5EFE2; padding: 4px 8px; border-radius: 4px;',
            'color: #074139;'
          );
        }

        submitBtn.disabled = false;
        if (labelSpan) labelSpan.textContent = 'Enquiry Sent Successfully ✓';
        leadForm.reset();

        setTimeout(() => {
          if (labelSpan) labelSpan.textContent = originalLabel;
        }, 4000);
      } catch (error) {
        console.error('Google Sheets submission error:', error);
        submitBtn.disabled = false;
        if (labelSpan) labelSpan.textContent = 'Error. Please retry or email info@obrive.com';
        setTimeout(() => {
          if (labelSpan) labelSpan.textContent = originalLabel;
        }, 5000);
      }
    });
  }

  // Set current year in footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
