var app = angular.module("locaApp")
    app.factory("firebaseArray", ["$firebaseArray",
  function ($firebaseArray) {
      // create a reference to the database location where we will store our data
      var ref = firebase.database().ref();

      // this uses AngularFire to create the synchronized array
      return $firebaseArray(ref);
  }
])

.factory("firebaseObject", ["$firebaseObject",
    function ($firebaseObject) {
        // create a reference to the database location where we will store our data
        var ref = firebase.database().ref();

        // this uses AngularFire to create the synchronized array
        return $firebaseObject(ref);
    }
])

.factory("AuthDetail", ["Auth","$q",
function (Auth,$q)
{   
    var factory = {};
    var d = $q.defer();
    factory.getDetail = function() {
    var detail = Auth.$getAuth();
    d.resolve(detail);
    return d.promise;
    }
    return factory;
}
])


.factory("FirebaseObjectNode", function ($firebaseObject)
{
    var factory={};

    factory.create = function(nodeLocation) {
        var nRef = firebase.database().ref().child(nodeLocation);
        return $firebaseObject(nRef);
    }
    return factory;
})

.factory("FirebaseUsersDetail", function ($q,$firebaseArray)
{
    var factory = {};
    var deferred = $q.defer();
    factory.byUserId = function(uid)
    {
        var nRef = firebase.database().ref().child("users/"+uid.toString());
        // var sss = $firebaseArray(nRef);
        // return sss;
        nRef.on("value",function(snapshot)
        {
            var sn = snapshot.val();
             deferred.resolve(sn);
            // return deferred.promise;
        })
        return deferred.promise;
    }
    return factory;
})

.factory("FirebaseUsersNode", function($firebaseArray,$firebaseObject,$q,firebaseRootRef)
{
    // this factory will only work inside Home.html or home state becoz of rootscope of firebase
    var factory = {};
    var deferred = $q.defer();
    factory.getUserDetail = function(myuid)    // getting all friends uid for logged in user
    {       
        var usersref = firebaseRootRef.child('/users/'+myuid);
        return $firebaseArray(usersref).$loaded();
    }

    factory.getUserDetailObject = function(myuid)    // getting all friends uid for logged in user
    {       
        var usersref = firebaseRootRef.child('/users/'+myuid);
        return $firebaseObject(usersref).$loaded();
    }

    return factory;
})

.factory("FirebaseQuestionsNode", function($firebaseArray,$firebaseObject,$q,firebaseRootRef)
{
    // this factory will only work inside Home.html or home state becoz of rootscope of firebase
    var factory = {};
    var deferred = $q.defer();
    factory.getQuestion = function(myuid)    // getting all friends uid for logged in user
    {       
        var quesref = firebaseRootRef.child('/questions/'+myuid);
        return $firebaseArray(quesref).$loaded();
    }

    factory.getQuestionObject = function(myuid)    // getting all friends uid for logged in user
    {       
        var quesref = firebaseRootRef.child('/questions/'+myuid);
        return $firebaseObject(quesref).$loaded();
    }

    return factory;
})

.factory("FirebaseAnswersNode", function($firebaseArray,$firebaseObject,$q,firebaseRootRef)
{
    // this factory will only work inside Home.html or home state becoz of rootscope of firebase
    var factory = {};
    var deferred = $q.defer();
    factory.getAnswersArray = function(myQid)    // getting all friends uid for logged in user
    {       
        var answersRef = firebaseRootRef.child('/answers/'+myQid);
        return $firebaseArray(answersRef).$loaded();
    }

    factory.getAnswersObject = function(myQid)    // getting all friends uid for logged in user
    {       
        var answersRef = firebaseRootRef.child('/answers/'+myQid);
        return $firebaseObject(answersRef).$loaded();
    }

    return factory;
})

.factory("PlacesDetailApi",function($http)
{
    var factory = {};

    factory.getPlaceDetail = function(placeId)
    {
       // debugger;
       return $http.get("https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeId+"&key=AIzaSyBgFHYQ6Bvy7P0YiND6V7adXNk2jJePxjk");
        
    }

    return factory;
})

.factory("GeoCodingApi",function($q)
{
    var factory = {};

    factory.LocationToLatLong = function (address) {
        //debugger;
        var defer = $q.defer();
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
            defer.resolve(results[0].geometry.location)
              //return results[0].geometry.location;
            
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
        return defer.promise;
      }

      factory.getResult = function (address) {
        var defer = $q.defer();
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
            defer.resolve(results)
            
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
        return defer.promise;
      }

      return factory;
})

.factory("NearbyPlacesApi",function($q)
{
    var defer = $q.defer();
    var factory = {};

    factory.getNearbyPlaces = function(latLong,radius,node)
    {
        var request = {
            location: latLong,
            radius: radius,
            types: ['restaurant', 'food', 'cafe', 'meal_delivery', 'meal_takeaway', 'night_club', 'amusement_park','bakery','movie_theater','bar']
          };
        service = new google.maps.places.PlacesService(document.getElementById(node));
        service.nearbySearch(request, callback);
        function callback(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            
            defer.resolve(results);
            
          }
        }
        return defer.promise;
    }
    return factory;
})

.factory("GoogleStaticMap",function($q,$http)
{
    var defer = $q.defer();
    var factory = {};

    factory.getStaticMap = function(address,zoom,size,maptype,geometry)
    {
        var marker = window.location.origin + window.location.pathname + '/images/pin_marker.png';
        return 'https://maps.googleapis.com/maps/api/staticmap?center='+encodeURIComponent(address)+'&zoom='+zoom+'&size='+size.width+'x'+size.height+'&maptype='+maptype+'&markers=icon:'+encodeURIComponent(marker)+'|'+geometry.lat+','+geometry.long+'&key=AIzaSyBgFHYQ6Bvy7P0YiND6V7adXNk2jJePxjk';
    }

    return factory;
})

.service('PlacesApi', function ($q) {

    this.init = function () {
        var options = {
            center: new google.maps.LatLng(40.7127837, -74.00594130000002),
            zoom: 13,
            disableDefaultUI: true
        }
        this.map = new google.maps.Map(
            document.getElementById("map2"), options
        );
        this.places = new google.maps.places.PlacesService(this.map);
    }

    this.search = function (pid) {
        var d = $q.defer();
        var request = {
            placeId: pid
        };
        var placeDetail = {};
        console.log('pid:', pid);
        this.places.getDetails(request, callback);
        function callback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                angular.forEach(place, function (value, key) {
                   // console.log(key);
                    placeDetail[key] = value;
                });
                d.resolve(place);
                return place;
            }
            else {
                // invalid response
                return d.reject(place);
            }
        }

        return d.promise;
    }
});
