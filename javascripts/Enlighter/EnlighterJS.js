/*!
---
name: EnlighterJS
description: Post Syntax Highlighter for MooTools - based on the famous Lighter.js

license: MIT-Style X11 License
version: 2.4-custom
build: a6a4f18a8eba9bd00a9c1eccf1634914/February 9 2015

authors:
  - Andi Dittrich (author of EnlighterJS)
  - Jose Prado (author of original Lighter.js)
  
download: https://github.com/AndiDittrich/EnlighterJS
website: http://enlighterjs.andidittrich.de/
demo: http://enlighterjs.andidittrich.de/Themes.html
  
requires:
  - Core/1.4.5

provides: [EnlighterJS]
...
*//*
---
name: EnlighterJS
description: Syntax Highlighter based on the famous Lighter.js

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - Core/1.4.5

provides: [EnlighterJS]
...
 */
var EnlighterJS = new Class({

	Implements : Options,

	options : {
		language : 'generic',
		theme : 'Enlighter',
		renderer: 'Block',
		indent : -1,
		forceTheme: false,
		rawButton: true,
		windowButton: true,
		infoButton: true,
		ampersandCleanup: true,
		rawcodeDoubleclick: false
	},

	// used renderer instance
	renderer: null,
	
	// used codeblock to highlight
	originalCodeblock: null,
	
	// used container to store highlighted code
	container: null,
	
	// lightning active ?
	isRendered: false,
	
	// language alias manager
	languageManager: null,

	// toggle raw code
	rawContentContainer: null,
	
	// rendered output span/ou/ul container
	output: null,
	

	/**
	 * @constructs
	 * @param {Element} originalCodeblock An Element containing code to highlight
	 * @param {Object} options The options object.
	 * @param {Element} container (optional) The output container - if not defined, the output will be injected after the originalCodeblock
	 */
	initialize : function(originalCodeblock, options, container) {
		this.setOptions(options);
		
		// create new language alias manager instance
		this.languageManager = new EnlighterJS.LanguageManager(options);
				
		// initialize renderer
		if (this.options.renderer == 'Inline'){
			this.renderer = new EnlighterJS.Renderer.InlineRenderer(options);
		}else{
			this.renderer = new EnlighterJS.Renderer.BlockRenderer(options);
		}
				
		// store codeblock element
		this.originalCodeblock = document.id(originalCodeblock);
		
		// store/create container
		if (container){
			this.container = document.id(container);
		}
	},

	/**
	 * Takes a codeblock and highlights the code inside of it using the
	 * stored parser/compilers. It reads the class name to figure out what
	 * language and theme to use for highlighting.
	 * 
	 * @return {EnlighterJS} The current EnlighterJS instance.
	 */
	enlight : function(enabled){
		// show highlighted sourcecode ?
		if (enabled){
			// get element language
			var rawLanguageName = this.originalCodeblock.get('data-enlighter-language');
			
			// ignore higlighting ?
			if (rawLanguageName == 'no-highlight'){
				return;
			}
			
			// hide original codeblock
			this.originalCodeblock.setStyle('display', 'none');
			
			// EnlighterJS exists so just toggle display.
			if (this.isRendered) {				
				this.container.setStyle('display', 'inherit');
				return this;
			}
			
			// get language name - use alias manager to check language string and validate
			var languageName = this.languageManager.getLanguage(rawLanguageName);
			
			// get theme name - use options as fallback
			var themeName = (this.options.forceTheme ? null : this.originalCodeblock.get('data-enlighter-theme')) || this.options.theme || 'Enlighter';
			
			// special lines to highlight ?
			var specialLines = new EnlighterJS.SpecialLineHighlighter(this.originalCodeblock.get('data-enlighter-highlight'), this.originalCodeblock.get('data-enlighter-lineoffset'));
			
			// Load language parser
			language = new EnlighterJS.Language[languageName](this.getRawCode(true));
			
			// compile tokens -> generate output
			this.output = this.renderer.render(language, specialLines, {
				lineOffset: (this.originalCodeblock.get('data-enlighter-lineoffset') || null),
				lineNumbers: this.originalCodeblock.get('data-enlighter-linenumbers')
			});
			
			// set class and id attributes.
			this.output.addClass(themeName.toLowerCase() + 'EnlighterJS').addClass('EnlighterJS');		
	
			// add wrapper ?
			if (this.options.renderer == 'Block'){
				// grab content into specific container or after original code block ?
				if (!this.container) {
					this.container = new Element('div');
					
					// put the highlighted code wrapper behind the original	
					this.container.inject(this.originalCodeblock, 'after');
				}
				
				// add wrapper class
				this.container.addClass('EnlighterJSWrapper').addClass(themeName.toLowerCase() + 'EnlighterJSWrapper');
				
				// add the highlighted code
				this.container.grab(this.output);
				
				// create raw content container
				this.rawContentContainer = new Element('pre', {
					text: this.getRawCode(false),
					styles: {
						'display': 'none'
					}
				});
				
				// add raw content container
				this.container.grab(this.rawContentContainer);
				
				// show raw code on double-click ?
				if (this.options.rawcodeDoubleclick){
					this.container.addEvent('dblclick', function(){
						this.toggleRawCode();
					}.bind(this));
				}
				
				// toolbar ?
				if (this.options.rawButton || this.options.windowButton || this.options.infoButton){
					this.container.grab(new EnlighterJS.UI.Toolbar(this));
				}
				
			// normal handling
			}else{
				// grab content into specific container or after original code block ?
				if (this.container) {
					this.container.grab(this.output);
					
				// just put the highlighted code behind the original	
				}else{
					this.output.inject(this.originalCodeblock, 'after');
					this.container = this.output;
				}
			}
			
			// set render flag
			this.isRendered = true;
			
		// disable highlighting	
		}else{
			// already highlighted ?
			if (this.isRendered) {
				this.originalCodeblock.setStyle('display', 'inherit');
				this.container.setStyle('display', 'none');
			}
		}

		return this;
	},
	
	/**
	 * Takes a codeblock and highlights the code inside. The original codeblock is set to invisible
	 * @DEPRECATED since v2.0 - this method will be removed in the future
	 * 
	 * @return {EnlighterJS} The current EnlighterJS instance.
	 */
	light : function(){
		return this.enlight(true);
	},
		
	/**
	 * Unlights a codeblock by hiding the enlighter element if present and re-displaying the original code.
	 * @DEPRECATED since v2.0 - this method will be removed in the future
	 * 
	 * @return {EnlighterJS} The current EnlighterJS instance.
	 */
	unlight : function() {
		return this.enlight(false);
	},

	/**
	 * Extracts the raw code from given codeblock
	 * @return {String} The plain-text code (raw)
	 */
	getRawCode: function(reindent) {
		// get the raw content
		var code = this.originalCodeblock.get('html');
		
		// remove empty lines at the beginning+end of the codeblock
		code = code.replace(/(^\s*\n|\n\s*$)/gi, '');
		
		// cleanup ampersand ?
		if (this.options.ampersandCleanup===true){
			code = code.replace(/&amp;/gim, '&');
		}
		
		// replace html escaped chars
		code = code.replace(/&lt;/gim, '<').replace(/&gt;/gim, '>').replace(/&nbsp;/gim, ' ');

		// replace tabs with spaces ?
		if (reindent === true){
			// get indent option value
			var newIndent = this.options.indent.toInt();
			
			// re-indent code if specified
			if (newIndent > -1){
				// match all tabs
				code = code.replace(/(\t*)/gim, function(match, p1, offset, string){
					// replace n tabs with n*newIndent spaces
					return (new Array(newIndent * p1.length + 1)).join(' ');
				});
			}
		}
		
		return code;
	},
	
	/**
	 * Hide/Show the RAW Code Container/Toggle Highlighted Code
	 */
	toggleRawCode: function(show){
		// initialization required!
		if (this.output == null){
			return;
		}
		
		// argument set ?
		if (typeof(show)!='boolean'){
			show = (this.rawContentContainer.getStyle('display') == 'none');
		}
		
		// toggle container visibility
		if (show){
			this.output.setStyle('display', 'none');
			this.rawContentContainer.setStyle('display', 'block');
		}else{
			this.output.setStyle('display', 'block');
			this.rawContentContainer.setStyle('display', 'none');
		}
	}
});

