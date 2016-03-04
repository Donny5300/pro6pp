angular.module('donny5300.pro6pp', [])
	.provider('Pro6ppConfig', function ()
	{
		this.setApiKey = function ( key )
		{

			this.apiKey = key;
		};

		this.setTemplate = function ( template )
		{
			this.template = template;
		};

		this.enableDebug = function (option)
		{
			var debug = (option != false);
			console.log(debug)
			this.debug = debug;
		};

		this.$get = function ()
		{
			return this;
		};
	})
	.directive('address', function ( $http, Pro6ppConfig )
	{
		return {
			restrict   : 'EA',
			scope   : {
				zipcode    : '=',
				address: '=',
				housenumber: '=',
				city       : '=',
				fullAddress: '='
			},
			controller: function ( $scope, Pro6ppConfig, $log )
			{
				if ( !Pro6ppConfig.apiKey )
				{
					$log.error('No Pro6PP api key filled in!')
				}
			},
			require   : '^form',
			templateUrl: Pro6ppConfig.template,
			link       : function ( scope )
			{
				var conf = Pro6ppConfig;

				scope.generateURL = function ( zipcode, housenumber )
				{
					return 'https://api.pro6pp.nl/v1/autocomplete?auth_key=' + conf.apiKey + '&nl_sixpp=' + zipcode + '&streetnumber=' + housenumber;
				};

				if ( conf.apiKey )
				{
					scope.$watch('[zipcode, housenumber]', function ()
					{
						var zipcode     = scope.zipcode;
						var housenumber = scope.housenumber;

						if ( typeof zipcode !== 'undefined' && typeof housenumber !== 'undefined' && zipcode.length == 6 && housenumber.length > 0 )
						{
							scope.requestStarted   = true;
							scope.validationStatus = false;
							var url                = scope.generateURL(zipcode, housenumber);

							$http.get(url)
								.success(function ( response )
								{
									if ( conf.debug )
									{
										if ( response.status == 'ok' )
										{
											console.log(response)
										} else
										{
											console.warn(response);
										}
									}
									delete scope.validationMessage;
									scope.requestStarted = false;
									scope.validationStatus = response.status;

									if ( response.status == 'error' )
									{
										scope.validationMessage = response.error.message;
									} else
									{
										scope.fullAddress = response.results[0];
									}

								});
						}
					});
				}
			}
		};
	});
