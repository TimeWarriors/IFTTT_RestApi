

#### Example


```javascript
const timeEdidApiLnu = new TimeEdidApi(
    'https://se.timeedit.net/web/lnu/db1/schema1/',
    4
);

// todays schedule
timeEdidApiLnu.getTodaysSchedule('ny105')
    .then((roomSchedule) => {
        console.log(JSON.stringify(roomSchedule, null ,2));
    }).catch((er) => {
        console.log(er);
    });

// full schedule
timeEdidApiLnu.getSchedule('ny105')
    .then((schedule) => {
        console.log(JSON.stringify(schedule, null ,2));
    }).catch((er) => {
        console.log(er);
    });

// search and se if exists
timeEdidApiLnu.search('ny105')
    .then((result) => {
        console.log(JSON.stringify(result, null ,2));
    }).catch((er) => {
        console.log(er);
    });

```
