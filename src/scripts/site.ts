document.body.classList.remove("no-js");
const menu = document.querySelector<HTMLDialogElement>("#mobile-menu");
const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
toggle?.addEventListener("click", () => {
  menu?.showModal();
  document.body.classList.add("menu-open");
});
document
  .querySelector(".menu-close")
  ?.addEventListener("click", () => menu?.close());
menu?.addEventListener("close", () => {
  document.body.classList.remove("menu-open");
  toggle?.focus();
});
menu?.addEventListener("click", (e) => {
  if (e.target === menu) menu.close();
});
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!reduced.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.classList.add("will-reveal");
    observer.observe(el);
  });
}
const filters = document.querySelectorAll<HTMLButtonElement>("[data-filter]");
filters.forEach((button) =>
  button.addEventListener("click", () => {
    const value = button.dataset.filter;
    filters.forEach((filter) =>
      filter.setAttribute("aria-pressed", String(filter === button)),
    );
    let count = 0;
    document
      .querySelectorAll<HTMLElement>("[data-role-sector]")
      .forEach((role) => {
        role.hidden = value !== "all" && role.dataset.roleSector !== value;
        if (!role.hidden) count++;
      });
    const status = document.querySelector("#role-status");
    if (status) status.textContent = `${count} role examples shown`;
  }),
);
