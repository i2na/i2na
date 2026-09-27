{
  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, index) => {
          entry.target.style.setProperty("--delay", `${Math.min(index, 8) * 70}ms`);
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
    },
    { rootMargin: "0px 0px -6% 0px" },
  );
  document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
}
