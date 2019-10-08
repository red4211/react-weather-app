import React, { Component } from "react";
import "./App.css";
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city: "",
      country: "",
      coordinates: [],
      forecast: []
    };
  }
  componentDidMount() {
    navigator.geolocation.getCurrentPosition(position => {
      axios
        .get(
          "https://api.openweathermap.org/data/2.5/forecast?lat=" +
            position.coords.latitude +
            "&lon=" +
            position.coords.longitude +
            "&units=metric&appid=a56f81c5361d14334548e00f79bfffb2"
        )
        .then(res => {
          console.log(res);
          //sort all entries by date
          let sortByDay = [[], [], [], [], [], []];
          let counter1 = 0;
          var lastDate = 99;
          res.data.list.forEach(function(currElem) {
            let compareDates = Number(currElem.dt_txt.slice(8, 10));
            if (lastDate === 99) {
              lastDate = compareDates;
              sortByDay[counter1].push(currElem);
            } else if (lastDate === compareDates) {
              sortByDay[counter1].push(currElem);
            } else {
              counter1++;
              sortByDay[counter1].push(currElem);
              lastDate = compareDates;
            }
          });

          let combinedForecast = [];
          combinedForecast = sortByDay.map(dayArr => {
            let highestTemp = 0;
            let lowestTemp = 100;
            let curDate = new Date(dayArr[0].dt_txt);
            const weekDay = ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"][
              curDate.getDay()
            ];

            let currDayObj = {
              highTemp: 0,
              lowTemp: 0,
              dOfWeek: weekDay,
              displayIcon: "01d"
            };
            dayArr.forEach(timeObj => {
              //calculate lowest and highest day temp
              if (timeObj.main.temp > highestTemp) {
                highestTemp = timeObj.main.temp;
              }
              if (timeObj.main.temp < lowestTemp) {
                lowestTemp = timeObj.main.temp;
              }

              if (timeObj.weather[0].id < 700) {
                currDayObj.displayIcon = timeObj.weather[0].icon;
              }
            });
            currDayObj.highTemp = Math.round(highestTemp);
            currDayObj.lowTemp = Math.round(lowestTemp);

            return currDayObj;
          }); //endof map
          this.setState({
            forecast: combinedForecast,
            city: res.data.city.name,
            country: res.data.city.country
          });
        });
    });
  }
  render() {
    return (
      <div className="App">
        <WeatherList
          forecast={this.state.forecast}
          city={this.state.city}
          country={this.state.country}
        ></WeatherList>
      </div>
    );
  }
}

function WeatherList(props) {
  if (props.forecast === undefined) {
    return null;
  } else {
    let listItems = props.forecast.map(function(currElem, index) {
      return (
        <li key={index}>
          <div>{currElem.dOfWeek}</div>
          <div>
            <img
              src={
                "http://openweathermap.org/img/w/" +
                currElem.displayIcon +
                ".png"
              }
              alt="#"
            />
          </div>
          <div className="high-temp">{currElem.highTemp}&deg;</div>
          <div className="low-temp">{currElem.lowTemp}&deg;</div>
        </li>
      );
    });
    return (
      <div className="wrapper">
        <p className="title">Weather in {props.city + ", " + props.country}</p>
        <div className="weather-wrap">
          <ul className="weather-list">{listItems}</ul>
        </div>
      </div>
    );
  }
}

export default App;
