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
    window.location.href = `/home/book/sort?field=${field}&sortOrder=${sortOrder}`;
  });
};
handleSortingOnBook("sortTitleIcon", "title");
handleSortingOnBook("sortAuthorIcon", "author");
handleSortingOnBook("sortpubDateIcon", "publicationDate");
handleSortingOnBook("sortquantityIcon", "quantity");
handleSortingOnBook("sortStatusIcon", "status");

const handleSorting = (icon, field) => {
  let sortOrder = "desc";
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
    window.location.href = `/home/member/sort?field=${field}&sortOrder=${sortOrder}`;
  });
};
handleSorting("sortUidIconHome", "uId");
handleSorting("sortNameIconHome", "name");
handleSorting("sortMemberTypeIconHome", "memberType");
handleSorting("sortMemberStatusIconHome", "membershipStatus");
