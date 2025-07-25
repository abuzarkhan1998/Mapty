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


let map, mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude } = position.coords;
      // console.log(latitude,longitude);
      const coords = [latitude, longitude];
      map = L.map('map').setView(coords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', function (mapE) {
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    function () {
      alert('Maps not working!!');
    }
  );
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
  //    console.log(mapEvent);
  const { lat, lng: long } = mapEvent.latlng;
  //    console.log(lat,'sd',long)
  L.marker([lat, long])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 350,
        minWidth: 100,
        className: 'running-popup',
        autoClose: false,
        closeOnClick: false,
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});

inputType.addEventListener('change',function(){
inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
