document.getElementById("resetMemberFilter").addEventListener("click", (e) => {
  e.preventDefault();

  document.getElementById("filterMember").value = "";
 
  var inputs = document.querySelectorAll("input");

  inputs.forEach(function (input) {
    input.classList.remove("input-filtered");
  });

  document.getElementById("filterForm").submit();
});
