/**
 * Traditional Sri Lankan Digital Wedding Invitation - Sachini & Sachin
 * Full interactive logic reproducing the viral invitation.lk experience
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==================== 1. DOM REFERENCES ====================
  const weddingAudio = document.getElementById('wedding-audio');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const reelAudioBtn = document.getElementById('reel-audio-btn');
  
  const coverScreen = document.getElementById('cover-screen');
  const btnOpenInvitation = document.getElementById('btn-open-invitation');
  
  const storyOverlay = document.getElementById('story-video-overlay');
  const storyVideo = document.getElementById('story-video');
  const reelSkipBtn = document.getElementById('reel-skip-btn');
  
  const floatingNavBar = document.getElementById('floating-nav-bar');
  const floatingPromoPill = document.getElementById('floating-promo-pill');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.invitation-section');
  
  // Countdown elements
  const daysEl = document.getElementById('days-count');
  const hoursEl = document.getElementById('hours-count');
  const minutesEl = document.getElementById('minutes-count');
  const secondsEl = document.getElementById('seconds-count');
  
  // RSVP Elements
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  const pillAccept = document.getElementById('pill-accept');
  const pillDecline = document.getElementById('pill-decline');
  const guestsCounterGroup = document.getElementById('guests-counter-group');
  const guestMinusBtn = document.getElementById('guest-minus');
  const guestPlusBtn = document.getElementById('guest-plus');
  const guestCountDisplay = document.getElementById('guest-count-display');
  const rsvpModal = document.getElementById('rsvp-modal');
  const rsvpModalMessage = document.getElementById('rsvp-modal-message');
  const btnWhatsappShare = document.getElementById('btn-whatsapp-share');
  const btnModalClose = document.getElementById('btn-modal-close');
  
  // Calendar button
  const btnSaveDate = document.getElementById('btn-save-date');
  
  // Gallery Lightbox
  const galleryLightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryCards = document.querySelectorAll('.gallery-item-card');

  // State
  let isAudioPlaying = false;
  let guestCount = 1;
  let attendanceStatus = 'accept';
  let submittedGuestName = '';


  // ==================== 2. AUDIO PLAYBACK ====================
  function toggleAudio(forcePlay = null) {
    if (forcePlay === true || (!isAudioPlaying && forcePlay === null)) {
      weddingAudio.play().then(() => {
        isAudioPlaying = true;
        audioToggleBtn.classList.add('playing');
      }).catch(err => {
        console.log('Audio autoplay prevented:', err);
      });
    } else {
      weddingAudio.pause();
      isAudioPlaying = false;
      audioToggleBtn.classList.remove('playing');
    }
  }

  audioToggleBtn.addEventListener('click', () => {
    toggleAudio();
  });

  if (reelAudioBtn) {
    reelAudioBtn.addEventListener('click', () => {
      toggleAudio();
    });
  }


  // ==================== 3. COVER -> STORY VIDEO -> MAIN FLOW ====================
  // Lock scroll events on cover and story screen
  if (coverScreen) {
    coverScreen.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    coverScreen.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  }
  if (storyOverlay) {
    storyOverlay.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    storyOverlay.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  }

  btnOpenInvitation.addEventListener('click', () => {
    // 1. Play soundtrack
    toggleAudio(true);

    // 2. Hide cover screen with smooth transition
    coverScreen.classList.add('opened');

    // 3. Show story video reel
    storyOverlay.classList.add('active');

    // 4. Play video (muted background voice, preserving ambient wedding soundtrack)
    if (storyVideo) {
      storyVideo.muted = true;
      storyVideo.volume = 0;
      storyVideo.currentTime = 0;
      storyVideo.play().catch(e => console.log('Video play caught:', e));
    }

    // 5. Hide navigation during story
    floatingNavBar.classList.add('hidden');
    if (floatingPromoPill) floatingPromoPill.classList.add('hidden');
  });

  function closeStoryVideo() {
    // Stop video
    if (storyVideo) {
      storyVideo.pause();
    }
    // Fade out overlay
    storyOverlay.classList.remove('active');

    // Unlock scrolling for main invitation
    document.body.classList.remove('cover-locked');

    // Reveal floating bottom bar and promo pill
    floatingNavBar.classList.remove('hidden');
    if (floatingPromoPill) floatingPromoPill.classList.remove('hidden');

    // Ensure page starts at top of invitation
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger celebratory petal burst
    triggerPetalBurst();
  }

  // Skip button or tapping video end
  if (reelSkipBtn) {
    reelSkipBtn.addEventListener('click', closeStoryVideo);
  }

  if (storyVideo) {
    storyVideo.addEventListener('ended', closeStoryVideo);
  }


  // Check URL query param for dynamic guest name: ?to=Thisaru+Dilhara or ?name=Thisaru+Dilhara
  const urlParams = new URLSearchParams(window.location.search);
  const guestNameParam = urlParams.get('to') || urlParams.get('name') || urlParams.get('guest');
  if (guestNameParam) {
    const formattedName = decodeURIComponent(guestNameParam).trim();
    const guestDisplayEl = document.getElementById('personalized-guest-name');
    const guestInputEl = document.getElementById('guest-name');
    if (guestDisplayEl) guestDisplayEl.textContent = formattedName;
    if (guestInputEl) guestInputEl.value = formattedName;
  }

  // ==================== 4. LIVE COUNTDOWN TIMER ====================
  // Wedding Date: Thursday, 29th October 2026, 09:00:00 (Sri Lanka UTC+5:30)
  const targetWeddingDate = new Date('2026-10-29T09:00:00+05:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetWeddingDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  // ==================== 5. SAVE THE DATE (CALENDAR) ====================
  if (btnSaveDate) {
    btnSaveDate.addEventListener('click', () => {
      const title = encodeURIComponent('Wedding of Sachini & Sachin');
      const details = encodeURIComponent('Sri Suba Mangalam! Celebrating the marriage of Sachini & Sachin at Nature Lanka Hotel, Dehiattakandiya, Sri Lanka. Poruwa Ceremony at 9.40 AM. Contacts: Sachin (0701021529), Sachini (0704154704).');
      const location = encodeURIComponent('Nature Lanka Hotel, Dehiattakandiya, Eastern Province, Sri Lanka');
      
      // Google Calendar link: Oct 29, 2026 09:00 to 17:00 SLT (UTC+5:30) -> 03:30 UTC to 11:30 UTC
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261029T033000Z/20261029T113000Z&details=${details}&location=${location}`;
      
      window.open(gcalUrl, '_blank');
    });
  }


  // ==================== 6. RSVP FORM LOGIC ====================
  // Radio pills toggle
  if (pillAccept && pillDecline) {
    pillAccept.addEventListener('click', () => {
      pillAccept.classList.add('active');
      pillDecline.classList.remove('active');
      pillAccept.querySelector('input').checked = true;
      attendanceStatus = 'accept';
      guestsCounterGroup.style.display = 'block';
    });

    pillDecline.addEventListener('click', () => {
      pillDecline.classList.add('active');
      pillAccept.classList.remove('active');
      pillDecline.querySelector('input').checked = true;
      attendanceStatus = 'decline';
      guestsCounterGroup.style.display = 'none';
    });
  }

  // Guests Stepper
  if (guestMinusBtn && guestPlusBtn) {
    guestMinusBtn.addEventListener('click', () => {
      if (guestCount > 1) {
        guestCount--;
        guestCountDisplay.textContent = guestCount;
      }
    });

    guestPlusBtn.addEventListener('click', () => {
      if (guestCount < 10) {
        guestCount++;
        guestCountDisplay.textContent = guestCount;
      }
    });
  }

  // RSVP Submit
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submittedGuestName = document.getElementById('guest-name').value.trim() || 'Thisaru Dilhara';
      const guestMessage = document.getElementById('guest-message') ? document.getElementById('guest-message').value.trim() : '';

      // Save submission to localStorage for Admin Panel
      try {
        const newRsvp = {
          id: 'rsvp_' + Date.now(),
          name: submittedGuestName,
          attendance: attendanceStatus,
          guests: attendanceStatus === 'accept' ? guestCount : 0,
          message: guestMessage,
          timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
        };
        const currentList = JSON.parse(localStorage.getItem('wedding_rsvp_submissions') || '[]');
        currentList.unshift(newRsvp);
        localStorage.setItem('wedding_rsvp_submissions', JSON.stringify(currentList));
      } catch (err) {
        console.error('Storage error:', err);
      }

      triggerPetalBurst(80);

      // Show modal
      if (attendanceStatus === 'accept') {
        rsvpModalMessage.innerHTML = `Ayubowan <strong>${submittedGuestName}</strong>! We are overjoyed that you will be joining us with <strong>${guestCount} guest(s)</strong> on 29<sup>th</sup> October 2026 at Nature Lanka Hotel, Dehiattakandiya!`;
      } else {
        rsvpModalMessage.innerHTML = `Thank you <strong>${submittedGuestName}</strong> for letting us know. You will be warmly remembered in our thoughts!`;
      }
      rsvpModal.classList.add('active');
    });
  }

  // WhatsApp Share RSVP Direct to Sachin (0701021529)
  if (btnWhatsappShare) {
    btnWhatsappShare.addEventListener('click', () => {
      let text = '';
      if (attendanceStatus === 'accept') {
        text = `*Wedding RSVP — Sachini & Sachin*%0A%0AHello Sachin & Sachini! This is *${submittedGuestName}*. I am delighted to confirm that I will be joyfully attending your wedding on *Thursday, 29th October 2026* at *Nature Lanka Hotel, Dehiattakandiya* with *${guestCount} guest(s)*!%0A%0ACongratulations & Suba Mangalam! 🥂💐`;
      } else {
        text = `*Wedding RSVP — Sachini & Sachin*%0A%0AHello Sachin & Sachini! This is *${submittedGuestName}*. Unfortunately, I won't be able to attend your wedding on 29th October 2026, but I send my warmest wishes and heartfelt blessings for a wonderful marriage! 💖`;
      }
      const whatsappUrl = `https://api.whatsapp.com/send?phone=94701021529&text=${text}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // Close Modal
  if (btnModalClose) {
    btnModalClose.addEventListener('click', () => {
      rsvpModal.classList.remove('active');
    });
  }
  const modalBackdrop = document.querySelector('.rsvp-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => {
      rsvpModal.classList.remove('active');
    });
  }


  // ==================== 7. PHOTO GALLERY LIGHTBOX ====================
  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const caption = card.querySelector('.gallery-caption');
      if (img && galleryLightbox) {
        lightboxImg.src = img.dataset.full || img.src;
        lightboxCaption.textContent = caption ? caption.textContent : 'Sachini & Sachin';
        galleryLightbox.classList.add('active');
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      galleryLightbox.classList.remove('active');
    });
  }
  const lightboxBackdrop = document.querySelector('.lightbox-backdrop');
  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', () => {
      galleryLightbox.classList.remove('active');
    });
  }


  // ==================== 8. FLOATING NAVBAR SCROLL SPY ====================
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersectObserver && entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          if (item.getAttribute('data-target') === id) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // Smooth scroll for nav items
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  // ==================== 9. CANVAS AMBIENT PETALS & SPARKLES ====================
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Petal {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -20 - Math.random() * 50;
      this.size = 8 + Math.random() * 12;
      this.speedY = 0.8 + Math.random() * 1.6;
      this.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.8;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 1.5;
      this.opacity = 0.4 + Math.random() * 0.45;
      this.isSparkle = Math.random() < 0.25;
      // Soft rose / ivory / gold
      const colors = [
        'rgba(248, 218, 222, ',  // soft pink petal
        'rgba(255, 245, 238, ',  // ivory petal
        'rgba(229, 203, 142, ',  // golden sparkle
      ];
      this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.015) * 0.7 + this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y > height + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);

      if (this.isSparkle) {
        // Draw 4-point star sparkle
        ctx.fillStyle = `rgba(235, 205, 130, ${this.opacity})`;
        ctx.beginPath();
        const s = this.size * 0.4;
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      } else {
        // Draw delicate organic flower petal
        ctx.fillStyle = `${this.colorPrefix}${this.opacity})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Create initial pool of particles
  const particleCount = window.innerWidth < 600 ? 22 : 36;
  for (let i = 0; i < particleCount; i++) {
    const p = new Petal();
    p.y = Math.random() * height; // scatter vertically initially
    particles.push(p);
  }

  function triggerPetalBurst(count = 45) {
    for (let i = 0; i < count; i++) {
      const p = new Petal();
      p.x = width / 2 + (Math.random() - 0.5) * 200;
      p.y = height / 3 + (Math.random() - 0.5) * 100;
      p.speedY = 1.5 + Math.random() * 3;
      p.speedX = (Math.random() - 0.5) * 4;
      p.size = 10 + Math.random() * 14;
      p.opacity = 0.8;
      particles.push(p);
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Keep pool size bounded
    if (particles.length > 70) {
      particles.splice(0, particles.length - 70);
    }

    requestAnimationFrame(animate);
  }
  animate();

});
