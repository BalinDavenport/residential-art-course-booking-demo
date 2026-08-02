const STORAGE_KEY = "residential-art-booking-demo-state-v3";

const courses = [
  {
    id: "mixed-media-spring",
    tutor: "Guest tutor",
    title: "Colour & light in mixed media",
    medium: "Mixed media",
    filter: "mixed-media",
    dates: "Sample dates · 12–15 February 2027",
    duration: "3 nights",
    modelFee: "",
    packages: [
      { id: "shared", name: "Shared room", price: 695, capacity: 8, booked: 3 },
      { id: "single", name: "Single room", price: 775, capacity: 4, booked: 2 },
      { id: "nonres", name: "Non-residential", price: 340, capacity: 6, booked: 1 }
    ]
  },
  {
    id: "pastel-spring",
    tutor: "Visiting tutor",
    title: "Pastel with confidence",
    medium: "Pastel",
    filter: "pastel",
    dates: "Sample dates · 6–11 April 2027",
    duration: "5 nights",
    modelFee: "+ optional materials fee",
    packages: [
      { id: "shared", name: "Shared room", price: 895, capacity: 8, booked: 7 },
      { id: "single", name: "Single room", price: 995, capacity: 4, booked: 4 },
      { id: "nonres", name: "Non-residential", price: 445, capacity: 6, booked: 5 }
    ]
  },
  {
    id: "watercolour-autumn",
    tutor: "Course tutor",
    title: "Atmosphere in watercolour",
    medium: "Watercolour",
    filter: "watercolour",
    dates: "Dates to be confirmed · Autumn 2027",
    duration: "6 nights",
    modelFee: "",
    packages: [
      { id: "shared", name: "Shared room", price: 1095, capacity: 8, booked: 8 },
      { id: "single", name: "Single room", price: 1210, capacity: 4, booked: 4 },
      { id: "nonres", name: "Non-residential", price: 590, capacity: 6, booked: 6 }
    ]
  }
];

let state = loadState();
let selectedCourseId = null;
let toastTimer;

const courseGrid = document.querySelector("#course-grid");
const ownerList = document.querySelector("#owner-list");
const ownerSummary = document.querySelector("#owner-summary");
const ownerView = document.querySelector("#owner-view");
const customerSections = document.querySelectorAll(".customer-only");
const viewToggle = document.querySelector("#view-toggle");
const viewToggleLabel = document.querySelector("#view-toggle-label");
const bookingDialog = document.querySelector("#booking-dialog");
const waitlistDialog = document.querySelector("#waitlist-dialog");
const bookingForm = document.querySelector("#booking-form");
const waitlistForm = document.querySelector("#waitlist-form");

