document.getElementById("resetRecordFilter").addEventListener("click", (e) => {
  e.preventDefault();

  document.getElementById("filterRecord").value = "";

  var inputs = document.querySelectorAll("input");

  inputs.forEach(function (input) {
    input.classList.remove("input-filtered");
  });

  document.getElementById("filterForm").submit();
});

