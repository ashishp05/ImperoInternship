const handleSortingOnBook = (icon, field) => {
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
    window.location.href = `/book/sort?field=${field}&sortOrder=${sortOrder}`;
  });
};
handleSortingOnBook("sortTitleIcon", "title");
handleSortingOnBook("sortAuthorIcon", "author");
handleSortingOnBook("sortCategoryIcon", "category");

handleSortingOnBook("sortpubDateIcon", "publicationDate");
handleSortingOnBook("sortquantityIcon", "quantity");
handleSortingOnBook("sortAvailableIcon", "availableQuantity");
handleSortingOnBook("sortStatusIcon", "status")
handleSortingOnBook("sortBorrowedIcon", "borrowedQuantity");
handleSortingOnBook("sortmaintenanceIcon", "maintenanceQuantity");
