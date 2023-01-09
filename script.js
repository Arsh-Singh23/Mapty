import "core-js/stable"
import "regenerator-runtime/runtime"

'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
////////////////////////////////////////////////////////////////////////////////////////

class Workout {
    constructor(distance, duration) {
        this.distance = distance
        this.duration = duration
        this.getDate()
        this.createId()
    }
    createId() {
        this.id = new Date().getTime()
    }
    getDate() {
        this.date = new Date()
    }
}

class Running extends Workout {
    constructor(distance, duration, cadence) {
        super(distance, duration)
        this.cadence = cadence
        this.calcSpeed()
    }
    calcSpeed() {
        this.speed = this.distance / this.duration
    }
}

class Cycling extends Workout {
    constructor(distance, duration, elevaionGain) {
        super(distance, duration)
        this.elevaionGain = elevaionGain
        this.calcSpeed()
    }
    calcSpeed() {
        this.speed = this.distance / this.duration
    }
}

class App {
    latitude;
    longitude;
    map;
    clickLat;
    clickLng;
    workout
    constructor() {
        navigator.geolocation.getCurrentPosition(this.getCoords.bind(this), this.showError.bind(this))
        form.addEventListener(`submit`, this.checkData.bind(this))
        inputType.addEventListener(`change`, this.toggleType.bind(this))

    }
    getCoords(pos) {
        this.latitude = pos.coords.latitude
        this.longitude = pos.coords.longitude
        this.loadMap()
    }
    showError() {
        alert(`Couldn't find your location. Kindly retry`)
    }
    loadMap() {
        this.map = L.map('map').setView([this.latitude, this.longitude], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
        this.map.on(`click`, this.clickCoords.bind(this))
    }
    clickCoords(e) {
        this.clickLat = e.latlng.lat
        this.clickLng = e.latlng.lng
        if (!this.clickLat || !this.clickLng) return
        this.openForm()
    }
    renderMarker() {
        let marker = L.marker([this.clickLat, this.clickLng]).addTo(this.map);
        let popup = L.popup({
            autoClose: false,
            closeOnClick: false,
            className: `${inputType.value === `running` ? `running-popup` : `cycling-popup`}`
        })
            .setContent(`${inputType.value === `running` ? `Running` : `Cycling`} on ${months[this.workout.date.getMonth()]} ${this.workout.date.getDate()}`);
        marker.bindPopup(popup).openPopup()
        form.classList.add(`hidden`)
    }
    openForm() {
        form.classList.remove(`hidden`)
        inputDistance.focus()
    }
    toggleType() {
        inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`)
        inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`)
    }
    checkData(e) {
        e.preventDefault()
        let incorrect = false
        if (inputType.value === `running`) {
            //for running exercise
            if (+inputDistance.value <= 0 || +inputDuration.value <= 0 || +inputCadence.value <= 0) {
                incorrect = true
            }
            if (!Number.isFinite(+inputDistance.value) || !Number.isFinite(+inputDuration.value) || !Number.isFinite(+inputCadence.value)) {
                incorrect = true
            }
            if (incorrect) {
                alert(`Insufficient informatiom`)
                inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = ``
                inputDistance.focus()
            } else {
                this.workout = new Running(+inputDistance.value, +inputDuration.value, +inputCadence.value)
                this.clearForm()
                this.addWorkout()
                this.renderMarker()
            }
        }
        if (inputType.value === `cycling`) {
            //for cycling exercise
            if (+inputDistance.value <= 0 || +inputDuration.value <= 0) {
                incorrect = true
            }
            if (!Number.isFinite(+inputDistance.value) || !Number.isFinite(+inputDuration.value) || !Number.isFinite(+inputElevation.value)) {
                incorrect = true
            }
            if (incorrect) {
                alert(`Insufficient informatiom`)
                inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = ``
                inputDistance.focus()
            } else {
                this.workout = new Cycling(+inputDistance.value, +inputDuration.value, +inputElevation.value)
                this.clearForm()
                this.addWorkout()
                this.renderMarker()
            }
        }
    }
    addWorkout() {
        let markup = `
        <li class="workout workout--${inputType.value === `running` ? `running` : `cycling`}" data-id="${this.workout.id}">
        <h2 class="workout__title">${inputType.value === `running` ? `Running` : `Cycling`} on ${months[this.workout.date.getMonth()]} ${this.workout.date.getDate()}</h2>
        <div class="workout__details">
          <span class="workout__icon">🏃‍♂️</span>
          <span class="workout__value">${this.workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${this.workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`
        if (inputType.value === `running`) {
            markup += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${this.workout.speed.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>`
        }
        if (inputType.value === `cycling`) {
            markup += `
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${this.workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>`
        }
        if (inputType.value === `running`) {
            markup += `
            <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${this.workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>`
        }
        if (inputType.value === `cycling`) {
            markup += `
            <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${this.workout.elevaionGain}</span>
            <span class="workout__unit">m</span>
          </div>`
        }

        markup += `</li>`
        containerWorkouts.insertAdjacentHTML(`beforeend`, markup)
    }
    clearForm() {
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = ``
        inputDistance.focus()
    }
}

new App()