/// <reference path="angular.min.js" />
/// <reference path="angular-ui-router.js" />


function Customer(Auth, $state, $firebaseObject, $rootScope,$localStorage) {
	this.auth = Auth;
	this.userInfo = this.auth.$getAuth();
	console.log('Home Auth:', Auth);
	this.$storage = $localStorage;
	

	//any time auth state changes, add the user data to scope
	this.auth.$onAuthStateChanged(function (firebaseUser) {
		this.firebaseUser = firebaseUser;
		$rootScope.firebaseUserData = firebaseUser;
		if (firebaseUser != null)
		{
			console.log('Home onAuthStateChanges:', firebaseUser);
			this.$storage = $localStorage;
			this.auth2 = Auth;
			if(typeof this.$storage == "undefined")
			{	
				this.auth2.$signOut();
				$state.go('Login');
			}
			else
			{
				if(typeof this.$storage.time == "undefined")
				{
					this.auth2.$signOut();
					$state.go('Login');
				}
				else
				{
					this.isExpired = ((new Date().getTime() - this.$storage.time) / (1000 * 3600 * 24)) > 1;
					console.log("isExpired",this.isExpired);
					if(this.isExpired > 1)
						{this.auth2.$signOut();
					$state.go('Login');}
				}
			}
			
		}
		else
			$state.go('Login');
	});
	this.bgimg = 'images/rest/rest-3.jpg';
	this.logOut = function () {
		console.log('log out called');
		$localStorage.$reset();
		this.auth.$signOut();
	}
	this.showMenu = false;
	if ($state.current.name == 'Home')
		$state.go('Home.Ask');
}

