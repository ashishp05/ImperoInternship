
var nums = document.querySelectorAll("input[type='number']");

nums.forEach(num => {
    var max = 100;
    num.addEventListener('input' , () =>
  {
      if(num.value >=max)
          {
             num.value = 100;
          }

          if(num.value <=-1 )
            {
               num.value = 0;
            }
  })
   
  });

document.getElementById("resetBookFilter").addEventListener("click",  (e) => {
    e.preventDefault()
   document.getElementById("filterTitle").value = '';
   document.getElementById("filterAuthor").value = '';
   document.getElementById("filterPublicationDate").value = '';
   document.getElementById("filterQuantity").value = '';
   document.getElementById("filterAvailableQuantity").value = '';
   document.getElementById("filterBorrowedQuantity").value = '';
   document.getElementById("filterMaintenanceQuantity").value = '';
   document.getElementById("filterStatus").value = '';
   
   var inputs = document.querySelectorAll("input, select");  
        
       
        inputs.forEach(function (input) {
            input.classList.remove("input-filtered");  
        });

  
});


document.querySelectorAll(".clear-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        
      
        document.getElementById("totalQuantity").value = '';
        document.getElementById("startDate").value = '';
        document.getElementById("endDate").value = '';
        document.getElementById("available").value = '';
        document.getElementById("borrowed").value = '';
        document.getElementById("maintenance").value = '';
        
       
        var inputs = document.querySelectorAll("input, select");  
        inputs.forEach(function (input) {
            input.classList.remove("input-filtered");  
        });
    });
});


