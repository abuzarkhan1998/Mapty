'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, dist, dur) {
    this.coords = coords;
    this.dist = dist;
    this.dur = dur;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, dist, dur, cadence) {
    super(coords, dist, dur);
    this.cadence = cadence;
    // console.log(this);
    this.calcPace();
    this._setDescription();
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
    // console.log(this);
    this.calcSpeed();
    this._setDescription();
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
  #zoomLevel = 13;

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);

    containerWorkouts.addEventListener('click',this._moveMarker.bind(this));

    this._getLocation();
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
    this.#map = L.map('map').setView(coords, this.#zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    this.#workout.forEach(work => {
        this._renderWorkoutMap(work);
    });
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

    //render workout on list
    this._renderWorkoutList(workout);

    //clear fields
    this._hideForm();
    //    console.log(mapEvent);

    this._saveLocation();
  }

  _renderWorkoutMap(position) {
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
      .setPopupContent(`${position.description}`)
      .openPopup();
  }

  _renderWorkoutList(workout) {
    //prettier-ignore
    let html = `<li class="workout workout--running" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">🏃‍♂️</span>
            <span class="workout__value">${workout.dist}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.dur}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === 'running') {
      html += ` 
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }

    if (workout.type === 'cycling') {
      html += ` 
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _hideForm() {
    form.style.display = 'none';
    setTimeout(function () {
      form.style.display = 'grid';
    }, 1000);
    form.classList.add('hidden');
     // prettier-ignore
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  _moveMarker(e){
    // console.log(this);
    // console.log(e.target);
    const workOutEl = e.target.closest('.workout');
    if(!workOutEl) return;
    // console.log(workOutEl);
    const matchedWorkOut = this.#workout.find(work => work.id === workOutEl.dataset.id);
    // console.log(matchedWorkOut);
    this.#map.setView(matchedWorkOut.coords,this.#zoomLevel, {
        animate : true,
        pan :{
            duration : 1
        }
    });
  }

  _saveLocation(){
    localStorage.setItem('workOut', JSON.stringify(this.#workout));
  }

  _getLocation(){
    const data = JSON.parse(localStorage.getItem('workOut'));
    // console.log(data);
    if(!data) return;
    this.#workout = data;
    this.#workout.forEach(work => {
        this._renderWorkoutList(work);
    });
  }

  reset(){
    localStorage.removeItem('workOut');
    location.reload();
  }
}

const app = new App();
