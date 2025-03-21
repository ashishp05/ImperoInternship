const cron = require("node-cron");
const Record = require("../models/borrowRecordModel");

exports.cronjob = async () => {
  try {
    cron.schedule(" 0 0 * * *", async () => {
      const allRecords = await Record.find()
        .populate("memberId")
        .populate("book.bookId");

      
      for (const record of allRecords) {
        for (const book of record.book) {
          const currDate = new Date();
          currDate.setDate(currDate.getDate() + 1); 
        
          
         
          if (book.dueDate < currDate && book.status === "borrowed") {
            book.status = "delayed";
            await record.save(); 
            console.log(
              `Book with dueDate ${book.dueDate} is now delayed.`
            );
          }
        }
      }

    });
  } catch (error) {
    console.error("Error in cron job:", error);
  }
};

