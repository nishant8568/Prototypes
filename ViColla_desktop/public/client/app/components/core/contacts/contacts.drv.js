/**
 * Created by Antony on 11/29/2015.
 */
contactsModule.directive('contacts', function () {
    return {
        restrict: 'E',
        scope: {
            contacts: '=contacts'
        },
        templateUrl: 'app/components/core/contacts/contacts.tpl.html',
        controller: 'contactsController',
        controllerAs: 'contactsCtrl',
        bindToController: true

    }
});