var app = angular.module("locaApp", ['ngStorage','ui.filters','ngSanitize','angular-toArrayFilter', 'angular-carousel-3d', "ui.router", 'ui.bootstrap', 'firebase'])
	.constant('firebaseRootRef', firebase.database().ref());
    app.run(["$rootScope", "$location","$state", function($rootScope, $location,$state) {
            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)  {
            $rootScope.previousState = fromState.name;
            $rootScope.previousParams = fromParams;
               $rootScope.currentState = toState.name;
               $rootScope.currentParams = toParams;
                console.log("PREIVOUS",$rootScope.previousState,fromParams);
});
            $rootScope.goBack = function()
            {
            	if($rootScope.previousState)
            	{
            		var previousState = $rootScope.previousState;
            		var previousParams = $rootScope.previousParams;
            		if(previousParams)
            		{
            			var Obj = []
            			angular.forEach(previousParams,function(value,key)
            			{
            				Obj[key] = value;	
            			})
            			$state.go(previousState,Obj);
            		}
            	}
            	else
            	{
            		$state.go('Home.Recommend');
            	}
            }
}]);
app.controller("locaCtrl", Customer)
	.filter('myfilter',function()
	{
		return function(logs)
		{
			console.log("filters",logs);
		}
	})
	.config(function ($stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider, $locationProvider,$compileProvider) {
		$urlRouterProvider.otherwise('/login');
		$urlMatcherFactoryProvider.caseInsensitive('true');
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|whatsapp|tel):/);
		//  $locationProvider.html5Mode = true;
		$stateProvider
			.state('Login', {
				url: '/login',
				templateUrl: 'login.html',
				controller: function ($scope, Auth,$http, FirebaseUsersNode, $state, $firebaseObject,$firebaseArray,$localStorage,$sessionStorage) {
					$scope.auth = Auth;
				 function createOrUpdateUser(facebookUser, fbFriends)   // to createOrUpdateUser
					{
						$localStorage.userid = facebookUser.providerData[0].uid;
						$localStorage.time = new Date().getTime();
						var userData = FirebaseUsersNode.getUserDetailObject(facebookUser.providerData[0].uid);
						userData.then(function(data)
						{
							if(facebookUser.providerData[0].uid != data.userId)
								{
									debugger;
									// creating new user
									data.name = facebookUser.displayName;
									data.profilePictureUrl = facebookUser.photoURL;
									data.userId = facebookUser.providerData[0].uid;
									data.email = facebookUser.email;
									data.createdDate = new Date().toString();
									data.lastLogin = new Date().toString();
									if(fbFriends.data.friends.data.length != 0)
									{
										var frnds = fbFriends.data.friends.data;
										var arr = [];
										angular.forEach(frnds,function(value)
										{
											if(data.friends)	
											{
												if(data.friends.indexOf(value.id) == -1) 
												{
												   data.friends.push(value.id);
												}
											}
											else
											{
												arr.push(value.id);
												data.friends = arr;
											}
										})                                    
									}
									
								}
								else
								{
									if(fbFriends.data.friends.data.length != 0)
									{
										var frnds = fbFriends.data.friends.data;
										var arr = [];
										angular.forEach(frnds,function(value)
										{
											if(data.friends)	
											{
												if(data.friends.indexOf(value.id) == -1) 
												{
												   data.friends.push(value.id);
												}
											}
											else
											{
												arr.push(value.id);
												data.friends = arr;
											}
										})                                    
									}
									data.lastLogin = new Date().toString();
								}
								data.$save().then(function (ref) {
										ref.key === data.$id; // true
									}, function (error) {
										console.log("Error:", error);
									}); // ending of saving object
						})
					}

					$scope.signInWithFacebook = function() {
						var provider = new firebase.auth.FacebookAuthProvider();
						console.log("provider",provider);
						provider.addScope('user_friends');
						provider.remember = "sessionOnly";
				
						$scope.auth.$signInWithPopup(provider).then(function(authData) {
							console.log(authData);
						$localStorage.userid = authData.user.providerData[0].uid;
						$localStorage.time = new Date().getTime();
						 $http.get("https://graph.facebook.com/v2.7/me?fields=friends&access_token="+authData.credential.accessToken)
							.then(function(response)
						{
							createOrUpdateUser(authData.user,response); // passing authUser and user_friends response
						})
						.catch(function(error)
						{
							console.log("Error getting Friends",error);
						})
				})  // ending of $signInWithPopup
					}
					// any time auth state changes, add the user data to scope
					$scope.auth.$onAuthStateChanged(function (firebaseUser,$firebaseUtils) {
						$scope.firebaseUser = firebaseUser;
					  //  console.log('onAuthStateChanges:', firebaseUser);
						if (firebaseUser != null) {
							$state.go('Home.Ask');
							
						}

					});
				}
			}
			)
			.state('Home', {
				url: '/home',
				templateUrl: 'Home.html',
				controller: 'locaCtrl',
				controllerAs: 'hCtrl'
			})
			.state('Home.Ask', {
				url: '/Ask',
				templateUrl: 'Asktab.html',
				controller: 'askController',
				controllerAs: 'askCtrl'

			})
			.state('Home.Recommend', {
				url: '/Recommend',
				templateUrl: 'Recommendtab.html',
				controller: 'recommendController',
				controllerAs: 'recommendCtrl'
				// resolve: {
				//     "friendsList" : function(AuthDetail,$firebaseArray,$firebaseObject,Auth,$rootScope)
				//     {
				//         var myId = $rootScope.firebaseUserData.providerData[0].uid.toString();
				//         console.log('myid',myId);
				//         debugger;
				//         var ref = firebase.database().ref();
				//         var usersref = ref.child('/users/'+myId+"/friends");
				//         return $firebaseArray(usersref).$loaded();
				//     }
				// }
			})
			.state('RecommendTip',
			{
				url: '/question?:personID&:questionID',
				templateUrl: 'RecommendTip.html',
				controller: 'recommendTipController',
				controllerAs: 'recommendTipCtrl',
				resolve : {
					"resolveUrlData" : function($stateParams,$q,Auth,$localStorage)
					 { 
					   // debugger;
						var sc = this;
					  var defer = $q.defer();
					  sc.$storage = $localStorage;
					  var uid = sc.$storage.userid;
					   
							if(uid !== undefined && uid != '') {
										 // $rootScope.rootFirebaseUser = firebaseUser;
										  if($stateParams.personID != '' && $stateParams.questionID != '')
								{
								   // debugger;
									var ref = firebase.database().ref();
									var messegesref = ref.child('questions').child($stateParams.personID.toString()).orderByChild('qId').equalTo($stateParams.questionID.toString());
								   // console.log("messegesref",$firebaseArray(messegesref));
								 var dd = messegesref.once("value")
									  .then(function(snapshot) {
										//debugger;
										var key = snapshot.key;
									   // var vx = snapshot.child("authorId").val();
										 var data = snapshot.val();
										defer.resolve(data);
										return data;
										//var childKey = snapshot.child("name/last"); // "last"
										
									  });
									
								}
							};
							return defer.promise;
				   
					
				}}

			})
			.state('PlaceDetail',
			{
				url: '/place/:id',
				templateUrl: 'Partials/placeDetail.html',
				controller: 'placeDetailController',
				controllerAs: 'placeDetailCtrl'
			})
			.state("Answer",
			{
				url: '/answer/:qauthorid/:qid',     // question id and authorid of question
				templateUrl: 'Partials/answerDetail.html',
				controller: 'answerDetailController',
				controllerAs: 'answerDetailCtrl',
				resolve: {
				"usersFriends" : function($q,$localStorage,FirebaseUsersNode)
								{
									var sc = this;
									sc.$storage = $localStorage;
									var defer = $q.defer();
									var myFriends = FirebaseUsersNode.getUserDetail(sc.$storage.userid)
									.then(function(friends)
									{
									   // proper way of using getRecord
										return friends.$getRecord("friends");
									})
									defer.resolve(myFriends);
									return defer.promise;
								}
						}
			})

	})
	.controller('indexController', function ($scope, $firebaseObject, firebaseUrl) {

	})
	.controller('placeDetailController', function ($scope, PlacesApi, $stateParams,$rootScope,$state) {
		//var request = {
		//    placeId: $stateParams.id
		//};
		//console.log('pid:', $stateParams.id);
		//service = new google.maps.places.PlacesService(document.getElementById('map_alt'));
		//service.getDetails(request, callback);
		//function callback(place, status) {
		//    if (status == google.maps.places.PlacesServiceStatus.OK) {
		//        console.log(place);
		//    }
		//}
		PlacesApi.init();
		var d = PlacesApi.search($stateParams.id);
		d.then(function (response) {
			$scope.detailObj = response;
			$scope.bannerImg = $scope.detailObj.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 200 });
			
		});

		// $scope.goBack = function()
		// {
		// 	if($rootScope.previousState)
		// 	{
		// 		var previousState = $rootScope.previousState;
		// 		var previousParams = $rootScope.previousParams;
		// 		if(previousParams)
		// 		{
		// 			var Obj = []
		// 			angular.forEach(previousParams,function(value,key)
		// 			{
		// 				Obj[key] = value;	
		// 			})
		// 			$state.go(previousState,Obj);
		// 		}
		// 	}
		// 	else
		// 	{
		// 		$state.go('Home.Recommend');
		// 	}
		// }
		// console.log(d.name);
		//  console.log(JSON.stringify($scope.detailObj));
	})
	.controller("recommendController", function ($scope,$log,$q,PlacesApi,FirebaseAnswersNode,FirebaseUsersNode,firebaseRootRef,FirebaseQuestionsNode,$localStorage)
	 {
	   // var myid = $rootScope.firebaseUserData.providerData[0].uid;

		$scope.$storage = $localStorage;
		$scope.useridfrmlocalstorage = $scope.$storage.userid;
		$scope.mudit = [0,1,2,3];
		//console.log("++++ STOGAGE +++ ", $scope.$storage);
		$scope.answeredData = [];
		var myFriends = FirebaseUsersNode.getUserDetail($scope.$storage.userid);
		var boolAnswered = false;
		var x=0;
		answeredByUsers = [];
		var myFriendsList;
		var parsedAnswers;
		var getMyRecommendations = myFriends.then(function(friends)
		{
		   // proper way of using getRecord
			return friends.$getRecord("friends");
		}).then(function(frns)
		{
			// then of friends
			console.log(frns);
			myFriendsList = frns;
			var defer = $q.defer();
			var prom = [];
			for(i=0;i<frns.length;i++)
			{
				var defer = $q.defer();
				defer.resolve(FirebaseQuestionsNode.getQuestion(frns[i]));
				prom.push(defer.promise);
			}
			return Promise.all(prom);
		}).then(function(quesRef)
		{
			console.log(quesRef,myFriendsList);
			var defer2 = $q.defer();
			var prom2=[];
			var questionTitles = [];
			var quesAuthorId;
			for(i=0;i<quesRef.length;i++)
			{
				var defer2 = $q.defer();
				for(j=0;j<quesRef[i].length;j++)
				{
					var defer2 = $q.defer();
					if(quesRef[i][j].answered)
	    			{
	    				questionTitles.push({'questionTitle' : quesRef[i][j].questionTitle});
	    				quesAuthorId =  quesRef[i][j].quesAuthorId;
	    				defer2.resolve(FirebaseAnswersNode.getAnswersArray(quesRef[i][j].$id));
	    				prom2.push(defer2.promise);
	    			}
	    			
				}
			}
			return $q.all(prom2)
					.then(function(results)
						{
							var data = [];
							for(i=0;i<results.length;i++)
							{
								for(j=0;j<results[i].length;j++)
								results[i][j] = angular.extend({},results[i][j], questionTitles[i], {"quesAuthorId" : quesAuthorId});
							}
							return results;
						});
		}).then(function(ansRef)
		{
			console.log("ansRef",ansRef);
			var yourAns = [];
			for(i=0;i<ansRef.length;i++)
			{
				for(j=0;j<ansRef[i].length;j++)
				{
					if(answeredByUsers.indexOf(ansRef[i][j].ansAuthorId) == -1) {
                       answeredByUsers.push(ansRef[i][j].ansAuthorId);
                    }

					if(ansRef[i][j].ansAuthorId == $scope.useridfrmlocalstorage)
						boolAnswered = true;
				}

				if(boolAnswered == true)
				{
					var tempAns = angular.extend({}, ansRef[i][0], {'answeredByUsers' : answeredByUsers}, {'totalAnswers' : ansRef[i].length});
					yourAns.push(tempAns);
					answeredByUsers = [];
					boolAnswered = false;
				}
				else
				{
					answeredByUsers = [];
				}
			}

			return yourAns;
		})

// After we get the answer, automatically fetch the tile place background
var bannerImg = getMyRecommendations.then(function(answers) {
	parsedAnswers = answers;
	prom3 = [];
	for(x=0;x<answers.length;x++)
	{
			PlacesApi.init();
			var defer = $q.defer();
			var de = PlacesApi.search(answers[x].locationId).then(function (response) {
			    if(response.photos === undefined)
			        return 'Images/placeholder-sm-min.jpg';

			     else
			     	return response.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 200 });
			})
			 defer.resolve(de);
			 prom3.push(defer.promise);
	}

  return Promise.all(prom3);
}).then(function(images)
{
	var prom4 = [];
	for(x=0;x<parsedAnswers.length;x++)
	{
		parsedAnswers[x] = angular.extend({},parsedAnswers[x],{"locationImage" : images[x] });
			var defer = $q.defer();
			var getProfilePics = getProfilePicPromise(parsedAnswers[x].answeredByUsers);
			
			defer.resolve(getProfilePics);
			prom4.push(defer.promise);
		
		

	}
	console.log("getMyRecommendations",parsedAnswers);
	return Promise.all(prom4);
}).then(function(resultPics)
{
	console.log("finalimg",resultPics);
	for(x=0;x<parsedAnswers.length;x++)
	{
		parsedAnswers[x] = angular.extend({},parsedAnswers[x],{"profilePicArray" : resultPics[x] });
	}
	$scope.answeredData = parsedAnswers;
});

