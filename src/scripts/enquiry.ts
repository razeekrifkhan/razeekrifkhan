import { company } from "../data";

const form = document.querySelector<HTMLFormElement>("#enquiry-form");
const review = document.querySelector<HTMLElement>("#enquiry-review");
const preview = document.querySelector<HTMLElement>("#brief-preview");
if (form) form.hidden = false;
const fallback = document.getElementById("enquiry-fallback");
if (fallback) fallback.hidden = true;
let brief = "";
const params = new URLSearchParams(window.location.search);
const sector = document.querySelector<HTMLSelectElement>("#sector");
const role = document.querySelector<HTMLInputElement>("#role");
if (
  sector &&
  params.get("sector") &&
  Array.from(sector.options).some((o) => o.value === params.get("sector"))
)
  sector.value = params.get("sector")!;
if (role && params.get("role")) role.value = params.get("role")!.slice(0, 150);
if (params.get("audience") === "jobseeker")
  document.querySelector<HTMLElement>("#jobseeker-notice")!.hidden = false;

function clearError(field: HTMLInputElement | HTMLSelectElement) {
  field.removeAttribute("aria-invalid");
  field.removeAttribute("aria-describedby");
  const error = document.getElementById(`${field.id}-error`);
  if (error) error.textContent = "";
}
form
  ?.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[required]")
  .forEach((field) => {
    field.addEventListener("input", () => clearError(field));
  });
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const errors: { id: string; message: string }[] = [];
  form
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>("[required]")
    .forEach((field) => {
      clearError(field);
      const label =
        form
          .querySelector(`label[for="${field.id}"]`)
          ?.textContent?.replace(" *", "") || "Privacy acknowledgement";
      let message = "";
      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        if (!field.checked)
          message = "Please acknowledge the privacy and enquiry information.";
      } else if (!field.value.trim())
        message = `Please enter ${label.toLowerCase()}.`;
      else if (field.id === "email" && !field.validity.valid)
        message = "Please enter a valid email address.";
      else if (field.id === "headcount" && !field.validity.valid)
        message = "Enter a whole number between 1 and 10,000.";
      if (message) {
        errors.push({ id: field.id, message });
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", `${field.id}-error`);
        document.getElementById(`${field.id}-error`)!.textContent = message;
      }
    });
  const summary = document.querySelector<HTMLElement>("#form-errors")!;
  summary.hidden = errors.length === 0;
  const list = summary.querySelector("ul")!;
  list.replaceChildren();
  if (errors.length) {
    errors.forEach((error) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${error.id}`;
      link.textContent = error.message;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById(error.id)?.focus();
      });
      item.append(link);
      list.append(item);
    });
    summary.focus();
    return;
  }
  const data = new FormData(form);
  const value = (key: string) => String(data.get(key) || "").trim();
  brief = [
    "Hello Victoria, I would like to discuss a workforce requirement.",
    "",
    `Company / employer: ${value("company")}`,
    `Contact name: ${value("name")}`,
    `Email: ${value("email")}`,
    `Phone / WhatsApp: ${value("phone") || "Not provided"}`,
    "",
    `Recruitment area: ${sector?.selectedOptions[0].text}`,
    `Role / trade: ${value("role")}`,
    `Number of people: ${value("headcount")}`,
    `Work location: ${value("location")}`,
    `Preferred start: ${value("timeline")}`,
    "",
    `Additional information: ${value("message") || "To be discussed"}`,
  ].join("\n");
  if (preview) preview.textContent = brief;
  document.querySelector<HTMLAnchorElement>("#send-whatsapp")!.href =
    `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(brief)}`;
  document.querySelector<HTMLAnchorElement>("#send-email")!.href =
    `mailto:${company.email}?subject=${encodeURIComponent("Workforce enquiry — " + value("company"))}&body=${encodeURIComponent(brief)}`;
  form.hidden = true;
  review!.hidden = false;
  document.querySelector<HTMLElement>(".form-step")!.textContent =
    "02 / REVIEW";
  document.getElementById("review-title")?.focus();
});
document.getElementById("edit-enquiry")?.addEventListener("click", () => {
  review!.hidden = true;
  form!.hidden = false;
  document.querySelector<HTMLElement>(".form-step")!.textContent =
    "01 / PREPARE";
  document.getElementById("company")?.focus();
  document.getElementById("copy-status")!.textContent = "";
});
document.getElementById("copy-enquiry")?.addEventListener("click", async () => {
  const status = document.getElementById("copy-status")!;
  try {
    await navigator.clipboard.writeText(brief);
    status.textContent =
      "Brief copied. Paste it into your preferred message app to send.";
  } catch {
    status.textContent =
      "Copy is unavailable in this browser. You can select the brief above or download it as a text file.";
  }
});
document.getElementById("download-enquiry")?.addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([brief], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "victoria-workforce-enquiry.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
