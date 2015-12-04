/**
 * Created by Nishant on 11/29/2015.
 */
contactsModule.directive('contacts', function () {
    return {
        templateUrl: 'app/components/core/contacts/contacts.tpl.html',
        controller: 'contactsController'
    }
});