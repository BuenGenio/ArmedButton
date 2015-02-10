ArmedButton
==========
The proverbial 'Big Red Button' made with MooTools & Bootstrap 3. When activated flashes and asks to confirm or cancel an action. Requires MooTools 1.5+ / Bootstrap 3+;
![Screenshot](https://buengenio.github.io/ArmedButton/images/armed.gif)

How to use
----------
# create your button:
```html
<button 
  href="#" 
  class="btn btn-default btn-block btn-armed armable">
    Just do it!
</button>
```
# initialise it:
```js
window.addEvent('domready', function(e){
  $$('.armable').armed({
    text: "Confirm",
    btnConfirm: {
      text: 'Confirm action',
      onConfirm: function(instance){
        //AB instance so you can do things like change the label and disarm
        instance.label.set('text', 'Action completed!');
        instance.disarm('btn btn-armed btn-block btn-success disabled');
      }
    },
    btnCancel: {
      text: 'Cancel'
    },

    fxOptions: {
      transition: 'pow:out',
      duration: 700
    }
  });
});
```
Demo
---------
https://buengenio.github.io/ArmedButton/
