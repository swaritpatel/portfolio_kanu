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
