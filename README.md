ArmedButton
==========
The proverbial 'Big Red Button' made with MooTools & Bootstrap 3. When activated flashes and asks to confirm or cancel an action. Requires MooTools 1.5+ / Bootstrap 3+;

How to use
----------
new ArmedButton(element, {
        btnConfirm: {
                text: 'Confirm',
                onConfirm: function(instance) {}
        },
        btnCancel: {
                text: 'Cancel',
        }
});

Demo
---------
(https://buengenio.github.io/ArmedButton/)