function getProfilePicPromise(authorIds)
{
	var allpics = [];
	var picpromises = [];
	for(i=0;i<authorIds.length;i++)
	{
		var defer = $q.defer();
		var userdetail = FirebaseUsersNode.getUserDetailObject(authorIds[i]+'/profilePictureUrl/')
		.then(function(success)
		{
		   return success.$value;
		})
		defer.resolve(userdetail);
		picpromises.push(defer.promise);
	}

	return Promise.all(picpromises).then(function(popip)
		{
			return popip;
		});
}		
	   // ending of firebase calls
	})
	.controller("recommendTipController", recommendTipCtrl)
function recommendTipCtrl($scope,GeoCodingApi,$localStorage, $log, $stateParams, Auth, $firebaseArray,$firebaseObject,resolveUrlData,$rootScope,$state) {
	var vm = this;
	//debugger;
	vm.$storage = $localStorage;
	vm.userid = vm.$storage.userid;
	vm.data = resolveUrlData[$stateParams.questionID];
	console.log("vm.data==>>>", vm.data);

	var getCountry = GeoCodingApi.getResult(vm.data.locationName);
	getCountry.then(function(results) {
		$scope.countryName = getCountryName(results[0].address_components);
		console.log("GeoCodingApi results ->",$scope.countryName,results[0]);
		// body...
	})

	function getCountryName(addrComponents) {
    for (var i = 0; i < addrComponents.length; i++) {
        if (addrComponents[i].types[0] == "country") {
            return addrComponents[i].short_name;
        }
     }
	}
	
	var ref = firebase.database().ref();
	//debugger;
	var messegesref = ref.child('/users/'+ vm.data.quesAuthorId);
	var rdata =  messegesref.on("value",function(snapshot) {
	   // debugger;
			 var key = snapshot.key;
			 var vx = snapshot.child("authorId").val();
			  var xdata = snapshot.val();
		   //  console.log('tipctrl:',key) ;
	  //        console.log("XXX" , xdata );
	  vm.questionAskedBy = xdata.name;
			  vm.userImg = xdata.profilePictureUrl;
			  setTimeout(function () {
		        $scope.$apply();
		    }, 200);
			 return xdata;
			 // "ada"
			// defer.resolve(data);
			 //var childKey = snapshot.child("name/last"); // "last"
			 
		});                          
  //  console.log("resolveUrlData : ",vm.data , rdata );
	vm.userSelectedpid = '';
	vm.userTip = '';
	vm.checking = function(arg)
	{
		if(arg.slide.pid != '' && $stateParams.personID !='')
		{
			vm.userSelectedpid = arg.slide.pid;
			vm.chosenPlace = arg.slide.caption;
		}
		console.log('checking function called == ',arg.slide.caption,vm.userSelectedpid," <---");
	}

	vm.send = function()
		{//debugger;
			
			//console.log(vm);
			vm.userSelectedpid = vm.slides[0].pid;
			vm.chosenPlace = vm.slides[0].caption;
			//console.log(vm.chosenPlace);
			if(vm.userSelectedpid != '' && $stateParams.personID != '' && $stateParams.questionID !='')
			{
				if(vm.tip == '' && vm.tip == undefined)
					vm.tip = ' ';
				var answersRef = ref.child('/answers/'+ $stateParams.questionID.toString());
				var list = $firebaseArray(answersRef);
				var answerObj = {
					answerText : vm.chosenPlace,
					ansAuthorId: vm.userid,
					commentArrayList: vm.tip,
					locationId: vm.userSelectedpid,
					questionId: $stateParams.questionID,
					ansDate: new Date().toString()
				}
				list.$add(answerObj).then(function(ref) {
						var rid = ref.key;
					console.log("added record with id " +rid , "  " ,ref);
					answersRef.child(rid.toString()+'/answerId/').set(rid);
					var updateRef =  firebase.database().ref().child('questions').child($stateParams.personID.toString()).child($stateParams.questionID.toString());
					vm.qObj = $firebaseObject(updateRef);
					vm.qObj.$loaded().then(function (data) {
						console.log('data: ',data);
					   // var kk = data.answers + 1;
					  

						data.answered = true;
						vm.qObj.$save().then(function(ref) {
									  ref.key === vm.qObj.$id; // true
									  console.log('lastlog',ref);
									  $state.go('Answer', {qauthorid : $state.params.personID, qid: $state.params.questionID});
									  //$state.go('Home.Recommend');
									}, function(error) {
									  console.log("Error:", error);
									});
					});
					
				});
			}
		}

	// vm.slides = [
	//     { 'src': '/images/rest/rest-4.jpg', caption: 'Peacock Paradise', rating: 4, pid: '' },
	//     { 'src': '/images/rest/rest-5.jpg', caption: 'The Sundown', rating: 2, pid: '' },
	//     { 'src': '/images/rest/rest-2.jpg', caption: 'Red Velvet', rating: 3.6, pid: '' },
	//     { 'src': '/images/rest/rest-6.jpg', caption: 'The Peach', rating: 4, pid: '' },
	//     { 'src': '/images/rest/rest-9.jpg', caption: 'Oceanic', rating: 4, pid: '' },
	//     { 'src': '/images/rest/rest-1.jpg', caption: 'Peach', rating: 3.4, pid: '' },
	//     { 'src': '/images/rest/rest-3.jpg', caption: 'Apple', rating: 4, pid: '' }
	// ];
	console.log(vm.slides);
	// SLIDES WITH CAPTIONS
	//===================================


	vm.options = {
		sourceProp: 'src',
		visible: 1,
		perspective: 1,
		startSlide: 0,
		border: 0,
		dir: 'ltr',
		width: 316,
		height: 190,
		space: 370,
		loop: true,
		clicking: true,
	};


	// ANY HTML
	//===================================


	vm.removeSlide = removeSlide;
	vm.addSlide = addSlide;
	vm.selectedClick = selectedClick;
	vm.slideChanged = slideChanged;
	vm.beforeChange = beforeChange;
	vm.lastSlide = lastSlide;


	function lastSlide(index) {
		$log.log('Last Slide Selected callback triggered. \n == Slide index is: ' + index + ' ==');
	}

	function beforeChange(index) {
		$log.log('Before Slide Change callback triggered. \n == Slide index is: ' + index + ' ==');
	}

	function selectedClick(index) {
		$log.log('Selected Slide Clicked callback triggered. \n == Slide index is: ' + index + ' ==');
	}

	function slideChanged(index) {
		$log.log('Slide Changed callback triggered. \n == Slide index is: ' + index + ' ==');
	}


	function addSlide(slide, array) {
		array.push(slide);
		vm.slide2 = {};
	}

	function removeSlide(index, array) {
		array.splice(array.indexOf(array[index]), 1);
	}
	$scope.myPlacesImages = function (arg) {
		var x = 0;
		vm.slides = [];
		vm.slides.length = 0;
			var obj = [];
			obj = {
				src : function(){
						if(arg.photos === undefined)
						   return 'Images/placeholder-sm-min.jpg';
						else
						return arg.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 200 });
						}(),
				caption : arg.name,
				rating: function(){
						if(arg.rating === undefined)
						   return 2;
						else
						return arg.rating;
						}(),
				pid: arg.place_id


			}
			vm.slides.push(obj);

		

		console.log(vm.slides.length);
		   setTimeout(function () {
		        $scope.$apply();
		    }, 200);
		

	}
}



