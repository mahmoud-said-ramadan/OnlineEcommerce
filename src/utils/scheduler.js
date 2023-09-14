import cron from "node-cron";

console.log("node-cron");
function performAction() {
    console.log('3aaaaaaaaaaaaaaaaaash');
    // Add your custom logic here
}

// Schedule the task
cron.schedule('0 * * * * *', () => {
    // This task will run every day at 12:00 PM
    performAction();
});