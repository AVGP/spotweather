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
          pics[i].url = 'https://farm' + pic.farm + '.staticflickr.com/' + pic.server + '/' + pic.id + '_' + pic.secret + '.jpg';
      }
    var index = Math.floor(Math.random() * pics.length);
    console.log('chosen ', index, pics[index]);
    callback(pics[index].url);
    }
    
    xhr.open('get', 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=a6f892e3b6363359166bdfbd4c1c298d&tags=' + weather + '&sort=interestingness-asc&lat=' + location.lat + '&lon=' + location.lng + '&radius=5&radius_units=km&is_commons=&format=json&nojsoncallback=1', true);
    xhr.send();
}

// Fetches the current weather information for a given lat/lng combination
function getWeatherForLocation(location, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var weather = JSON.parse(this.responseText);
    callback(weather.weather[0].main);
  }
  xhr.open('get', 'http://api.openweathermap.org/data/2.5/weather?lat=' + location.lat + '&lon=' + location.lng, true);
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

///////////////////////////
// Application functions //
///////////////////////////


// Manually displaying the weather + a photo using the form:
document.getElementById('go').addEventListener('click', function() {
  getLatLngFor(document.getElementById('location').value, function(location) {
    getWeatherForLocation(location, function(weather) {
      getPhotoForWeatherAt(weather, location, function(url) {
        var img = document.createElement('img');
        img.src = url;
        document.body.appendChild(img);
      });
    });
  });
});

// Automatically determine location by Geolocation lookup:
navigator.geolocation.getCurrentPosition(function(pos) {
  getWeatherForLocation({lat: pos.coords.latitude, lng: pos.coords.longitude}, function(weather) {
    getPhotoForWeatherAt(weather, location, function(url) {
      var img = document.createElement('img');
      img.src = url;
      document.body.appendChild(img);
    });
  });
});