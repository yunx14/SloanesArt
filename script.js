const artworks = [
  {
    title: "Dog With Collar",
    category: "Animals",
    image: "dog_with_collar.jpg",
    alt: "Drawing of a dog wearing a collar",
    description: "A loyal friend with a big personality and careful details."
  },
  {
    title: "Panda Bear",
    category: "Animals",
    image: "panda_bear.jpg",
    alt: "Drawing of a panda bear",
    description: "A sweet black-and-white character with a gentle expression."
  },
  {
    title: "Funny Pirate",
    category: "Characters",
    image: "funny_pirate.jpg",
    alt: "Drawing of a funny pirate",
    description: "A playful character piece with costume, humor, and attitude."
  },
  {
    title: "Gingerbread House",
    category: "Places",
    image: "gingerbread_house.jpg",
    alt: "Drawing of a gingerbread house",
    description: "A cozy candy-world building with a storybook feeling."
  },
  {
    title: "The Zoo",
    category: "Places",
    image: "the_zoo.jpg",
    alt: "Colorful drawing of a zoo",
    description: "A full scene packed with energy, animals, and tiny discoveries."
  }
];

const filterButtons = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll(".art-card");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxTitle = document.querySelector("[data-lightbox-title]");
const lightboxCategory = document.querySelector("[data-lightbox-category]");
const lightboxDescription = document.querySelector("[data-lightbox-description]");
const openButtons = document.querySelectorAll("[data-art-index]");
const openFeatureButton = document.querySelector("[data-open-feature]");
const closeButton = document.querySelector("[data-close-lightbox]");
const prevButton = document.querySelector("[data-prev-art]");
const nextButton = document.querySelector("[data-next-art]");

let currentIndex = 4;
let lastFocusedElement = null;

function setFilter(filter) {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  cards.forEach((card) => {
    const shouldShow = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("hidden", !shouldShow);
  });
}

function renderLightbox(index) {
  const artwork = artworks[index];
  currentIndex = index;
  lightboxImage.src = artwork.image;
  lightboxImage.alt = artwork.alt;
  lightboxTitle.textContent = artwork.title;
  lightboxCategory.textContent = artwork.category;
  lightboxDescription.textContent = artwork.description;
}

function openLightbox(index) {
  lastFocusedElement = document.activeElement;
  renderLightbox(index);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  closeButton.focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function showNextArtwork(direction) {
  const nextIndex = (currentIndex + direction + artworks.length) % artworks.length;
  renderLightbox(nextIndex);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

openButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openLightbox(Number(button.dataset.artIndex));
  });
});

openFeatureButton.addEventListener("click", () => openLightbox(4));
closeButton.addEventListener("click", closeLightbox);
prevButton.addEventListener("click", () => showNextArtwork(-1));
nextButton.addEventListener("click", () => showNextArtwork(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("open")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    showNextArtwork(-1);
  }

  if (event.key === "ArrowRight") {
    showNextArtwork(1);
  }
});