function cloneInitialState() {
  return courses.map((course) => ({
    id: course.id,
    packages: course.packages.map(({ id, capacity, booked }) => ({ id, capacity, booked }))
  }));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : cloneInitialState();
  } catch {
    return cloneInitialState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCourseState(courseId) {
  return state.find((course) => course.id === courseId);
}

function remaining(courseId, packageId) {
  const item = getCourseState(courseId).packages.find((pkg) => pkg.id === packageId);
  return Math.max(0, item.capacity - item.booked);
}

function courseStatus(courseId) {
  const spaces = getCourseState(courseId).packages.map((pkg) => Math.max(0, pkg.capacity - pkg.booked));
  const total = spaces.reduce((sum, value) => sum + value, 0);
  if (total === 0) return { label: "Waiting list", className: "full" };
  if (Math.min(...spaces) === 0 || total <= 3) return { label: "Limited places", className: "limited" };
  return { label: "Places available", className: "available" };
}

function renderCourses(filter = document.querySelector(".filter.active")?.dataset.filter || "all") {
  const visible = courses.filter((course) => filter === "all" || course.filter === filter);
  courseGrid.innerHTML = visible.map((course) => {
    const status = courseStatus(course.id);
    const action = status.className === "full" ? "Join waiting list" : "View options & reserve";
    return `
      <article class="course-card" data-course="${course.id}">
        <div class="course-visual">
          <span class="medium-label">${course.medium}</span>
          <span class="status-pill ${status.className}">${status.label}</span>
        </div>
        <div class="course-content">
          <p class="course-meta">${course.dates} · ${course.duration}</p>
          <h3>${course.title}</h3>
          <p class="tutor">with ${course.tutor}</p>
          <div class="price-lines">
            ${course.packages.map((pkg) => `<div class="price-line"><span>${pkg.name}</span><strong>£${pkg.price}</strong></div>`).join("")}
          </div>
          ${course.modelFee ? `<p class="model-fee">${course.modelFee}</p>` : ""}
          <button class="primary-button course-action" type="button" data-action="${status.className === "full" ? "waitlist" : "book"}" data-course-id="${course.id}">${action}</button>
        </div>
      </article>`;
  }).join("");
}

function renderOwner() {
  const totals = courses.reduce((acc, course) => {
    getCourseState(course.id).packages.forEach((pkg) => {
      acc.capacity += pkg.capacity;
      acc.booked += pkg.booked;
    });
    return acc;
  }, { capacity: 0, booked: 0 });
  const openCourses = courses.filter((course) => courseStatus(course.id).className !== "full").length;
  ownerSummary.innerHTML = `
    <div class="summary-stat"><strong>${totals.booked}</strong><span>places booked</span></div>
    <div class="summary-stat"><strong>${totals.capacity - totals.booked}</strong><span>places remaining</span></div>
    <div class="summary-stat"><strong>${openCourses}</strong><span>courses open</span></div>
    <div class="summary-stat"><strong>${courses.length}</strong><span>courses shown</span></div>`;

  ownerList.innerHTML = courses.map((course) => {
    const courseState = getCourseState(course.id);
    const firstAvailable = courseState.packages.find((pkg) => pkg.booked < pkg.capacity);
    return `
      <article class="owner-course">
        <div class="owner-course-head">
          <h3>${course.tutor}<small>${course.dates} · ${courseStatus(course.id).label}</small></h3>
          ${course.packages.map((pkg) => {
            const current = courseState.packages.find((item) => item.id === pkg.id);
            return `<div class="capacity">
              <span>${pkg.name}</span>
              <strong>${current.booked} / ${current.capacity} booked</strong>
              <meter min="0" max="${current.capacity}" value="${current.booked}">${current.booked} of ${current.capacity}</meter>
            </div>`;
          }).join("")}
          <button class="phone-button" type="button" data-action="phone" data-course-id="${course.id}" data-package-id="${firstAvailable?.id || ""}" ${firstAvailable ? "" : "disabled"}>+ Add telephone booking</button>
        </div>
      </article>`;
  }).join("");
}

function openBooking(courseId) {
  const course = courses.find((item) => item.id === courseId);
  selectedCourseId = courseId;
  document.querySelector("#booking-subtitle").textContent = `${course.tutor} · ${course.dates}`;
  document.querySelector("#package-choices").innerHTML = course.packages.map((pkg, index) => {
    const spaces = remaining(course.id, pkg.id);
    return `<label class="package-choice">
      <input type="radio" name="package" value="${pkg.id}" ${spaces === 0 ? "disabled" : ""} ${spaces > 0 && index === course.packages.findIndex((item) => remaining(course.id, item.id) > 0) ? "checked" : ""} required />
      <span>${pkg.name}<br /><small>${spaces > 0 ? `${spaces} place${spaces === 1 ? "" : "s"} remaining` : "Full"}</small></span>
      <strong>£${pkg.price}</strong>
    </label>`;
  }).join("");
  bookingDialog.showModal();
}

function openWaitlist(courseId) {
  const course = courses.find((item) => item.id === courseId);
  selectedCourseId = courseId;
  document.querySelector("#waitlist-subtitle").textContent = `${course.tutor} · ${course.dates}`;
  waitlistDialog.showModal();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
}

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderCourses(button.dataset.filter);
  });
});

courseGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "book") openBooking(button.dataset.courseId);
  if (button.dataset.action === "waitlist") openWaitlist(button.dataset.courseId);
});

ownerList.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="phone"]');
  if (!button || button.disabled) return;
  const courseState = getCourseState(button.dataset.courseId);
  const pkg = courseState.packages.find((item) => item.id === button.dataset.packageId);
  if (pkg && pkg.booked < pkg.capacity) {
    pkg.booked += 1;
    saveState();
    renderOwner();
    renderCourses();
    showToast("Telephone booking added and availability updated.");
  }
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  const formData = new FormData(bookingForm);
  const pkg = getCourseState(selectedCourseId).packages.find((item) => item.id === formData.get("package"));
  if (!pkg || pkg.booked >= pkg.capacity) return;
  pkg.booked += 1;
  saveState();
  renderCourses();
  renderOwner();
  bookingDialog.close();
  bookingForm.reset();
  showToast("Demonstration booking complete—owner availability updated.");
});

waitlistForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!waitlistForm.reportValidity()) return;
  waitlistDialog.close();
  waitlistForm.reset();
  showToast("Added to the demonstration waiting list. Nothing was sent.");
});

document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

[bookingDialog, waitlistDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

viewToggle.addEventListener("click", () => {
  const shouldShowOwner = ownerView.hidden;
  ownerView.hidden = !shouldShowOwner;
  customerSections.forEach((section) => { section.hidden = shouldShowOwner; });
  viewToggleLabel.textContent = shouldShowOwner ? "Show guest view" : "Show owner view";
  if (shouldShowOwner) renderOwner();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector("#reset-demo").addEventListener("click", () => {
  state = cloneInitialState();
  saveState();
  renderCourses();
  renderOwner();
  showToast("Demonstration availability reset.");
});

renderCourses();
renderOwner();
