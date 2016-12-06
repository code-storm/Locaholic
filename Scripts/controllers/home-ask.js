angular.module("locaApp")
    .controller("askController", function ($log,$scope,FirebaseAnswersNode,FirebaseUsersNode,$uibModal,$q,PlacesApi,Auth,$firebaseArray,$firebaseObject,$rootScope,FirebaseObjectNode,FirebaseQuestionsNode) {
        var $ctrl = this;
        var d = $q.defer();
        $ctrl.auth = Auth;
       
        
 $ctrl.ansObj = [];

        $ctrl.auth.$onAuthStateChanged(function (firebaseUser) {
          if(firebaseUser !=null)
          {
            var x=0;
            answeredByUsers = [];
          $ctrl.authObj = firebaseUser;
          
           var quesRef = FirebaseQuestionsNode.getQuestion(firebaseUser.providerData[0].uid);
           quesRef.then(function(qS)  // all questions
           {
            //var promises = [];
            var deferred = $q.defer();
            angular.forEach(qS,function(qValue,qKey)
            {
              var deferred = $q.defer();
              
              if(qValue.answered)
              {
                
                var ansRef = FirebaseAnswersNode.getAnswersArray(qValue.$id);
                ansRef.then(function(aS)  // all answers for each question
                { var promises = [];
                 // console.log('Each QS: ->',qValue);
                  angular.forEach(aS,function(aValue,aKey)
                  {
                    ++x;
                    if(answeredByUsers.indexOf(aValue.ansAuthorId) == -1) {
                       answeredByUsers.push(aValue.ansAuthorId);
                    }
                   // console.log("Each AS: ->",aValue.$id);
                    if(x==aS.length)
                    {debugger;
                      var deferred = $q.defer();
                      var bannerImg = '';
                      deferred.resolve({ "answeredByUsers" : answeredByUsers , 'qS' : qValue, 'aS' : aValue, "totalAnswers" : aS.length });
                      promises.push(deferred.promise);
                      //console.log("Last AS: ->",aValue,aS.length,answeredByUsers);
                      x=0;
                      answeredByUsers = [];
                      
                    }
                    
                  })
var y =0;
var promises2 = [];
var deferred2 = $q.defer();
                  $q.all(promises)  // promise 1 for getting sync answeredByUsers
                  .then(function(res)
                  {
                    debugger;
                    var profilePicArray = []
                    angular.forEach(res,function(proValue,proKey)
                    {debugger;
                     // console.log("$q each",proKey,proValue);
                      PlacesApi.init();
                      var de = PlacesApi.search(proValue.aS.locationId);
                        de.then(function (response) {
                          if(response.photos === undefined)
                               bannerImg = 'Images/placeholder-sm-min.jpg';

                           else
                           bannerImg = response.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 200 });


                         // console.log("--",bannerImg);
                          deferred2.resolve({ "answeredByUsers" : proValue.answeredByUsers , 'qS' : proValue.qS, 'aS' : proValue.aS, "totalAnswers" : proValue.totalAnswers , "locationImage" : bannerImg});
                         })
                        promises2.push(deferred2.promise);                       
                    })

                    $q.all(promises2)  // promise 2 for getting sync images from google and next combining with profilepics
                    .then(function(res2){
                     // console.log("res2",res2);
                     debugger;
                      var OBJ = res2[0];
                      angular.forEach(OBJ.answeredByUsers,function(answeredUserValue,answeredUserKey)
                      {
                        var userdetail = FirebaseUsersNode.getUserDetailObject(answeredUserValue+'/profilePictureUrl/');
                        userdetail.then(function(success)
                        { ++y;
                            profilePicArray.push(success.$value);
                            if(y == OBJ.answeredByUsers.length)
                            {
                              var parth = angular.extend({}, OBJ.qS, OBJ.aS, {"answeredByUsers" : OBJ.answeredByUsers},{'locationImage' : OBJ.locationImage},{'profilePicArray' : profilePicArray},{'totalAnswers' : OBJ.totalAnswers});
                              
                              $ctrl.ansObj.push(parth);
                            //  console.log("$ctrl.ansObj",$ctrl.ansObj);
                              y=0;
                            }
                        })
                      })
                    })
                  })
                  
                  
                })
              }
              
            })
            
           })
          }
        })

        
                

   

