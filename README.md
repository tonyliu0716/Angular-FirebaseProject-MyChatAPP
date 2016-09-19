# Angular-FirebaseProject-MyChatAPP

### Project Description:
1. You can visit and try to send message to your friend by using this application, I have already uploaded to git-page.
2. take a look: https://tonyliu0716.github.io/Angular-FirebaseProject-MyChatAPP/
3. Some bootstrap templates I downloaded them from internet.
4. This project mainly used Angular & AngualrFirebase & Firebase
5. UI-Bootstrap for modal: http://angular-ui.github.io/bootstrap/versioned-docs/0.14.3/#/modal

### 1. AngularFire API:
`https://github.com/firebase/angularfire/blob/master/docs/reference.md#watchcb-context`


### 2. Angularjs & JQuery, set scroll to the buttom of the div
```javascript
//set scroll to bottom:
 $('#ChatMessage').bind('DOMNodeInserted', function () {
   $('div.tab-pane').scrollTop($('#ChatMessage').height());
 });
 // Angular scroll gule didn't work
```

### 3. $firebaseAuth Obj
```javascript
factory("Auth", ['$firebaseAuth', function ($firebaseAuth) {
    return $firebaseAuth();
}])
```
Then can be injected in controller:
```javascript
controller("LoginController", ['$scope', 'Auth', 'DataService', '$firebaseArray', '$location', '$log', '$rootScope',
              function ($scope, Auth, DataService, $firebaseArray, $location, $log, $rootScope) {
    //auth object
    $scope.authObj = Auth;
    $scope.DataService = DataService;

    //===========================login with github account:
    $scope.githubLogin = function () {
        $scope.authObj.$signInWithPopup('github').then(function (result) {
        ...
    }).catch(function(error) {
        ...
    });
    //===========================login with google account:
    $scope.googleLogin = function () {
        $scope.authObj.$signInWithPopup('google').then(function (result) {
          ...
        }).catch(function() {
          ...
        });
    };
}
```

### 4. Auth sign out
This method will return a promise when the whole content was download from firebase
```javascript
Auth.$sighOut();
```

### 5. $loaded method
This method will return a promise when the whole content was download from firebase
```javascript
var userInfoRef = firebase.database().ref('UserInfo');
$scope.userInfos = $firebaseArray(userInfoRef);
$scope.userInfos.$loaded().then(function (lists) {
    //angularjs for loop
    angular.forEach(lists, function (obj, index) {
      ...
    });
);
```

### 6. AngularFire CRUD
Define where we should go and fetch:
```javascript
var userInfoRef = firebase.database().ref('UserInfo');
$scope.userInfos = $firebaseArray(userInfoRef);
```

Add new Data:
```javascript
$scope.userInfos.$add(UserInfo).then(function (userInfoRef) {
   ...
}
```

Update Data:
```javascript
$scope.userInfos.$save(obj).then(function (userInfoRef) {});
```

Delete Data:
```javascript
$scope.userInfos.$remove(...)
```

### 7. Get record from firebase:
```javascript
//id should be the key:
$scope.singleChats.$getRecord(UniqueKey)
```

### 8. Angularjs & Firebase: Three-way data binding
```javascript
//three way data binding: if something has been added to the array, div should auto update:
$scope.singleChats.$watch(function (event) {
      if (event.event === 'child_changed') {
            $scope.chatHistorys = $scope.singleChats.$getRecord($scope.DataService.singleChatId.id).messages;
      }
 //$scope.chatHistorys = $scope.singleChats.$getRecord($scope.DataService.singleChatId.id).messages;
});
```





 
 
 
 
