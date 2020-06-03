const schedule = require('node-schedule');
const chrome = require('./chrome.js')

async function robot(){

    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 5)];
    rule.hour = 10;
    rule.minute = 0;
    
    await scheduleReading(rule)

    async function scheduleReading(rule){
        let scheduledJob
        schedule.scheduleJob(rule, async () => {
            try {
                if(scheduledJob){
                    scheduledJob.cancel()
                }
                await chrome()

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
