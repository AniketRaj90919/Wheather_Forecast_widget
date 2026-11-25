import { useEffect, useState } from "react";
import "./App.css";
import {
  getWeather,
  getWeatherDescription,
  getLocationName,
} from "./Services/weatherService";

function App() {
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    window.electronAPI.onWeatherClosed(() => {
      setIsWeatherOpen(false);
    });
  }, []);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported.");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

        getLocationName(latitude, longitude)
          .then((locationData) => {
            setLocationName(locationData);
          })
          .catch((error) => {
            console.error("Location name error:", error);
          });

        setIsLoadingLocation(false);

        setIsLoadingWeather(true);
        setWeatherError("");

        getWeather(latitude, longitude)
          .then((weatherData) => {
            setWeather(weatherData);
          })
          .catch((error) => {
            console.error("Weather error:", error);
            setWeatherError("Unable to fetch weather.");
          })
          .finally(() => {
            setIsLoadingWeather(false);
          });

        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
      },

      (error) => {
        console.error("Location error:", error);

        setLocationError("Unable to get your location.");
        setIsLoadingLocation(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleWeatherClick = () => {
    if (isWeatherOpen) {
      window.electronAPI.closeWeather();
      setIsWeatherOpen(false);
    } else {
      window.electronAPI.openWeather();
      setIsWeatherOpen(true);

      getCurrentLocation();
    }
  };

  return (
    <div className={`weather-container ${isWeatherOpen ? "open" : ""}`}>
      <button
        className="weather-button"
        onClick={handleWeatherClick}
      >
        <img
          src="/weather-icon.png"
          alt="Weather"
          className="weather-icon"
        />
      </button>

      {isWeatherOpen && (
        <div className="weather-card">
          <div className="weather-header">
            <h2>Weather Update</h2>

            <button
              className="refresh-button"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation || isLoadingWeather}
            >
              ↻
            </button>
          </div>

          <div className="weather-content">
            {isLoadingLocation && (
              <p>Getting your location...</p>
            )}

            {locationError && (
              <p className="error-message">
                {locationError}
              </p>
            )}

            {isLoadingWeather && (
              <p>Getting weather...</p>
            )}

            {weatherError && (
              <p className="error-message">
                {weatherError}
              </p>
            )}

            {weather && (
              <div className="weather-details">

                {locationName && (
                  <div className="location-name">
                    📍 {locationName.name}, {locationName.state}
                  </div>
                )}

                <div className="temperature">
                  {weather.temperature}°C
                </div>

                <div className="condition">
                  {getWeatherDescription(weather.weatherCode)}
                </div>

                <div className="weather-row">
                  <span>💧 Humidity</span>
                  <span>{weather.humidity}%</span>
                </div>

                <div className="weather-row">
                  <span>💨 Wind</span>
                  <span>{weather.windSpeed} km/h</span>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;