var app = angular.module('myapp', ['ngRoute']);

app.config(function ($routeProvider) {

    $routeProvider.when('/', {
            template: "<h1>Welcome to MEAN STACK </h1>"
        })
        .when("/signup", {
            templateUrl: "views/signup.html",
            controller: "signUpController"
        })
        .when("/login", {
            templateUrl: "views/login.html",
            controller: "logInController",
           
        })
        .when("/home", {
            templateUrl: "views/home.html",
            resolve: ["authservice", function(authservice){
                    return authservice.checkuserstatus();
                    }]
        })
        .when("/messages", {
            templateUrl: "views/messages.html",
            controller: "messageController",
            resolve: ["authservice", function(authservice){
               // console.log( authservice.checkuserstatus());
                return authservice.checkuserstatus();
                    }]
        })
        .when("/details/:dId", {
            templateUrl: "views/details.html",
             controller: "detailsController",
             resolve: ["authservice", function(authservice){
                return authservice.checkuserstatus();
                    }]
        });

});

app.controller('mycntrl', function ($rootScope, $location, $scope) {

    $rootScope.authstatus = true;
   
    $scope.logOut = function () {
        
        $rootScope.authstatus = true;
        var token_value = localStorage.getItem("token");
       // console.log("inside logout");
        //console.log(token_value);
        localStorage.removeItem("token");
        $location.path(['/login']);
    };

});

app.factory("authservice", function($location ){
    return{
       mytoken : localStorage.getItem("token"),
        checkuserstatus :  function($route){
            if(this.mytoken){
                //console.log(this.mytoken);
                return true; 
                
            }
           else{

           // $route.reload();
           $location.path(['/login']);
           
            return false;
           } 
        }
    }

});

app.factory("serviceDetails", function($http, $q){

    var token_value = localStorage.getItem("token");

        return{
           getData : function(){
                    var defer = $q.defer();

                    $http.get("http://localhost:3000/messages",  {
                        headers: {
                            'token': token_value
                            }
                        })
                    .then(function(resp){
                        
                        // console.log("resp");
                        // console.log(resp.data);

                        defer.resolve(resp);
                        //resp.send(resp.data);
                       // console.log(defer.promise);
                    });
                   
                   return defer.promise;  
                             
           } 
        }
});

app.controller('signUpController', function ($scope, $http, $location) {


    var user;

    $scope.signUp = function () {

        //console.log(this.user);

        $http.post("/signup", JSON.stringify(this.user))
            .then(function (resp) {

                    //console.log("resp data");
                    // console.log(resp.data);
                    $location.path(['/login']);

                },
                function (err) {

                    alert("invalid username or password ");
                    $location.path(['/signup']);


                });
    };
});

app.controller('logInController', function ($scope, $http, $location, $rootScope) {

    //  $rootScope.authstatus = true;
    var login_input;
    $scope.logIn = function () {

        // console.log(this.login_input);

        $http.post("/login", JSON.stringify(this.login_input))
            .then(function (resp) {
                 console.log("inside fu");
                //console.log(resp);
                //console.log(resp.data.result.length);
                if (resp.data.data.length > 0) {
                    $location.path(['/home']);
                    $rootScope.authstatus = !$rootScope.authstatus;
                    localStorage.setItem("token", resp.data.token);

                } else {
                    alert("login invalid");
                    $location.path(['/login']);
                }
            });
    };


});


