
let streetEvent = document.body.querySelector('.street');
streetEvent.addEventListener('click', function(e) {
  let street = document.body.querySelector('.streetName').value;
  if(typeof street !== 'string') {
    alert('please enter correct street');
  } else {
    retriveDetails(street);
  }
});

let geoloc = document.body.querySelector('.geolocation');
geoloc.addEventListener('click', function(e) {
  
  if(navigator.geolocation) {
  let longitude;
  let latitude;
  let street;
    navigator.geolocation.getCurrentPosition((position) => {
      longitude = position.coords.longitude;
      latitude = position.coords.latitude;
      console.log(latitude, longitude);
      fetch(`https://api.winnipegtransit.com/v3/locations.json?api-key=xLhIA38e3OOJNgZfBwTy&lat=${latitude}&lon=${longitude}`, {
       method: 'GET', 
      })
        .then((location) => {
          return location.json();
        })
        .then((locationObj) => {
          locationObj.locations.forEach((ele) => {
            if(ele.street) {
              street = ele.street.name;
              if(street !== undefined) {
                retriveDetails(street);
              }
            }
          })
        });
    }); 
  }
});

function retriveDetails(street) { 
  let streetId;
  let allDetails = new Object();
  let id = 0;
  let ids = [];
  let list = document.body.querySelector('ol');
  //Warde%20Avenue
  fetch(`https://api.winnipegtransit.com/v3/streets.json?api-key=xLhIA38e3OOJNgZfBwTy&name=${street}`)
    .then((response) => {
        return response.json();
    })
    .then((street) => {
      console.log(street, "str");
      streetId = street.streets[0].key;
      fetch(`https://api.winnipegtransit.com/v3/stops.json?api-key=xLhIA38e3OOJNgZfBwTy&street=${streetId}`)
      .then((response) => {
        return response.json();
      })
      .then((stops) => {
        console.log(stops);
        let stopsArray;
        stopsArray = stops.stops;
        stopsArray.forEach(element => {
          let stop = element.key;
          fetch(`https://api.winnipegtransit.com/v3/routes.json?api-key=xLhIA38e3OOJNgZfBwTy&stop=${element.key}`)
          .then((response) => {
            return response.json();
          })
          .then((route) => {
            console.log(route);
            let routeArray = route['routes'];
            let promiseArray = []; 
            routeArray.forEach((ele) => {
                let p = fetch(`https://api.winnipegtransit.com/v3/stops/${stop}/schedule.json?api-key=xLhIA38e3OOJNgZfBwTy&route=${ele.key}`)
                .then((response) => {
                    return response.json();
                });
            
                promiseArray.push(p);
              })
            
              Promise.all(promiseArray)
              .then((schedule) => {
                schedule.forEach((element) => {
                  let stopSchedule = element['stop-schedule'];
                  let routeSchedule = stopSchedule['route-schedules'];
                  let details = stopSchedule['stop'];
                  console.log(routeSchedule);
                  if(routeSchedule !== undefined) {
                    let arr = routeSchedule[0];
                  
                    if(arr !== undefined) {
                      let counter = 0;
                      let route = arr.route.key;
                      let scheduledStops = arr['scheduled-stops'];
                      scheduledStops.forEach((time) => {
                        console.log(time, "time");
                        if((counter < 5) && (time.times.arrival !== undefined || time.times.departure !== undefined)) {
                          let bustime;
                  
                          if(time.times.arrival) {
                            bustime = time.times.arrival.scheduled;
                          } else if(time.times.departure) {
                            bustime = time.times.departure.scheduled;
                          }
                          list.insertAdjacentHTML('beforeend', `
                          <li class = "${id} clickable" >${details.name}</li>
                          `);
                          let crossStreet = details['cross-street']['name'];
                          let name = details.name;
                          let direction = details.direction;
                          let ref = {name, direction, crossStreet, bustime, route};
                          allDetails[`${id}`] = ref;
                          ids.push(id);
                          id++;
                          counter++;  
                        }
                      });
                    }
                  }
                });
              });
            });
        });  
      });
    });

  list.addEventListener('click', function(e) {
    if(e.target.classList.contains('clickable') && !(e.target.classList.contains('open'))) {
        
      for(let i = 0; i < ids.length ; i++) {
        
        let temp = ids[i].toString();
        if(e.target.classList.contains(temp)) {
          let addDetails = e.target;
          addDetails.classList.add('open');
          addDetails.insertAdjacentHTML('beforeend', `
            <ul>
              <li>
                Stop Name: ${allDetails[temp].name}
              </li>
              <li>
                Direction: ${allDetails[temp].direction}
              </li>
              <li>
                Cross street: ${allDetails[temp].crossStreet}
              </li>
              <li>
                Name: ${allDetails[temp].name}
              </li>
              <li>
                Bus time:${allDetails[temp].bustime}
              </li>
              <li>
                Route number:${allDetails[temp].route}
              </li>
            </ul>
          `);
          }
        }
    }
  });
}

