app.directive('googlefoodplace', function () {
	return {
		require: 'ngModel',
		scope: {
			myPlaces: '='

		},
		link: function (scope, element, attrs, model) {
			var options = {
				componentRestrictions: {}
			};
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
			//  console.log(google.maps)
			var places = [];
			google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
				var place = scope.gPlace.getPlace();
				console.log(place);
				console.log('main place:');
				angular.forEach(place.types, function (value, key) {
					if (place.types[key] == 'restaurant' || place.types[key] == 'food') {
						if (place != undefined) {
							var obj = {
								name: place.name,
								img: function () {
									if (place.photos != undefined)
										return place.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 200 });
									else
										return 'images/placeholder-sm-min.jpg';
								} (),
								rating: function () {
									if (place.rating == undefined)
										return 3;
									else
										return place.rating;
								} (),
								placeid: place.place_id
							};
							places.push(obj);
							console.log('places');
							console.log(places);

						}
					}
				});

				scope.$apply(function () {
					model.$setViewValue(element.val());
				});
				var newPos = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
				var request = {
					location: newPos,
					radius: 2000,
					types: ['restaurant', 'food', 'cafe', 'meal_delivery', 'meal_takeaway', 'night_club', 'amusement_park','bakery','movie_theater','bar']
				};
				var service = new google.maps.places.PlacesService(document.getElementById('map'));

				service.nearbySearch(request, callback);

			});

			function callback(results, status) {
				// debugger;

				if (status == google.maps.places.PlacesServiceStatus.OK) {
					console.log(results);
					addPlacesIntoObj(results);
					scope.myPlaces(places);
					console.log('after push');
					console.log(places);
				}
			}

			function addPlacesIntoObj(results) {
				for (var i = 0; i < results.length; i++) {
					if (results[i].photos != undefined) {
						var obj = {
							name: results[i].name,
							img: results[i].photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 200 }),
							rating: function () {
								if (results[i].rating == undefined)
									return 3;
								else
									return results[i].rating;
							} (),
							placeid: results[i].place_id
						};
						console.log(results[i].name)
						places.push(obj);

					}
					else {
						var obj = {
							name: results[i].name,
							img: 'images/placeholder-sm-min.jpg',
							rating: function () {
								if (results[i].rating == undefined)
									return 3;
								else
									return results[i].rating;
							} (),
							placeid: results[i].place_id
						};
						console.log(results[i].name)
						places.push(obj);
					}

				}
			}
		}
	};
})

app.directive('googleautocomplete', function () {
	return {
		require: 'ngModel',
		scope: {
			myPlaces: '='

		},
		link: function (scope, element, attrs, model) {
			var options = {
				componentRestrictions: {}
			};
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
			//  console.log(google.maps)
			var places = [];
			google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
				var place = scope.gPlace.getPlace();
				console.log(place);
				//console.log('main place:',place.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 200 }));
				scope.$apply(function () {
					model.$setViewValue(element.val());
				});
			});

		}
	};
})


app.directive('googleplacesearch', function () {
	return {
		require: 'ngModel',
		scope: {
			myPlaces: '='

		},
		link: function (scope, element, attrs, model) {
			var options = {
				componentRestrictions: {}
			};
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
			//  console.log(google.maps)
			var places = [];
			google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
				var place = scope.gPlace.getPlace();
				console.log(place);
				scope.$apply(function () {
					model.$setViewValue(element.val());
				});
				scope.myPlaces(place);
				console.log('main place:',place);
				

				

			});
		}
	};
})


app.directive('gautocompwithrestriction', function () {

	var googlePlace = {
		init : function (scope, element, attrs, model) {
			var options = {
				componentRestrictions: {
					country: scope.countryName
				}
			};
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
			//  console.log(google.maps)
			var places = [];
			google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
				var place = scope.gPlace.getPlace();
				console.log(place);
				scope.$apply(function () {
					model.$setViewValue(element.val());
				});
				scope.myPlaces(place);
				console.log('main place:',place);
				

				

			});
		}
	}

	return {
		require: 'ngModel',
		scope: {
			myPlaces: '=',
			countryName: '='
		},
		link: function (scope,element,attrs,model) {
			scope.$watch('countryName', function() {
          if(scope.countryName === undefined) return;

          googlePlace.init(scope,element,attrs,model);
        });
		}
	};
})