// register namespaces
EnlighterJS.Language = {};
EnlighterJS.Renderer = {};
EnlighterJS.Util = {};
EnlighterJS.UI = {};

/*
---
name: Special Line Highlighter
description: Highlights special lines

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - core/1.4.5

provides: [EnlighterJS.SpecialLineHighlighter]
...
*/
EnlighterJS.SpecialLineHighlighter = new Class({
		
	// storage of line numbers to highlight
	specialLines: {},
	
	/**
	 * @constructs
	 * @param {String} html attribute content "highlight" - scheme 4,5,6,10-12,19
	 */
	initialize : function(lineNumberString, lineOffsetString){
		// special lines given ?
		if (lineNumberString == null || lineNumberString.length == 0){
			return;
		}
		
		// line offset available ?
		var lineOffset = (lineOffsetString != null && lineOffsetString.toInt() > 1 ? lineOffsetString.toInt()-1 : 0);
		
		// split attribute string into segments
		var segments = lineNumberString.split(',');
				
		// iterate over segments
		segments.each(function(item, index){
			// pattern xxxx-yyyy
			var parts = item.match(/([0-9]+)-([0-9]+)/);
			
			// single line or line-range
			if (parts!=null){				
				// 2 items required
				var start = parts[1].toInt()-lineOffset;
				var stop = parts[2].toInt()-lineOffset;
				
				// valid range ?
				if (stop > start){
					// add lines to storage
					for (var i=start;i<=stop;i++){
						this.specialLines['l' + i] = true;
					}
				}
			}else{
				// add line to storage
				this.specialLines['l' + (item.toInt()-lineOffset)] = true;
			}
		}.bind(this));
	},
	
	/**
	 * Check if the given linenumber is a special line
	 * @param Integer lineNumber
	 * @returns {Boolean}
	 */
	isSpecialLine: function(lineNumber){
		return (this.specialLines['l' + lineNumber] || false);
	}
	
});
/*
---
description: Code parsing engine for EnlighterJS

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Language.generic]
...
*/
EnlighterJS.Language.generic = new Class({

	tokenizerType : 'Lazy',
	tokenizer : null,
	code : null,

	patterns : {},
	keywords : {},
	delimiters : {
		start: null,
		end: null
	},


	// commonly used Regex Patterns
	common : {
		// Matches a C style single-line comment.
		slashComments : /(?:^|[^\\])\/\/.*$/gm,

		// Matches a Perl style single-line comment.
		poundComments : /#.*$/gm,

		// Matches a C style multi-line comment
		multiComments : /\/\*[\s\S]*?\*\//gm,

		// Matches a string enclosed by single quotes. Legacy.
		aposStrings : /'[^'\\]*(?:\\.[^'\\]*)*'/gm,

		// Matches a string enclosed by double quotes. Legacy.
		quotedStrings : /"[^"\\]*(?:\\.[^"\\]*)*"/gm,

		// Matches a string enclosed by single quotes across multiple lines.
		multiLineSingleQuotedStrings : /'[^'\\]*(?:\\.[^'\\]*)*'/gm,

		// Matches a string enclosed by double quotes across multiple lines.
		multiLineDoubleQuotedStrings : /"[^"\\]*(?:\\.[^"\\]*)*"/gm,

		// Matches both.
		multiLineStrings : /'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"/gm,

		// Matches a string enclosed by single quotes.
		singleQuotedString : /'[^'\\\r\n]*(?:\\.[^'\\\r\n]*)*'/gm,

		// Matches a string enclosed by double quotes.
		doubleQuotedString : /"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/gm,

		// Matches both.
		strings : /'[^'\\\r\n]*(?:\\.[^'\\\r\n]*)*'|"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/gm,

		// Matches a property: .property style.
		properties : /\.([\w]+)\s*/gi,

		// Matches a method call: .methodName() style.
		methodCalls : /\.([\w]+)\s*\(/gm,

		// Matches a function call: functionName() style.
		functionCalls : /\b([\w]+)\s*\(/gm,

		// Matches any of the common brackets.
		brackets : /\{|\}|\(|\)|\[|\]/g,

		// Matches integers, decimals, hexadecimals.
		numbers : /\b((?:(\d+)?\.)?[0-9]+|0x[0-9A-F]+)\b/gi
	},

	/**
	 * Constructor.
	 * 
	 * @constructs
	 * @param {Object}
	 *            options
	 */
	initialize : function(code){
		// initialize language options
		this.setupLanguage();
		
		this.aliases = {};
		this.rules = {};
		this.code = code;

		// create new tokenizer
		this.tokenizer = new EnlighterJS.Tokenizer[this.tokenizerType]();

		// Add delimiter rules.
		if (this.delimiters.start){
			this.addRule('delimBeg', this.delimiters.start, 'de1');
		}

		if (this.delimiters.end){
			this.addRule('delimEnd', this.delimiters.end, 'de2');
		}

		// Set Keyword Rules from this.keywords object.
		Object.each(this.keywords, function(keywordSet, ruleName){
			// keyword set contains elements ?
			if (keywordSet.csv != ''){
				this.addRule(ruleName, this.csvToRegExp(keywordSet.csv, keywordSet.mod || "g"), keywordSet.alias);
			}
		}, this);

		// Set Rules from this.patterns object.
		Object.each(this.patterns, function(regex, ruleName){
			this.addRule(ruleName, regex.pattern, regex.alias);
		}, this);
	},
	
	// override this method to setup language params
	setupLanguage: function(){
	},

	getTokens : function(){
		return this.tokenizer.getTokens(this, this.code);
	},

	getRules : function(){
		return this.rules;
	},

	hasDelimiters : function(){
		return this.delimiters.start && this.delimiters.end;
	},

	addRule : function(ruleName, regex, className){
		this.rules[ruleName] = regex;
		this.addAlias(ruleName, className);
	},

	addAlias : function(key, alias){
		this.aliases[key] = alias || key;
	},

	csvToRegExp : function(csv, mod){
		return new RegExp('\\b(' + csv.replace(/,\s*/g, '|') + ')\\b', mod);
	},

	delimToRegExp : function(beg, esc, end, mod, suffix){
		beg = beg.escapeRegExp();
		if (esc){
			esc = esc.escapeRegExp();
		}
		end = (end) ? end.escapeRegExp() : beg;
		var pat = (esc) ? beg + "[^" + end + esc + '\\n]*(?:' + esc + '.[^' + end + esc + '\\n]*)*' + end : beg + "[^" + end + '\\n]*' + end;

		return new RegExp(pat + (suffix || ''), mod || '');
	},

	strictRegExp : function(){
		var regex = '(';
		for (var i = 0; i < arguments.length; i++){
			regex += arguments[i].escapeRegExp();
			regex += (i < arguments.length - 1) ? '|' : '';
		}
		regex += ')';
		return new RegExp(regex, "gim");
	}
});
/*
---
description: defines a key/value object with language aliases e.g. javascript -> js

license: MIT-style

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.LanguageManager]
...
*/
EnlighterJS.LanguageManager = new Class({
	
	Implements : Options,
	
	options: {
		'language': 'generic'
	},

	/**
	 * @constructs
	 * @param {Object} options The options object.
	 */
	initialize : function(options) {
		this.setOptions(options);
	},	
	
	// map of language aliases
	languageAliases: {
		'standard': 'generic',
		'js': 'javascript',
		'md': 'markdown',
		'c++': 'cpp',
		'c': 'cpp',
		'styles': 'css',
		'bash': 'shell',
		'json': 'javascript',
		'py': 'python',
		'html': 'xml',
		'jquery': 'javascript',
		'mootools': 'javascript',
		'ext.js': 'javascript',
		'c#': 'csharp'
	},
	
	// get language name, process aliases and default languages
	getLanguage: function(languageName){
		// get default language
		var defaultLanguage = (this.options.language != null ? this.options.language.trim().toLowerCase() : '');
		
		// alias available ?
		if (this.languageAliases[defaultLanguage]){
			defaultLanguage = this.languageAliases[defaultLanguage];
		}
		
		// default language class available ?
		if (defaultLanguage.trim() == '' || !EnlighterJS.Language[defaultLanguage]){
			defaultLanguage = 'generic';
		}
				
		// valid string ?
		if (languageName == null || languageName.trim() == ''){
			return defaultLanguage;
		}
		
		// "clean" languge name
		languageName = languageName.trim().toLowerCase();
		
		// alias available ?
		if (this.languageAliases[languageName]){
			languageName = this.languageAliases[languageName];
		}
		
		// language class available ?
		if (EnlighterJS.Language[languageName]){
			return languageName;
		}else{
			return defaultLanguage;
		}
	}		
});/*
---
description: Code parsing engine for Lighter.

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - Core/1.4.5

provides: [EnlighterJS.Tokenizer]
...
*/
EnlighterJS.Tokenizer = new Class({

	/**
	 * @constructs
	 */
	initialize : function(){
	},

	/**
	 * Parses source code using language regex rules and returns the array of tokens.
	 * 
	 * @param {Language}
	 *            language The Language to use for parsing.
	 * @param {String}
	 *            code The source code to parse.
	 * @param {Number}
	 *            [offset] Optional offset to add to the found index.
	 */
	getTokens : function(language, code){
		var text = null;
		var token = null;

		// parse code
		var tokens = this.parseTokens(language, code);

		// Add code between matches as an unknown token to the token array.
		for (var i = 0,pointer = 0; i < tokens.length; i++){
			if (pointer < tokens[i].index){
				text = code.substring(pointer, tokens[i].index);
				token = new EnlighterJS.Token(text, 'unknown', pointer);
				tokens.splice(i, 0, token);
			}
			pointer = tokens[i].end;
		}

		// Add the final unmatched piece if it exists.
		if (pointer < code.length){
			text = code.substring(pointer, code.length);
			token = new EnlighterJS.Token(text, 'unknown', pointer);
			tokens.push(token);
		}

		return tokens;
	},

	/**
	 * Parsing strategy method which child classes must override.
	 */
	parseTokens : function(language, code){
		throw new Error('Extending classes must override the parseTokens() method.');
	}
});
/*
---
description: Represents a token with its source code position and type.

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Token]
...
*/
EnlighterJS.Token = new Class({
    
	text: null,
	type: null,
	index: -1,
	length: -1,
	end: -1,
	
    /**
     * Creates an instance of Token.
     *
     * @constructs
     * @param {String} text  The match text.
     * @param {String} type  The type of match.
     * @param {Number} index The index where the match was found.
     */
    initialize: function(text, type, index){
        this.text   = text;
        this.type   = type;
        this.index  = index;
        this.length = this.text.length;
        this.end    = this.index + this.length;
    },
    
    /**
     * Tests whether a Token is contained within this Token.
     * 
     * @param Token token The Token to test against.
     * @return Boolean Whether or not the Token is contained within this one.
     */
    contains: function(token){
        return (token.index >= this.index && token.index < this.end);
    },
    
    /**
     * Tests whether a this Token is past another Token.
     * 
     * @param Token token The Token to test against.
     * @return Boolean Whether or not this Token is past the test one.
     */
    isBeyond: function(token){
        return (this.index >= token.end);
    },
    
    /**
     * Tests whether a Token overlaps with this Token.
     * 
     * @param Token token The Token to test against.
     * @return Boolean Whether or not this Token overlaps the test one.
     */
    overlaps: function(token){
        return (this.index == token.index && this.length > token.length);
    },
    
    toString: function(){
        return this.index + ' - ' + this.text + ' - ' + this.end;
    }
});
/*
---
description: Compiles an array of tokens into inline elements, grabbed into a outer container.

license: MIT-style X11

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Renderer.InlineRenderer]
...
*/
EnlighterJS.Renderer.InlineRenderer = new Class({
	Implements: Options,
	
	options : {
		inlineContainerTag : 'span'
	},

	initialize : function(options){
		this.setOptions(options);
	},

	/**
	 * Renders the generated Tokens
	 * 
	 * @param {Language} language The Language used when parsing.
	 * @param {SpecialLineHighlighter} specialLines Instance to define the lines to highlight           
	 * @return {Element} The renderer output
	 */
	render : function(language, specialLines, localOptions){
		// create output container element
		var container = new Element(this.options.inlineContainerTag);

		// generate output based on ordered list of tokens
		language.getTokens().each(function(token, index){
			// get classname
			var className = token.type ? (language.aliases[token.type] || token.type) : '';
			
			// create new inline element which contains the token - htmlspecialchars get escaped by mootools setText !
			container.grab(new Element('span', {
				'class': className,
				'text': token.text
			}));
		});

		return container;
	}
});
/*
---
description: Renders the generated Tokens into li-elements, grabbed into a outer ul/ol-container.

license: MIT-style X11

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Renderer.BlockRenderer]
...
*/
EnlighterJS.Renderer.BlockRenderer = new Class({
	Implements: Options,
	
	options : {
		hover : 'hoverEnabled',
		oddClassname: 'odd',
		evenClassname: 'even',
		showLinenumbers: true
	},

	initialize : function(options){
		this.setOptions(options);
	},

	/**
	 * Renders the generated Tokens
	 * 
	 * @param {Language} language The Language used when parsing.
	 * @param {SpecialLineHighlighter} specialLines Instance to define the lines to highlight           
	 * @return {Element} The renderer output
	 */
	render : function(language, specialLines, localOptions){
		// create new outer container element - use ol tag if lineNumbers are enabled. element attribute settings are priorized
		var container = null;
		if (localOptions.lineNumbers != null){
			container = new Element((localOptions.lineNumbers.toLowerCase() === 'true') ? 'ol' : 'ul');
		}else{
			container = new Element(this.options.showLinenumbers ? 'ol' : 'ul');
		}
		
		// add "start" attribute ?
		if ((localOptions.lineNumbers || this.options.showLinenumbers) && localOptions.lineOffset && localOptions.lineOffset.toInt() > 1){
			container.set('start', localOptions.lineOffset);
		}
		
		// line number count
		var lineCounter = 1;
		
		// current line element
		var currentLine = new Element('li', {
			'class': (specialLines.isSpecialLine(lineCounter) ? 'specialline' : '')
		});
		
		// generate output based on ordered list of tokens
		language.getTokens().each(function(token, index){
			// get classname
			var className = token.type ? (language.aliases[token.type] || token.type) : '';
			
			// split the token into lines
			var lines = token.text.split('\n');
			
			// linebreaks found ?
			if (lines.length > 1){
				// just add the first line
				currentLine.grab(new Element('span', {
					'class': className,
					'text': lines.shift()
				}));
				
				// generate element for each line
				lines.each(function(line, lineNumber){
					// grab old line into output container
					container.grab(currentLine);
					
					// new line
					lineCounter++;
					
					// create new line, add special line classes
					currentLine = new Element('li', {
						'class': (specialLines.isSpecialLine(lineCounter) ? 'specialline' : '')
					});
										
					// create new token-element
					currentLine.grab(new Element('span', {
						'class': className,
						'text': line
					}));
				});				
			}else{
				// just add the token
				currentLine.grab(new Element('span', {
					'class': className,
					'text': token.text
				}));	
			}			
		});
		
		// grab last line into container
		container.grab(currentLine);

		// add odd/even classes
		if (this.options.evenClassname){
			container.getElements('li:even').addClass(this.options.evenClassname);
		}
		if (this.options.oddClassname){
			container.getElements('li:odd').addClass(this.options.oddClassname);
		}

		// highlight lines ?
		if (this.options.hover && this.options.hover != "NULL"){
			// add hover enable class
			container.getChildren().addClass(this.options.hover);
		}

		return container;
	}
});
/*
---
description: Lazy parsing engine for Lighter.

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - Core/1.4.5

provides: [Tokenizer.Lazy]
...
*/
EnlighterJS.Tokenizer.Lazy = new Class({

	Extends : EnlighterJS.Tokenizer,

	/**
	 * @constructs
	 */
	initialize : function(){
	},

	/**
	 * Brute force the matches by finding all possible matches from all rules. Then we sort them and cycle through the matches finding and eliminating inner matches. Faster than
	 * LighterTokenizer.Strict, but less robust and prone to erroneous matches.
	 * 
	 * @param {Language}
	 *            language The language to use for parsing.
	 * @param {String}
	 *            code The code to parse.
	 * @return {Array} The array of matches found.
	 */
	parseTokens : function(language, code){
		var tokens = [];
		var match = null;
		var text = null;
		var index = null;


		Object.each(language.getRules(), function(regex, rule){
			while (null !== (match = regex.exec(code))){
				index = match[1] && match[0].contains(match[1]) ? match.index + match[0].indexOf(match[1]) : match.index;
				text = match[1] || match[0];
				tokens.push(new EnlighterJS.Token(text, rule, index));
			}
		}, this);

		tokens = tokens.sort(function(token1, token2){
			return token1.index - token2.index;
		});

		for (var i = 0,j = 0; i < tokens.length; i++){

			if (tokens[i] === null){
				continue;
			}

			for (j = i + 1; j < tokens.length && tokens[i] !== null; j++){
				if (tokens[j] === null){
					continue;
				}else if (tokens[j].isBeyond(tokens[i])){
					break;
				}else if (tokens[j].overlaps(tokens[i])){
					tokens[i] = null;
				}else if (tokens[i].contains(tokens[j])){
					tokens[j] = null;
				}
			}
		}

		return tokens.clean();
	}
});
/*
---
description: XML parser engine for EnlighterJS

license: MIT-style

authors:
  - Andi Dittrich
  - Jose Prado

requires:
  - Core/1.4.5

provides: [EnlighterJS.Tokenizer.Xml]
...
*/
EnlighterJS.Tokenizer.Xml = new Class({

	Extends : EnlighterJS.Tokenizer,

	/**
	 * @constructs
	 */
	initialize : function(){
	},

	/**
	 * Xml Tokenizer
	 * 
	 * @author Jose Prado, Andi Dittrich
	 * 
	 * @param {Language}
	 *            lang The language to use for parsing.
	 * @param {String}
	 *            code The code to parse.
	 * @param {Number}
	 *            [offset] Optional offset to add to the match index.
	 * @return {Array} The array of tokens found.
	 */
	parseTokens : function(lang, code){
		// Tags + attributes matching and preprocessing.
		var tagPattern = /((?:\&lt;|<)[A-Z][A-Z0-9]*)(.*?)(\/?(?:\&gt;|>))/gi;
		var attPattern = /\b([\w-]+)([ \t]*)(=)([ \t]*)(['"][^'"]+['"]|[^'" \t]+)/gi;
		
		// tmp storage
		var tokens = [];
		var match = null;
		var attMatch = null;
		var index = 0;

		// Create array of matches containing opening tags, attributes, values, and separators.
		while ((match = tagPattern.exec(code)) != null){
			tokens.push(new EnlighterJS.Token(match[1], 'kw1', match.index));
			while ((attMatch = attPattern.exec(match[2])) != null){
				index = match.index + match[1].length + attMatch.index;
				tokens.push(new EnlighterJS.Token(attMatch[1], 'kw2', index)); // Attributes
				index += attMatch[1].length + attMatch[2].length;
				tokens.push(new EnlighterJS.Token(attMatch[3], 'kw1', index)); // Separators (=)
				index += attMatch[3].length + attMatch[4].length;
				tokens.push(new EnlighterJS.Token(attMatch[5], 'st0', index)); // Values
			}
			tokens.push(new EnlighterJS.Token(match[3], 'kw1', match.index + match[1].length + match[2].length));
		}

		// apply rules
		Object.each(lang.getRules(), function(regex, rule){
			while (null !== (match = regex.exec(code))){
				index = match[1] && match[0].contains(match[1]) ? match.index + match[0].indexOf(match[1]) : match.index;
				text = match[1] || match[0];
				tokens.push(new EnlighterJS.Token(text, rule, index));
			}
		}, this);

		// sort tokens
		tokens = tokens.sort(function(token1, token2){
			return token1.index - token2.index;
		});

		for (var i = 0,j = 0; i < tokens.length; i++){

			if (tokens[i] === null){
				continue;
			}

			for (j = i + 1; j < tokens.length && tokens[i] !== null; j++){
				if (tokens[j] === null){
					continue;
				}else if (tokens[j].isBeyond(tokens[i])){
					break;
				}else if (tokens[j].overlaps(tokens[i])){
					tokens[i] = null;
				}else if (tokens[i].contains(tokens[j])){
					tokens[j] = null;
				}
			}
		}
		return tokens.clean();
	}
});
/*
---
name: CodeWindow
description: Opens a new Window with the raw-sourcecode within

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - core/1.4.5

provides: [EnlighterJS.UI.CodeWindow]
...
*/
EnlighterJS.UI.CodeWindow = (function(code){
	// code "cleanup"
	code = code.replace(/&/gim, '&amp;').replace(/</gim, '&lt;').replace(/>/gim, '&gt;');

	// open new window
	var w = window.open('', '', 'width=' + (window.screen.width -200) + ', height=' + (screen.height-300) + ', menubar=no, titlebar=no, toolbar=no, top=100, left=100, scrollbars=yes, status=no');
	
	// insert code
	w.document.body.innerHTML = '<pre>' + code + '</pre>';
	w.document.title = 'EnlighterJS Sourcecode';
});



/*
---
name: Toolbar
description: Container which contains various buttons

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - core/1.4.5

provides: [EnlighterJS.UI.Toolbar]
...
*/
EnlighterJS.UI.Toolbar = new Class({
	Implements: Options,
	
	options: {
		toolbar: {
			rawTitle: 'Toggle RAW Code',
			windowTitle: 'Open Code in new Window',
			infoTitle: 'EnlighterJS Syntax Highlighter'
		}
	},

	// toolbar container
	container: null,
	
	initialize : function(enlighterInstance){
		// get options
		this.setOptions(enlighterInstance.options);
		
		// create outer container
		this.container = new Element('div', {
			'class': 'EnlighterJSToolbar'
		});
		
		// info button ?
		if (this.options.infoButton){
			// create window "button"
			this.container.grab(new Element('a', {
				'class': 'EnlighterJSInfoButton',
				title: this.options.toolbar.infoTitle,
				events: {
					// open new window on click
					click: function(){
						window.open('http://enlighterjs.andidittrich.de');
					}.bind(this)
				 }
			}));
		}
		
		// toggle button ?
		if (this.options.rawButton){
			// create toggle "button"
			this.container.grab(new Element('a', {
				'class': 'EnlighterJSRawButton',
				title: this.options.toolbar.rawTitle,
				events: {
					 click: function(){
						 // trigger toggle
						 enlighterInstance.toggleRawCode();
					 }.bind(this)
				 }
			}));		
		}
		
		// code window button ?
		if (this.options.windowButton){
			// create window "button"
			this.container.grab(new Element('a', {
				'class': 'EnlighterJSWindowButton',
				title: this.options.toolbar.windowTitle,
				events: {
					// open new window on click
					click: function(){
						EnlighterJS.UI.CodeWindow(enlighterInstance.getRawCode(false));
					}.bind(this)
				 }
			}));
		}		
		
		// clearfix
		this.container.grab(new Element('span', {
			'class': 'clear'
		}));
	},
	
	toElement: function(){
		return this.container;
	}	
});
/*
---
description: Extends MooTools.Element with the `enlight()` shortcut. Also adds `light()` and `unlight()` for backward compatibility with Lighter.js

license: MIT-style X11 License

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [Element.enlight]
...
 */
(function(){
	Element.implement({
		/**
		 * Highlights an element/Removes Element highlighting
		 *
		 * @param {Object, Boolean} [options] EnlighterJS options Object or Boolean value to enable/disable highlighting
		 * @returns {Element} The current Element instance.
		 */
		enlight: function(options){
			// mixed input check - options available ?
			options = (typeof(options) == "undefined") ? {} : options;
			
			// convert "true" to empty Object!
			options = (options===true) ? {} : options;
			
			// enlighter instance already available ?
			var enlighter = this.retrieve('EnlighterInstance');

			// hide highlighted sourcecode ?
			if (options === false){
				if (enlighter !== null) {
					enlighter.enlight(false);
				}
			// highlight sourcecode and use options	
			}else{
				// create new enlighter instance
				if (enlighter === null) {
					enlighter = new EnlighterJS(this, options, null);
					this.store('EnlighterInstance', enlighter);
				}
				enlighter.enlight(options);
			}
			
			// element instance
			return this;
		},
		
		/**
		 * Highlights an element
		 * @DEPRECATED since v2.0 - this method will be removed in the future
		 * @param {Object} [options] EnlighterJS Options Object
		 * @returns {Element} The current Element instance.
		 */
		light : function(options) {
			return this.enlight(options);
		},

		/**
		 * Removes/hides Element highlighting
		 * @DEPRECATED since v2.0 - this method will be removed in the future
		 * @returns {Element} The current Element instance.
		 */
		unlight : function(){
			return this.enlight(false);
		}
	});

})();/*
---
name: Helper
description: Helper to initialize multiple Enlighter instances on your page as well as code-groups

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - Core/1.4.5

provides: [EnlighterJS.Util.Helper]
...
*/
(function(){
	EnlighterJS.Util.Helper = (function(elements, options){
		// element grouping disabled?
		if (options.grouping===false){
			// highlight all elements
			elements.enlight(options);
			
		// use grouping	
		}else{
			// get separated groups and single elements
			var groups = {};
			var ungrouped = [];
			
			// group elements
			Array.each(elements, function(el){
				// extract group name
				var groupName = el.get('data-enlighter-group');
				
				// build element tree
				if (groupName){
					if (groups[groupName]){
						groups[groupName].push(el);
					}else{
						groups[groupName] = [el];
					}
				}else{
					ungrouped.push(el);
				}
			});
			
			// highlight single elements (non grouped)
			ungrouped.each(function(el){
				el.enlight(options);
			});
			
			// create & highlight groups
			Object.each(groups, function(obj){
				// copy options
				var localoptions = Object.clone(options);

				// force theme defined within options (all group members should have the same theme as group-leader)
				localoptions.forceTheme = true;
				
				// get group-leader theme
				localoptions.theme = obj[0].get('data-enlighter-theme') || options.theme || 'Enlighter';

				// create new tab pane
				var tabpane = new EnlighterJS.UI.TabPane(localoptions.theme);
				
				// put enlighted objects into the tabpane
				Array.each(obj, function(el, index){
					// create new tab - set title with fallback
					var container = tabpane.addTab(el.get('data-enlighter-title') || el.get('data-enlighter-language') || localoptions.language);
															
					// run enlighter
					(new EnlighterJS(el, localoptions, container)).enlight(true);
					
				}.bind(this));
				
				// select first tab (group-leader)
				tabpane.getContainer().inject(obj[0], 'before');
				tabpane.selectTab(0);
				
			}.bind(this));
		}	
	});
})();	
/*
---
name: TapPane
description: Displays multiple code-blocks within a group

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - core/1.4.5

provides: [EnlighterJS.UI.TabPane]
...
*/
EnlighterJS.UI.TabPane = new Class({
		
	// wrapper container which contains the controls + panes
	container: null,
	
	// control container - contains the tab names
	controlContainer: null,
	
	// pane container - contains the tab panes
	paneContainer: null,
	
	// array of tab objects
	tabs: [],
	
	// current active tab
	selectedTabIndex: 0,
	
	/**
	 * @constructs
	 * @param {String} cssClassname The class-name of the outer container
	 */
	initialize : function(cssClassname) {
		// create container
		this.container = new Element('div', {
			'class': 'EnlighterJSTabPane ' + cssClassname.toLowerCase() + 'EnlighterJSTabPane'
		});
		
		// create container structure
		//	<div class="EnlighterJSTabPane ...">
		//    <div class="controls">
		//       <ul> <li>Tab1</li> .... </ul>
		//    </div>
		//    <div class="pane">
		//      <div>Enlighter Tab1</div>
		//      <div>Enlighter Tab2</div>
		//    </div>
		//  </div>
		this.controlContainer = new Element('ul');
		this.paneContainer = new Element('div', {
			'class': 'pane'
		});		
		var controlWrapper = new Element('div', {
			'class': 'controls'
		});
		controlWrapper.grab(this.controlContainer);
		controlWrapper.grab(new Element('div', {
			'class': 'clearfixList'
		}));
		
		this.container.grab(controlWrapper);
		this.container.grab(this.paneContainer);
	},
	
	selectTab: function(index){
		if (index < this.tabs.length){
			// hide current tab
			this.tabs[this.selectedTabIndex].pane.setStyle('display', 'none');
			this.tabs[this.selectedTabIndex].control.removeClass('selected');
			
			// show selected tab
			this.tabs[index].pane.setStyle('display', 'block');
			this.tabs[index].control.addClass('selected');
			
			// store selected index
			this.selectedTabIndex = index;
		}
	},
	
	addTab: function(name){
		// create new control element
		var ctrl = new Element('li', {
			text: name
		});
		this.controlContainer.grab(ctrl);
		
		// get new tab position
		var tabIndex = this.tabs.length;
		
		// select event - display tab
		ctrl.addEvent('click', function(){
			this.selectTab(tabIndex);
		}.bind(this));
		
		// create new tab element
		var tab = new Element('div', {
			'styles': {
				'display': 'none'
			}
		});
		this.paneContainer.grab(tab);
		
		// store new tab
		this.tabs.push({
			control: ctrl,
			pane: tab
		});
		
		// return created tab element
		return tab;
	},
		
	getContainer: function(){
		return this.container;
	}

	
});
/*
---
description: XML language.

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.xml]
...
*/
EnlighterJS.Language.xml = new Class({

	Extends : EnlighterJS.Language.generic,
	tokenizerType : 'Xml',

	setupLanguage: function(){
		// Common HTML patterns
		this.patterns = {
			'comments' : {
				pattern : /(?:\&lt;|<)!--[\s\S]*?--(?:\&gt;|>)/gim,
				alias : 'co2'
			},
			'cdata' : {
				pattern : /(?:\&lt;|<)!\[CDATA\[[\s\S]*?\]\](?:\&gt;|>)/gim,
				alias : 'st1'
			},
			'closingTags' : {
				pattern : /(?:\&lt;|<)\/[A-Z][A-Z0-9]*?(?:\&gt;|>)/gi,
				alias : 'kw1'
			},
			'doctype' : {
				pattern : /(?:\&lt;|<)!DOCTYPE[\s\S]+?(?:\&gt;|>)/gim,
				alias : 'st2'
			},
			'version' : {
				pattern : /(?:\&lt;|<)\?xml[\s\S]+?\?(?:\&gt;|>)/gim,
				alias : 'kw2'
			}
		};
	}

});
/*
---
description: JavaScript language fuel.

license: MIT-style

authors:
  - Jose Prado

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.javascript]
...
*/
EnlighterJS.Language.javascript = new Class({
    
    Extends: EnlighterJS.Language.generic,
    
    setupLanguage: function()
    {
        this.keywords = {
            commonKeywords: {
                csv: "as, break, case, catch, continue, delete, do, else, eval, finally, for, if, in, is, item, instanceof, return, switch, this, throw, try, typeof, void, while, write, with",
                alias: 'kw1'
            },
            langKeywords: {
                csv: "class, const, default, debugger, export, extends, false, function, import, namespace, new, null, package, private, protected, public, super, true, use, var",
                alias: 'kw2'
            },
            windowKeywords: {
                csv: "alert, back, blur, close, confirm, focus, forward, home, navigate, onblur, onerror, onfocus, onload, onmove, onresize, onunload, open, print, prompt, scroll, status, stop",
                alias: 'kw3'
            }
        };
        
        this.patterns = {
            'slashComments': {
                pattern: this.common.slashComments,
                alias:   'co1'
            },
            'multiComments': {
                pattern: this.common.multiComments,
                alias:   'co2'
            },
            'strings': {
                pattern: this.common.strings,
                alias:   'st0'
            },
            'methodCalls': {
                pattern: this.common.properties,
                alias:   'me0'
            },
            'brackets': {
                pattern: this.common.brackets,
                alias:   'br0'
            },
            'numbers': {
                pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][-+]?[0-9]+)?|0x[A-F0-9]+)\b/gi,
                alias:   'nu0'
            },
            'regex': {
                pattern: this.delimToRegExp("/", "\\", "/", "g", "[gimy]*"),
                alias:   're0'
            },
            'symbols': {
                pattern: /\+|-|\*|\/|%|!|@|&|\||\^|\<|\>|=|,|\.|;|\?|:/g,
                alias:   'sy0'
            }
        };
        
        this.delimiters = {
            start: this.strictRegExp('<script type="text/javascript">', '<script language="javascript">'),
            end:   this.strictRegExp('</script>')
        };
        
    }
});
