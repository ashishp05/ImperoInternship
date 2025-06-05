var nums = document.querySelectorAll("input[type='text']");

nums.forEach((num) => {
  var max = 100;
  num.addEventListener("input", () => {
    if (num.value >= max) {
      num.value = 100;
    }

  
  });
});

document.getElementById("resetBookFilter").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("filter").value = "";

  var inputs = document.querySelectorAll("input");

  inputs.forEach(function (input) {
    input.classList.remove("input-filtered");
  });

  document.getElementById("filterForm").submit();
});

