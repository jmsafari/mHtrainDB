///////////////////////////////////////////////////////////////////

jQuery(document).ready(function(){
		jQuery('#app_intro').hide(); 
		//navigator.splashscreen.hide();
});


//app = angular.module('app',['ngRoute','ngSanitize','ngTouch']).config( [
app = angular.module('app',['ngRoute','ngSanitize']).config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|whatsapp|fb-messenger|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);

app.run(function($window,$http,Factory,$rootScope,$filter,$location) {

	  $rootScope.HomeData = -1;
	  
	  localStorage.backTo = -1;
	  localStorage.latestAnnouncement =  localStorage.latestAnnouncement=='' ? '' : localStorage.latestAnnouncement;
	  
	  $rootScope.backButton = function() {
			$window.history.go(-1);
	  };
	  
      $rootScope.online = navigator.onLine;
      $window.addEventListener("offline", function() {
        $rootScope.$apply(function() {
          $rootScope.online = false;
        });
      }, false);

      $window.addEventListener("online", function() {
        $rootScope.$apply(function() {
          $rootScope.online = true;
        });
      }, false);
	  
	  $rootScope.dateFormatting = function(dateString) {  // YYYY-MM-DD	  
				
				try{
					var dateArray = dateString.split('-');
					var monthLabel = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
					
					return monthLabel[parseInt(dateArray[1])] + ' ' + dateArray[2] + ', ' +  dateArray[0];
				}catch(err){
					return '';
				}
		 };
	  	  
});

app.config( function($routeProvider){
		
		/*   PAGES   */      
		$routeProvider.when('/',{controller:'HomeCtrl',templateUrl:'views/home.html'})
					  .when('/home',{controller:'HomeCtrl',templateUrl:'views/home.html'})		
					  .when('/overview/:nid/:mvenue',{controller:'OverviewCtrl',templateUrl:'views/overview.html'})
					  .when('/meetingroom/:nid',{controller:'MeetingCtrl',templateUrl:'views/meetingroom.html'}) 
					  .when('/infopack/:nid',{controller:'InfoPackCtrl',templateUrl:'views/infopack.html'}) 
					  .when('/emergency/:nid/:type',{controller:'PeopleCtrl',templateUrl:'views/emergency.html'}) 
					  .when('/invited/:nid/:type',{controller:'PeopleCtrl',templateUrl:'views/invited.html'}) 
					  .when('/announcement/:nid',{controller:'AnnouncementCtrl',templateUrl:'views/announcement.html'})
					  .when('/agenda/:nid/:date_descr/:theme',{controller:'AgendaCtrl',templateUrl:'views/agenda.html'});						  
		/*    ANY   */
		$routeProvider.otherwise({redirectTo:'/'});	
});

