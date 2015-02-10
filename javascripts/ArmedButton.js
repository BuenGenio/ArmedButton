/*
---
author: Eugene Trotsan <eugene@anthill.hk> - http://anthill.hk
version: 0.3
description: JavaScript version of the proverbial 'Big Red Button' to confirm or cancel an action once 'armed'
requires:
- core/Class.Extras
- core/Element.Event
- more/Events.Pseudos
- core/Element.Data
provides: [ArmedButton, Element.flash]
demo: https://buengenio.github.io/ArmedButton/
...
*/

var ArmedButton = new Class({
	Implements: [Options, Events],

	options: {
		element : null,
		from_color: '#d2322d',
		to_color: '#ff8a86',

		fxOptions: {
			effect		: 'Tween',
			transition	: 'pow:in',
			duration	: 500,
			link		: 'cancel',
			property	: 'width',
			unit		: '%'
		}
	},

	initialize: function(element, options){
		this.element = element;
		if(options.extraClasses)
			this.element.addClass(options.extraClasses);
		this.element.store('armed', false);
		this.element.store('original_classes', this.element.get('class'));
		this.setOptions(options);
		this.build();
	},

	build: function(){
		text = this.options.text || this.element.get('html');
		this.element.set('html', '');
		this.element.adopt(Elements.from('<div class="armed-label"></div><div class="armed-controls"></div>'));
		this.label = this.element.getElement('.armed-label');
		this.label.set('html', text);
		if(!this.element.hasClass('disabled') && !this.element.get('disabled')){
			this.controls = this.element.getElement('.armed-controls');
			this.controls.adopt(new Element('button', Object.merge({
				'class': 	'armed-confirm btn btn-sm btn-success'
			}, this.options.btnConfirm)));

			this.controls.adopt(new Element('button', Object.merge({
				'class': 	'armed-cancel btn btn-sm btn-default'
			}, this.options.btnCancel)));

			this.fx = new Fx.Tween(this.label, this.options.fxOptions);
			this.addButtonEvents();
		}
	},

	addButtonEvents: function(){

		this.element.addEvent('click', function(e){
			e.preventDefault();
			if(this.element.hasClass('armed') && (!e.target.match('button')))
				return false;
			this.arm();
		}.bind(this));

		this.controls.getElements('button').addEvent('click', function(e){
			e.stopPropagation();
			e.preventDefault();
			if(e.target.hasClass('armed-confirm')){
				this.options.btnConfirm.onConfirm.bind(this);
				this.options.btnConfirm.onConfirm(this);
			} else {
				this.disarm();
			}
		}.bind(this));
	},

	arm: function(){
		this.fx.start(100, 0);
		this.element.addClass('btn-danger');
		this.element.removeClass('btn-primary');
		this.flashing = this.element.flash(this.options.from_color, this.options.to_color, 100, 'background-color', 500);
		this.element.addClass('armed');
	},

	disarm: function(classes){
		clearInterval(this.flashing);
		this.element.retrieve('effect').cancel()
		this.element.removeClass('btn-danger');
		this.fx.start(0, 100);
		setTimeout(function(){
			this.element.retrieve('effect').start('background-color', this.element.getStyle('background-color'), '#0088cc').chain(function(){
				this.element.erase('style');
			});
			if(classes != undefined){
				this.element.addClass(classes);
			}
			else this.element.addClass(this.element.retrieve('original_classes'));
		}.bind(this),300);
		this.element.removeClass('armed');
	}
});

//Element.flash
(function(){
	if(Element.flash == undefined){
		Element.implement({
			flash: function(to,from,reps,prop,dur) {

				//defaults
				if(!reps) { reps = 1; }
				if(!prop) { prop = 'background-color'; }
				if(!dur) { dur = 250; }
				
				this.tween(prop, this.getStyle(prop), to);
				//create effect
				this.store('effect', new Fx.Tween(this, {
					duration: dur,
					link: 'chain'
				}));
				
				//do it!
				var loop = function(){
					this.retrieve('effect').start(prop,from,to).start(prop,to,from);
					return loop;
				}.bind(this);

				periodical = loop().periodical(1000);
				return periodical;
			},

			armed: function(options){
				return new ArmedButton(this, options);
			}
		});
	}
})();
