document.getElementById("resetMemberFilter").addEventListener('click' , (e) =>
    {
        e.preventDefault();
    
        document.getElementById("filteruId").value = ''
        document.getElementById('filterEmail').value = ''
        document.getElementById('filterName').value = ''
        document.getElementById('filterMemberType').value = ''
        document.getElementById('filterMembershipStatus').value= ''
        var inputs = document.querySelectorAll("input, select");  
            
           
        inputs.forEach(function (input) {
            input.classList.remove("input-filtered");  
        });
       
    
    })