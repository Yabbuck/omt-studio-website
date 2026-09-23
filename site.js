(() => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.setAttribute("aria-label", "Back to top");
  button.textContent = "↑";
  document.body.append(button);

  const update = () => button.classList.toggle("is-visible", window.scrollY > 360);
  button.addEventListener("click", () => window.scrollTo({top: 0, behavior: "smooth"}));
  window.addEventListener("scroll", update, {passive: true});
  update();
})();
