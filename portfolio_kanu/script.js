const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((section) => revealObserver.observe(section));

const pageProgressFill = document.getElementById("pageProgressFill");
let progressSources = [];

function isScrollableElement(element) {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  const canScroll = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
  return canScroll && element.scrollHeight > element.clientHeight + 2;
}

function collectProgressSources() {
  const sources = [];

  const root = document.scrollingElement || document.documentElement;
  if (root) {
    sources.push({
      type: "root",
      node: root,
      getTop: () => root.scrollTop || 0,
      getMax: () => Math.max(0, root.scrollHeight - root.clientHeight)
    });
  }

  document.querySelectorAll("main, .layout, .right-panel, section, aside").forEach((node) => {
    if (!isScrollableElement(node)) return;
    sources.push({
      type: "element",
      node,
      getTop: () => node.scrollTop || 0,
      getMax: () => Math.max(0, node.scrollHeight - node.clientHeight)
    });
  });

  return sources;
}

function updatePageProgress() {
  if (!pageProgressFill) return;
  if (!progressSources.length) progressSources = collectProgressSources();

  let active = progressSources[0];
  progressSources.forEach((source) => {
    if (!active || source.getTop() > active.getTop()) active = source;
  });

  if (!active) {
    pageProgressFill.style.width = "0%";
    return;
  }

  const maxScroll = active.getMax();
  const top = active.getTop();
  const percent = maxScroll > 0 ? (top / maxScroll) * 100 : 0;
  pageProgressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}

function bindProgressEvents() {
  progressSources = collectProgressSources();
  progressSources.forEach((source) => {
    if (source.type === "element") {
      source.node.addEventListener("scroll", updatePageProgress, { passive: true });
    }
  });
}

window.addEventListener("scroll", updatePageProgress, { passive: true });
window.addEventListener("resize", () => {
  bindProgressEvents();
  updatePageProgress();
});
window.addEventListener("hashchange", updatePageProgress);
window.addEventListener("load", () => {
  bindProgressEvents();
  updatePageProgress();
});
document.addEventListener("DOMContentLoaded", () => {
  bindProgressEvents();
  updatePageProgress();
});
requestAnimationFrame(updatePageProgress);
setTimeout(() => {
  bindProgressEvents();
  updatePageProgress();
}, 80);

const statElements = Array.from(document.querySelectorAll(".stats-row h3"));

function animateCounter(element) {
  const text = element.textContent.trim();
  const number = Number(text.replace(/[^\d.]/g, ""));
  if (!number) return;

  const hasK = text.includes("K");
  const hasPercent = text.includes("%");
  const hasPlus = text.includes("+");
  const duration = 1400;
  const start = performance.now();

  function frame(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const current = number * progress;
    let formatted = Number.isInteger(number) ? Math.floor(current).toString() : current.toFixed(1);

    if (hasK) formatted += "K";
    if (hasPercent) formatted += "%";
    if (hasPlus) formatted = `+${formatted}`;

    element.textContent = formatted;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const statsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.8 }
);

statElements.forEach((item) => statsObserver.observe(item));

const sections = document.querySelectorAll("section[id], header[id]");
const navLinks = document.querySelectorAll(".top-nav a");

function scrollToHashTarget(rawHash, shouldPushState = false) {
  if (!rawHash || rawHash === "#") return;

  const target = document.querySelector(rawHash);
  if (!target) return;

  if (shouldPushState && window.location.hash !== rawHash) {
    history.pushState(null, "", rawHash);
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    event.preventDefault();
    scrollToHashTarget(href, true);
  });
});

window.addEventListener("hashchange", () => {
  scrollToHashTarget(window.location.hash);
});

window.addEventListener("load", () => {
  if (window.location.hash) {
    setTimeout(() => {
      scrollToHashTarget(window.location.hash);
    }, 30);
  }
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.style.color = active ? "#fff" : "#d4cfdd";
        });
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
);

sections.forEach((section) => sectionObserver.observe(section));

document.querySelectorAll(".tilt-card").forEach((tiltCard) => {
  tiltCard.addEventListener("mousemove", (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateX = ((y - midY) / midY) * -4;
    const rotateY = ((x - midX) / midX) * 4;
    tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  tiltCard.addEventListener("mouseleave", () => {
    tiltCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  });
});

const campaignLaunchCard = document.querySelector(".gallery-launch");
const campaignSliderTrack = document.querySelector(".campaign-slider-track");
const campaignSlides = Array.from(document.querySelectorAll(".campaign-slider-track img"));
const campaignDots = Array.from(document.querySelectorAll(".campaign-slider-dot"));
const campaignPrev = document.querySelector("[data-campaign-prev]");
const campaignNext = document.querySelector("[data-campaign-next]");
let campaignSlideIndex = 0;
let campaignSliderInterval = null;

function renderCampaignSlider(index) {
  if (!campaignSlides.length || !campaignSliderTrack) return;
  campaignSlideIndex = (index + campaignSlides.length) % campaignSlides.length;
  campaignSliderTrack.style.transform = `translateX(-${campaignSlideIndex * 100}%)`;

  campaignDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === campaignSlideIndex);
  });
}

