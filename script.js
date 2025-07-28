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

class Workout {
  date = new Date();
  id = (Date.now + '').slice(-10);

  constructor(coords, dist, dur) {
    this.coords = coords;
    this.dist = dist;
    this.dur = dur;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, dist, dur, cadence) {
    super(coords, dist, dur);
    this.cadence = cadence;
    console.log(this);
  }

  calcPace() {
    this.pace = this.dur / this.dist;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, dist, dur, elevation) {
    super(coords, dist, dur);
    this.elevation = elevation;
    console.log(this);
  }

  calcSpeed() {
    this.speed = this.dist / (this.dur / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #workout = [];

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
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    const workoutType = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    const { lat, lng: long } = this.#mapEvent.latlng;

    //Check if data is valid

    const checkValidInput = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const validatePositiveNumbers = (...inputs) => inputs.every(inp => inp > 0);

    //If workout is running, create running object
    if (workoutType === 'running') {
      const cadence = +inputCadence.value;
    //   console.log(cadence);
      if (
        !checkValidInput(distance, duration, cadence) ||
        !validatePositiveNumbers(distance, duration, cadence)
      )
        alert('Input fields must be a positive number');
      workout = new Running([lat, long], distance, duration, cadence);
    }

    //If workout is cycling, create cycling object
    if (workoutType === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !checkValidInput(distance, duration, elevation) ||
        !validatePositiveNumbers(distance, duration)
      )
        alert('Input fields must be a positive number');
      workout = new Cycling([lat, long], distance, duration, elevation);
    }

    //add new object in workout array
    this.#workout.push(workout);

    //display marker on map
    this._renderWorkoutMap(workout);

    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    //    console.log(mapEvent);
  }

  _renderWorkoutMap(position){
    L.marker(position.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 350,
          minWidth: 100,
          className: `${position.type}-popup`,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`${position.type}`)
      .openPopup();
  }
}

const app = new App();
