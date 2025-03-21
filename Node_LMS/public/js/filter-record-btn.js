document.getElementById("filter-issue").addEventListener("click", function(e) {

    e.stopPropagation()

    let form = document.getElementById("filter-issue-modal");
    form.style.display = form.style.display === "block" ? "none" : "block";
});
 
document.addEventListener('click', function(e) {
    let form = document.getElementById("filter-issue-modal");
    let showFilterBtn = document.getElementById("filter-issue");

   
    if (!form.contains(e.target) && e.target !== showFilterBtn) {
        form.style.display = "none";
    }
});

document.getElementById("filter-due").addEventListener("click", function(e) {

    e.stopPropagation()

    let form = document.getElementById("filter-due-modal");
    form.style.display = form.style.display === "block" ? "none" : "block";
});
 
document.addEventListener('click', function(e) {
    let form = document.getElementById("filter-due-modal");
    let showFilterBtn = document.getElementById("filter-due");

   
    if (!form.contains(e.target) && e.target !== showFilterBtn) {
        form.style.display = "none";
    }
});