document.getElementById("resetRecordFilter").addEventListener("click" , (e) =>
{
    e.preventDefault();

    document.getElementById("memberName").value = '';
    document.getElementById("memberEmail").value = '';
    document.getElementById("recordBook").value = '';
    document.getElementById("issueDate").value = '';
    document.getElementById("dueDate").value = '';
    document.getElementById("status").value = '';
    var inputs = document.querySelectorAll("input, select");  
            
           
    inputs.forEach(function (input) {
        input.classList.remove("input-filtered");  
    });
})


document.querySelectorAll(".clear-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        
      
        document.getElementById('issue').value = '';
        document.getElementById('due').value= ''
        
       
        var inputs = document.querySelectorAll("input, select");  
        inputs.forEach(function (input) {
            input.classList.remove("input-filtered");  
        });
    });
});


