"use strict";
//'angularCSS' --> Angular CSS selector
//'ngAnimate', 'ngSanitize', 'ui.bootstrap' for accordion
//more info looks here: http://angular-ui.github.io/bootstrap/#/getting_started

//luegg.directives: using for Angularjs auto scrolling to buttom
var app = angular.module("myChat", ['ngRoute', 'firebase', 'angularCSS', 'ngAnimate', 'ngSanitize', 'ui.bootstrap']).

factory("Auth", ['$firebaseAuth', function ($firebaseAuth) {
    return $firebaseAuth();
}]).

service("DataService", [function () {
    this.obj = {
        username: "",
        email: "",
        userImage: ""
    };

    this.user = {
        anonymous: false,
        exist: false,
        message: ""
    };

    this.userInfo = {
        id: "",
        username: "",
        email: "",
        provider: "",
        active: true,
        image: "",
        anonymous: false
    };

    this.newUser = {
        flag: false
    };

    this.memberId = {
        id: ""
    };

    this.singleChatId = {
        id: ""
    }
}]).

config(function ($routeProvider) {
    $routeProvider.otherwise({
        redirectTo: '/home'
    });

    $routeProvider.
    when("/chat-room", {
        templateUrl: 'templates/chatRoom.html',
        controller: "ChatController",
        css: "css/freelancer.css"
    }).
    when("/home", {
        templateUrl: "templates/contents.html",
        css: "css/freelancer.css"
    }).
    when("/chat-window", {
        templateUrl: 'templates/chatWindow.html',
        controller: "WindowController",
        css: "css/chat-window.css"
    });
}).

controller("HeaderController", ['$scope', 'DataService', 'Auth', '$firebaseArray', '$location', '$log', function ($scope, DataService, Auth, $firebaseArray, $location, $log) {
    //using $rootScope to check if the user login or not
    $scope.DataService = DataService;

    var userInfoRef = firebase.database().ref('UserInfo');
    $scope.userInfos = $firebaseArray(userInfoRef);

    $scope.logout = function () {

        //before logout, set 'active' = false
        var record = $scope.userInfos.$getRecord($scope.DataService.userInfo.id);
        record.active = false;
        $scope.userInfos.$save(record).then(function (userInfoRef) {
            // when active set to false, which means the user logout successfully.
        });

        //user logout method:
        Auth.$signOut();

        //clear user info
        $scope.DataService.obj.email = "";
        $scope.DataService.obj.username = "";
        $scope.DataService.obj.userImage = "";
        //set the flag to control login or logout icon
        $scope.DataService.user.exist = false;
        $scope.DataService.user.anonymous = false;
        $scope.DataService.user.message = "";
        $scope.DataService.userInfo.active = false;
        $scope.DataService.userInfo.anonymous = false;
        $scope.DataService.userInfo.email = "";
        $scope.DataService.userInfo.id = "";
        $scope.DataService.userInfo.provider = "";
        $scope.DataService.userInfo.username = "";
        $scope.DataService.userInfo.image = "";
        //redirect to home page
        $location.url("/home");
    }
}]).

