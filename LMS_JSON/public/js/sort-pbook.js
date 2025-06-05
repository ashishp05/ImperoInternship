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
    window.location.href = `/book/preffered-book/sort?field=${field}&sortOrder=${sortOrder}`;
  });
};

handleSortingOnBook("sortTitleIconP", "title");
handleSortingOnBook("sortAuthorIconP", "author");
handleSortingOnBook("sortCategoryIconP", "category");
handleSortingOnBook("sortStatusIconP", "status")

handleSortingOnBook("sortpubDateIconP", "publicationDate");
handleSortingOnBook("sortquantityIconP", "quantity");
handleSortingOnBook("sortAvailableIconP", "availableQuantity");
handleSortingOnBook("sortBorrowedIconP", "borrowedQuantity");
handleSortingOnBook("sortmaintenanceIconP", "maintenanceQuantity");
