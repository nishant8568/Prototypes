/**
 * Created by Antony on 11/21/2015.
 */
'use strict';

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
        .when('/', '/callHistory')
        .otherwise('/callHistory');

    $stateProvider
        .state('tabs', {
            abstract: true,
            url: '/',
            template: '<navigation-tabs layout="column" flex></navigation-tabs>'
        })
        .state('tabs.callHistory', {
            url: 'callHistory',
            data: {
                'selectedTab': 0
            },
            views: {
                'callHistory': {
                    template: '<online-mode></online-mode>'
                },
                'contacts': {
                    template: '<contacts layout="column"></contacts>'
                }
            }
        })
        .state('tabs.experts', {
            url: 'experts',
            data: {
                'selectedTab': 0
            },
            views: {
                'contacts': {
                    template: '<contacts layout="column"></contacts>'
                }
            }
        })
        .state('tabs.offlineMode', {
            url: 'offlineMode',
            data: {
                'selectedTab': 1
            },
            views: {
                'offlineMode': {
                    template: '<offline-mode></offline-mode>'
                }
            }
        })
        .state('tabs.onlineMode', {
            url: 'onlineMode',
            data: {
                'selectedTab': 2
            },
            views: {
                'onlineMode': {
                    template: '<videochat layout="column" layout-fill="" videouser="videoChat"></videochat>'
                }
            }
        })
        .state('tabs.onlineMode.call', {
            url: '/call',
            views: {
                'onlineModeCall': {
                    template: '<videochat layout="column" layout-fill="" videouser="videoChat"></videochat>'
                }
            }
        })
        .state('tabs.onlineMode.collaborate', {
            url: '/collaborate',
            controller: function ($scope){
                console.log("collaborate tab");
            },
            views: {
                'onlineModeCollaborate': {
                    template: 'app/components/core/online-mode/annotate/annotate-online.html'
                }
            }
        })
        .state('tabs.onlineMode.annotate', {
            url: '/annotateOnline',

            views: {
                'onlineModeAnnotate': {
                    templateUrl: 'app/components/core/online-mode/annotate/annotate-online.html',
                    controller: function ($scope){
                        console.log("annotate tab");
                    }
                }
            }
        })
});