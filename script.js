'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude } = position.coords;
      // console.log(latitude,longitude);
      const coords = [latitude, longitude];
      const map = L.map('map').setView(coords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', function (mapEvent) {
        //    console.log(mapEvent);
        const { lat, lng: long } = mapEvent.latlng;
        //    console.log(lat,'sd',long)
        L.marker([lat, long])
          .addTo(map)
          .bindPopup(L.popup({
            maxWidth : 350,
            minWidth : 100,
            className : 'running-popup',
            autoClose : false,
            closeOnClick : false
          }))
          .setPopupContent('Workout')
          .openPopup();
      });

    },
    function () {
      alert('Maps not working!!');
    }
  );
}