$ctrl.showInput = false;
  $ctrl.items = ['item1', 'item2', 'item3'];
$ctrl.shareLink = "https://goo.gl/";
  $ctrl.animationsEnabled = true;

  $ctrl.open = function (size,qIdArg,fromArg) {
   // debugger;
   // console.log("===>THis",this);
      console.log($scope.askedQuestion,$scope.chosenPlace);
      if(qIdArg != '' && fromArg == 'fromAskPending')
      {
        var modalTileInstance = $uibModal.open({
              animation: $ctrl.animationsEnabled,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceForTileCtrl',
              controllerAs: '$ctrl',
              size: size,
              resolve: {
                "qIdArg" : function()
                {
                  return qIdArg;
                }
              }
            });



          modalTileInstance.result.then(function (selectedItem) {
              $ctrl.selected = selectedItem;
              
            }, function () {
                
              $log.info('Modal dismissed at: ' + new Date());

            });
      }
    else
      {
      if( $scope.chosenPlace!=null && $scope.askedQuestion !=null && $scope.askedQuestion.length > 5 && $scope.chosenPlace.length > 3)
        {
            var modalInstance = $uibModal.open({
              animation: $ctrl.animationsEnabled,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceCtrl',
              controllerAs: '$ctrl',
              size: size,
              resolve: {
                "place" : function()
                {
                  var tempPlace = $scope.chosenPlace;
                  $scope.chosenPlace = '';
                  return tempPlace;
                },
                "questionTitle": function()
                {
                  var tempQuestionTitle = $scope.askedQuestion;
                  $scope.askedQuestion = '';
                 return tempQuestionTitle;
                }
              }
            });



          modalInstance.result.then(function (selectedItem) {
              $ctrl.selected = selectedItem;
              
            }, function () {
                
              $log.info('Modal dismissed at: ' + new Date());

            });
        };
}

}

});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('locaApp').controller('ModalInstanceCtrl', function (place,questionTitle,FirebaseQuestionsNode,$firebaseArray,$uibModalInstance,$scope,FirebaseUsersNode, $rootScope , $localStorage) {
  var $ctrl = this;
  $ctrl.items = 0;
  $ctrl.privateFrnds = [];
  var firebaseDomain = "https://mnv8u.app.goo.gl/";

  var url = '';
  $ctrl.shareLink = firebaseDomain+"?link="+ encodeURIComponent(window.location.origin+"/#/question?"+url)+"&apn=com.locaholic.android"+"&afl="+ encodeURIComponent(window.location.origin+"/#/question?"+url);
  $ctrl.$storage = $localStorage;
  $ctrl.showInput = false;
console.log('ModalInstance : ',0);
  $ctrl.ok = function () {
    $uibModalInstance.close();
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $ctrl.myFriendList = function()
  {
    var myFriends = FirebaseUsersNode.getUserDetail($ctrl.$storage.userid);
    myFriends.then(function(friends)
        {
           // proper way of using getRecord
            var frn = friends.$getRecord("friends");
            $ctrl.frndsCollection = [];
            angular.forEach(frn,function(value)
            {
               var detail = FirebaseUsersNode.getUserDetailObject(value);
               detail.then(function(single)
               {
                var dataExists = single.$value !== null;
                if(dataExists)
                {
                  $ctrl.frndsCollection.push(single);
                }
               })
               
            })
             })
  }
  $ctrl.myFriendList();
  $ctrl.formData = {};
  $ctrl.updateAll = function () {
        if ($ctrl.selectedAll) {
            $ctrl.selectedAll = true;
        } else {
            $ctrl.selectedAll = false;
        }
        angular.forEach($ctrl.frndsCollection, function (value,item) {
            $ctrl.formData[value.userId] = $ctrl.selectedAll;
        });
      }



  $ctrl.send = function()
  {
   // debugger; OLD function
   //  if($ctrl.formData)
   //  {
   //    // angular.forEach($ctrl.formData,function(value)
   //    // {
   //       $ctrl.privateFrnds = [];
   //      for (var key in $ctrl.formData) {
   //        if ($ctrl.formData.hasOwnProperty(key)) {
   //          if($ctrl.formData[key] === true)
   //          {
   //          $ctrl.privateFrnds.push(key);
   //          }
   //        }
   //      }
   //    if($ctrl.privateFrnds.length > 0)
   //    {
   //       url = addfun();
   //    }
   // //   })
   //  }
   // NEW FUNCTION
   // NEW function
    if($ctrl.formData)
    {
      $ctrl.privateFrnds = [];
      if($ctrl.selectedAll)
      {
        url = addfun();
      }
      else
      {
          for (var key in $ctrl.formData) {
            if ($ctrl.formData.hasOwnProperty(key)) {
              if($ctrl.formData[key] === true)
              {
              $ctrl.privateFrnds.push(key);
              }
            }
          }
        if($ctrl.privateFrnds.length > 0)
          {
             url = addfun();
          }
      }
    }
  }

  // below function is used to send for Asking from friends
 function addfun() {
            if( place!=null && questionTitle !=null && questionTitle.length > 5 && place.length > 3)
       {var ref = firebase.database().ref();
        var messagesRef = ref.child('questions/'+$ctrl.$storage.userid);
      // var list = FirebaseQuestionsNode.getQuestion($ctrl.$storage.userid);
       var list = $firebaseArray(messagesRef);
       var listObj = {
         questionTitle: questionTitle,
         locationName: place,
         quesDate: new Date().toString(),
         quesAuthorId: $ctrl.$storage.userid,
         answered: false,
         isPrivate: !$ctrl.selectedAll,
         peopleWhoCanSeePrivateQuestion: function(){
          if($ctrl.privateFrnds.length>0)
            return $ctrl.privateFrnds;
          else
            return null
         }()
       };
      return list.$add(listObj).then(function(ref) {
  var qid = ref.key;
  console.log("added record with id " +qid , "  ", $ctrl.$storage.userid );
  $ctrl.shareLink = window.location.hostname + "/#/question?personID="+$ctrl.$storage.userid+"&questionID="+ref.key;
  // adding Qid in users
    var nRef = firebase.database().ref();
    // creating questionAsked if Not exist
        var qRef2 = nRef.child("/questions/"+$ctrl.$storage.userid+"/"+qid+"/qId/");
          qRef2.set(qid);
          
         //  console.log(uid);
   $ctrl.showInput = true;
     //console.log('success fun');
   questionTitle = '';
  return 'personID='+$ctrl.$storage.userid+'&questionID='+qid;

});
       }
        }
      });

// Please note that the close and dismiss bindings are from $uibModalInstance.

angular.module('locaApp').component('modalComponent', {
  templateUrl: 'myModalContent.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function () {
    var $ctrl = this;

    $ctrl.$onInit = function () {
      $ctrl.shareLink = 'xfefe';
      
    };

    $ctrl.ok = function () {
      $ctrl.close({$value: '1'});
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});


// Modal For Pending TIle
angular.module('locaApp').controller('ModalInstanceForTileCtrl', function (qIdArg,FirebaseQuestionsNode,$firebaseArray,$firebaseObject,$uibModalInstance,$scope,FirebaseUsersNode, $rootScope , $localStorage) {
 // debugger;
  var tileCtrl = this;
  tileCtrl.items = 0;
  tileCtrl.privateFrnds = [];
  tileCtrl.$storage = $localStorage;
  var firebaseDomain = "https://mnv8u.app.goo.gl/";

  var url = 'personID='+tileCtrl.$storage.userid+'&questionID='+qIdArg;
  tileCtrl.shareLink = firebaseDomain+"?link="+ encodeURIComponent(window.location.origin+"/#/question?"+url)+"&apn=com.locaholic.android"+"&afl="+ encodeURIComponent(window.location.origin+"/#/question?"+url);
  
  tileCtrl.showInput = true;
console.log('ModalInstanceForTileCtrl : ',0);
  tileCtrl.ok = function () {
    $uibModalInstance.close();
  };

  tileCtrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
//debugger;
  tileCtrl.populateModal = function()
  {
    var myFriends = FirebaseUsersNode.getUserDetail(tileCtrl.$storage.userid);
    myFriends.then(function(friends)
        {
         // console.log("___",friends);
           // proper way of using getRecord
          // debugger;
            var frn = friends.$getRecord("friends");
            console.log("___",friends,frn);
            tileCtrl.frndsCollection = [];
            angular.forEach(frn,function(value)
            {
             // debugger;
               var detail = FirebaseUsersNode.getUserDetailObject(value);
               detail.then(function(single)
               {
               var dataExists = single.$value !== null;
                if(dataExists)
                {
                tileCtrl.frndsCollection.push(single);
                }
               })
               
            })
             })
  }
  tileCtrl.populateModal();
  tileCtrl.formData = {};
  tileCtrl.updateAll = function () {
        if (tileCtrl.selectedAll) {
            tileCtrl.selectedAll = true;
        } else {
            tileCtrl.selectedAll = false;
        }
       // debugger;
        angular.forEach(tileCtrl.frndsCollection, function (value,item) {
         // debugger;
        
            tileCtrl.formData[value.userId] = tileCtrl.selectedAll;
        });
      }



  tileCtrl.send = function()
  {
   // debugger; OLD function
    // if(tileCtrl.formData)
    // {
    //   console.log("tileCtrl.formData",tileCtrl.formData);
    //     tileCtrl.privateFrnds = [];
    //     for (var key in tileCtrl.formData) {
    //       if (tileCtrl.formData.hasOwnProperty(key)) {
    //         if(tileCtrl.formData[key] === true)
    //         {
    //         tileCtrl.privateFrnds.push(key);
    //         }
    //       }
    //     }
    //   if(tileCtrl.privateFrnds.length > 0)
    //   {
    //      UpdatePrivateFriends();
    //   }
 
    // }

    // NEW function
    if(tileCtrl.formData)
    {
      if(tileCtrl.selectedAll)
      {
        UpdateIsPrivate();
      }
      else
      {
        tileCtrl.privateFrnds = [];
          for (var key in tileCtrl.formData) {
            if (tileCtrl.formData.hasOwnProperty(key)) {
              if(tileCtrl.formData[key] === true)
              {
              tileCtrl.privateFrnds.push(key);
              }
            }
          }
        if(tileCtrl.privateFrnds.length > 0)
          {
             UpdatePrivateFriends();
          }
      }
    }

  }

  function UpdateIsPrivate()
  {
    var ref = firebase.database().ref();
    var messagesRef = ref.child('questions/'+tileCtrl.$storage.userid+"/"+qIdArg);
     var list = $firebaseObject(messagesRef);
     list.$loaded()
     .then(function(single)
     {
      single.isPrivate = false;
      single.$save();
     })
     .catch(function(err)
     {
      console.log(err);
     })
  }

  function UpdatePrivateFriends()
  {
    var ref = firebase.database().ref();
    var messagesRef = ref.child('questions/'+tileCtrl.$storage.userid+"/"+qIdArg);
     var list = $firebaseObject(messagesRef);
     list.$loaded()
     .then(function(single)
       {
        single.peopleWhoCanSeePrivateQuestion = tileCtrl.privateFrnds;
        single.isPrivate = true;
        single.$save();
       
       })
     .catch(function(err)
     {
      console.log(err);
     })
  }

      });