controller("LoginController", ['$scope', 'Auth', 'DataService', '$firebaseArray', '$location', '$log', '$rootScope', function ($scope, Auth, DataService, $firebaseArray, $location, $log, $rootScope) {
    //auth object
    $scope.authObj = Auth;
    $scope.DataService = DataService;

    //===========================login with github account:
    $scope.githubLogin = function () {
        $scope.authObj.$signInWithPopup('github').then(function (result) {
            //store those infomations in service
            DataService.obj.username = result.user.displayName;
            $scope.DataService.obj.username = DataService.obj.username;

            DataService.obj.email = result.user.email;
            $scope.DataService.obj.email = DataService.obj.email;

            DataService.obj.userImage = result.user.photoURL;
            $scope.DataService.obj.userImage = DataService.obj.userImage;

            //set flag
            DataService.user.exist = true;
            //store user info in firebase 'UserInfo'

            var userInfoRef = firebase.database().ref('UserInfo');
            $scope.userInfos = $firebaseArray(userInfoRef);

            //=============================github login================================
            $scope.keepGoing = true;
            $scope.userInfos.$loaded().then(function (lists) {
                //for-loop to check if the user login before: 'email', 'provider', 'username', 'image'
                angular.forEach(lists, function (obj, index) {
                    if ($scope.keepGoing) {
                        $log.info("I am inside the loop!");
                        $log.info("obj value: ", obj);
                        if (obj.email === result.user.email && obj.provider === 'github' && obj.username === result.user.displayName) {

                            //that means this user already login before
                            $scope.DataService.userInfo = {
                                //get the id of the new inserted data
                                id: obj.$id,
                                username: obj.username,
                                email: obj.email,
                                provider: 'github',
                                image: obj.image,
                                active: true,
                                anonymous: false
                            };
                            $scope.DataService.user.message = "You successful login with github account, enjoy!";

                            $scope.DataService.newUser.flag = false;
                            $scope.keepGoing = false; // break the loop
                            //if keepGoing value is false, we should store the new data into the database
                            obj.active = true;
                            $scope.userInfos.$save(obj).then(function (userInfoRef) {});

                        }
                    }
                });
                //if the keepGoing value has been changed, that means we found the user info inside db.
                //otherwise:
                if ($scope.keepGoing) {
                    var UserInfo = {
                            username: $scope.DataService.obj.username,
                            email: $scope.DataService.obj.email,
                            provider: 'github',
                            active: true,
                            image: $scope.DataService.obj.userImage,
                            anonymous: false
                        }
                        //add data into database:
                    $scope.userInfos.$add(UserInfo).then(function (userInfoRef) {
                        $scope.DataService.userInfo = {
                            //get the id of the new inserted data
                            id: userInfoRef.key,
                            username: UserInfo.username,
                            email: UserInfo.email,
                            provider: UserInfo.provider,
                            active: UserInfo.active,
                            image: UserInfo.image,
                            anonymous: UserInfo.anonymous
                        };
                        $scope.DataService.user.message = "You successful login with github account, enjoy!";
                    });
                    //this is a new user
                    $scope.DataService.newUser.flag = true;
                }
            });
            /* 
            var UserInfo = {
                    username: $scope.DataService.obj.username,
                    email: $scope.DataService.obj.email,
                    provider: 'github',
                    active: true,
                    anonymous: false
                }
                //add data into database:
            $scope.userInfos.$add(UserInfo).then(function () {
                $scope.DataService.userInfo = {
                    username: UserInfo.username,
                    email: UserInfo.email,
                    provider: UserInfo.provider,
                    active: UserInfo.active,
                    anonymous: UserInfo.anonymous
                };
                $scope.DataService.user.message = "You successful login with github account, enjoy!";
            });
            */
            //after callback function, redirect to chat room page
            $location.url("/chat-room");
        }).catch(function (error) {
            //handling the account-exists-with-different-credential
            $log.info(error);
            $scope.message = "An account already exists with the same email address but different sign-in credentials. Please use another way to sign in."
        })
    }

    //=========================login with google account=======================
    $scope.googleLogin = function () {
        $scope.authObj.$signInWithPopup('google').then(function (result) {
            //store these user info in service
            DataService.obj.username = result.user.displayName;
            $scope.DataService.obj.username = DataService.obj.username;

            DataService.obj.email = result.user.email;
            $scope.DataService.obj.email = DataService.obj.email;

            DataService.obj.userImage = result.user.photoURL;
            $scope.DataService.obj.userImage = DataService.obj.userImage;

            //set flag
            DataService.user.exist = true;

            //store the user informations in database under: 'UserInfo'
            var userInfoRef = firebase.database().ref('UserInfo');
            $scope.userInfos = $firebaseArray(userInfoRef);

            //when the data loaded, return a promise
            //before we store the user into the database, we should check if the user already login before, if already exist, we will not create a new entry in database
            //======================start from here=======================
            $scope.keepGoing = true;
            $scope.userInfos.$loaded().then(function (lists) {
                //for-loop to check if the user login before: 'email', 'provider', 'username'
                angular.forEach(lists, function (obj, index) {
                    if ($scope.keepGoing) {

                        if (obj.email === result.user.email && obj.provider === 'google' && obj.username === result.user.displayName) {
                            //that means this user already login before
                            $scope.DataService.userInfo = {
                                //get the id of the new inserted data
                                id: obj.$id,
                                username: obj.username,
                                email: obj.email,
                                provider: 'google',
                                active: true,
                                image: obj.image,
                                anonymous: false
                            };
                            $scope.DataService.user.message = "You successful login with google account, enjoy!";

                            $scope.keepGoing = false; // break the loop
                            //if keepGoing value is false, we should store the new data into the database
                            $scope.DataService.newUser.flag = false;

                            obj.active = true;
                            $scope.userInfos.$save(obj).then(function (userInfoRef) {});
                        }
                    }
                });
                //if the keepGoing value has been changed, that means we found the user info inside db.
                //otherwise:
                if ($scope.keepGoing) {
                    var UserInfo = {
                            username: $scope.DataService.obj.username,
                            email: $scope.DataService.obj.email,
                            provider: 'google',
                            active: true,
                            image: $scope.DataService.obj.userImage,
                            anonymous: false
                        }
                        //add data into database:
                    $scope.userInfos.$add(UserInfo).then(function (userInfoRef) {
                        $scope.DataService.userInfo = {
                            //get the id of the new inserted data
                            id: userInfoRef.key,
                            username: UserInfo.username,
                            email: UserInfo.email,
                            provider: UserInfo.provider,
                            active: UserInfo.active,
                            image: UserInfo.image,
                            anonymous: UserInfo.anonymous
                        };
                        $scope.DataService.user.message = "You successful login with google account, enjoy!";
                    });
                    $scope.DataService.newUser.flag = true;
                }
            });

            //==============================google login ends here===================================

            $location.url("/chat-room");
        }).catch(function (error) {
            $log.info(error);
            $scope.message = "An account already exists with the same email address but different sign-in credentials. Please use another way to sign in."
        })
    }

    //Anonymous Login: 
    //=======================================form submit=========================================
    $scope.loading = false;
    $scope.onSubmit = function () {
        $scope.loading = true;
        //anonymous always create a new user
        $scope.DataService.newUser.flag = true;
        //firebase config
        var userInfoRef = firebase.database().ref('UserInfo');
        $scope.userInfos = $firebaseArray(userInfoRef);

        if ($scope.username !== null && $scope.password !== null) {
            //anonymously login in
            Auth.$signInAnonymously().then(function (firebaseUser) {
                //sign in successfully, store the user message into db
                var UserInfo = {
                    username: $scope.username,
                    email: "",
                    provider: 'anonymous',
                    active: true,
                    image: "",
                    anonymous: true
                }
                $scope.userInfos.$add(UserInfo).then(function (userInfoRef) {
                    $scope.DataService.userInfo = {
                        //get the id of the new inserted data
                        id: userInfoRef.key,
                        username: UserInfo.username,
                        email: UserInfo.email,
                        provider: UserInfo.provider,
                        active: UserInfo.active,
                        image: "",
                        anonymous: UserInfo.anonymous
                    };
                    $scope.DataService.user.message = "You successful login with anonymous account, enjoy!";

                });


            }).catch(function (error) {
                $log.info(error);
            });
        }
        //set time out
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.loading = false;
                DataService.user.exist = true;
                DataService.user.anonymous = true;
                //then redirect to chatRoom page
                $location.url("/chat-room");
            })
        }, 1500);
    }
}]).

