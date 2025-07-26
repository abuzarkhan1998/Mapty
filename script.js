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


class Workout{
    date = new Date();
    id = (Date.now + '').slice(-10);

    constructor(coords,dist, dur){
        this.coords = coords;
        this.dist = dist;
        this.dur = dur;
    }
}

class Running extends Workout{
    constructor(coords,dist,dur,cadence){
        super(coords,dist,dur);
        this.cadence = cadence;
    }

    calcPace(){
        this.pace = this.dur/this.dist;
        return this.pace;
    }
}

class Cycling extends Workout{
    constructor(coords,dist,dur,elevation){
        super(coords,dist,dur);
        this.elevation = elevation;
    }

    calcSpeed(){
        this.speed = this.dist/(this.this.dur/60);
        return this.speed;
    }
}

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Maps not working!!');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    // console.log(latitude,longitude);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
      inputElevation
        .closest('.form__row')
        .classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    //    console.log(mapEvent);
    const { lat, lng: long } = this.#mapEvent.latlng;
    //    console.log(lat,'sd',long)
    L.marker([lat, long])
      .addTo(this.#map)
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
  }
}

const app = new App();
