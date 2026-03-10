'use strict';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (String(new Date().getTime()).slice(-10));

  /**
   * 
   * @param {Number[]} coords the coordinate of the loctaion in this order `[lat, lng]`
   * @param {Number} distance the distance in `km`
   * @param {Number} duration the duration in `minute`
   */
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // km
    this.duration = duration; // min
  }
}

class Running extends Workout {
  type = "running";

  /**
   * 
   * @param {Number[]} coords the coordinate of the loctaion in this order `[lat, lng]`
   * @param {Number} distance the distance in `km`
   * @param {Number} duration the duration in `minute`
   * @param {Number} cadence the step rate — how many times your feet hit the ground per minute
   */
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();

  }
  calcPace() {
    // pace = time / distance
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  /**
  * 
  * @param {Number[]} coords the coordinate of the loctaion in this order `[lat, lng]`
  * @param {Number} distance the distance in `km`
  * @param {Number} duration the duration in `minute`
  * @param {Number} elevationGain the pedal rate in RPM(revolution/min)-
  */
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;

    this.calcSpeed();

  }
  calcSpeed() {
    // speed = distance(km) / time (h)
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
const run1 = new Running([12.234234, 87.8234234], 10, 20, 12);
const cycl1 = new Running([14.234234, 87.8234234], 19, 20, 12);




class App {
  // private fields
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();



    // listeners
    form.addEventListener("submit", this._newWorkout.bind(this));

    // changing cadance and elevation
    inputType.addEventListener("change", this._toggleElevationField);
  }
  // get position by geolocation
  _getPosition() {
    if (!navigator.geolocation) {
      alert("Sorry, Your browser does not support location information.");
    } else {
      navigator.geolocation.getCurrentPosition(
        // on success
        // passing the this inside loadMape => this here (current obj)
        this._loadMap.bind(this),
        // on error
        function () {
          alert("Could not get your location.")
        }
      );
    }

  }

  _loadMap(position) {
    const coords = [
      position.coords.latitude,
      position.coords.longitude
    ];

    // initializing 
    // put the map on map div
    // set center: coords
    // set zoom: 13
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    this.#map.on("click", this._showform.bind(this));

  }

  // click on map
  _showform(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  // changing inputfields elevation <---> cadance
  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }
  _newWorkout(e) {
    const areNum = function (...inputs) {
      return inputs.every(inp => Number.isFinite(inp));
    }
    const arePositive = function (...inputs) {
      return inputs.every(inp => inp > 0);
    }
    e.preventDefault();
    if (!this.#mapEvent) return;

    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;




    // validate
    // if workout
    //    running -> create running object 
    if (type === "running") {
      const cadence = +inputCadence.value;
      // validate
      if (!areNum(distance, duration, cadence) || !arePositive(distance, duration, cadence)) {
        return alert("Inputs should be positive numbers.")
      }
      workout = new Running([lat, lng], distance, duration, cadence);

    }
    //    cycling -> create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      // validate
      if (!areNum(distance, duration, elevation) || !arePositive(distance, duration)) {
        return alert("Inputs should be positive numbers.")
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // add new object to workout array
    this.#workouts.push(workout);

    // render workout on map as marker
    this._renderWorkoutMarker(workout);

    // clearing fields + hiding form
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
    form.classList.add("hidden");



  }
  // makerer renderer
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 120,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`
        })
      )
      .setPopupContent(
        `<p>Workout</p>`
      )
      .openPopup();
  }
}


// initialization
const app = new App();