controller("ChatController", ['$scope', 'DataService', '$firebaseArray', '$location', '$log', function ($scope, DataService, $firebaseArray, $location, $log) {
    $scope.DataService = DataService;
    $scope.loading = true;

    var userInfoRef = firebase.database().ref('UserInfo');
    $scope.userInfos = $firebaseArray(userInfoRef);

    //ng-if to show the loading icon
    $scope.initLoading = function () {
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.loading = false;
            })
        }, 1500);
    }

    //relocated to chat window
    $scope.relocatedTo = function () {
        $location.url("/chat-window");
    }

    //anonymous user login, relocate to chat window
    $scope.relocatedToAnony = function () {
        //before we redirect, store the user image into db
        var record = $scope.userInfos.$getRecord($scope.DataService.userInfo.id);
        record.image = $scope.DataService.obj.userImage;
        $scope.userInfos.$save(record).then(function (userInfoRef) {
            // when active set to false, which means the user logout successfully.
        });
        $location.url("/chat-window");
    }

    $scope.icon = false;
    //anonymous user choose image
    $scope.chooseImage = function (imageUrl) {
        if ($scope.userMessage !== null) {
            $scope.userMessage = null;
        }
        $scope.icon = true;
        //this image will be shown as user's image
        $scope.DataService.obj.userImage = imageUrl;
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.userMessage = "You have selected a user image!";
                $scope.icon = false;
            })
        }, 1500);


    }

}]).