function startCampaignSliderAutoplay() {
  if (campaignSliderInterval || !campaignSlides.length) return;
  campaignSliderInterval = setInterval(() => {
    renderCampaignSlider(campaignSlideIndex + 1);
  }, 1200);
}

function stopCampaignSliderAutoplay() {
  if (campaignSliderInterval) {
    clearInterval(campaignSliderInterval);
    campaignSliderInterval = null;
  }
}

if (campaignLaunchCard && campaignSlides.length) {
  renderCampaignSlider(0);

  campaignLaunchCard.addEventListener("mouseenter", startCampaignSliderAutoplay);
  campaignLaunchCard.addEventListener("mouseleave", stopCampaignSliderAutoplay);
  campaignLaunchCard.addEventListener("focusin", startCampaignSliderAutoplay);
  campaignLaunchCard.addEventListener("focusout", stopCampaignSliderAutoplay);

  campaignDots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", (event) => {
      event.stopPropagation();
      renderCampaignSlider(dotIndex);
    });
  });

  [campaignPrev, campaignNext].forEach((button, buttonIndex) => {
    if (!button) return;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (buttonIndex === 0) renderCampaignSlider(campaignSlideIndex - 1);
      if (buttonIndex === 1) renderCampaignSlider(campaignSlideIndex + 1);
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopCampaignSliderAutoplay();
  });
}

const galleryModal = document.getElementById("campaignGalleryModal");
const galleryMainImage = document.getElementById("galleryMainImage");
const galleryCaption = document.getElementById("galleryCaption");
const galleryThumbs = Array.from(document.querySelectorAll("#galleryThumbs .thumb"));
const galleryOpeners = document.querySelectorAll("[data-gallery-open]");
const galleryClosers = document.querySelectorAll("[data-gallery-close]");
const galleryPrev = document.querySelector("[data-gallery-prev]");
const galleryNext = document.querySelector("[data-gallery-next]");

const galleryItems = [
  { src: "assets/campaign-creative-01.png", caption: "Creative Preview 1" },
  { src: "assets/campaign-creative-02.png", caption: "Creative Preview 2" },
  { src: "assets/campaign-creative-03.png", caption: "Creative Preview 3" },
  { src: "assets/campaign-creative-04.png", caption: "Creative Preview 4" }
];

let currentGalleryIndex = 0;
let galleryRenderToken = 0;

function renderGallery(index, options = {}) {
  const { immediate = false } = options;
  currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[currentGalleryIndex];
  const token = ++galleryRenderToken;

  galleryThumbs.forEach((thumb, thumbIndex) => {
    thumb.classList.toggle("active", thumbIndex === currentGalleryIndex);
  });

  const applyFrame = () => {
    if (token !== galleryRenderToken) return;
    galleryMainImage.src = item.src;
    galleryCaption.textContent = item.caption;
    galleryMainImage.classList.remove("is-switching");
    galleryCaption.classList.remove("is-switching");
  };

  if (immediate) {
    applyFrame();
    return;
  }

  galleryMainImage.classList.add("is-switching");
  galleryCaption.classList.add("is-switching");

  const preloadImage = new Image();
  preloadImage.onload = () => {
    if (token !== galleryRenderToken) return;
    setTimeout(applyFrame, 65);
  };
  preloadImage.onerror = applyFrame;
  preloadImage.src = item.src;
}

function openGallery(index = 0) {
  renderGallery(index, { immediate: true });
  galleryModal.classList.add("open");
  galleryModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("gallery-open");
}

function closeGallery() {
  galleryModal.classList.remove("open");
  galleryModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("gallery-open");
}

galleryOpeners.forEach((trigger) => {
  trigger.addEventListener("click", () => openGallery(0));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openGallery(0);
    }
  });
});

galleryClosers.forEach((closer) => {
  closer.addEventListener("click", closeGallery);
});

galleryThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const index = Number(thumb.dataset.index);
    renderGallery(index);
  });
});

galleryPrev.addEventListener("click", () => renderGallery(currentGalleryIndex - 1));
galleryNext.addEventListener("click", () => renderGallery(currentGalleryIndex + 1));

document.addEventListener("keydown", (event) => {
  if (!galleryModal.classList.contains("open")) return;

  if (event.key === "Escape") closeGallery();
  if (event.key === "ArrowLeft") renderGallery(currentGalleryIndex - 1);
  if (event.key === "ArrowRight") renderGallery(currentGalleryIndex + 1);
});
