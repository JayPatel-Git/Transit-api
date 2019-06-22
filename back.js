let streetId;
let list = document.body.querySelector('ul');
fetch("https://api.winnipegtransit.com/v3/streets.json?api-key=xLhIA38e3OOJNgZfBwTy&name=Henlow%20Bay")
  .then((response) => {
      return response.json();
  })
  .then((street) => {
    streetId = street.streets[0].key;
    fetch(`https://api.winnipegtransit.com/v3/stops.json?api-key=xLhIA38e3OOJNgZfBwTy&street=${streetId}`)
    .then((response) => {
      return response.json();
    })
    .then((promisearray) => {
      console.log(promisearray);
      let stopsArray;
      Promise.all(promisearray.stops)
      .then((stops) => {
        stopsArray = stops;
        console.log(stopsArray);
        stopsArray.forEach(element => {
          let stop = element.key;
          let direction = element.direction;
          let crossStreet = element['cross-street'].name;
          let name = element.name;
          fetch(`https://api.winnipegtransit.com/v3/routes.json?api-key=xLhIA38e3OOJNgZfBwTy&stop=${element.key}`)
          .then((response) => {
              return response.json();
          })
          .then((routes) => {
            let routesArray = routes['routes'];
            routesArray.forEach((element) => {
              let counter = 0;
              fetch(`https://api.winnipegtransit.com/v3/stops/${stop}/schedule.json?api-key=xLhIA38e3OOJNgZfBwTy&route=${element.key}`)
              .then((response) => {
                  return response.json();
              })
              .then((schedule) => {
                let stopSchedule = schedule['stop-schedule'];
                let routeSchedule = stopSchedule['route-schedules'];
                if(routeSchedule !== undefined) {
                  let arr = routeSchedule[0];
                  if(arr !== undefined) {
                    let scheduledStops = arr['scheduled-stops'];
                    console.log(scheduledStops);
                    scheduledStops.forEach((time) => {
                      console.log(time);
                      if((counter < 2) && (time.times.arrival !== undefined || time.times.departure !== undefined)) {
                        let bustime;
                        if(time.times.arrival) {
                          bustime = time.times.arrival.scheduled;
                        } else if(time.times.departure) {
                          bustime = time.times.departure.scheduled;
                        }
                        list.insertAdjacentHTML('beforeend', `
                        <li>
                              Stop Name: ${name}
                          </li>
                          <li>
                              Direction: ${direction}
                          </li>
                          <li>
                              Cross street: ${crossStreet}
                          </li>
                          <li>
                              ${element.name}
                          </li>
                          <li>
                              ${bustime}
                          </li>
                          <li>
                              Route number:${element.key}
                          </li>
                          `);
                        }
                      counter++;
                      });
                  }
                }
              });
            });
          });
        });
      });
      
    })
  });



