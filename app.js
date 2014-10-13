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

function getWeatherForLocation(location, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var weather = JSON.parse(this.responseText);
    callback(weather.weather[0].main);
  }
  xhr.open('get', 'http://api.openweathermap.org/data/2.5/weather?lat=' + location.lat + '&lon=' + location.lng, true);
  xhr.send();
}


getLatLngFor("Zurich", function(location) {
  getWeatherForLocation(location, function(weather) {
    getPhotoForWeatherAt(weather, location, function(url) {
      var img = document.createElement('img');
      img.src = url;
      document.body.appendChild(img);
    });
  });
});

function getLatLngFor(name, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var response = JSON.parse(this.responseText);
    callback(response.results[0].geometry.location);
  };
  xhr.open('get', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + name, true);
  xhr.send();
}

//navigator.geolocation.getCurrentPosition(show_map);