app.controller("messageController", function ($http, $scope, $route, $rootScope) {

    var token_value = localStorage.getItem("token");
    //console.log(token_value);
    $scope.message_data;

    var message_input;

    $http.get("http://localhost:3000/messages", {
            headers: {
                'token': token_value
            }
            })
            .then(function (resp) {

                $scope.message_data = resp.data;
                $rootScope.authstatus = false;
            })
            .catch(function (ex) {
                console.log(ex);
            });

    $scope.deleteMessage = function (deleteId) {

        var delete_obj = {
                        "id": deleteId 
                         };
        $http.post("http://localhost:3000/deleteMessage", delete_obj, {
            headers: {
                'token': token_value
            }
        }).then(function (resp) {

            //console.log("in then");
            //console.log(resp.data);
            $route.reload();
            $rootScope.authstatus = false;

           // resp.status(200).send("delete valid");
            
        })
        .catch(function(ex){
            //console.log("in catch");
            console.log(ex.message);
        });
    };

    $scope.userlist; 
    $http.get("http://localhost:3000/userlist", {
            headers: {
                'token': token_value
            }
            })
            .then(function (resp) {

               // console.log("inside uer lsie");
                //console.log(resp.data);
                $scope.userlist = resp.data;
                $rootScope.authstatus = false;
            })
            .catch(function (ex) {
                console.log(ex);
            });

            $scope.markAsImportant = function(messageID)
            {   
                var message_obj_Id ={
                    "id" : messageID,
                    "isImportant": this.isImportant = true ? true : false
                }
                $http.post("/updateImp",message_obj_Id ,{
                    headers: {
                        'token': token_value
                    }
                    })
                    .then(function (resp) {
                        
                            console.log(resp);
                            //$route.reload();
        
                        })
                        .catch(function(ex){
                            console.log(ex);                
                        });
                    
            };

    $scope.enterMessage = function(){

        $http.post("/messages", this.message_input,{
        headers: {
            'token': token_value
        }
        })
            .then(function (resp) {

                    // console.log("resp data");
                    // console.log(resp.data);
                   $route.reload();

                })
                .catch(function(ex){
                    console.log(ex);                
                });
    };
}); 


app.controller("detailsController", function($scope, $location, $http,serviceDetails, $rootScope, $routeParams, $route){

    var token_value = localStorage.getItem("token");
 
    var detailId = $routeParams['dId'];
  
   serviceDetails.getData().then(function(resp){
 

     var reply_message;

      id_m = resp.data[detailId]._id;
      message_id ={
        "id" : id_m
        } ;
        
        $scope.message_details_data;

        $http.post("http://localhost:3000/details/:dId", message_id, {
        headers: {
            'token': token_value
        }
        }).then(function (resp) {
          
            $scope.message_details_data = resp.data;

            //console.log($scope.message_details_data);
           // console.log(resp.data[detailId].messageBody);
           // console.log($scope.message_details_data.messageBody);

            $rootScope.authstatus = false;

        })
        .catch(function (ex) {
            console.log(ex);
        });

        $scope.deleteFromDetails = function(id_m){
            
            // var message_obj = {
            //     "id": id_m
            // }; 
            $http.post("http://localhost:3000/deleteMessageFromDetails", message_id, {
                headers: {
                    'token': token_value
                }
            }).then(function (resp) {

               // console.log("in then");
                //console.log(resp.data);
                $route.reload();
                $rootScope.authstatus = false;

            // resp.status(200).send("delete valid");
                
            })
            .catch(function(ex){
                console.log(ex.message);
            });

        };


        $scope.userlist_details; 
        $http.get("http://localhost:3000/userlist", {
                headers: {
                    'token': token_value
                }
                })
                .then(function (resp) {
    
                   // console.log("inside uer lsie");
                    //console.log(resp.data);
                    $scope.userlist_details = resp.data;
                    $rootScope.authstatus = false;
                })
                .catch(function (ex) {
                    console.log(ex);
                });
    

        $scope.sendMessagefromDetails = function(){

            $http.post("/messages", JSON.stringify(this.reply_message),{
                headers: {
                    'token': token_value
                }
                })
                    .then(function (resp) {
                         //   console.log("resp data");
                           // console.log(resp.data);
                           $route.reload();
                        })
                        .catch(function(ex){
                            console.log(ex);                
                        });
        };
});

    $scope.backToMessage = function(){
       
        $location.path(['/messages']);
        
    };

});

// function IsTokenPresent(){
//     if(localStorage.getItem("token")){
//         return true;
//     }
//     else{
//         return false;
//     }
// }