var controllers = {};
	
	controllers.HomeCtrl = function ($scope,$rootScope,$location,$window,$route,Factory){
	
			window.scrollTo(0,0);
			
			$scope.myPage = {};
			$scope.myPage.alertAnnoucement = false;	
			$scope.myPage.displaySpinner=true;
			

			Factory.getHome().success( function(data){
				
					$rootScope.HomeData = data[0];
					$scope.myPage.displaySpinner=false;
					angular.element(document).ready(function () {
						jQuery(".clickable-row").click(function() {
							$location.path($(this).data("href"));
							$scope.$apply();
						});
					});					
					Factory.getAnnouncements($rootScope.HomeData.evt_nid).success( function(data){
							if(localStorage.latestAnnouncement!==data[0].Submitted){
									$scope.myPage.alertAnnoucement = true;
							}
					}).error(function(error) {
							console.log("erreur:" + error);
					});
								
				
			}).error(function(error) {
					console.log("erreur:" + error);
			});	

			$scope.doneReLoading = true;
		    $scope.$watch('online', function(){
				 if(!$rootScope.online) $scope.doneReLoading = false; 
				 if(!$scope.doneReLoading && $rootScope.online && $scope.myPage.displaySpinner){ 
					$scope.doneReLoading = true;
					$route.reload();
					$scope.$apply();
				}
		    });			
	};
	
	controllers.MeetingCtrl = function ($scope,$rootScope,$routeParams,$location,$route,Factory){
	
				window.scrollTo(0,0);
				$scope.myPage = {};	
				$scope.myPage.displaySpinner=true;
		
				Factory.getRoomData($routeParams.nid).success( function(data){
						$scope.myPage.RoomData = data;
						$scope.myPage.displaySpinner=false;
				}).error(function(error) {
						console.log("erreur:" + error);
				});
				
				$scope.doneReLoading = true;
				$scope.$watch('online', function(){
					 if(!$rootScope.online) $scope.doneReLoading = false; 
					 if(!$scope.doneReLoading && $rootScope.online && $scope.myPage.displaySpinner){ 
						$scope.doneReLoading = true;
						$route.reload();
						$scope.$apply();
					}
				});	
	};
	
	controllers.InfoPackCtrl = function ($scope,$rootScope,$routeParams,$location,$route,Factory){
	
			window.scrollTo(0,0);
			$scope.myPage = {};	
			$scope.myPage.displaySpinner=true;
	
			Factory.getInfoPack($routeParams.nid).success( function(data){
					$scope.myPage.InfoPackData = data;
					$scope.myPage.displaySpinner=false;
			}).error(function(error) {
					console.log("erreur:" + error);
			});
			
			$scope.doneReLoading = true;
		    $scope.$watch('online', function(){
				 if(!$rootScope.online) $scope.doneReLoading = false; 
				 if(!$scope.doneReLoading && $rootScope.online && $scope.myPage.displaySpinner){ 
					$scope.doneReLoading = true;
					$route.reload();
					$scope.$apply();
				}
		    });	
	
	};
	
	controllers.PeopleCtrl = function ($scope,$rootScope,$routeParams,$location,$route,Factory){
	
			window.scrollTo(0,0);
			$scope.myPage = {};	
			$scope.myPage.displaySpinner=true;
	
			Factory.getPeopleData($routeParams.nid,$routeParams.type).success( function(data){
					$scope.myPage.PeopleData = data;
					$scope.myPage.displaySpinner=false;
			}).error(function(error) {
					console.log("erreur:" + error);
			});
			
			$scope.doneReLoading = true;
		    $scope.$watch('online', function(){
				 if(!$rootScope.online) $scope.doneReLoading = false; 
				 if(!$scope.doneReLoading && $rootScope.online && $scope.myPage.displaySpinner){ 
					$scope.doneReLoading = true;
					$route.reload();
					$scope.$apply();
				}
		    });		
	};
	
	controllers.AnnouncementCtrl = function ($scope,$rootScope,$window,$routeParams,$location,$route,Factory){
	
			window.scrollTo(0,0);
			$scope.myPage = {};	
			$scope.myPage.displaySpinner=true;
			
			var screenWidth = $window.innerWidth * 95.0/100.0;
			if($window.innerWidth<340){
				$scope.myPage.dbnameWidth = screenWidth * 95.0 /100.0;
			}else{
				$scope.myPage.dbnameWidth = screenWidth * 95.0 /100.0;		
			}
	
			Factory.getAnnouncements($routeParams.nid).success( function(data){
					$scope.myPage.AnnounceData = data;
					localStorage.latestAnnouncement =data[0].Submitted;
					$scope.myPage.displaySpinner=false;
					angular.element(document).ready(function () {
						//	jQuery(".clickable-row").click(function() {
						//			window.location = $(this).data("href");
						//	});
					});
			}).error(function(error) {
					console.log("erreur:" + error);
			});
			
			$scope.doneReLoading = true;
		    $scope.$watch('online', function(){
				 if(!$rootScope.online) $scope.doneReLoading = false; 
				 if(!$scope.doneReLoading && $rootScope.online && $scope.myPage.displaySpinner){ 
					$scope.doneReLoading = true;
					$route.reload();
					$scope.$apply();
				}
		    });		
	};
	
	
	controllers.AgendaCtrl = function ($scope,$rootScope,$window,$routeParams,$location,$route,Factory){

			window.scrollTo(0,0);
			$scope.myPage = {};	
			$scope.myPage.displaySpinner=true;
			
			var screenWidth = $window.innerWidth * 95.0/100.0;
			if($window.innerWidth<340){
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;
			}else{
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;		
			}
	
			//Factory.getAnnouncements().success( function(data){
			Factory.getAgenda($routeParams.nid,$routeParams.date_descr).success( function(data){
					$scope.myPage.RawData = data;
					$scope.myPage.Theme = $routeParams.theme;
					$scope.myPage.AgendaDate = $routeParams.date_descr;
					$scope.myPage.displaySpinner=false;
					angular.element(document).ready(function () {
						//	jQuery(".clickable-row").click(function() {
						//			window.location = $(this).data("href");
						//	});
						jQuery("#collapse_0").addClass('show');
					});
			}).error(function(error) {
					console.log("erreur:" + error);
			});	
			
			$scope.doneReLoading = true;
		    $scope.$watch('online', function(){
				 if(!$rootScope.online) $scope.doneReLoading = false; 
				 if(!$scope.doneReLoading && $rootScope.online && $scope.myPage.displaySpinner){ 
					$scope.doneReLoading = true;
					$route.reload();
					$scope.$apply();
				}
		    });	
	};
	
	
	controllers.OverviewCtrl = function ($scope,$rootScope,$window,$routeParams,$route,Factory,$location){
			
			window.scrollTo(0,0);
			$scope.myPage = {};	
			$scope.myPage.displaySpinner=true;
			
			var screenWidth = $window.innerWidth * 95.0/100.0;
			if($window.innerWidth<340){
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;
			}else{
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;		
			}
			
			$scope.myPage.urlEncode = function(inputValue){
			
					return inputValue;
					//return escape(inputValue);
			};
	
			Factory.getAgendaOverview($routeParams.nid).success( function(data){
					$scope.myPage.Overview = data;
					$scope.myPage.MainVenue = $routeParams.mvenue;
					$scope.myPage.displaySpinner=false;
					angular.element(document).ready(function () {
							jQuery(".clickable-row").click(function() {
									//window.location = $(this).data("href");
									$location.path($(this).data("href"));
									$scope.$apply();
							});
					});
			}).error(function(error) {
					console.log("erreur:" + error);
			});		

			$scope.doneReLoading = true;
		    $scope.$watch('online', function(){
				 if(!$rootScope.online) $scope.doneReLoading = false; 
				 if(!$scope.doneReLoading && $rootScope.online && $scope.myPage.displaySpinner){ 
					$scope.doneReLoading = true;
					$route.reload();
					$scope.$apply();
				}
		    });				
	}; 
	

	app.controller(controllers);
	
	app.factory('Factory', function($http,$rootScope,$filter) {
		
			var factory = {};   //getQuestions
			
			URL = 'https://htraindb.h3abionet.org/';
			
			factory.getHome = function(){
			
					return  $http({
							url: URL  + 'current-event-json',
							method: 'POST'
					});
			};

			factory.getAnnouncements = function(nid){
			
					return  $http({
							url: URL + 'announcements-json/' + nid,
							method: 'POST'
					});
			};
			
			factory.getInfoPack = function(nid){
			
					return  $http({
							url: URL + 'infopack-json/' + nid,
							method: 'POST'
					});
			};
			
			factory.getPeopleData = function(nid,type){
					return  $http({
							url: URL + 'people-json/' + nid + '/' + type,
							method: 'POST'
					});
			};
			
			factory.getRoomData = function(nid){ 
					return  $http({
							url: URL + 'room-json/' + nid,
							method: 'POST'
					});			
			};

			factory.getAgendaOverview = function(nid){
			
					return  $http({
							url: URL + 'agenda-overview-json/'+ nid,
							method: 'POST'
					});
			};
			
			factory.getAgenda = function(nid,date_descr){
			
					return  $http({
							url: URL + 'agenda-json/'+ nid +'/'+ date_descr,
							method: 'POST'
					});
			};
			
			return factory;
	});
	
Date.prototype.addHours = function(h){
    this.setHours(this.getHours()+h);
    return this;
}
