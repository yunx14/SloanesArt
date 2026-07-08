const artworks = [
  {
    title: "Dog With Collar",
    category: "Animals",
    image: "dog_with_collar.jpg",
    alt: "Drawing of a dog wearing a collar",
    description: "A loyal friend with a big personality and careful details.",
    layout: "tall"
  },
  {
    title: "Panda Bear",
    category: "Animals",
    image: "panda_bear.jpg",
    alt: "Drawing of a panda bear",
    description: "A sweet black-and-white character with a gentle expression.",
    layout: "tall"
  },
  {
    title: "Pigeon",
    category: "Animals",
    image: "pigeon.jpg",
    alt: "Paper collage of a blue pigeon on yellow paper",
    description: "A bright paper collage with a bold shape and a funny sentence.",
    layout: "tall"
  },
  {
    title: "Rainbow Cat",
    category: "Animals",
    image: "rainbow_cat.jpg",
    alt: "Colorful drawing of an orange cat with a rainbow background",
    description: "A glowing orange cat surrounded by bold bands of color.",
    layout: "tall"
  },
  {
    title: "Funny Pirate",
    category: "Characters",
    image: "funny_pirate.jpg",
    alt: "Drawing of a funny pirate",
    description: "A playful character piece with costume, humor, and attitude.",
    layout: "tall"
  },
  {
    title: "Noura",
    category: "Characters",
    image: "noura.jpg",
    alt: "Crayon portrait of Noura wearing a black dress",
    description: "A bold portrait with warm colors and a confident black dress.",
    layout: "tall"
  },
  {
    title: "Textured Cupcake",
    category: "Food",
    image: "textured_cupcake.jpg",
    alt: "Textured cupcake craft with colorful tissue paper frosting",
    description: "A bright cupcake craft with soft, layered frosting textures.",
    layout: "tall"
  },
  {
    title: "Gingerbread House",
    category: "Places",
    image: "gingerbread_house.jpg",
    alt: "Drawing of a gingerbread house",
    description: "A cozy candy-world building with a storybook feeling.",
    layout: "tall"
  },
  {
    title: "The Zoo",
    category: "Places",
    image: "the_zoo.jpg",
    alt: "Colorful drawing of a zoo",
    description: "A full scene packed with energy, animals, and tiny discoveries.",
    layout: "tall"
  }
];

const filterBar = document.querySelector("[data-filter-bar]");
const artGrid = document.querySelector("[data-art-grid]");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxTitle = document.querySelector("[data-lightbox-title]");
const lightboxCategory = document.querySelector("[data-lightbox-category]");
const lightboxDescription = document.querySelector("[data-lightbox-description]");
const closeButton = document.querySelector("[data-close-lightbox]");
const zoomOutButton = document.querySelector("[data-zoom-out]");
const zoomInButton = document.querySelector("[data-zoom-in]");
const zoomResetButton = document.querySelector("[data-zoom-reset]");
const zoomLevel = document.querySelector("[data-zoom-level]");

let currentIndex = artworks.length - 1;
let currentZoom = 1;
let currentFilter = "all";
let lastFocusedElement = null;

function getCategorySlug(category) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const characters = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return characters[character];
  });
}

function getLayoutClass(artwork) {
  return artwork.layout ? ` ${escapeHtml(artwork.layout)}` : "";
}

function renderFilters() {
  const categories = [...new Map(artworks.map((artwork) => [
    getCategorySlug(artwork.category),
    artwork.category
  ]))];

  filterBar.innerHTML = [
    `<button class="filter-button active" type="button" data-filter="all" role="tab" aria-selected="true">All</button>`,
    ...categories.map(([slug, category]) => (
      `<button class="filter-button" type="button" data-filter="${escapeHtml(slug)}" role="tab" aria-selected="false">${escapeHtml(category)}</button>`
    ))
  ].join("");
}

function renderArtCards() {
  artGrid.innerHTML = artworks.map((artwork, index) => {
    const category = getCategorySlug(artwork.category);

    return `
      <article class="art-card${getLayoutClass(artwork)}" data-category="${escapeHtml(category)}">
        <button class="art-open" type="button" data-art-index="${index}" aria-label="Open ${escapeHtml(artwork.title)}">
          <img src="${escapeHtml(artwork.image)}" alt="${escapeHtml(artwork.alt)}">
        </button>
        <div class="art-details">
          <p class="category">${escapeHtml(artwork.category)}</p>
          <h3>${escapeHtml(artwork.title)}</h3>
          <p>${escapeHtml(artwork.description)}</p>
        </div>
      </article>
    `;
  }).join("");
}

function renderGallery() {
  renderFilters();
  renderArtCards();
  setFilter(currentFilter);
}

function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll("[data-filter]").forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".art-card").forEach((card) => {
    const shouldShow = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("hidden", !shouldShow);
  });
}

function renderLightbox(index) {
  const artwork = artworks[index];

  if (!artwork) {
    return;
  }

  currentIndex = index;
  lightboxImage.src = artwork.image;
  lightboxImage.alt = artwork.alt;
  lightboxTitle.textContent = artwork.title;
  lightboxCategory.textContent = artwork.category;
  lightboxDescription.textContent = artwork.description;
  setZoom(1);
}

function setZoom(value) {
  currentZoom = Math.min(Math.max(value, 0.6), 2.5);
  lightboxImage.style.setProperty("--zoom-width", `${Math.round(currentZoom * 100)}%`);
  zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
  zoomOutButton.disabled = currentZoom <= 0.6;
  zoomInButton.disabled = currentZoom >= 2.5;
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

renderGallery();

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");

  if (button) {
    setFilter(button.dataset.filter);
  }
});

artGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-art-index]");

  if (button) {
    openLightbox(Number(button.dataset.artIndex));
  }
});

closeButton.addEventListener("click", closeLightbox);
zoomOutButton.addEventListener("click", () => setZoom(currentZoom - 0.2));
zoomInButton.addEventListener("click", () => setZoom(currentZoom + 0.2));
zoomResetButton.addEventListener("click", () => setZoom(1));

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

  if (event.key === "-" || event.key === "_") {
    setZoom(currentZoom - 0.2);
  }

  if (event.key === "+" || event.key === "=") {
    setZoom(currentZoom + 0.2);
  }

  if (event.key === "0") {
    setZoom(1);
  }
});