controller("WindowController", ['$scope', '$firebaseArray', 'DataService', '$log', '$location', '$anchorScroll', function ($scope, $firebaseArray, DataService, $log, $location, $anchorScroll) {
    $scope.DataService = DataService;
    //Members:
    var userInfoRef = firebase.database().ref('UserInfo');
    $scope.userInfos = $firebaseArray(userInfoRef);
    //groups is an array
    //should be store in firebase
    $scope.groups = [];

    //
    $scope.group = {};

    $scope.onSubmit = function () {

        $scope.groups.push($scope.group);
        $scope.group = {};
        $log.info($scope.groups);
    }

    var singleChatRef = firebase.database().ref('Single-Chats');
    $scope.singleChats = $firebaseArray(singleChatRef);

    $scope.backgroundColorChange = false;
    //implement talkTo() 
    $scope.talkTo = function (member, index) {
            $scope.keepGoing = true;
            $scope.backgroundColorChange = true;
            $scope.memberIndex = index;
            $log.info(index);
            //for-loop to check if the these two users had conversation before
            $scope.singleChats.$loaded().then(function (chatHistory) {
                angular.forEach(chatHistory, function (chat, index) {
                    if ($scope.keepGoing) {
                        if ((member.$id === chat.to && $scope.DataService.userInfo.id === chat.from) || (member.$id === chat.from && $scope.DataService.userInfo.id === chat.to)) {
                            //which means these two users had conversion before: messages will be an array
                            $scope.DataService.memberId.id = member.$id;
                            $scope.chatHistorys = chat.messages;
                            $scope.keepGoing = false;
                            $scope.talkToImage = member.image;
                            $scope.memberName = member.username;
                            $scope.DataService.singleChatId.id = chat.$id;

                            //set scroll to bottom:
                            $('#ChatMessage').bind('DOMNodeInserted', function () {
                                $('div.tab-pane').scrollTop($('#ChatMessage').height());
                            });
                        }
                    }

                });
                //==================if this is a new conversation===============
                if ($scope.keepGoing) {
                    var chat = {
                        from: $scope.DataService.userInfo.id,
                        to: member.$id,
                        messages: [{
                            from: $scope.DataService.userInfo.id,
                            message: null
                        }]
                    }
                    $scope.singleChats.$add(chat).then(function (singleChatRef) {
                        $scope.DataService.singleChatId.id = singleChatRef.key;

                    });
                }
            });

        } // finish talkTo method=====================

    $scope.sendMessage = function () {
        if ($scope.inputMessage !== null) {
            var newMessage = {
                from: $scope.DataService.userInfo.id,
                message: $scope.inputMessage
            };
            var record = $scope.singleChats.$getRecord($scope.DataService.singleChatId.id);
            record.messages.push(newMessage);
            $scope.singleChats.$save(record);
            //show updates
            $scope.chatHistorys = $scope.singleChats.$getRecord($scope.DataService.singleChatId.id).messages;
            $scope.inputMessage = "";

            //after updates: auto scroll to the buttom using jquery, but this one is not working perfectly.

            //$('div.tab-pane').scrollTop($('#ChatMessage').outerHeight());
            //$log.info($('#ChatMessage').outerHeight());

            //try to use html5 api domnodeInserted, working perfect! Nice!
            $('#ChatMessage').bind('DOMNodeInserted', function () {
                $('div.tab-pane').scrollTop($('#ChatMessage').height());
            });
        }
    }


}]);