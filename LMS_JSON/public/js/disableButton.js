function disableButton(e) {
  document.getElementById("submitButton").disabled = true;
  document.getElementById("submitButton").innerText = "Processing...";
  document.getElementById("form").submit();
}
