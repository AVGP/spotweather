// Load settings...
try {
  var settings = JSON.parse(localStorage.getItem('settings'));
} catch(e) {
  var settings = {
    fallback_location: '',
    units: 'metric'
  };
}


//////////////////////////
// Auxilliary functions //
//////////////////////////

// Fetch a random image from the Flickr Photo Search API that has been taken at the location and contains the weather as a tag:
function getPhotoForWeatherAt(weather, location, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var pics = JSON.parse(this.responseText).photos.photo;
      var i=pics.length;
      
      while(i--) {
          var pic = pics[i];
          pics[i].url = 'https://farm' + pic.farm + '.staticflickr.com/' + pic.server + '/' + pic.id + '_' + pic.secret + '_b.jpg';
      }
    var index = Math.floor(Math.random() * pics.length);
    console.log('chosen ', index, pics[index]);
    callback(pics[index].url);
    }
    
    xhr.open('get', 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=8436cce5ea8518073333ad2ca051fd60&tags=' + weather + '&sort=interestingness-asc&lat=' + location.lat + '&lon=' + location.lng + '&radius=5&radius_units=km&is_commons=&format=json&nojsoncallback=1', true);
    xhr.send();
}

// Fetches the current weather information for a given lat/lng combination
function getWeatherForLocation(location, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var weather = JSON.parse(this.responseText);
    callback(weather);
  }
  xhr.open('get', 'http://api.openweathermap.org/data/2.5/weather?units=metric&lat=' + location.lat + '&lon=' + location.lng, true);
  xhr.send();
}

function getForecastForLocation(location, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var weather = JSON.parse(this.responseText);
    callback(weather.list);
  }
  xhr.open('get', 'http://api.openweathermap.org/data/2.5/forecast?units=metric&lat=' + location.lat + '&lon=' + location.lng, true);
  xhr.send();
}


// Takes an address (or city name) and turns it into a lat/lng tuple
function getLatLngFor(name, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var response = JSON.parse(this.responseText);
    callback(response.results[0].geometry.location);
  };
  xhr.open('get', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + name, true);
  xhr.send();
}

function getLocationNameByLatLng(lat, lng, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var results = JSON.parse(this.responseText).results,
        i = results.length;
    while(i--) {
      if(results[i].types instanceof Array && results[i].types.indexOf('locality') > -1) {
        callback(results[i].formatted_address);
        break;
      } else if(results[i].types == 'locality') {
        callback(results[i].formatted_address);
        break;
      }
    }
  }
  xhr.open('get', 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng, true);
  xhr.send();
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

///////////////////////////
// Application functions //
///////////////////////////


// Manually displaying the weather + a photo using the form:
document.getElementById('go').addEventListener('click', function() {
  getLatLngFor(document.getElementById('location').value, function(location) {
    getWeatherForLocation(location, function(weather) {
      getPhotoForWeatherAt(weather.weather[0].main, location, function(url) {
        document.body.style.backgroundImage = 'url(' + url + ')';
      });

      var mainWeather = weather.main, container = document.getElementById('content');
      var weatherContent = document.importNode(document.querySelector('template').content, true);
      weatherContent.querySelector('h1').textContent = mainWeather.temp + ' °C';
      weatherContent.querySelector('h2').textContent = weather.weather[0].description;

      document.head.querySelector('title').textContent = mainWeather.temp + ' °C, ' + weather.weather[0].description + ' in ' + document.getElementById('location').value; 

      clearChildren(container);
      container.appendChild(weatherContent);
    });
  });
});

// Automatically determine location by Geolocation lookup:
navigator.geolocation.getCurrentPosition(function(pos) {
  var location = {lat: pos.coords.latitude, lng: pos.coords.longitude};
  getWeatherForLocation(location, function(weather) {
    getPhotoForWeatherAt(weather.weather[0].main, location, function(url) {
      document.body.style.backgroundImage = 'url(' + url + ')';
    });

    var mainWeather = weather.main, container = document.getElementById('content');
    var weatherContent = document.importNode(document.querySelector('template#tpl').content, true);
    weatherContent.querySelector('h1').textContent = mainWeather.temp + ' °C';
    weatherContent.querySelector('h2').textContent = weather.weather[0].description;
    var forecastContainer = weatherContent.querySelector(".forecast");

    clearChildren(container);

    getForecastForLocation(location, function(forecasts) {
      clearChildren(forecastContainer);

      for(var i=0, len = forecasts.length; i<len; i++) {
        var date = new Date(parseInt(forecasts[i].dt, 10) * 1000);
        if(new Date().toLocaleDateString() != date.toLocaleDateString()) continue;

        var fcContainer = document.importNode(document.querySelector('template#forecast_entry').content, true);

        fcContainer.querySelector('.forecast_time').textContent = date.toLocaleTimeString().slice(0, -3);
        fcContainer.querySelector('.forecast_img img').src = 'http://openweathermap.org/img/w/' + forecasts[i].weather[0].icon + '.png';
        fcContainer.querySelector('.forecast_temp').textContent = forecasts[i].main.temp + ' °C';
        fcContainer.querySelector('.forecast_text').textContent = forecasts[i].weather[0].description;
        container.appendChild(fcContainer);
      }
    });

    try {
      getLocationNameByLatLng(location.lat, location.lng, function(locationName) {
        document.head.querySelector('title').textContent = mainWeather.temp + ' °C, ' + weather.weather[0].description + ' in ' + locationName;
      });
    } catch(e) {
      document.head.querySelector('title').textContent = mainWeather.temp + ' °C, ' + weather.weather[0].description;
    }
    container.appendChild(weatherContent);
  });
});

document.getElementById('settings').addEventListener('click', function() {
  Modal.open({
    ajaxContent: '/settings.html',
    width: '50%', // Can be set to px, em, %, or whatever else is out there.
    height: '50%',
    openCallback: function() {
      document.forms.settings.set_units.value = settings.units;
      document.forms.settings.set_fallback_location.value = settings.fallback_location;
    },
    closeCallback: function() {
      settings.units = document.forms.settings.set_units.value;
      settings.fallback_location = document.forms.settings.set_fallback_location.value;
      localStorage.setItem('settings', JSON.stringify(settings));
    }
  });
});