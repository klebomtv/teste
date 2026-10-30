
// Caminho: js/main.js

const WHATSAPP_PHONE = "5511961303203";
const WHATSAPP_MESSAGE = "Olá! Gostaria de solicitar um orçamento para um stand.";

function setupWhatsAppLinks() {
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

function setupCarousel() {
  const slides = [...document.querySelectorAll(".hero-slide")];
  const dots = [...document.querySelectorAll("[data-slide]")];
  const counter = document.querySelector(".hero-index");

  if (slides.length < 2) return;

  let activeIndex = 0;
  let timer;

  function showSlide(index) {
    activeIndex = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });

    if (counter) {
      counter.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span> / ${String(slides.length).padStart(2, "0")}`;
    }
  }

  function restartTimer() {
    clearInterval(timer);

    timer = setInterval(() => {
      showSlide((activeIndex + 1) % slides.length);
    }, 5000);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slide));
      restartTimer();
    });
  });

  showSlide(0);
  restartTimer();
}

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    });
  });
}

function setCurrentYear() {
  const year = document.querySelector("#current-year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

async function setupPortfolio() {
  const gallery = document.querySelector("#portfolio-grid");

  if (!gallery) return;

  try {
    const response = await fetch("photos.json");

    if (!response.ok) {
      throw new Error("Não foi possível carregar a lista de fotos.");
    }

    const photos = await response.json();

    if (!photos.length) {
      gallery.innerHTML = '<p class="portfolio-message">Nenhum projeto encontrado.</p>';
      return;
    }

    gallery.innerHTML = photos.map((photo) => `
      <article class="portfolio-card">
        <img
          src="${photo.src}"
          alt="${photo.title}"
          loading="lazy"
        >

        <div class="portfolio-card-info">
          <h2>${photo.title}</h2>
          <p>${photo.description}</p>
        </div>
      </article>
    `).join("");

  } catch (error) {
    console.error("Erro no portfólio:", error);

    gallery.innerHTML = `
      <p class="portfolio-message">
        Não foi possível carregar os projetos.
      </p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupCarousel();
  setupMobileMenu();
  setCurrentYear();
  setupPortfolio();
});
