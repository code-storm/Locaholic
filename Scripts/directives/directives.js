var app = angular.module("locaApp")
app.directive("askPendingTileDirective",function(AuthDetail,$firebaseArray,Auth)
{
    function linkFunction(scope,elem,attrs){
        scope.auth = Auth;
        scope.urlStart = window.location.hostname;
        scope.auth.$onAuthStateChanged(function (firebaseUser) {
                   //   console.log('dir state change : ', firebaseUser);
                      if(firebaseUser != null)
            {
                var ref = firebase.database().ref();
                var messegesref = ref.child('/questions/'+ firebaseUser.providerData[0].uid);
                scope.listObj = $firebaseArray(messegesref);
               // console.log('directive tile :',scope.listObj);
            }
        });
    }
    return {
        restrict: 'E',
        templateUrl: 'Partials/askPendingTile.html',
        link : linkFunction,
        scope: false
    };
})


app.directive("askAnsweredTileDirective",function()
{
   
    return {
        restrict: 'E',
        templateUrl: 'Partials/askAnsweredTile.html',
        scope:false
    };
})

.directive("recommendPendingTileDirective",function(AuthDetail,$rootScope,$firebaseObject,FirebaseQuestionsNode,FirebaseUsersNode, $localStorage, $firebaseArray,Auth)
{
    function linkFunction(scope,elem,attrs){
        scope.auth = Auth;
        scope.urlStart = window.location.hostname;
        // NEW
        scope.$storage = $localStorage;
        var myFriends = FirebaseUsersNode.getUserDetail(scope.$storage.userid);
        var boolAnswered = false;
        scope.questIds = [];
        $rootScope.recommendBubble = 0;
        myFriends.then(function(friends)
        {
           // proper way of using getRecord
            var frn = friends.$getRecord("friends");
            angular.forEach(frn,function(value)
            {   //debugger;
                var questsRef = FirebaseQuestionsNode.getQuestion(value);
                questsRef.then(function(questions)
                {   //debugger;
                    angular.forEach(questions,function(question)
                    {//debugger;
                    var boolPrivate = question.isPrivate;
                    boolAnswered = question.answered;
                    if(!boolAnswered)
                    {
                        if(boolPrivate)
                        {
                           // debugger;
                            var privateFriendsList = question.peopleWhoCanSeePrivateQuestion;
                            angular.forEach(privateFriendsList,function(value2)
                            {
                                if(value2 == scope.$storage.userid)
                                 {
                                   var tempObj = getAndMerge(question);
                                   tempObj.then(function(response)
                                   {
                                    
                                    scope.questIds.push(response);
                                    console.log("&*&*&*QUESTIDs",scope.questIds);
                                   })
                                   
                                   
                                 }
                            })
                        }

                        else
                        {
                            var tempObj = getAndMerge(question);
                            tempObj.then(function(response)
                                   {
                                    
                                    scope.questIds.push(response);
                                    console.log("&*&*&*QUESTIDs",scope.questIds);
                                   })
                        }
                    }

                    })

                })
            })
        })

        function getAndMerge(questPara)
        {
            ++$rootScope.recommendBubble;
            var authorId = questPara.quesAuthorId;
            var authorRef = FirebaseUsersNode.getUserDetail(authorId);
           return authorRef.then(function(authorDetails)
            {
                var fullName = authorDetails.$getRecord("name").$value;
                var profilePic = authorDetails.$getRecord("profilePictureUrl").$value;
                var mergedObj = angular.extend({},questPara,{'fullName' : fullName},{'profilePic' : profilePic});
                return mergedObj;
            })
        }
        // OLD
        // scope.auth.$onAuthStateChanged(function (firebaseUser) {
        //            //   console.log('dir state change : ', firebaseUser);
        //               if(firebaseUser != null)
        //     {
        //         scope.myId = firebaseUser.providerData[0].uid.toString();
        //       //  console.log('myid',scope.myId);
        //       scope.listObj = [];
        //       scope.questIds = [];
        //         var ref = firebase.database().ref();
        //         var friendsRef = ref.child('/users/'+scope.myId+'/friends/');
        //         friendsRef.on("value",function(friendSnap)
        //         {
        //             var friendsList = friendSnap.val();
        //             angular.forEach(friendsList,function(value,key)
        //             {
        //                 var questRef = ref.child('/questions/'+friendsList[key]+'/');
        //                     scope.listObj = $firebaseArray(questRef);
        //                     questRef.on("value",function(snapshot)
        //                     {   var svar = snapshot.val();
        //                         angular.forEach(svar,function(value2,key2)
        //                         {
        //                             if(svar[key2].peopleWhoCanSeePrivateQuestion !== undefined && svar[key2].answered == false)
        //                             {
        //                             if(svar[key2].peopleWhoCanSeePrivateQuestion.length > 0)
        //                             {
        //                                 var temp = svar[key2].peopleWhoCanSeePrivateQuestion;
        //                                 angular.forEach(temp,function(value3)
        //                                 {
        //                                     if(value3 == scope.myId)
        //                                     {
        //                                         console.log("peopleWhoCanSeePrivateQuestion",svar[key2]);
        //                                         scope.questIds.push(svar[key2]);
        //                                     }
        //                                     console.log("&*&*&*QUESTIDs",scope.questIds);
        //                                 })
                                        
        //                             }
        //                         }
                                    
        //                           //  console.log(svar[key2]);
        //                         })
                                
        //                     })
        //                     //console.log('plz',scope.listObj,scope.questIds);
        //             })
                    
        //         })
                
                
        //         //  OrderBy date and filtering by authorId != loginUserId is done under
        //     }
        // });
    }
    return {
        restrict: 'E',
        templateUrl: 'Partials/recommendPendingTile.html',
        link : linkFunction
    };
})

.directive("recommendAnsweredTileDirective",function(AuthDetail,$firebaseArray,$firebaseObject,Auth,$timeout)
{
   
    return {
        restrict: 'E',
        templateUrl: 'Partials/recommendAnsweredTile.html',
        scope: false
    };
})

.directive('fbSrc', ['$log', function ($log) {
    // Used to embed images stored in Firebase
    
    /*
    Required attributes:
        fp-src (The name of an image stored in Firebase)
    */
    return {
        link: function (scope, elem, attrs) {
            var safename = attrs.fpSrc.replace(/\.|\#|\$|\[|\]|-|\//g, "");
            var dataRef = new Firebase( [scope.firebaseUrl, 'images', safename].join('/') );
            elem.attr('alt', attrs.fpSrc);
            dataRef.once('value', function (snapshot) {
                var image = snapshot.val();
                if (!image) {
                    $log.log('It appears the image ' + attrs.fpSrc + ' does not exist.');
                }else{
                    elem.attr('src', image.data);
                }
            });
        },
        restrict: 'A'
    };
}]);