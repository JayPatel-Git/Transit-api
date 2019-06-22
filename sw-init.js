if(navigator.serviceWorker) {
    console.log('true');
    navigator.serviceWorker.register('sw.js').then((res) => {
      console.log('registration worked!');
    })
    .catch((rej) => {
      console.log('registration failed!!');
    })
  }
  