app.directive('googleplace', function () {
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
										return 'Images/placeholder-sm-min.jpg';
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
							img: 'Images/placeholder-sm-min.jpg',
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

app.factory("Auth", ["$firebaseAuth",
	function ($firebaseAuth) {
		return $firebaseAuth();
	}
]);

app.controller("answerDetailController", answerDetailController);
function answerDetailController($rootScope,$localStorage,GoogleStaticMap,usersFriends,$scope,$log,$q,$stateParams,PlacesApi,FirebaseAnswersNode,FirebaseUsersNode,$firebaseArray,$firebaseObject,FirebaseUsersDetail,FirebaseQuestionsNode)
{
	vm = this;
	vm.$storage = $localStorage;
	var slideVisible = 2;
	var isAllowed = false;
	for(x=0;x<usersFriends.length;x++)
	{
		if(usersFriends[x] == $stateParams.qauthorid)
			isAllowed = true;
		else if($stateParams.qauthorid == vm.$storage.userid)
		{
			isAllowed = true;
			vm.myquestion = true;
		}
	}


	if($stateParams.qauthorid != '' && $stateParams.qid != '' && isAllowed == true)
	{
		//var ref = firebase.database().ref();
		//var ansRef = ref.child('/answers/'+ $stateParams.qid.toString());
		//vm.ANSWERS = $firebaseArray(ansRef);
		vm.loading = false;
		vm.ANSWERS = [];
		var once = false;
		var userwhoQuestioned = $stateParams.qauthorid;
		var userwhoAnswered = "";
		vm.slides = [];
		vm.showArr = [];
		var ansRef = FirebaseAnswersNode.getAnswersArray($stateParams.qid.toString());
		ansRef.then(function(ANS)  // all answers for each question
		{
			//var ANS = answersShot.val();
			var questionId = $stateParams.qid;
			var promises = [];
			angular.forEach(ANS,function(value,key)
			{
				//debugger;
				var deferred = $q.defer();
			
				var authorId = ANS[key].ansAuthorId;
				var placeId = ANS[key].locationId;
				PlacesApi.init();
				var d = PlacesApi.search(placeId);
				d.then(function (response) {
					vm.detailObj = response;
				 console.log("placesdetails->",response,response.geometry.location.lat(),response.geometry.location.lng());
				 vm.mapImg = GoogleStaticMap.getStaticMap(response.formatted_address,11,{width: 284,height:100},'roadmap',{lat: response.geometry.location.lat(), long: response.geometry.location.lng()});
				 vm.mapUrl = response.url;
				 console.log("staticMap",vm.mapImg);
				 // staticMap.then(function(sMap)
				 // {
				 	
				 // })
				 if(response.photos === undefined)
					  vm.bannerImg = 'Images/placeholder-sm-min.jpg';

				  else
					vm.bannerImg = vm.detailObj.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 200 });

					 deferred.resolve({'bannerImg' : vm.bannerImg, "detail" : value, "placeName" : vm.detailObj.name, "rating" : vm.detailObj.rating, "pid": vm.detailObj.place_id, "mapImg" : vm.mapImg, "mapUrl" : vm.mapUrl});
					//console.log("VM>SLIDES",vm.slides);
					
					// console.log("+++++pdetails++++",vm.detailObj,vm.bannerImg);
				});

				promises.push(deferred.promise);
			})


			$q.all(promises)
			.then(function(results)
			{
				console.log("results",results);
				angular.forEach(results,function(resValue,resKey)
				{
					var placeId = resValue.detail.locationId;
					//var ansRef = ref.child('/answers/'+ $stateParams.qid.toString());
					var userdetail = FirebaseUsersNode.getUserDetailObject(resValue.detail.ansAuthorId);
					userdetail.then(function(success)
					{
						var proPic = success.profilePictureUrl;
						var authorName = success.name;
						var objStore = angular.extend({},resValue.detail,{'profilePictureUrl' : proPic, 'authorName' : authorName});
						vm.ANSWERS.push(objStore);
						var slideData = { 'src': resValue.bannerImg, "caption": resValue.placeName, "rating": resValue.rating, "pid": resValue.pid , "mapImg" : resValue.mapImg, "mapUrl" : resValue.mapUrl, "comment" : objStore};
						vm.slides.push(slideData); 
						if(once == false)
						{
						  vm.showArr.push('true');
						  once=true;
						}
						else
						{
						  vm.showArr.push('false');   
						}
						console.log("VM>SLIDES",vm.slides);
					})
					.catch(function(error)
						{
							console.log("error",error);
						})
				})
			})
			//console.log("vm.ANSWERS",vm.ANSWERS);
		   // debugger;
			var quesRef = FirebaseQuestionsNode.getQuestionObject($stateParams.qauthorid.toString()+"/"+$stateParams.qid.toString());
		  //  var quesRef = ref.child('questions/'+ userwhoQuestioned+"/"+$stateParams.qid);
			//vm.questionDetail = $firebaseObject(quesRef).$loaded();
			quesRef.then(function(questions)
				{
					vm.questionDetail = questions;
		  //  console.log("vm.questionDetail",vm.questionDetail);
		});

		})
	}

	vm.parseDate = function (dateArg)
	{
		return Date.parse(dateArg);
	}

	console.log(vm.slides);
	// SLIDES WITH CAPTIONS
	//===================================


	vm.options = {
		sourceProp: 'src',
		visible: slideVisible,
		perspective: 1,
		startSlide: 0,
		border: 0,
		dir: 'ltr',
		width: 316,
		height: 190,
		space: 370,
		loop: true,
		clicking: true,
	};


	// ANY HTML
	//===================================


	vm.removeSlide = removeSlide;
	vm.addSlide = addSlide;
	vm.selectedClick = selectedClick;
	vm.slideChanged = slideChanged;
	vm.beforeChange = beforeChange;
	vm.lastSlide = lastSlide;

vm.showText = false;
	function lastSlide(index) {
		$log.log('Last Slide Selected callback triggered. \n == Slide index is: ' + index + ' ==');
	}

	function beforeChange(index) {
		$log.log('Before Slide Change callback triggered. \n == Slide index is: ' + index + ' ==',this.slides[index]);
		//this.slides[index].show = false;
	//	debugger;
		vm.showArr[index] = false;
		setTimeout(function () {
		        $scope.$apply();
		    }, 500);
		var target = document.getElementsByTagName("h1")[index+1];
		console.log("before",angular.element(target).parent('.slide-3d'),angular.element(target).parent('.slide-3d').parent());
	}

	function selectedClick(index) {
		$log.log('Selected Slide Clicked callback triggered. \n == Slide index is: ' + index + ' ==');
		window.location.href = window.location.origin + window.location.pathname + '#/place/'+this.slides[index].pid;
	}

	function slideChanged(index) {
		$log.log('Slide Changed callback triggered. \n == Slide index is: ' + index + ' ==',vm.slides[index][index]);
		//vm.slides[index-1].show = false;
		//vm.slides[index].show = true;
		vm.showArr[index] = true;
		setTimeout(function () {
		        $scope.$apply();
		    }, 500);
		
		var target = document.getElementsByTagName("h1")[index+1];
		console.log(angular.element(target).parent('.slide-3d'),angular.element(target).parent('.slide-3d').parent());
	}


	function addSlide(slide, array) {
		array.push(slide);
		vm.slide2 = {};
	}

	function removeSlide(index, array) {
		array.splice(array.indexOf(array[index]), 1);
	}

	// carousel3d settings end

}
