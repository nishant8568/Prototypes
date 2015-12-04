/**
 * Created by Nishant on 11/29/2015.
 */
contactsModule.controller('contactsController', function ($scope) {
    'use strict';

    $scope.contacts = [
        {
            firstName: "Andy",
            lastName: "Strauss"
        },
        {
            firstName: "Michael",
            lastName: "Hall"
        },
        {
            firstName: "Tim",
            lastName: "Smith"
        },
        {
            firstName: "Andrew",
            lastName: "Clark"
        }
    ];
});