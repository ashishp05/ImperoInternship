
    function disableButton(e) {
        document.getElementById("submitButton").disabled = true;
        document.getElementById("submitButton").innerText = "Processing...";
        document.getElementById("form").submit();
    }

   
     
//  filter of publication Date
    document.getElementById("filter-pubdate").addEventListener("click", function(e) {
       
        e.preventDefault()
        e.stopPropagation()
        let form = document.getElementById("filter-pubdate-modal");
        form.style.display = form.style.display === "block" ? "none" : "block";
    });
     
    document.addEventListener('click', function(e) {
        let form = document.getElementById("filter-pubdate-modal");
        let showFilterBtn = document.getElementById("filter-pubdate");
    
      
        if (!form.contains(e.target) && e.target !== showFilterBtn) {
            form.style.display = "none";
        }
    });
    
    // filter of qunatity
    document.getElementById("filter-quantity").addEventListener("click", function(e) {

        e.stopPropagation()

        let form = document.getElementById("filter-quantity-modal");
        form.style.display = form.style.display === "block" ? "none" : "block";
    });
     
    document.addEventListener('click', function(e) {
        let form = document.getElementById("filter-quantity-modal");
        let showFilterBtn = document.getElementById("filter-quantity");
    
       
        if (!form.contains(e.target) && e.target !== showFilterBtn) {
            form.style.display = "none";
        }
    });
    
    // filter of available quantity
     document.getElementById("filter-available").addEventListener("click", function(e) {

        e.stopPropagation()

        let form = document.getElementById("filter-available-modal");
        form.style.display = form.style.display === "block" ? "none" : "block";
    });
     
    document.addEventListener('click', function(e) {
        let form = document.getElementById("filter-available-modal");
        let showFilterBtn = document.getElementById("filter-available");
    
       
        if (!form.contains(e.target) && e.target !== showFilterBtn) {
            form.style.display = "none";
        }
    });

    // filter of borrowed quantity
    document.getElementById("filter-borrowed").addEventListener("click", function(e) {

        e.stopPropagation()

        let form = document.getElementById("filter-borrowed-modal");
        form.style.display = form.style.display === "block" ? "none" : "block";
    });
     
    document.addEventListener('click', function(e) {
        let form = document.getElementById("filter-borrowed-modal");
        let showFilterBtn = document.getElementById("filter-borrowed");
    
       
        if (!form.contains(e.target) && e.target !== showFilterBtn) {
            form.style.display = "none";
        }
    });
    
     // filter of maintenance quantity
     document.getElementById("filter-maintenance").addEventListener("click", function(e) {

        e.stopPropagation()

        let form = document.getElementById("filter-maintenance-modal");
        form.style.display = form.style.display === "block" ? "none" : "block";
    });
     
    document.addEventListener('click', function(e) {
        let form = document.getElementById("filter-maintenance-modal");
        let showFilterBtn = document.getElementById("filter-maintenance");
    
       
        if (!form.contains(e.target) && e.target !== showFilterBtn) {
            form.style.display = "none";
        }
    });
    
// filter of status

    document.getElementById("filter-status").addEventListener("click", function() {
        let form = document.getElementById("filter-status-modal");
        form.style.display = form.style.display === "block" ? "none" : "block";
    });

 