const handleSortingOnRecord = (icon, field) => {
  document.getElementById(icon).addEventListener("click", function () {
    const urlParams = new URLSearchParams(window.location.search);
    let sortOrder = urlParams.get("sortOrder") === "desc" ? "asc" : "desc";

    if (sortOrder === "asc") {
      this.classList.remove("fa-sort");
      this.classList.add("fa-sort-up");
    } else {
      this.classList.remove("fa-sort");
      this.classList.add("fa-sort-down");
    }

    window.location.href = `/book/category/sort?field=${field}&sortOrder=${sortOrder}`;
  });
};

handleSortingOnRecord("sortCategoryDetailsIcon", "category");
