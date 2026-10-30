// Caminho: js/main.js
// Atualize o telefone abaixo com o WhatsApp oficial da 1st Stands.
const WHATSAPP_PHONE = "5511999999999";
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
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));

    if (counter) {
      counter.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span> / ${String(slides.length).padStart(2, "0")}`;
    }
  }

  function restartTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => {
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
  if (year) year.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupCarousel();
  setupMobileMenu();
  setCurrentYear();
});
