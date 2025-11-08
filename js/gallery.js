// Gallery Management System
class GalleryManager {
  constructor() {
    this.animations = [];
    this.galleryGrid = document.getElementById("gallery-grid");
    this.modal = document.getElementById("video-modal");
    this.modalTitle = document.getElementById("modal-title");
    this.modalDescription = document.getElementById("modal-description");
    this.videoContainer = document.getElementById("video-container");
    this.youtubeLink = document.getElementById("youtube-link");
    this.modalClose = document.querySelector(".modal-close");
    this.modalOverlay = document.querySelector(".modal-overlay");

    this.init();
  }

  async init() {
    await this.loadAnimations();
    this.renderGallery();
    this.setupModalListeners();
  }

  async loadAnimations() {
    try {
      const response = await fetch("assets/data/videos.json");
      const data = await response.json();
      this.animations = data.animations;
    } catch (error) {
      console.error("Error loading animations:", error);
      this.showError();
    }
  }

  renderGallery() {
    if (this.animations.length === 0) {
      this.galleryGrid.innerHTML =
        '<div class="loading">No animations found.</div>';
      return;
    }

    this.galleryGrid.innerHTML = "";

    this.animations.forEach((animation) => {
      const item = this.createGalleryItem(animation);
      this.galleryGrid.appendChild(item);
    });
  }

  createGalleryItem(animation) {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.setAttribute("data-id", animation.id);
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `View ${animation.title}`);

    const typeLabel = this.getTypeLabel(animation.type);

    item.innerHTML = `
      <img 
        src="${animation.poster}" 
        alt="${animation.title} poster" 
        class="gallery-item-poster"
        loading="lazy"
      >
      <div class="gallery-item-info">
        <h3 class="gallery-item-title">${animation.title}</h3>
        ${
          animation.releaseYear
            ? `<p class="gallery-item-meta">${animation.releaseYear}</p>`
            : ""
        }
        <span class="gallery-item-type">${typeLabel}</span>
      </div>
    `;

    item.addEventListener("click", () => this.openModal(animation));
    item.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.openModal(animation);
      }
    });

    return item;
  }

  getTypeLabel(type) {
    const labels = {
      full: "Full Movie",
      trailer: "Trailer",
      series: "Series",
      short: "Short Film",
    };
    return labels[type] || type;
  }

  openModal(animation) {
    this.modalTitle.textContent = animation.title;
    this.modalDescription.textContent =
      animation.description || "No description available.";

    // Clear previous video
    this.videoContainer.innerHTML = "";

    if (animation.youtubeId) {
      // Create YouTube embed
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${animation.youtubeId}?autoplay=1`;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      this.videoContainer.appendChild(iframe);

      // Set YouTube link
      this.youtubeLink.href = `https://www.youtube.com/watch?v=${animation.youtubeId}`;
      this.youtubeLink.classList.remove("disabled");
    } else {
      // No video available
      this.videoContainer.innerHTML =
        '<div class="no-video-message">Video coming soon!</div>';
      this.youtubeLink.href = "#";
      this.youtubeLink.classList.add("disabled");
    }

    // Show modal
    this.modal.classList.add("active");
    document.body.classList.add("modal-open");

    // Focus on close button for accessibility
    this.modalClose.focus();
  }

  closeModal() {
    this.modal.classList.remove("active");
    document.body.classList.remove("modal-open");

    // Stop video playback
    this.videoContainer.innerHTML = "";
  }

  setupModalListeners() {
    // Close button
    this.modalClose.addEventListener("click", () => this.closeModal());

    // Overlay click
    this.modalOverlay.addEventListener("click", () => this.closeModal());

    // Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("active")) {
        this.closeModal();
      }
    });
  }

  showError() {
    this.galleryGrid.innerHTML = `
      <div class="loading">
        Failed to load gallery. Please try again later.
      </div>
    `;
  }
}

// Initialize gallery when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new GalleryManager();
});
