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
	  localStorage.settings = localStorage.settings=='' ? '' : localStorage.settings;
	  
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
	  
	  $rootScope.dateFormatting_OLD = function(dateString) {  // YYYY-MM-DD	  
				
				try{
					var dateArray = dateString.split('-');
					var monthLabel = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
					
					return monthLabel[parseInt(dateArray[1])] + ' ' + dateArray[2] + ', ' +  dateArray[0];
				}catch(err){
					return '';
				}
		 };
	
	   $rootScope.dateFormatting = function(dateString) {  // YYYY-MM-DD	  
				
				try{
					var dateFormatted = new Date(dateString + " 00:00:00");
					var monthLabel = {"0":"January","1":"February","2":"March","3":"April","4":"May","5":"June","6":"July","7":"August","8":"September","9":"October","10":"November","11":"December"};
					var dayLabel = {"1":"Monday","2":"Tuesday","3":"Wednesday","4":"Thursday","5":"Friday","6":"Saturday","7":"Sunday"};
					
					return dayLabel[dateFormatted.getDay()] + ', ' + monthLabel[dateFormatted.getMonth()] + ' ' +  dateFormatted.getDate() + ' ' + dateFormatted.getFullYear();
				}catch(err){
					return '';
				}
		};
	  	  
});

app.config( function($routeProvider){
		
		/*   PAGES   */      
		$routeProvider.when('/',{controller:'HomeCtrl',templateUrl:'views/home.html'})
					  .when('/home',{controller:'HomeCtrl',templateUrl:'views/home.html?v2'})		
					  .when('/overview/:nid/:mvenue',{controller:'OverviewCtrl',templateUrl:'views/overview.html'})
					  .when('/meetingroom/:nid',{controller:'MeetingRoomCtrl',templateUrl:'views/meetingroom.html'}) 
					  .when('/infopack/:nid',{controller:'InfoPackCtrl',templateUrl:'views/infopack.html'})
					  .when('/socialnetwork',{controller:'SocialNetworkCtrl',templateUrl:'views/socialnetwork.html'})	
					  .when('/contact-us/:nid',{controller:'ContactUsCtrl',templateUrl:'views/contact_us.html'})					  
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
			$rootScope.alertAnnoucement = false;	
			//$scope.myPage.displaySpinner=true;       NOTE: To Take a chance and hide the loading spinner on the Home Page
			
			try{
				$rootScope.HomeData = JSON.parse(localStorage.HomeData);
			}catch(err){}

			try{
								Factory.getHome().success( function(data){
							
								$rootScope.HomeData = data[0];
								localStorage.HomeData = JSON.stringify(data[0]);
								
								$scope.myPage.displaySpinner=false;
								//$scope.$apply();
								angular.element(document).ready(function () {
									jQuery(".clickable-row").click(function() {
										$location.path($(this).data("href"));
										$scope.$apply();
									});
								});
								
								if(localStorage.settings == "undefined" || localStorage.settings=='' ){
									localStorage.settings = JSON.stringify({"VERSION":data[0].version,"evt_nid":data[0].evt_nid,"updateMap":1,"updateGuest":1,"updateEmergency":1,"updateInfoPack":1,"updateOverview":1});
								}else{
										var settings = JSON.parse(localStorage.settings);
										if(settings.evt_nid != data[0].evt_nid || settings.VERSION != data[0].version){
												localStorage.settings = JSON.stringify({"VERSION":data[0].version,"evt_nid":data[0].evt_nid,"updateMap":1,"updateGuest":1,"updateEmergency":1,"updateInfoPack":1,"updateOverview":1});
										}
								}
								
								Factory.getAnnouncements($rootScope.HomeData.evt_nid).success( function(data){
										if(localStorage.latestAnnouncement!==data[0].Submitted){
												$rootScope.alertAnnoucement = true;
										}
								}).error(function(error) {
										console.log("erreur:" + error);
								});
											
							
						}).error(function(error) {
							//	console.log("erreur:" + error);
						});	
			}catch(err){
			
								angular.element(document).ready(function () {
									jQuery(".clickable-row").click(function() {
										$location.path($(this).data("href"));
										$scope.$apply();
									});
								});	
			}

			$scope.doneReLoading = true;
		    $scope.$watch('online', function(){
				 if(!$rootScope.online) $scope.doneReLoading = false; 
				 if(!$scope.doneReLoading && $rootScope.online){ 
					$scope.doneReLoading = true;
					$route.reload();
					$scope.$apply();
				}
		    });			
	};
	
	controllers.MeetingRoomCtrl = function ($scope,$rootScope,$routeParams,$location,$route,Factory){
	
				window.scrollTo(0,0);
				$scope.myPage = {};	
				
				var settings = JSON.parse(localStorage.settings);
				if(settings.updateMap==1){
						$scope.myPage.displaySpinner=true;		
						Factory.getRoomData($routeParams.nid).success( function(data){
								$scope.myPage.RoomData = data;
								$scope.myPage.displaySpinner=false;
								localStorage.RoomData = JSON.stringify(data);
								settings.updateMap=0;
								localStorage.settings = JSON.stringify(settings);
						}).error(function(error) {
								console.log("erreur:" + error);
						});
				}else{
						$scope.myPage.RoomData = JSON.parse(localStorage.RoomData);
				}
				
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
	
	controllers.ContactUsCtrl = function ($scope,$rootScope,$routeParams,$location,$route,Factory){
	
				window.scrollTo(0,0);
				$scope.myPage = {};	
				$scope.myPage.feedback = '';
				$scope.myPage.subject = '';
				$scope.myPage.yr_email = '';
				$scope.myPage.yr_fullname = '';
				$scope.myPage.message = '';
				$scope.myPage.captcha = '';
				$scope.myPage.displaySpinner = false;
				$scope.myPage.rand1 = Math.floor((Math.random() * 10) + 1);
				$scope.myPage.rand2 = Math.floor((Math.random() * 10) + 1);
				$scope.myPage.feedback= '';
				
				$scope.sendEmail = function(){
						if($scope.myPage.rand1+$scope.myPage.rand2==$scope.myPage.captcha){
								$scope.myPage.displaySpinner = true;
								Factory.sendMessage($routeParams.nid,$scope.myPage.subject,$scope.myPage.yr_email,$scope.myPage.yr_fullname,$scope.myPage.message).success( function(data){
									$scope.myPage.feedback = data.feedback;
									if(data.feedback == "OK"){
											$scope.myPage.subject = '';
											$scope.myPage.yr_email = '';
											$scope.myPage.yr_fullname = '';
											$scope.myPage.message = '';
											$scope.myPage.captcha = '';
											$scope.myPage.displaySpinner = false;
											console.log(data);
									}
								}).error(function(data) {
									$scope.myPage.captcha = '';
									$scope.myPage.rand1 = Math.floor((Math.random() * 10) + 1);;
									$scope.myPage.rand2 =Math.floor((Math.random() * 10) + 1);;
									// console.log(data);			
								});
						}else{
								$scope.myPage.captcha = '';
								$scope.myPage.rand1 =Math.floor((Math.random() * 10) + 1);;
								$scope.myPage.rand2 =Math.floor((Math.random() * 10) + 1);;
						}
				};
				
				var settings = JSON.parse(localStorage.settings);
				if(settings.updateMap==1){
						$scope.myPage.displaySpinner=true;		
						Factory.getRoomData($routeParams.nid).success( function(data){
								$scope.myPage.RoomData = data;
								$scope.myPage.displaySpinner=false;
								localStorage.RoomData = JSON.stringify(data);
								settings.updateMap=0;
								localStorage.settings = JSON.stringify(settings);
						}).error(function(error) {
								console.log("erreur:" + error);
						});
				}else{
						$scope.myPage.RoomData = JSON.parse(localStorage.RoomData);
				}
				
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
	
	controllers.SocialNetworkCtrl = function ($scope,$rootScope,$routeParams,$location,$route,Factory){

			window.scrollTo(0,0);
			$scope.myPage = {};	
			
			/*	angular.element(document).ready(function () {
					jQuery(".clickable-row").click(function() {
						$location.path($(this).data("href"));
						$scope.$apply();
					});
				});
			*/
				
	};
	
	controllers.InfoPackCtrl = function ($scope,$rootScope,$routeParams,$location,$route,Factory){
	
			window.scrollTo(0,0);
			$scope.myPage = {};	
			
			var settings = JSON.parse(localStorage.settings);
			if(settings.updateInfoPack==1){
			
					$scope.myPage.displaySpinner=true;
	
					Factory.getInfoPack($routeParams.nid).success( function(data){
							$scope.myPage.InfoPackData = data;
							$scope.myPage.displaySpinner=false;
							localStorage.InfoPackData = JSON.stringify(data);
							settings.updateInfoPack=0;
							localStorage.settings = JSON.stringify(settings);
					}).error(function(error) {
							console.log("erreur:" + error);
					});
			}else{
					$scope.myPage.InfoPackData = JSON.parse(localStorage.InfoPackData);
			}
					
			
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
			
			var settings = JSON.parse(localStorage.settings);
			
			var queryType = $routeParams.type;
			
			if( (queryType == 'emergency' && settings.updateEmergency==1) ||  (queryType == 'invited' && settings.updateGuest==1) ){
			
					$scope.myPage.displaySpinner=true;
					Factory.getPeopleData($routeParams.nid,$routeParams.type).success( function(data){
							$scope.myPage.PeopleData = data;
							$scope.myPage.displaySpinner=false;
							if(queryType == 'emergency'){
								localStorage.Emergency = JSON.stringify(data);
								settings.updateEmergency=0;
							}else{
								localStorage.Guest = JSON.stringify(data);
								settings.updateGuest=0;							
							}
							localStorage.settings = JSON.stringify(settings);
					}).error(function(error) {
							console.log("erreur:" + error);
					});
			}else{
					if(queryType == 'emergency'){
							$scope.myPage.PeopleData = JSON.parse(localStorage.Emergency);
					}else{
							$scope.myPage.PeopleData = JSON.parse(localStorage.Guest);
					}
			}
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
			
			
			var screenWidth = $window.innerWidth * 95.0/100.0;
			if($window.innerWidth<340){
				$scope.myPage.dbnameWidth = screenWidth * 95.0 /100.0;
			}else{
				$scope.myPage.dbnameWidth = screenWidth * 95.0 /100.0;		
			}
			
			if($rootScope.alertAnnoucement || localStorage.Annoucements=="undefined"){  // Meaning if there is no Alert for a new Annoucement
												 // Do not load data
					$scope.myPage.displaySpinner=true;
					Factory.getAnnouncements($routeParams.nid).success( function(data){
							$scope.myPage.AnnounceData = data;
							localStorage.Annoucements = JSON.stringify(data);
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
			}else{
						$scope.myPage.AnnounceData = JSON.parse(localStorage.Annoucements);
			}
			
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
						jQuery("#agenda").attr("style","margin-top:" +(jQuery(".checkAll").outerHeight()+54)+"px;");
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
			
			var settings = JSON.parse(localStorage.settings);
			if(settings.updateOverview==1){
			
					$scope.myPage.displaySpinner=true;
	
					Factory.getAgendaOverview($routeParams.nid).success( function(data){
							$scope.myPage.Overview = data;
							$scope.myPage.MainVenue = $routeParams.mvenue;
							$scope.myPage.displaySpinner=false;
							localStorage.Overview = JSON.stringify(data);
							localStorage.MainVenue = $routeParams.mvenue;
							settings.updateOverview=0;
							localStorage.settings = JSON.stringify(settings);
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
			}else{
						$scope.myPage.Overview = JSON.parse(localStorage.Overview);
						$scope.myPage.MainVenue = localStorage.MainVenue;
						angular.element(document).ready(function () {
									jQuery(".clickable-row").click(function() {
											//window.location = $(this).data("href");
											$location.path($(this).data("href"));
											$scope.$apply();
									});
						});
			}
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
			
			factory.sendMessage = function(nid,subject,yr_email,yr_fullname,message){
			
					return  $http({
							url: URL + 'node/479',
							method: 'POST',
							data: {nid:nid,subject:subject,yr_email:yr_email,yr_fullname:yr_fullname,message:message}
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
