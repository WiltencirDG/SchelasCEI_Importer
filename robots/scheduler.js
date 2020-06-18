const schedule = require('node-schedule');
const chrome = require('./chrome.js')

async function robot(base64Credentials){

    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 5)];
    rule.hour = 23;
    rule.minute = 0;
    
    await scheduleReading(rule,base64Credentials)

    async function scheduleReading(rule,base64Credentials){
        let scheduledJob
        schedule.scheduleJob(rule, async () => {
            try {
                if(scheduledJob){
                    scheduledJob.cancel()
                }
                await chrome(base64Credentials)

                console.log(`> Job ran successfully.`)

            } catch (error) {
                console.log(`> Service unavailable right now. Trying again in 15 minutes.`)
                scheduledJob = scheduleReading("*/15 * * * *")
            }
        });
        console.log('> Task scheduled.');
    }
}

module.exports = robot
