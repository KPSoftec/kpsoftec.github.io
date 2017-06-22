(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, script){
	var isPoorBrowser = $('html').hasClass('poor-browser');
	if(!Modernizr.cssanimations || isPoorBrowser){
		$('.scroll-in-animation').removeClass('scroll-in-animation');
		$('.scroll-animation').removeClass('scroll-animation');
		return;
	}
	$('.safari i.scroll-in-animation').removeClass('scroll-in-animation');
	$('.safari i.scroll-animation').removeClass('scroll-animation');
	$context.find('.scroll-in-animation, .scroll-animation').each(function(){
		var $this = $(this);
		var delay = $this.data('delay');
		var animation = $this.data('animation')+' animated css-animation-show';
		var pause = function(){
			if(delay){
				setTimeout(function(){$this.removeClass(animation);}, delay);
			}else{
				$this.removeClass(animation);
			}
		}
		var resume = function(){
			if(delay){
				setTimeout(function(){$this.addClass(animation);}, delay);
			}else{
				$this.addClass(animation);
			}
		}
		var start = resume;
		script.players.addPlayer($this, start, pause, resume);
	});
};
},{}],2:[function(require,module,exports){
"use strict"; var $ = jQuery;
var players=[];
players.addPlayer = function($view, startFunc, pauseFunc, resumeFunc){
	players.push(
		new (function(){
			var played = false;
			var started = false;
			this.$view = $view;
			$view.addClass('player').data('player-ind', players.length);
			this.play = function(){
				if(!played){
					played = true;
					if(!started){
						started = true;
						startFunc();
					}else{
						resumeFunc();
					}
				}
			};
			this.pause = function(){
				if(played){
					played = false;
					pauseFunc();
				}
			};
		})()
	);
};
module.exports = players;
},{}],3:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(script){
	var me = this;
	var tools = require('../tools/tools.js');
	var ScrollAnimation = require('../app/scroll-animation.js');
	var $window = $(window);
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var scrollAnimation = new ScrollAnimation(me, script);
	this.windowTopPos = undefined;
	this.windowBottomPos = undefined;
	this.windowH = undefined;
	this.scroll = function(windowTopP){
		me.windowH = $window.height();
		me.windowTopPos = windowTopP
		me.windowBottomPos = windowTopP+me.windowH;
		if(me.windowTopPos < script.topNav.state1Top()){
			script.topNav.state1();
		}else{
			script.topNav.state2();
		}
		scrollAnimation.scroll()
		for(var i=0; i<script.players.length; i++){
			var viewPos = me.calcPosition(script.players[i].$view);
			if(viewPos.visible){
				script.players[i].play();
			}else{
				script.players[i].pause();
			}
		}
	}
	this.calcPosition = function ($block){
		var blockH = $block.height();
		var blockTopPos = $block.data('position');
		var blockBottomPos = blockTopPos + blockH;
		return {
			top: blockTopPos,
			bottom: blockBottomPos,
			height: blockH,
			visible: blockTopPos<me.windowBottomPos && blockBottomPos>me.windowTopPos
		};
	}
};
},{"../app/scroll-animation.js":7,"../tools/tools.js":11}],4:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var appShare = require('../app/app-share.js');
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var fadeTime = 4000;
	var moveTime = 12000;
	var st0 = {scale: 1};
	var st1 = {scale: 1.1};
	var rules = [
		[st0, st1],
		[st1, st0]
	];
	var origins = [
		{or: 'left top', xr: 0, yr: 0},
		{or: 'left center', xr: 0, yr: 1},
		{or: 'right top', xr: 2, yr: 0},
		{or: 'right center', xr: 2, yr: 1}
	]
	var lastRule = rules.length -1;
	var lastOrigin = origins.length -1;
	var fadeEase = TWEEN.Easing.Quartic.InOut;//Power4.easeInOut;
	var moveEase = TWEEN.Easing.Linear.None;//Linear.easeNone;
	this.run = function($slides) {
		if(isPoorBrowser) return;
		var lastI = $slides.length - 1;
		show(lastI, true);
		function show(i, isFirstRun) {
			var slide = $slides.get(i);
			var $slide = $(slide);
			var cfg = $slide.data();
			var ri = Math.round(Math.random() * lastRule);
			var ori = Math.round(Math.random() * lastOrigin);
			var rule = rules[ri];
			cfg.ssScale = rule[0]['scale'];
			cfg.ssOrig = origins[ori];
			cfg.ssOpacity = (i === lastI && !isFirstRun) ? 0 : 1;
			if (i === lastI && !isFirstRun) {
				new TWEEN.Tween(cfg)
					.to({ssOpacity: 1}, fadeTime)
					.easing(fadeEase)
					.onComplete(function(){
						$slides.each(function(){
							$(this).data().ssOpacity = 1;
						});
					})
					.start();
			}
			new TWEEN.Tween(cfg)
				.to({ssScale: rule[1]['scale']}, moveTime)
				.easing(moveEase)
				.start();
			if (i > 0) {
				new TWEEN.Tween({ssOpacity: 1})
					.to({ssOpacity: 0}, fadeTime)
					.onUpdate(function(){
						cfg.ssOpacity = this.ssOpacity;
					})
					.easing(fadeEase)
					.delay(moveTime - fadeTime)
					.onStart(function(){
						show(i - 1);
					})
					.start();
			}else{
				new TWEEN.Tween(cfg)
					.to({}, 0)
					.easing(fadeEase)
					.delay(moveTime - fadeTime)
					.onStart(function(){
						show(lastI);
					})
					.start();
			}
		}
	};
};
},{"../app/app-share.js":5}],5:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var me = this;
	var isOldWin =
			(navigator.appVersion.indexOf("Windows NT 6.1")!=-1) || //Win7
			(navigator.appVersion.indexOf("Windows NT 6.0")!=-1) || //Vista
			(navigator.appVersion.indexOf("Windows NT 5.1")!=-1) || //XP
			(navigator.appVersion.indexOf("Windows NT 5.0")!=-1);   //Win2000
	var isIE9 = $('html').hasClass('ie9');
	var isIE10 = $('html').hasClass('ie10');
	var isIE11 = $('html').hasClass('ie11');
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var isMobile = $('html').hasClass('mobile');
	var factor = (function(){
		if(isIE9 || isIE10 || (isIE11 && isOldWin)){
			return 0;
		}else if(isIE11){
			return -0.15;
		}else if(isPoorBrowser){
			return 0;
		}else{
			return -0.25;
		}
	})();
	this.force3D = isMobile ? false : true;
	this.parallaxMargin = function(script, secInd, viewOffsetFromWindowTop){
		var viewOffsetFromNavPoint = (viewOffsetFromWindowTop - (secInd === 0 ? 0 : script.topNav.state2H));
		return Math.round(factor * viewOffsetFromNavPoint);
	};
})();
},{}],6:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var appShare = require('./app-share.js');
	var themes = require('./themes.js');
	var SlideShow = require('../animation/slide-show.js');
	var slideShow = new SlideShow();
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var isMobile = $('html').hasClass('mobile');
	var skewH = 60;
	var $bord = $('#top-nav, .page-border, #dot-scroll');
	var $topNav = $('#top-nav');
	var state1Colors = $topNav.data('state1-colors');
	var state2Colors = $topNav.data('state2-colors');
	var $body = $('body');
	var $views = $('.view');
	var $bacgrounds;
	this.prepare = function(callback){
		if(window.location.protocol === 'file:' && !$('body').hasClass('example-page')){
			$('<div class="file-protocol-alert alert colors-d background-80 heading fade in">	<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> Upload files to web server and open template from web server. If template is opened from local file system, some links, functions and examples may work incorrectly.</div>')
					.appendTo('body');
		}
		if(appShare.force3D === true){
			$('html').addClass('force3d');
		}
		if(isPoorBrowser){
			var $bodyBg = $('body>.bg');
			$bodyBg.each(function(i){
				if(i === ($bodyBg.length - 1)){
					$(this).css('display', 'block');
				}else{
					$(this).remove();
				}
			});
			$('.view').each(function(){
				var $viewBg = $(this).children('.bg');
				$viewBg.each(function(i){
					if(i === ($viewBg.length - 1)){
						$(this).css('display', 'block');
					}else{
						$(this).remove();
					}
				});
			});
		}
		if(isMobile){
			var $bodyImg = $('body>img.bg');
			var $defImgSet = $bodyImg.length>0 ? $bodyImg : $('.view>img.bg');
			if($defImgSet.length > 0){
				var $defImg = $($defImgSet[0]);
				$('.view').each(function(){
					var $sec = $(this);
					var $bg = $sec.children('img.bg');
					if($bg.length<1){
						$defImg.clone().prependTo($sec);
					}
				});
			}
			$('body>img.bg').remove();
		}
		$bacgrounds = $('.bg');
		callback();
	};
	this.setup = function(callback){
		var goodColor = function($el){
			var bg = $el.css('background-color');
			return (
					bg.match(/#/i) ||
					bg.match(/rgb\(/i) ||
					bg.match(/rgba.*,0\)/i)
			);
		};
		$('.view.section-header').each(function(){
			var $this = $(this);
			var $next = $this.nextAll('.view').first().children('.content');
			if($next.length>0 && goodColor($next)){
				$this.children('.content').addClass('skew-bottom-right');
			}
		});
		$('.view.section-footer').each(function(){
			var $this = $(this);
			var $prev = $this.prevAll('.view').first().children('.content');
			if($prev.length>0 && goodColor($prev)){
				$this.children('.content').addClass('skew-top-right');
			}
		});
		$views.find('.content').filter('.skew-top-right, .skew-top-left, .skew-bottom-left, .skew-bottom-right').each(function(){
			var $content = $(this);
			var $view = $content.parent();
			if($content.hasClass('skew-top-right') || $content.hasClass('skew-top-left')){
				var $prev = $view.prevAll('.view').first().children('.content');
				if($prev.length>0 && goodColor($prev)){
					var type = $content.hasClass('skew-top-right') ? 1 : 2;
					$('<div class="skew skew-top-'+(type === 1 ? 'right' : 'left')+'"></div>').appendTo($content).css({
						position: "absolute",
						top: "0px",
						width: "0px",
						height: "0px",
						"border-top-width": type === 2 ? (skewH+"px") : "0px",
						"border-right-width": "2880px",
						"border-bottom-width": type === 1 ? (skewH+"px") : "0px",
						"border-left-width": "0px",
						"border-style": "solid solid solid dashed",
						"border-bottom-color": "transparent",
						"border-left-color":  "transparent"
					}).addClass(getColorClass($prev));
				}
			}
			if($content.hasClass('skew-bottom-left') || $content.hasClass('skew-bottom-right')){
				var $next = $view.nextAll('.view').first().children('.content');
				if($next.length>0 && goodColor($next)){
					var type = $content.hasClass('skew-bottom-left') ? 1 : 2;
					$('<div class="skew skew-bottom-'+(type === 1 ? 'left' : 'right')+'"></div>').appendTo($content).css({
						position: "absolute",
						bottom: "0px",
						width: "0px",
						height: "0px",
						"border-top-width": type === 1 ? (skewH+"px") : "0px",
						"border-right-width": "0px",
						"border-bottom-width": type === 2 ? (skewH+"px") : "0px",
						"border-left-width": "2880px",
						"border-style": "solid dashed solid solid",
						"border-top-color": "transparent",
						"border-right-color": "transparent"
					}).addClass(getColorClass($next));
				}
			}
		});
		callback();
		function getColorClass($el){
			for(var i=0; i<themes.colors; i++){
				var colorClass = 'colors-'+String.fromCharCode(65+i).toLowerCase();
				if($el.hasClass(colorClass)){
					return colorClass;
				}
			}
		}
	};
	this.ungated = function(){
		$('body, .view').each(function(){
			var $bg = $(this).children('.bg');
			if($bg.length > 1) slideShow.run($bg);
		});
	}
	this.tick = function(){
		$bacgrounds.each(function(){
			var $this = $(this);
			var cfg = $this.data();
			var opa, xr, yr, or;
			if(cfg.ssOpacity !== undefined){
				opa = cfg.ssOpacity;
				xr = cfg.ssOrig.xr;
				yr = cfg.ssOrig.yr;
				or = cfg.ssOrig.or;
			}else{
				opa = 1;
				xr = 1;
				yr = 1;
				or = 'center center';
			}
			var x = cfg.normalX + (cfg.zoomXDelta * xr);
			var y = cfg.normalY + (cfg.zoomYDelta * yr) + (cfg.parallaxY !== undefined ? cfg.parallaxY : 0);
			var sc = cfg.normalScale * (cfg.ssScale !== undefined ? cfg.ssScale : 1);
			if(Modernizr.csstransforms3d && appShare.force3D){
				$this.css({transform: 'translate3d('+x+'px, '+y+'px, 0px) scale('+sc+', '+sc+')', opacity: opa, 'transform-origin': or+' 0px'});
			}else{
				$this.css({transform: 'translate('+x+'px, '+y+'px) scale('+sc+', '+sc+')', opacity: opa, 'transform-origin': or});
			}
		});
	}
	this.buildSizes = function(script){
		var $window = $(window);
		var wh = $window.height();
		var ww = $window.width();
		var $tnav = $('#top-nav:visible');
		var sh = wh - ($tnav.length > 0 ? script.topNav.state2H : 0);
		var $bbord = $('.page-border.bottom:visible');
		var borderH = $bbord.length > 0 ? $bbord.height() : 0;
		$('.full-size, .half-size, .one-third-size').each(function() {
			var $this = $(this);
			var minPaddingTop = parseInt($this.css({
				'padding-top': '',
			}).css('padding-top').replace('px', ''));
			var minPaddingBottom = parseInt($this.css({
				'padding-bottom': '',
			}).css('padding-bottom').replace('px', ''));
			var minFullH = sh - ($bbord.length > 0 ? borderH : 0);
			var minHalfH = Math.ceil(minFullH / 2);
			var min13H = Math.ceil(minFullH / 3);
			var min = $this.hasClass('full-size') ? minFullH : ($this.hasClass('half-size') ? minHalfH : min13H);
			$this.css({
				'padding-top': minPaddingTop + 'px',
				'padding-bottom': minPaddingBottom + 'px'
			});
			if($this.hasClass('stretch-height') || $this.hasClass('stretch-full-height')){
				$this.css({height: ''});
			}
			var thisH = $this.height();
			if (thisH < min) {
				var delta = min - thisH - minPaddingTop - minPaddingBottom;
				if(delta<0){
					delta=0;
				}
				var topPlus = Math.round(delta / 2);
				var bottomPlus = delta - topPlus;
				var newPaddingTop = minPaddingTop + topPlus;
				var newPaddingBottom = minPaddingBottom + bottomPlus;
				$this.css({
					'padding-top': newPaddingTop + 'px',
					'padding-bottom': newPaddingBottom + 'px'
				});
			}
		});
		$('.stretch-height').each(function(){
			var $this = $(this);
			var $par = $this.parent();
			var $strs = $par.find('.stretch-height');
			$strs.css('height', '');
			if($this.outerWidth()<$par.innerWidth()){
				$strs.css('height', $par.innerHeight()+'px');
			}
		});
		$('.stretch-full-height').each(function(){
			var $this = $(this);
			var $par = $this.parent();
			var $strs = $par.find('.stretch-full-height');
			$strs.css('height', '');
			if($this.outerWidth()<$par.innerWidth()){
				var parH = $par.innerHeight();
				var strsH = wh < parH ? parH : wh;
				$strs.css('height', strsH+'px');
			}
		});
		$views.each(function(i){
			var $view = $(this);
			var $content = $view.find('.content');
			var $skewTop = $content.find('.skew.skew-top-right, .skew.skew-top-left');
			var $skewBottom = $content.find('.skew.skew-bottom-left, .skew.skew-bottom-right');
			var contentWPx = $content.width()+"px";
			$skewBottom.css({
				"border-left-width": contentWPx
			});
			$skewTop.css({
				"border-right-width": contentWPx
			});
			var viewH = $view.height();
			var viewW = $view.width();
			var targetH = (function(){
				var viewOffset1 = -1 * viewH;
				var viewOffset2 = 0;
				var viewOffset3 = wh - viewH;
				var viewOffset4 = wh;
				var marg1 = appShare.parallaxMargin(script, i, viewOffset1);
				var marg2 = appShare.parallaxMargin(script, i, viewOffset2);
				var marg3 = appShare.parallaxMargin(script, i, viewOffset3);
				var marg4 = appShare.parallaxMargin(script, i, viewOffset4);
				var topDelta = function(viewOffset, marg){
					return marg + (viewOffset > 0 ? 0 : viewOffset);
				};
				var bottomDelta = function(viewOffset, marg){
					var bottomOffset = viewOffset + viewH;
					return -marg - (bottomOffset < wh ? 0 : bottomOffset - wh);
				};
				var delta = 0;
				var curDelta;
				curDelta = topDelta(viewOffset1, marg1); if(curDelta > delta) delta = curDelta;
				curDelta = topDelta(viewOffset2, marg2); if(curDelta > delta) delta = curDelta;
				curDelta = topDelta(viewOffset3, marg3); if(curDelta > delta) delta = curDelta;
				curDelta = topDelta(viewOffset4, marg4); if(curDelta > delta) delta = curDelta;
				curDelta = bottomDelta(viewOffset1, marg1); if(curDelta > delta) delta = curDelta;
				curDelta = bottomDelta(viewOffset2, marg2); if(curDelta > delta) delta = curDelta;
				curDelta = bottomDelta(viewOffset3, marg3); if(curDelta > delta) delta = curDelta;
				curDelta = bottomDelta(viewOffset4, marg4); if(curDelta > delta) delta = curDelta;
				return viewH + (2 * delta);
			})();
			$view.children('img.bg').each(function(){ 
				bgSize($(this), targetH, viewW, viewH);
			});
			$view.data('position', $view.offset().top);
		});
		$('section').each(function(){
			var $this = $(this);
			$this.data('position', $this.offset().top);
		});
		$('body').children('img.bg').each(function(){ 
			bgSize($(this), wh, ww, wh);
		});
		function bgSize($bg, targetH, viewW, viewH){
			var nat = natSize($bg);
			var scale = (viewW/targetH > nat.w/nat.h) ? viewW / nat.w : targetH / nat.h;
			var newW = nat.w * scale;
			var newH = nat.h * scale;
			var zoomXDelta = (newW - nat.w)/2;
			var zoomYDelta = (newH - nat.h)/2;
			var x = Math.round((viewW - newW)/2);
			var y = Math.round((viewH - newH)/2);
			var cfg = $bg.data();
			cfg.normalScale = scale;
			cfg.normalX = x;
			cfg.normalY = y;
			cfg.zoomXDelta = zoomXDelta;
			cfg.zoomYDelta = zoomYDelta;
		}
	};
	this.changeSection = function(script, sectionHash){
		var $sect = $(sectionHash);
		var cls = $sect.data('border-colors');
		if(cls){
			$bord.removeClass(themes.colorClasses);
			$bord.addClass(cls);
		}else{
			if($body.hasClass('state2') && state2Colors){
				$bord.removeClass(themes.colorClasses);
				$bord.addClass(state2Colors);
			}else if(state1Colors){
				$bord.removeClass(themes.colorClasses);
				$bord.addClass(state1Colors);
			}
		}
	};
	function natSize($bg){
		var elem = $bg.get(0);
		var natW, natH;
		if(elem.tagName.toLowerCase() === 'img'){
			natW = elem.width;
			natH = elem.height;
		}else if(elem.naturalWidth){
			natW = elem.naturalWidth;
			natH = elem.naturalHeight;
		}else{
			var orig = $bg.width();
			$bg.css({width: '', height: ''});
			natW = $bg.width();
			natH = $bg.height();
			$bg.css({width: orig});
		}
		return {w: natW, h: natH};
	}
})();
},{"../animation/slide-show.js":4,"./app-share.js":5,"./themes.js":8}],7:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(scrolling, script){
	var $views = $('.view');
	var appShare = require('./app-share.js');
	var isPoorBrowser = $('html').hasClass('poor-browser');
	this.scroll = function(){
		if(isPoorBrowser) return;
		$views.each(function(i){
			var $view = $(this);
			var viewPos = scrolling.calcPosition($view);
			if(viewPos.visible){
				var viewOffset = viewPos.top - scrolling.windowTopPos;
				$view.children('.bg:not(.static)').each(function(){
					var cfg = $(this).data();
					cfg.parallaxY = appShare.parallaxMargin(script, i, viewOffset);
				});
			}
		});
	};
};
},{"./app-share.js":5}],8:[function(require,module,exports){
"use strict";
module.exports = new (function(){
	var me = this;
	this.options = {
		'angie': {style: 'theme-angie', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'lynda': {style: 'theme-lynda', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'alice': {style: 'theme-alice', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'lucy': {style: 'theme-lucy', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'mary': {style: 'theme-alice', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'suzi': {style: 'theme-suzi', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'viki': {style: 'theme-viki', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'luiza': {style: 'theme-luiza', bgSync: ['**/*.txt', '**/*'], videoSync: []}
	};
	this.names = {
	};
	this.colors = 8;
	this.colorClasses = (function(){
		var res = '';
		for(var i=0; i<me.colors; i++){
			var sep = i === 0 ? '' : ' ';
			res += sep + 'colors-'+String.fromCharCode(65+i).toLowerCase();
		}
		return res;
	})();
})();
},{}],9:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(script){
	var themes = require('../app/themes.js');
	var tools = require('../tools/tools.js');
	var loading = require('../widgets/loading.js');
	var appShare = require('../app/app-share.js');
	var colors = themes.colors;
	var me = this;
	var cPath = '';
	var customCss;
	var $window = $(window);
	var $panel;
	var $opt;
	var $toggle;
	var optW;
	var $customCss;
	var $themesSelect;
	var $colors;
	var isInitialized = false;
	
	this.lessVars = {};
	this.isShowPanel = (function(){
		var customizeP = tools.getUrlParameter('customize');
		if(customizeP === undefined){
			customizeP = $.cookie('customize');
		}else{
			$.cookie('customize', 'yes', {path: cPath});
		}
		return (customizeP && $('#top-nav').length > 0) ? true : false;
	})();
	this.show = function(){
		setTimeout(function(){
			if(!isInitialized){
				isInitialized = true;
				createCss(true);
				initLessVars();
				var $gate = $opt.find('.options-gate');
				$gate.css({opacity: 0});
				setTimeout(function(){
					$gate.css({visibility: 'hidden'});
				}, 1000);
			}
		}, 550);
		$panel.css({left: '0px'});
		$panel.addClass('on');
	};
	this.hide = function(){
		$panel.css({left: -1*optW+'px'});
		$panel.removeClass('on');
	};
	function resize(){
		$opt.css({
			height: ($window.height() - parseInt($panel.css('top').replace('px','')) - 30) + 'px'
		});
	}
	function themeSelectToCustom(){
		if($themesSelect.val() !== 'custom'){
			$('<option value="custom">Custom</option>').appendTo($themesSelect);
			$themesSelect.val('custom');
			$.cookie.json = false;
			$.cookie('themeSelect', 'custom', {path: cPath});
			$.cookie.json = true;
		}
	}
	function initLessVars(){
		for(var i=0; i<colors; i++){
			initGroup(String.fromCharCode(65+i).toLowerCase());
		}
		initLessVar('<span><span class="primary-color"></span></span>', '.primary-color', 'color', 'input.primary-bg', 'primary-bg', toHex);
		initLessVar('<span><span class="out-primary"></span></span>', '.out-primary', 'opacity', 'input.primary-out', 'primary-out', outTranslator, outSetTranslator);
		initLessVar('<span><span class="success-color"></span></span>', '.success-color', 'color', 'input.success-bg', 'success-bg', toHex);
		initLessVar('<span><span class="out-success"></span></span>', '.out-success', 'opacity', 'input.success-out', 'success-out', outTranslator, outSetTranslator);
		initLessVar('<span><span class="info-color"></span></span>', '.info-color', 'color', 'input.info-bg', 'info-bg', toHex);
		initLessVar('<span><span class="out-info"></span></span>', '.out-info', 'opacity', 'input.info-out', 'info-out', outTranslator, outSetTranslator);
		initLessVar('<span><span class="warning-color"></span></span>', '.warning-color', 'color', 'input.warning-bg', 'warning-bg', toHex);
		initLessVar('<span><span class="out-warning"></span></span>', '.out-warning', 'opacity', 'input.warning-out', 'warning-out', outTranslator, outSetTranslator);
		initLessVar('<span><span class="danger-color"></span></span>', '.danger-color', 'color', 'input.danger-bg', 'danger-bg', toHex);
		initLessVar('<span><span class="out-danger"></span></span>', '.out-danger', 'opacity', 'input.danger-out', 'danger-out', outTranslator, outSetTranslator);
	}
	function initGroup(grp){
		initLessVar('<span class="colors-'+grp+'"><span class="bg-color"></span></span>', '.bg-color', 'color', 'input.'+grp+'-bg', grp+'-bg', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="text"></span></span>', '.text', 'color', 'input.'+grp+'-text', grp+'-text', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="highlight"></span></span>', '.highlight', 'color', 'input.'+grp+'-highlight', grp+'-highlight', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="link"></span></span>', '.link', 'color', 'input.'+grp+'-link', grp+'-link', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="heading"></span></span>', '.heading', 'color', 'input.'+grp+'-heading', grp+'-heading', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="out"></span></span>', '.out', 'opacity', 'input.'+grp+'-out', grp+'-out', outTranslator, outSetTranslator);
	}
	function outTranslator(v){return Math.round((1-v)*100);}
	function outSetTranslator(v){return Math.round(v);}
	function initLessVar(getterHtml, getterQ, cssProperty, inputQ, lessVar, translator, setTranslator){
		//var changeDelay = 300;
		var $g = $('<span class="getter"></span>').appendTo('body');
		$(getterHtml).appendTo($g);
		var getted = $g.find(getterQ).css(cssProperty);
		$g.remove();
		if(getted){
			if(translator) getted = translator(getted);
		}
		me.lessVars[lessVar] = getted;
		var $inp = $opt.find(inputQ);
		$inp.val(getted);
		if(cssProperty === 'color'){
			$inp.minicolors({
				control: $(this).attr('data-control') || 'hue',
				defaultValue: $(this).attr('data-defaultValue') || '',
				inline: $(this).attr('data-inline') === 'true',
				letterCase: $(this).attr('data-letterCase') || 'lowercase',
				opacity: false,
				position: $(this).attr('data-position') || 'top left',
				//changeDelay: changeDelay,
				change: function(hex, opacity) {
					themeSelectToCustom();
					me.lessVars[lessVar] = hex;
					createCss();
				},
				show: function(){
					var $mc = $inp.parent();
					var $mcPanel = $mc.children('.minicolors-panel');
					var mcPanelH = $mcPanel.outerHeight(true);
					var mcPanelW = $mcPanel.outerWidth(true);
					var $window = $(window);
					var wW = $window.width();
					var wH = $window.height();
					var offset = $mcPanel.offset();
					var left = offset.left - $(document).scrollLeft();
					var top = offset.top - $(document).scrollTop();
					if( (left+mcPanelW) > wW ){
						left = wW - mcPanelW - 5;
					}
					if( (top+mcPanelH) > wH ){
						top = wH - mcPanelH - 2;
					}
					if( top < 0 ){
						top = 2;
					}
					$mcPanel.css({
						position: 'fixed',
						left: left+'px',
						top: top+'px'
					});
				},
				hide: function(){
					$inp.parent().children('.minicolors-panel').css({
						position: '',
						left: '',
						top: ''
					});
				},
				theme: 'bootstrap'
			});
		}else{
			var timer;
			$inp.change(function(){
				var $el = $(this);
				var val = $el.val();
				if (timer){
					clearTimeout(timer);
				}
				//timer = setTimeout(function(){
					themeSelectToCustom();
					me.lessVars[lessVar] = val;
					createCss();
				//}, changeDelay);
			});
		}
		function colorFormat(val){
			if(!val.match(/^#[0-9a-fA-f][0-9a-fA-f][0-9a-fA-f][0-9a-fA-f][0-9a-fA-f][0-9a-fA-f]$/i)){
				if(val.match(/^#[0-9a-fA-f][0-9a-fA-f][0-9a-fA-f]$/i)){
					return "#"+val.charAt(1)+val.charAt(1)+val.charAt(2)+val.charAt(2)+val.charAt(3)+val.charAt(3);
				}else{
					return null;
				}
			}else{
				return val;
			}
		}
	}
	function buildPanel(){
		if(!me.isShowPanel){
			$panel.hide();
			return;
		}else{
			if(Object.keys(themes.names).length>0){
				for (var k in themes.names){
					$('<option value="'+k+'">'+themes.names[k]+'</option>').appendTo($themesSelect);
				}
			}else{
				$themesSelect.remove();
				$('<a class="button" href="#">Reset</a>').appendTo($opt.find('.themes')).click(function(e){
					e.preventDefault();
					$.cookie.json = false;
					$.cookie('themeSelect', "", {path: cPath});
					$.cookie.json = true;
					me.hide();
					loading.gate(function(){
						location.reload();
					});
				});
			}
			$.cookie.json = false;
			var themeSelectC = $.cookie('themeSelect');
			$.cookie.json = true;
			if(themeSelectC === 'custom'){
				themeSelectToCustom();
			}else if(themeSelectC){
				$themesSelect.val(themeSelectC);
			}else{
				var $factory = $('#factory-theme');
				if($factory.length > 0 && $factory.css('visibility') === 'hidden'){
					var ts = themes.options[$factory.html()].style;
					$themesSelect.val(ts);
					$.cookie.json = false;
					$.cookie('themeSelect', ts, {path: cPath});
					$.cookie.json = true;
				}
			}
			$themesSelect.change(function(){
				$('.options .themes select option[value=custom]').remove();
				var href = $(this).val();
				$.cookie.json = false;
				$.cookie('themeSelect', href, {path: cPath});
				$.cookie.json = true;
				me.hide();
				loading.gate(function(){
					location.reload();
				});
			});
			$panel.css({left: -1*optW+'px'});
			$toggle.click(function(e){
				e.preventDefault();
				if($panel.hasClass('on')){
					me.hide();
				}else{
					me.show();
				}
			});
			$opt.find('.save-custom-css').click(function(e){
				e.preventDefault();
				var $content = $customCss.find('.content');
				if($.cookie('saveAsLess')){
					var lessStr='@import "theme.less";\r\n\r\n';
					for(var key in me.lessVars){
						lessStr = lessStr+'@'+key+': '+me.lessVars[key]+';\r\n';
						$content.text(lessStr);
					}
				}else{
					if(!customCss) createCss();
					$content.text(
						customCss.replace(/(\r\n|\r|\n)/g,'\r\n')
					);
				}
				new TWEEN.Tween({autoAlpha: 0, x:-450})
					.to({autoAlpha: 1, x: 0}, 400)
					.onUpdate(function(){
						$customCss.css({opacity: this.autoAlpha, visibility: (this.autoAlpha > 0 ? 'visible' : 'hidden')});
						if(Modernizr.csstransforms3d && appShare.force3D){
							$customCss.css({transform: 'translate3d('+this.x+'px, 0px, 0px)'});
						}else{
							$customCss.css({transform: 'translate('+this.x+'px, 0px)'});
						}
					})
					.easing(TWEEN.Easing.Quadratic.Out)
					.start();
			});
			$customCss.find('.close-panel').click(function(e){
				e.preventDefault();
				new TWEEN.Tween({autoAlpha: 1, x: 0})
					.to({autoAlpha: 0, x: -450}, 400)
					.onUpdate(function(){
						$customCss.css({opacity: this.autoAlpha, visibility: (this.autoAlpha > 0 ? 'visible' : 'hidden')});
						if(Modernizr.csstransforms3d && appShare.force3D){
							$customCss.css({transform: 'translate3d('+this.x+'px, 0px, 0px)'});
						}else{
							$customCss.css({transform: 'translate('+this.x+'px, 0px)'});
						}
					})
					.easing(TWEEN.Easing.Linear.None)
					.start();
			});
			tools.selectTextarea($customCss.find("textarea"));
			var colorsBg = $colors.css('background-image');
			if(!colorsBg || colorsBg == 'none'){
				var $bgIm = $('img.bg');
				if($bgIm.length>0){
					$colors.css({
						'background-image': "url('"+$bgIm.get(0).src+"')",
						'background-position': 'center center',
						'background-size': 'cover'
					});
				}
			}
		}
	}
	function createCss(isInitOnly){
		var custom = atob(customLess);
		$.cookie('lessVars', me.lessVars, {path: cPath});
		doLess(custom, function(css){
			if(!isInitOnly){
				var ems = 'edit-mode-styles';
				customCss = css;
				var $cur = $('#'+ems);
				if($cur.length<1){
					$('<style type="text/css" id="'+ems+'">\n'+css+'</style>').appendTo('head');
					$('#custom-css').remove();
				}else{
					if($cur[0].innerHTML){
						$cur[0].innerHTML = customCss;
					}else{
						$cur[0].styleSheet.cssText = customCss;
					}
				}
			}
		});
	}
	function doLess(data, callback){
		less.render(
			data,
			{	currentDirectory: "styles/themes/",
				filename: "styles/themes/theme-default.less",
				entryPath: "styles/themes/",
				rootpath: "styles/themes/styles/themes/",
				rootFilename: "styles/themes/theme-default.less",
				relativeUrls: false,
				useFileCache: me.lessVars || less.globalVars,
				compress: false,
				modifyVars: me.lessVars,
				globalVars: less.globalVars
			},
			function(e, output) {
				callback(output.css);
			}
		);
	}
	function toHex(rgb){
		if(rgb.indexOf('rgb') === -1){
			return rgb;
		}else{
			var triplet = rgb.match(/[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*/i);
			return "#"+digitToHex(triplet[1])+digitToHex(triplet[2])+digitToHex(triplet[3]);
		}
		function digitToHex(dig){
			if(isNaN(dig)){
				return "00";
			}else{
				var hx = parseInt(dig).toString(16);
				return hx.length == 1 ? "0"+hx : hx;
			}
		}
	}
	
	if(me.isShowPanel){
		$('<div id="customize-panel"></div>').appendTo('body').load('customize/customize.html #customize-panel>*', function(xhr, statusText, request){
			if(statusText !== "success" && statusText !== "notmodified"){
				$('#customize-panel').remove();
				script.afterConfigure();
			}else{
				$.getScript( "customize/custom-less.js", function( data, lessStatusText, jqxhr ) {
					if(lessStatusText !== "success" && lessStatusText !== "notmodified"){
						$('#customize-panel').remove();
						script.afterConfigure();
					}else{
						$panel = $('#customize-panel');
						$opt = $panel.find('.options');
						$toggle = $panel.find('.toggle-button');
						optW = $opt.width();
						$customCss = $panel.find('.custom-css');
						$themesSelect = $opt.find('.themes select');
						$colors = $opt.find('.colors');
						$.cookie.json = true;
						buildPanel();
						if(tools.getUrlParameter('save-as-less')){
							$.cookie('saveAsLess', 'yes', {path: cPath});
						}
						$.cookie.json = false;
						var tsc = $.cookie('themeSelect');
						$.cookie.json = true;
						if( tsc === 'custom' ){
							isInitialized = true;
							me.lessVars = $.cookie('lessVars');
							createCss();
							initLessVars();
							$opt.find('.options-gate').css({visibility: 'hidden'});
						}
						$window.resize(resize);
						resize();
						script.afterConfigure();
					}
				});
			}
		});
	}else{
		script.afterConfigure();
	}
};
},{"../app/app-share.js":5,"../app/themes.js":8,"../tools/tools.js":11,"../widgets/loading.js":18}],10:[function(require,module,exports){
"use strict"; var $ = jQuery;
$(function() { new (function(){
	var Customize = require('./customize/customize.js');
	var TopNav = require('./widgets/top-nav.js');
	var MenuToggle = require('./widgets/menu-toggle.js');
	var Players = require('./animation/players.js');
	var Scrolling = require('./animation/scrolling.js');
	var tools = require('./tools/tools.js');
	var ShowList = require('./widgets/show-list.js');
	var Gallery = require('./widgets/gallery.js');
	var fluid = require('./widgets/fluid.js');
	var Counter = require('./widgets/counter.js');
	var ChangeColors = require('./widgets/change-colors.js');
	var Sliders = require('./widgets/sliders.js');
	var loading = require('./widgets/loading.js');
	var CssAnimation = require('./animation/css-animation.js');
	var dotScroll = require('./widgets/dot-scroll.js');
	var Map = require('./widgets/map.js');
	var Skillbar = require('./widgets/skillbar.js');
	var AjaxForm = require('./widgets/ajax-form.js');
	var YoutubeBG = require('./widgets/youtube-bg.js');
	var VimeoBG = require('./widgets/vimeo-bg.js');
	var VideoBG = require('./widgets/video-bg.js');
	var app = require('./app/app.js');
	var OverlayWindow = require('./widgets/overlay-window.js');
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var isAndroid43minus = $('html').hasClass('android-browser-4_3minus');
	var $pageTransition = $('.page-transition');
	var me = this;
	var $window = $(window);
	var $sections = $('section');
	var sectionTriggers = [];
	var lastActiveSectionHash;
	var location = document.location.hash ? document.location.href.replace(new RegExp(document.location.hash+'$'),'') : document.location.href.replace('#','');
	var $navLinks = (function(){
		var $res = jQuery();
		$('#top-nav .navbar-nav a').each(function(){
			var $this = $(this);
			if(
				(!this.hash) ||
				(
					(this.href === location+this.hash) &&
					($('section'+this.hash).length > 0)
				)
			){
				$res = $res.add($this);
			}
		});
		return $res;
	})();
	var isMobile = $('html').hasClass('mobile');
	var scrolling;
	var maxScrollPosition;
	var ticker = new (function(){
		var me = this;
		window.requestAnimFrame = (function(){
			return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function(/* function */ callback, /* DOMElement */ element){
					window.setTimeout(callback, 1000 / 60);
				};
		})();
		var lastPosition = -1;
		this.pageIsReady = false;
		(function animate(time){
			if(me.pageIsReady){
				var windowTopPos = tools.windowYOffset();
				if (lastPosition !== windowTopPos) {
					scrolling.scroll(windowTopPos);
					trigNavigationLinks(windowTopPos);
				}
				lastPosition = windowTopPos;
				TWEEN.update();
				app.tick();
			}
			if(loading.queue.length > 0) {
				(loading.queue.pop())();
			}
			requestAnimFrame(animate);
		})();
	})();
	
	this.topNav = undefined;
	this.players = Players;
	this.afterConfigure = function(){
		var hash = window.location.hash;
		if (history && history.replaceState) {
			history.replaceState("", document.title, window.location.pathname + window.location.search);
		}
		new YoutubeBG();
		new VimeoBG();
		new VideoBG();
		app.prepare(function(){
			loading.load(function (){
				$navLinks = $navLinks.add(dotScroll.links()).click(function(){
					$navLinks.removeClass('target');
					$(this).addClass('target');
				});
				me.topNav = new TopNav();
				new MenuToggle();
				scrolling = new Scrolling(me);
				widgets($('body'));
				new Gallery(onBodyHeightResize, widgets, unwidgets);
				var windowW = $window.width();
				var windowH = $window.height();
				$window.resize(function(){
					var newWindowW = $window.width();
					var newWindowH = $window.height();
					if(newWindowW!==windowW || newWindowH!==windowH){ //IE 8 fix
						windowW = newWindowW;
						windowH = newWindowH;
						fluid.setup($('body'));
						onBodyHeightResize();
					}
				});
				app.setup(function(){
					var finish = function(){
						buildSizes();
						calcNavigationLinkTriggers();
						ticker.pageIsReady = true;
						$navLinks.each(function(){
							if(this.href==location){
								$(this).addClass('active');
							}
						});
						$('.bigtext').each(function(){
							$(this).bigtext();
						});
						app.ungated();
						setTimeout(function(){
							loading.ungate();
							navigate(window.location.href, hash);
						});
					};
					var test = function(){
						var $excl = $('.non-preloading, .non-preloading img');
						var $imgs = $('img').not($excl);
						for(var i=0; i<$imgs.length; i++){
							if( (!$imgs[i].width || !$imgs[i].height) && (!$imgs[i].naturalWidth || !$imgs[i].naturalHeight) ){
								setTimeout(test, 100);
								return;
							}
						}
						finish();
					}
					test();
				});
			});
		});
	}
	function onBodyHeightResize() {
		buildSizes();
		scrolling.scroll(tools.windowYOffset());
		calcNavigationLinkTriggers();
	}
	function widgets($context){
		new ShowList($context, me);
		new Sliders($context);
		if(!isMobile) $context.find('.hover-dir').each( function() { $(this).hoverdir({speed: 300}); } );
		$context.find("a").click(function(e){
			var $this = $(this);
			if($this.data('toggle')) return;
			navigate(this.href, this.hash, e, $this)
		});
		fluid.setup($context);
		new Map($context);
		new Counter($context, me);
		new ChangeColors($context);
		new Skillbar($context, me);
		$context.find("input,select,textarea").not("[type=submit]").jqBootstrapValidation();
		new AjaxForm($context);
		new CssAnimation($context, me);
		$('.widget-tabs a').click(function (e) {
			e.preventDefault()
			$(this).tab('show')
		});
		$('.widget-tooltip').tooltip();
		$('.widget-popover').popover();
		$context.find('video').each(function(){ // IE 9 Fix
			if($(this).attr('muted')!==undefined){
				this.muted=true;
			}
		});
		$context.find('.open-overlay-window').each(function(){
			var $this = $(this);
			var $overlay = $($this.data('overlay-window'));
			var overlayWindow = new OverlayWindow($overlay);
			$this.click(function(e){
				e.preventDefault();
				overlayWindow.show();
			})
		});
		if(isPoorBrowser){
			$context.find('.tlt-loop').remove();
		}else{
			$context.find('.textillate').each(function(){
				var $tlt = $(this);
				$tlt.textillate(eval('('+$tlt.data('textillate-options')+')'));
			});
		}
	}
	function unwidgets($context){
		new Sliders($context, true);
		$context.find('.player').each(function(){
			var ind = $(this).data('player-ind');
			me.players[ind].pause();
			me.players.splice(ind, 1);
		})
	}
	function navigate(href, hash, e, $elem) {
		var hrefBH = hash ? href.replace(new RegExp(hash+'$'), '') : href;
		if(location === hrefBH && hash && hash.indexOf("!") === -1){
			var $content = $(hash);
			if (e) {
				e.preventDefault();
			}
			if($content.length > 0){
				var offset = $content.offset().top - me.topNav.state2H;
				var tn = $content.get(0).tagName.toLowerCase();
				if(tn === 'h1' || tn === 'h2' || tn === 'h3' || tn === 'h4' || tn === 'h5' || tn === 'h6'){
					offset -= 20;
				}
				if (offset < 0) offset = 0;
				tools.scrollTo(offset);
			}else{
				tools.scrollTo(0);
			}
		}else if(e && (href !== location+'#')){
			if(!$elem.attr('target')){
				var pageTransition = function(){
					e.preventDefault();
					me.topNav.state1();
					loading.gate(function(){
						window.location = href;
					});
				}
				if($elem.hasClass('page-transition')){
					pageTransition();
				}else{
					$pageTransition.each(function(){
						var container = $(this).get(0);
						if($.contains(container, $elem[0])){
							pageTransition();
						}
					});
				}
			}
		}
	}
	function calcNavigationLinkTriggers(){
		var wh = $window.height();
		var triggerDelta = wh/3;
		sectionTriggers = [];
		$sections.each(function(i){
			var $s = $(this);
			var id = $s.attr('id');
			if(id){
				sectionTriggers.push({hash: '#'+id, triggerOffset: $s.data('position')-triggerDelta});
			}
		});
		trigNavigationLinks(tools.windowYOffset());
	}
	function trigNavigationLinks(windowTopPos){
		var activeSectionHash;
		for(var i=0; i<sectionTriggers.length; i++){
			if(sectionTriggers[i].triggerOffset<windowTopPos){
				activeSectionHash = sectionTriggers[i].hash;
			}
		}
		if(activeSectionHash!=lastActiveSectionHash){
			var sectionLink = location + activeSectionHash;
			lastActiveSectionHash = activeSectionHash;
			$navLinks.each(function(){
				var $a = $(this);
				if(this.href === sectionLink){
					$a.addClass('active');
					$a.removeClass('target');
				}else{
					$a.removeClass('active');
				}
			});
			app.changeSection(me, activeSectionHash);
		}
	}
	function buildSizes(){
		app.buildSizes(me);
		maxScrollPosition = $('body').height() - $window.height();
		for(var i=0; i<me.players.length; i++){
			var $v = me.players[i].$view;
			$v.data('position', $v.offset().top);
		}
	}
	var animEnd = function(elems, end, modern, callback, time){
		var additionTime = 100;
		var defaultTime = 1000;
		return elems.each(function() {
			var elem = this;
			if (modern && !isAndroid43minus) {
				var done = false;
				$(elem).bind(end, function() {
					done = true;
					$(elem).unbind(end);
					return callback.call(elem);
				});
				if(time >= 0 || time === undefined){
					var wTime = time === undefined ? 1000 : defaultTime + additionTime;
					setTimeout(function(){
						if(!done){
							$(elem).unbind(end);
							callback.call(elem);
						}
					}, wTime)
				}
			}else{
				callback.call(elem);
			}
		});
	}
	$.fn.animationEnd = function(callback, time) {
		return animEnd(this, tools.animationEnd, Modernizr.cssanimations, callback, time);
	};
	$.fn.transitionEnd = function(callback, time) {
		return animEnd(this, tools.transitionEnd, Modernizr.csstransitions, callback, time);
	};
	$.fn.stopTransition = function(){
		return this.css({
			'-webkit-transition': 'none',
			'-moz-transition': 'none',
			'-ms-transition': 'none',
			'-o-transition': 'none',
			'transition':  'none'
		});
	}
	$.fn.cleanTransition = function(){
		return this.css({
			'-webkit-transition': '',
			'-moz-transition': '',
			'-ms-transition': '',
			'-o-transition': '',
			'transition':  ''
		});
	}
	$.fn.nonTransition =  function(css) {
		return this.stopTransition().css(css).cleanTransition();
	};
	$.fn.transform =  function(str, origin) {
		return this.css(tools.transformCss(str, origin));
	};
	$('video').each(function(){ // IE 9 Fix
		if($(this).attr('muted')!==undefined){
			this.muted=true;
		}
	});
	new Customize(me);
})();});
},{"./animation/css-animation.js":1,"./animation/players.js":2,"./animation/scrolling.js":3,"./app/app.js":6,"./customize/customize.js":9,"./tools/tools.js":11,"./widgets/ajax-form.js":12,"./widgets/change-colors.js":13,"./widgets/counter.js":14,"./widgets/dot-scroll.js":15,"./widgets/fluid.js":16,"./widgets/gallery.js":17,"./widgets/loading.js":18,"./widgets/map.js":19,"./widgets/menu-toggle.js":20,"./widgets/overlay-window.js":21,"./widgets/show-list.js":22,"./widgets/skillbar.js":23,"./widgets/sliders.js":24,"./widgets/top-nav.js":25,"./widgets/video-bg.js":26,"./widgets/vimeo-bg.js":27,"./widgets/youtube-bg.js":28}],11:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var me = this;
	var script = require('../script.js');
	var isAndroidBrowser4_3minus = $('html').hasClass('android-browser-4_3minus');
	this.animationEnd = 'animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd';
	this.transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend';
	this.transition = ['-webkit-transition', '-moz-transition', '-ms-transition', '-o-transition', 'transition'];
	this.transform = ["-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform", "transform"];
	this.property = function(keys, value, obj){
		var res = obj ? obj : {};
		for(var i=0; i<keys.length; i++){
			res[keys[i]]=value;
		}
		return res;
	}
	this.windowYOffset = function(){
		return window.pageYOffset != null ? window.pageYOffset : (document.compatMode === "CSS1Compat" ? document.documentElement.scrollTop : document.body.scrollTop);
	}
	this.getUrlParameter = function(sParam){
		var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++) {
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam) {
				return decodeURI(sParameterName[1]);
			}
		}
	}
	this.selectTextarea = function($el){
		$el.focus(function() {
			var $this = $(this);
			$this.select();
			// Work around Chrome's little problem
			$this.mouseup(function() {
				// Prevent further mouseup intervention
				$this.unbind("mouseup");
				return false;
			});
		});
	}
	var timer;
	this.time = function(label){
		if(!timer){
			timer = Date.now();
			console.log('==== Timer started'+(label ? ' | '+label : ''))
		}else{
			var t = Date.now();
			console.log('==== '+(t-timer)+' ms'+(label ? ' | '+label : ''));
			timer = t;
		}
	}
	this.scrollTo = function (y, callback, time) {
		if(time === undefined) time = 1200;
		new TWEEN.Tween({y: me.windowYOffset()})
			.to({y: Math.round(y)}, time)
			.onUpdate(function(){
				//$w.scrollTop(this.y);
				window.scrollTo(0, this.y);
			})
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onComplete(function () {
				if(callback){
					callback();
				}
			})
			.start();
	}
	this.androidStylesFix = function($q){
		if(isAndroidBrowser4_3minus){
			$q.hide();
			$q.get(0).offsetHeight;
			$q.show();
		}
	}
	this.transformCss = function(str, origin){
		var res = {
			'-webkit-transform': str,
			'-moz-transform': str,
			'-ms-transform': str,
			'-o-transform': str,
			'transform':  str
		};
		if(origin){
			res['-webkit-transform-origin'] = origin;
			res['-moz-transform-origin'] = origin;
			res['-ms-transform-origin'] = origin;
			res['-o-transform-origin'] = origin;
			res['transform-origin'] = origin;
		}
		return res;
	}
})();
},{"../script.js":10}],12:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context) {
	var loading = require('./loading.js');
	var $gateLoader = $('.gate .loader');
	$context.find('.ajax-form').each(function() {
		var $frm = $(this);
		$frm.submit(function(e) {
			if($frm.find('.help-block ul').length < 1){
				$gateLoader.addClass('show');
				loading.gate(function() {
					var message = function(msg) {
						$('<div class="ajax-form-alert alert heading fade in text-center">	<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> ' + msg + '</div>')
								.addClass($frm.data('message-class')).appendTo('body');
						loading.ungate();
						$gateLoader.removeClass('show');
					};
					$.ajax({
						type: $frm.attr('method'),
						url: $frm.attr('action'),
						data: $frm.serialize(),
						success: function(data) {
							$frm[0].reset();
							message(data);
						},
						error: function(xhr, str) {
							message('Error: ' + xhr.responseCode);
						}
					});
				});
				e.preventDefault();
			}
		});
	});
};


},{"./loading.js":18}],13:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context){
	var themes = require('../app/themes.js');
	$context.find('.change-colors').each(function(){
		var $group = $(this);
		var $target = $($group.data('target'));
		var $links = $group.find('a');
		var currentColors;
		for(var i=0; i<themes.colors; i++){
			var colors = 'colors-'+String.fromCharCode(65+i).toLowerCase();
			if($target.hasClass(colors)){
				currentColors = colors;
				$links.each(function(){
					var $el = $(this);
					if($el.data('colors') === currentColors){
						$el.addClass('active');
					}
				})
			}
		}
		$links.click(function(e){
			e.preventDefault();
			var $link = $(this);
			$target.removeClass(currentColors);
			currentColors = $link.data('colors');
			$target.addClass(currentColors);
			$links.removeClass('active');
			$link.addClass('active');
		});
	});
};
},{"../app/themes.js":8}],14:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, script){
	var isPoorBrowser = $('html').hasClass('poor-browser');
	if(isPoorBrowser) return;
	$context.find('.counter .count').each(function(){
		var $this = $(this);
		var count = parseInt($this.text());
		var cnt = {n: 0}
		var tw = new TWEEN.Tween(cnt)
			.to({n: count}, 1000)
			.onUpdate(function(){
				$this.text(Math.round(this.n));
			})
			.easing(TWEEN.Easing.Quartic.InOut);
		var pause = function(){
			tw.stop();
		}
		var resume = function(){
			cnt.n = 0;
			tw.start();
		}
		var start = resume;
		script.players.addPlayer($this, start, pause, resume);
	});
};
},{}],15:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var isMobile = $('html').hasClass('mobile');
	var $sec = $('body>section[id]');
	var $lnks;
	if(!isMobile && $sec.length>1){
		var $ul = $('#dot-scroll');
		$sec.each(function(){
			$ul.append('<li><a href="#'+$(this).attr('id')+'"><span></span></a></li>');
		});
		$lnks = $ul.find('a');
	}else{
		$lnks = jQuery();
	}
	this.links = function(){
		return $lnks;
	}
})();
},{}],16:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	this.setup = function($context){
		$context.find('.fluid *').each(function() {
			var $el = $(this);
			var $wrap = $el.parent('.fluid');
			var newWidth = $wrap.width();
			var ar = $el.attr('data-aspect-ratio');
			if(!ar){
				ar = this.height / this.width;
				$el
					// jQuery .data does not work on object/embed elements
					.attr('data-aspect-ratio', ar)
					.removeAttr('height')
					.removeAttr('width');
			}
			var newHeight = Math.round(newWidth * ar);
			$el.width(Math.round(newWidth)).height(newHeight);
			$wrap.height(newHeight);
		});
	};
})();
},{}],17:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(onBodyHeightResize, widgets, unwidgets){
	var tools = require('../tools/tools.js');
	var OverlayWindow = require('./overlay-window.js');
	var $topNav = $('#top-nav');
	$('.gallery').each(function(i){
		var $gallery = $(this);
		var $overlay = $($gallery.data('overlay'));
		var overlayWindow = new OverlayWindow($overlay, widgets, unwidgets);
		var $overlayNext = $overlay.find('.next');
		var $overlayPrevios = $overlay.find('.previos');
		var $overlayClose = $overlay.find('.cross');
		var isFilter = false;
		var defaultGroup = $gallery.data('default-group') ? $gallery.data('default-group') : 'all';
		var isNonFirstLayout = false;
		if(!defaultGroup) defaultGroup = 'all';
		var $grid = $gallery.find('.grid')
			.shuffle({
				group: defaultGroup,
				speed: 500
			})
			.on('filter.shuffle', function() {
				isFilter = true;
			})
			.on('layout.shuffle', function() {
				if(isNonFirstLayout){
					onBodyHeightResize(true);
				}else{
					onBodyHeightResize();
					isNonFirstLayout = true;
				}
			})
			.on('filtered.shuffle', function() {
				if(isFilter){
					isFilter = false;
				}
			});
		var $btns = $gallery.find('.filter a');
		var $itemView = $gallery.find('.item-view');
		var $all = $gallery.find('.filter a[data-group=all]');
		var $items = $grid.find('.item');
		var currentGroup = defaultGroup;
		var $currentItem;
		$gallery.find('.filter a[data-group='+defaultGroup+']').addClass('active');
		$items.addClass('on');
		$overlayClose.click(function(e){
			$currentItem = false;
		});
		$btns.click(function(e){
			e.preventDefault();
			if(isFilter) return;
			var $this = $(this);
			var isActive = $this.hasClass( 'active' );
			var	group = isActive ? 'all' : $this.data('group');
			if(currentGroup !== group){
				currentGroup = group;
				$btns.removeClass('active');
				if(!isActive){
					$this.addClass('active');
				}else{
					$all.addClass('active');
				}
				$grid.shuffle( 'shuffle', group );
				$items.each(function(){
					var $i = $(this);
					var filter = eval($i.data('groups'));
					if( group == 'all' || $.inArray(group, filter)!=-1 ){
						$i.addClass('on');
					}else{
						$i.removeClass('on');
					}
				});
			}
		});
		$items.click(function(e){
			e.preventDefault();
			openItem($(this));
		});
		function openItem($item){
			$currentItem = $item;
			var url = $item.children('a')[0].hash.replace('#!','');
			overlayWindow.show(url +' .item-content');
		}
		$overlayNext.click(function(e){
			if(!$currentItem){
				return;
			}
			e.preventDefault();
			var $i = $currentItem.nextAll('.on').first();
			if($i.length<1){
				$i = $items.filter('.on').first();
			}
			openItem($i);
		});
		$overlayPrevios.click(function(e){
			if(!$currentItem){
				return;
			}
			e.preventDefault();
			var $i = $currentItem.prevAll('.on').first();
			if($i.length<1){
				$i = $items.filter('.on').last();
			}
			openItem($i);
		});
	});
};
},{"../tools/tools.js":11,"./overlay-window.js":21}],18:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var tools = require('../tools/tools.js');
	var $gate = $('.gate');
	var $gateBar = $gate.find('.gate-bar');
	var $gateLoader = $gate.find('.loader');
	var isAndroidBrowser4_3minus = $('html').hasClass('android-browser-4_3minus');
	var me = this;
	this.queue = [];
	this.load = function(callback){
		var urls = [];
		var $excl = $('.non-preloading, .non-preloading img');
		$('*:visible:not(script)').not($excl).each(function(){
			var $el = $(this);
			var name = $el[0].nodeName.toLowerCase();
			var bImg = $el.css("background-image");
			var src = $el.attr('src');
			var func = $el.data('loading');
			if(func){
				urls.push(func);
			}else if(name === 'img' && src && $.inArray(src, urls) === -1){
				urls.push(src);
			}else if (bImg != 'none'){
				var murl = bImg.match(/url\(['"]?([^'")]*)/i);
				if(murl && murl.length>1 && $.inArray(murl[1], urls) === -1){
					urls.push(murl[1]);
				}
			}
		});
		var loaded = 0;
		if(urls.length === 0){
			callback();
		}else{
			$gateLoader.addClass('show');
			var waterPerc = 0;
			var done = function(){
				loaded++;
				waterPerc = loaded/urls.length * 100;
				$gateBar.css({width: waterPerc+'%'});
				//$gateCount.html(Math.ceil(waterPerc));
				if(loaded === urls.length){
					if($gate.length<1){
						callback();
					}else{
						$gateLoader.transitionEnd(function(){
							$gateLoader.removeClass('hided');
							callback();
						}, 200).addClass('hided').removeClass('show');
					}
				}
			}
			for(var i=0; i<urls.length; i++){
				if(typeof(urls[i]) == 'function'){
					urls[i](done);
				}else{
					var img = new Image();
					$(img).one('load', function(){me.queue.push(done)});
					img.src = urls[i];
				}
			}
		}
	}
	this.gate = function(callback){
		//$gateCount.html('0');
		$gateBar.css({width: '0%'});
		$gate.transitionEnd(function(){
			if(callback){
				callback();
			}
		}).css({opacity: 1, visibility: 'visible'});
	}
	this.ungate = function(callback){
		$gate.transitionEnd(function(){
			if(isAndroidBrowser4_3minus){
				tools.androidStylesFix($('body'));
			}
			if(callback){
				callback();
			}
		}).css({opacity: 0, visibility: 'hidden'});
	};
})();
},{"../tools/tools.js":11}],19:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context){
	var tools = require('../tools/tools.js');
	var OverlayWindow = require('./overlay-window.js');
	if(typeof(google) == "undefined") return;
	$context.find('.map-open').each(function(){
		var $mapOpen = $(this);
		var $overlay = $($mapOpen.data('map-overlay'));
		var $mapCanvas = $overlay.find('.map-canvas');
		var mapOptions = {
			center: new google.maps.LatLng($mapCanvas.data('latitude'), $mapCanvas.data('longitude')),
			zoom: $mapCanvas.data('zoom'),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		var markers = [];
		$mapCanvas.find('.map-marker').each(function(){
			var $marker = $(this);
			markers.push({
				latitude: $marker.data('latitude'),
				longitude: $marker.data('longitude'),
				text: $marker.data('text')
			});
		});
		$mapCanvas.addClass('close-map').wrap('<div class="map-view"></div>');
		var $mapView = $mapCanvas.parent();
		var overlayWindow = new OverlayWindow($overlay, false, false, function(){
			new TWEEN.Tween({autoAlpha: 1})
					.to({autoAlpha: 0}, 500)
					.onUpdate(function(){
						$mapView.css({opacity: this.autoAlpha, visibility: (this.autoAlpha > 0 ? 'visible' : 'hidden')});
					})
					.easing(TWEEN.Easing.Linear.None)
					.start();
		});
		var isInited = false;
		$mapOpen.click(function(event) {
			event.preventDefault();
			overlayWindow.show(false, function() {
				if (!isInited) {
					isInited = true;
					var map = new google.maps.Map($mapCanvas[0], mapOptions);
					var addListener = function(marker, text) {
						var infowindow = new google.maps.InfoWindow({
							content: text
						});
						google.maps.event.addListener(marker, "click", function() {
							infowindow.open(map, marker);
						});
					}
					for (var i = 0; i < markers.length; i++) {
						var marker = new google.maps.Marker({
							map: map,
							position: new google.maps.LatLng(markers[i].latitude, markers[i].longitude)
						});
						var text = markers[i].text;
						if (text) {
							addListener(marker, text);
						}
					}
				}
				var $oc = $overlay.find('.overlay-control');
				$mapView.css({height: ($(window).height() - $oc.height()) + 'px'});
				new TWEEN.Tween({autoAlpha: 0})
					.to({autoAlpha: 1}, 500)
					.onUpdate(function(){
						$mapView.css({opacity: this.autoAlpha, visibility: (this.autoAlpha > 0 ? 'visible' : 'hidden')});
					})
					.easing(TWEEN.Easing.Linear.None)
					.start();
			});
		});
	});
}
},{"../tools/tools.js":11,"./overlay-window.js":21}],20:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var $toggle = $('.menu-toggle');
	$toggle.click(function(e){
		e.preventDefault();
		var $tg = $(this);
		if($tg.hasClass('ext-nav-toggle')){
			var targetQ = $tg.data('target');
			var $extNav = $(targetQ);
			var $clickEls = $(targetQ+',#top-nav a:not(.menu-toggle),.page-border a');
			var clickHnd = function() {
				$extNav.removeClass('show');
				$tg.removeClass('show');
				$('body').removeClass('ext-nav-show');
				$('html, body').css({overflow: '', position: ''});
				$clickEls.unbind('click', clickHnd);
			}
			if($tg.hasClass('show')){
				$extNav.removeClass('show');
				$tg.removeClass('show');
				$('body').removeClass('ext-nav-show');
				$clickEls.unbind('click', clickHnd);
			}else{
				$extNav.addClass('show');
				$tg.addClass('show');
				$('body').addClass('ext-nav-show');
				$clickEls.bind('click', clickHnd);
			}
		}else{
			if($tg.hasClass('show')){
				$tg.removeClass('show');
			}else{
				$tg.addClass('show');
			}
		}
	});
};
},{}],21:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($overlay, widgets, unwidgets, hideFunc){
	var $overlayClose = $overlay.find('.cross');
	var $overlayZoom = $($overlay.data('overlay-zoom'));
	var $overlayView = $overlay.find('.overlay-view');
	var $overlayClose = $overlay.find('.cross');
	var me = this;
	this.show = function(load, callback) {
		var open = function() {
			$overlayZoom.addClass('overlay-zoom');
			$overlay.transitionEnd(function(){
				if (load) {
					var $loader = $overlay.find('.loader');
					var $loadedContent = $('<div class="loaded-content"></div>');
					$loader.addClass('show');
					$loadedContent.addClass('content-container').appendTo($overlayView);
					$loadedContent.load(load, function(xhr, statusText, request) {
						if (statusText !== "success" && statusText !== "notmodified") {
							$loadedContent.text(statusText);
							return;
						}
						var $images = $loadedContent.find('img');
						var nimages = $images.length;
						if (nimages > 0) {
							$images.load(function() {
								nimages--;
								if (nimages === 0) {
									show();
								}
							});
						} else {
							show();
						}
						function show() {
							if(widgets){
								widgets($loadedContent);
							}
							$loadedContent.addClass('show');
							$loader.removeClass('show');
							if(callback){
								callback();
							}
						}
					});
				}else{
					if(callback){
						callback();
					}
				}
			}).addClass('show');
		};
		if ($overlay.hasClass('show')) {
			me.hide(open);
		} else {
			open();
		}
	}
	this.hide = function(callback) {
		$overlayZoom.removeClass('overlay-zoom');
		$overlay.removeClass('show');
		setTimeout(function() {
			var $loadedContent = $overlay.find('.loaded-content');
			if($loadedContent.length>0){
				if(unwidgets){
					unwidgets($loadedContent);
				}
				stopIframeBeforeRemove($loadedContent, function() {
					$loadedContent.remove();
					if(hideFunc){
						hideFunc();
					}
					if (callback) {
						callback();
					}
				});
			}else{
				if(hideFunc){
					hideFunc();
				}
				if (callback) {
					callback();
				}
			}
		}, 500);
	}
	function stopIframeBeforeRemove($context, callback) {
		var isDoStop = $('html').hasClass('ie9')
				|| $('html').hasClass('ie10');
		if (isDoStop) {
			$context.find('iframe').attr('src', '');
			setTimeout(function() {
				callback();
			}, 300);
		} else {
			callback();
		}
	}
	$overlayClose.click(function(e){
		e.preventDefault();
		me.hide();
	});
};
},{}],22:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, script){
	$context.find('.show-list').each(function(){
		$(this).wrapInner('<div class="wrapper"></div>').textillate({
			loop:true,
			in:{effect:'fadeInRight', reverse:true},
			out:{effect:'fadeOutLeft', sequence:true},
			selector:'.wrapper'
		});
	});
};
},{}],23:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, script){
	var isPoorBrowser = $('html').hasClass('poor-browser');
	$context.find('.skillbar').each(function(){
		var $this = $(this)
		var $bar = $this.find('.skillbar-bar');
		var perc =  parseInt($this.attr('data-percent').replace('%',''));
		if(isPoorBrowser){
			$bar.css({width: perc+'%'});
		}else{
			var w = {width: 0}
			var tw = new TWEEN.Tween(w)
				.to({width: perc}, 1000)
				.onUpdate(function(){
					$bar.css({width: this.width+'%'});
				})
				.easing(TWEEN.Easing.Quartic.Out);
			var pause = function(){
				tw.stop();
			};
			var resume = function(){
				w.width = 0;
				tw.start();
			};
			var start = resume;
			script.players.addPlayer($this, start, pause, resume);
		}
	});
};
},{}],24:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, isRemoved){
	if(isRemoved){
		$context.find(".carousel, .slider").each(function(){
			$(this).slick('unslick');
		});
		return;
	}
	var tools = require('../tools/tools.js');
	$context.find(".slider").each(function(){
		var $this = $(this)
		$this.slick({
			autoplay: true,
			dots: true
		});
	});
	$context.find(".carousel").each(function(){
		var $this = $(this)
		$this.slick({
			autoplay: false,
			dots: true,
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 3,
			responsive: [
				{
					breakpoint: 1000,
					settings: {
						dots: true,
						slidesToShow: 2,
						slidesToScroll: 2
					}
				},
				{
					breakpoint: 480,
					settings: {
						dots: true,
						slidesToShow: 1,
						slidesToScroll: 1
					}
				}
			]
		});
	});
}
},{"../tools/tools.js":11}],25:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var tools = require('../tools/tools.js');
	var $topNav =  $('#top-nav');
	var $body = $('body');
	var isTopNav = $topNav.length > 0;
	var $topMenuNav =  $topNav.find('.navbar-collapse');
	var upperH = 20;
	var bigTopNav = isTopNav ? 89 : 0;
	var smallTopNav = isTopNav ? 49 : 0;
	var themes = require('../app/themes.js');
	var topNavState1Top = (function(){
		if(isTopNav){
			return upperH;
		}else{
			return 0;
		}
	})();
	var isTopNavState1 = false;
	var isTopNavState2 = false;
	var me = this;
	var state1Colors = $topNav.data('state1-colors');
	var state2Colors = $topNav.data('state2-colors');
	this.state1H = bigTopNav;
	this.state2H = smallTopNav;
	this.state1Top = function(){ return topNavState1Top; };
	this.state1 = function(){
		if(isTopNav && !isTopNavState1){
			$body.removeClass('state2').addClass('state1');
			isTopNavState1 = true;
			isTopNavState2 = false;
			tools.androidStylesFix($topNav);
		}
	};
	this.state2 = function(){
		if(isTopNav && !isTopNavState2){
			$body.removeClass('state1').addClass('state2');
			isTopNavState1 = false;
			isTopNavState2 = true;
			tools.androidStylesFix($topNav);
		}
	};
	this.$menu = function(){
		return $topMenuNav;
	};
	if(isTopNav){
		me.state1();
		$topMenuNav.find('a:not(.dropdown-toggle)').click(function(){
			$topNav.find('.navbar-collapse.in').collapse('hide');
			$topNav.find('.menu-toggle.navbar-toggle').removeClass('show');
		});
		$(window).resize(function(){
			$topNav.find('.navbar-collapse.in').collapse('hide');
			$topNav.find('.menu-toggle.navbar-toggle').removeClass('show');
		});
	}
};
},{"../app/themes.js":8,"../tools/tools.js":11}],26:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var $videoBgs = $(".video-bg");
	if($videoBgs.length <1){
		return;
	}
	var isPlayVideo = (function(){
		var isMobile = $('html').hasClass('mobile');
		var v=document.createElement('video');
		var canMP4 = v.canPlayType ? v.canPlayType('video/mp4') : false;
		return canMP4 && !isMobile;
	})();
	if( !isPlayVideo ){
		$videoBgs.each(function(){
			var $videoBg = $(this);
			var alt = $videoBg.data('alternative');
			if(alt){
				var $img = $('<img alt class="bg" src="'+alt+'"/>');
				$videoBg.after($img).remove();
			}
		});
		return;
	}
	$videoBgs.each(function(){
		var $divBg = $(this);
		$divBg.data('loading', function(done){
			var $videoBg = $('<video class="video-bg"></video>');
			if($divBg.data('mute')==='yes') $videoBg[0].muted = true;
			var vol = $divBg.data('volume');
			if(vol !== undefined) $videoBg[0].volume= vol/100;
			var doDone = function(){
				var vw = $videoBg.width();
				var vh = $videoBg.height();
				var vr = vw/vh;
				var $window = $(window);
				var resize = function(){
					var ww = $window.width();
					var wh = $window.height();
					var wr = ww/wh;
					var w, h;
					if(vr > wr){
						h = Math.ceil(wh);
						w = Math.ceil(h * vr);
					}else{
						w = Math.ceil(ww);
						h = Math.ceil(w / vr);
					}
					$videoBg.css({
						width:  w+'px',
						height: h+'px',
						top: Math.round((wh - h)/2)+'px',
						left: Math.round((ww - w)/2)+'px'
					});
				};
				$window.resize(resize);
				resize();
				$videoBg[0].play();
				done();
			};
			$videoBg.on('ended', function(){
				this.currentTime = 0;
				this.play();
				if(this.ended) {
					this.load();
				}
			});
			var isNotDone = true;
			$videoBg.on('canplaythrough', function(){
				if(isNotDone){
					isNotDone = false;
					doDone();
				}else{
					this.play();
				}
			});
			$videoBg[0].src = $divBg.data('video');
			$videoBg[0].preload="auto";
			$divBg.after($videoBg);
			$divBg.remove();
		});
	});
};
},{}],27:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var $vimeoBgs = $(".vimeo-bg");
	if($vimeoBgs.length <1){
		return;
	}
	if($('html').hasClass('mobile')){
		$vimeoBgs.each(function(){
			var $vimeoBg = $(this);
			var alt = $vimeoBg.data('alternative');
			if(alt){
				var $img = $('<img alt class="bg" src="'+alt+'"/>');
				$vimeoBg.after($img).remove();
			}
		});
		return;
	}
	var dones = [];
	$vimeoBgs.each(function(i){
		var $vimeoBg = $(this);
		var elId = $vimeoBg.attr('id');
		if(!elId) {
			elId = 'vimeo-bg-'+i;
			$vimeoBg.attr('id', elId);
		}
		$vimeoBg.data('loading', function(done){
			dones[elId] = done;
		});
	});
	$.getScript( "https://f.vimeocdn.com/js/froogaloop2.min.js" )
		.done(function( script, textStatus ) {
			$vimeoBgs.each(function(){
				var $vimeoBgDiv = $(this);
				var id = $vimeoBgDiv.attr('id');
				var volume = (function(){
					var r = $vimeoBgDiv.data('volume');
					return r === undefined ? 0 : r;
				})();
				var videoId = $vimeoBgDiv.data('video');
				var $vimeoBg = $('<iframe class="vimeo-bg" src="https://player.vimeo.com/video/'+videoId+'?api=1&badge=0&byline=0&portrait=0&title=0&autopause=0&player_id='+id+'&loop=1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
				$vimeoBgDiv.after($vimeoBg);
				$vimeoBgDiv.remove();
				$vimeoBg.attr('id', id);
				var player = $f($vimeoBg[0]);
				player.addEvent('ready', function() {
					var resize = function(vRatio){
						var windowW = $(window).width();
						var windowH = $(window).height();
						var iFrameW = $vimeoBg.width();
						var iFrameH = $vimeoBg.height();
						var ifRatio = iFrameW/iFrameH;
						var wRatio = windowW/windowH;
						//var vRatio = ratio === undefined ? ifRatio : eval(ratio);
						var setSize = function(vw, vh){
							var ifw, ifh;
							if(ifRatio > vRatio){
								ifh = Math.ceil(vh);
								ifw = Math.ceil(ifh * ifRatio);
							}else{
								ifw = Math.ceil(vw);
								ifh = Math.ceil(ifw / ifRatio);
							}
							$vimeoBg.css({
								width:  ifw+'px',
								height: ifh+'px',
								top: Math.round((windowH - ifh)/2)+'px',
								left: Math.round((windowW - ifw)/2)+'px',
							});
						}
						if(wRatio > vRatio){
							var vw = windowW;
							var vh = vw/vRatio;
							setSize(vw, vh);
						}else{
							var vh = windowH;
							var vw = vh * vRatio;
							setSize(vw, vh);
						}
					};
					player.addEvent('finish', function(){
						player.api('play');
					});
					var isNotDone = true;
					player.addEvent('play', function(){
						if(isNotDone){
							isNotDone = false;
							dones[id]();
						}
					});
					player.api('setVolume', volume);
					player.api('getVideoWidth', function (value, player_id) {
						var w = value
						player.api('getVideoHeight', function (value, player_id) {
							var h = value;
							var vRatio = w / h;
							$(window).resize(function(){resize(vRatio);});
							resize(vRatio);
							player.api('play');
						});
					});
				});
			});
		})
		.fail(function( jqxhr, settings, exception ) {
			console.log( 'Triggered ajaxError handler.' );
		});
};
},{}],28:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var $youtubeBgs = $(".youtube-bg");
	if($youtubeBgs.length <1){
		return;
	}
	if($('html').hasClass('mobile')){
		$youtubeBgs.each(function(){
			var $youtubeBg = $(this);
			var alt = $youtubeBg.data('alternative');
			if(alt){
				var $img = $('<img alt class="bg" src="'+alt+'"/>');
				$youtubeBg.after($img).remove();
			}
		});
		return;
	}
	var dones = [];
	$youtubeBgs.each(function(i){
		var $youtubeBg = $(this);
		var elId = $youtubeBg.attr('id');
		if(!elId) {
			elId = 'youtube-bg-'+i;
			$youtubeBg.attr('id', elId);
		}
		$youtubeBg.data('loading', function(done){
			dones[elId] = done;
		});
	});
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	window.onYouTubeIframeAPIReady = function(){
		$youtubeBgs.each(function(){
			var $youtubeBg = $(this);
			var videoId = $youtubeBg.data('video');
			var vol = $youtubeBg.data('volume');
			var mute = $youtubeBg.data('mute');
			var elId = $youtubeBg.attr('id');
			var isNotDone = true;
			var player = new YT.Player(elId, {
				videoId: videoId,
				playerVars: {html5: 1, controls: 0, 'showinfo': 0, 'modestbranding': 1, 'rel': 0, 'allowfullscreen': true, 'iv_load_policy': 3, wmode: 'transparent' },
				events: {
					onReady: function(event){
						var resize = function(){
							var $iFrame = $(event.target.getIframe());
							var windowW = $(window).width();
							var windowH = $(window).height();
							var iFrameW = $iFrame.width();
							var iFrameH = $iFrame.height();
							var ifRatio = iFrameW/iFrameH;
							var wRatio = windowW/windowH;
							var vRatio = (function(){
								var r = $youtubeBg.data('ratio');
								return r === undefined ? ifRatio : eval(r);
							})(); 
							var setSize = function(vw, vh){
								var ifw, ifh;
								if(ifRatio > vRatio){
									ifh = Math.ceil(vh);
									ifw = Math.ceil(ifh * ifRatio);
								}else{
									ifw = Math.ceil(vw);
									ifh = Math.ceil(ifw / ifRatio);
								}
								$iFrame.css({
									width:  ifw+'px',
									height: ifh+'px',
									top: Math.round((windowH - ifh)/2)+'px',
									left: Math.round((windowW - ifw)/2)+'px',
								});
							}
							if(wRatio > vRatio){
								var vw = windowW;
								var vh = vw/vRatio;
								setSize(vw, vh);
							}else{
								var vh = windowH;
								var vw = vh * vRatio;
								setSize(vw, vh);
							}
						};
						$(window).resize(resize);
						resize();
						event.target.setPlaybackQuality('highres');
						if(vol !== undefined) event.target.setVolume(vol);
						if(mute === 'yes' || mute === undefined) event.target.mute();
						event.target.playVideo();
					},
					onStateChange: function(event){
						if(isNotDone && event.data === YT.PlayerState.PLAYING){
							isNotDone = false;
							(dones[elId])();
						}else if(event.data === YT.PlayerState.ENDED){
							event.target.playVideo();
						}
					}
				}
			});
		});	
	};
};
},{}]},{},[10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJjOlxcMDAwXFxfYml0YnVja2V0XFxza3JvbGxleFxcbm9kZV9tb2R1bGVzXFxncnVudC1icm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL2FuaW1hdGlvbi9jc3MtYW5pbWF0aW9uLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvYW5pbWF0aW9uL3BsYXllcnMuanMiLCJjOi8wMDAvX2JpdGJ1Y2tldC9za3JvbGxleC9zcmMvc2NyaXB0cy9hbmltYXRpb24vc2Nyb2xsaW5nLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvYW5pbWF0aW9uL3NsaWRlLXNob3cuanMiLCJjOi8wMDAvX2JpdGJ1Y2tldC9za3JvbGxleC9zcmMvc2NyaXB0cy9hcHAvYXBwLXNoYXJlLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvYXBwL2FwcC5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL2FwcC9zY3JvbGwtYW5pbWF0aW9uLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvYXBwL3RoZW1lcy5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL2N1c3RvbWl6ZS9jdXN0b21pemUuanMiLCJjOi8wMDAvX2JpdGJ1Y2tldC9za3JvbGxleC9zcmMvc2NyaXB0cy9zY3JpcHQuanMiLCJjOi8wMDAvX2JpdGJ1Y2tldC9za3JvbGxleC9zcmMvc2NyaXB0cy90b29scy90b29scy5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL3dpZGdldHMvYWpheC1mb3JtLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvd2lkZ2V0cy9jaGFuZ2UtY29sb3JzLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvd2lkZ2V0cy9jb3VudGVyLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvd2lkZ2V0cy9kb3Qtc2Nyb2xsLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvd2lkZ2V0cy9mbHVpZC5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL3dpZGdldHMvZ2FsbGVyeS5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL3dpZGdldHMvbG9hZGluZy5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL3dpZGdldHMvbWFwLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvd2lkZ2V0cy9tZW51LXRvZ2dsZS5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL3dpZGdldHMvb3ZlcmxheS13aW5kb3cuanMiLCJjOi8wMDAvX2JpdGJ1Y2tldC9za3JvbGxleC9zcmMvc2NyaXB0cy93aWRnZXRzL3Nob3ctbGlzdC5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL3dpZGdldHMvc2tpbGxiYXIuanMiLCJjOi8wMDAvX2JpdGJ1Y2tldC9za3JvbGxleC9zcmMvc2NyaXB0cy93aWRnZXRzL3NsaWRlcnMuanMiLCJjOi8wMDAvX2JpdGJ1Y2tldC9za3JvbGxleC9zcmMvc2NyaXB0cy93aWRnZXRzL3RvcC1uYXYuanMiLCJjOi8wMDAvX2JpdGJ1Y2tldC9za3JvbGxleC9zcmMvc2NyaXB0cy93aWRnZXRzL3ZpZGVvLWJnLmpzIiwiYzovMDAwL19iaXRidWNrZXQvc2tyb2xsZXgvc3JjL3NjcmlwdHMvd2lkZ2V0cy92aW1lby1iZy5qcyIsImM6LzAwMC9fYml0YnVja2V0L3Nrcm9sbGV4L3NyYy9zY3JpcHRzL3dpZGdldHMveW91dHViZS1iZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDellBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGNvbnRleHQsIHNjcmlwdCl7XHJcblx0dmFyIGlzUG9vckJyb3dzZXIgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ3Bvb3ItYnJvd3NlcicpO1xyXG5cdGlmKCFNb2Rlcm5penIuY3NzYW5pbWF0aW9ucyB8fCBpc1Bvb3JCcm93c2VyKXtcclxuXHRcdCQoJy5zY3JvbGwtaW4tYW5pbWF0aW9uJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1pbi1hbmltYXRpb24nKTtcclxuXHRcdCQoJy5zY3JvbGwtYW5pbWF0aW9uJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1hbmltYXRpb24nKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0JCgnLnNhZmFyaSBpLnNjcm9sbC1pbi1hbmltYXRpb24nKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWluLWFuaW1hdGlvbicpO1xyXG5cdCQoJy5zYWZhcmkgaS5zY3JvbGwtYW5pbWF0aW9uJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1hbmltYXRpb24nKTtcclxuXHQkY29udGV4dC5maW5kKCcuc2Nyb2xsLWluLWFuaW1hdGlvbiwgLnNjcm9sbC1hbmltYXRpb24nKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG5cdFx0dmFyIGRlbGF5ID0gJHRoaXMuZGF0YSgnZGVsYXknKTtcclxuXHRcdHZhciBhbmltYXRpb24gPSAkdGhpcy5kYXRhKCdhbmltYXRpb24nKSsnIGFuaW1hdGVkIGNzcy1hbmltYXRpb24tc2hvdyc7XHJcblx0XHR2YXIgcGF1c2UgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRpZihkZWxheSl7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpeyR0aGlzLnJlbW92ZUNsYXNzKGFuaW1hdGlvbik7fSwgZGVsYXkpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHQkdGhpcy5yZW1vdmVDbGFzcyhhbmltYXRpb24pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgcmVzdW1lID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYoZGVsYXkpe1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXskdGhpcy5hZGRDbGFzcyhhbmltYXRpb24pO30sIGRlbGF5KTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0JHRoaXMuYWRkQ2xhc3MoYW5pbWF0aW9uKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIHN0YXJ0ID0gcmVzdW1lO1xyXG5cdFx0c2NyaXB0LnBsYXllcnMuYWRkUGxheWVyKCR0aGlzLCBzdGFydCwgcGF1c2UsIHJlc3VtZSk7XHJcblx0fSk7XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG52YXIgcGxheWVycz1bXTtcclxucGxheWVycy5hZGRQbGF5ZXIgPSBmdW5jdGlvbigkdmlldywgc3RhcnRGdW5jLCBwYXVzZUZ1bmMsIHJlc3VtZUZ1bmMpe1xyXG5cdHBsYXllcnMucHVzaChcclxuXHRcdG5ldyAoZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyIHBsYXllZCA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgc3RhcnRlZCA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLiR2aWV3ID0gJHZpZXc7XHJcblx0XHRcdCR2aWV3LmFkZENsYXNzKCdwbGF5ZXInKS5kYXRhKCdwbGF5ZXItaW5kJywgcGxheWVycy5sZW5ndGgpO1xyXG5cdFx0XHR0aGlzLnBsYXkgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGlmKCFwbGF5ZWQpe1xyXG5cdFx0XHRcdFx0cGxheWVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdGlmKCFzdGFydGVkKXtcclxuXHRcdFx0XHRcdFx0c3RhcnRlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdHN0YXJ0RnVuYygpO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdHJlc3VtZUZ1bmMoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdHRoaXMucGF1c2UgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGlmKHBsYXllZCl7XHJcblx0XHRcdFx0XHRwbGF5ZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdHBhdXNlRnVuYygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdH0pKClcclxuXHQpO1xyXG59O1xyXG5tb2R1bGUuZXhwb3J0cyA9IHBsYXllcnM7IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzY3JpcHQpe1xuXHR2YXIgbWUgPSB0aGlzO1xuXHR2YXIgdG9vbHMgPSByZXF1aXJlKCcuLi90b29scy90b29scy5qcycpO1xuXHR2YXIgU2Nyb2xsQW5pbWF0aW9uID0gcmVxdWlyZSgnLi4vYXBwL3Njcm9sbC1hbmltYXRpb24uanMnKTtcblx0dmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cdHZhciBpc1Bvb3JCcm93c2VyID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdwb29yLWJyb3dzZXInKTtcblx0dmFyIHNjcm9sbEFuaW1hdGlvbiA9IG5ldyBTY3JvbGxBbmltYXRpb24obWUsIHNjcmlwdCk7XG5cdHRoaXMud2luZG93VG9wUG9zID0gdW5kZWZpbmVkO1xuXHR0aGlzLndpbmRvd0JvdHRvbVBvcyA9IHVuZGVmaW5lZDtcblx0dGhpcy53aW5kb3dIID0gdW5kZWZpbmVkO1xuXHR0aGlzLnNjcm9sbCA9IGZ1bmN0aW9uKHdpbmRvd1RvcFApe1xuXHRcdG1lLndpbmRvd0ggPSAkd2luZG93LmhlaWdodCgpO1xuXHRcdG1lLndpbmRvd1RvcFBvcyA9IHdpbmRvd1RvcFBcblx0XHRtZS53aW5kb3dCb3R0b21Qb3MgPSB3aW5kb3dUb3BQK21lLndpbmRvd0g7XG5cdFx0aWYobWUud2luZG93VG9wUG9zIDwgc2NyaXB0LnRvcE5hdi5zdGF0ZTFUb3AoKSl7XG5cdFx0XHRzY3JpcHQudG9wTmF2LnN0YXRlMSgpO1xuXHRcdH1lbHNle1xuXHRcdFx0c2NyaXB0LnRvcE5hdi5zdGF0ZTIoKTtcblx0XHR9XG5cdFx0c2Nyb2xsQW5pbWF0aW9uLnNjcm9sbCgpXG5cdFx0Zm9yKHZhciBpPTA7IGk8c2NyaXB0LnBsYXllcnMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIHZpZXdQb3MgPSBtZS5jYWxjUG9zaXRpb24oc2NyaXB0LnBsYXllcnNbaV0uJHZpZXcpO1xuXHRcdFx0aWYodmlld1Bvcy52aXNpYmxlKXtcblx0XHRcdFx0c2NyaXB0LnBsYXllcnNbaV0ucGxheSgpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHNjcmlwdC5wbGF5ZXJzW2ldLnBhdXNlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuY2FsY1Bvc2l0aW9uID0gZnVuY3Rpb24gKCRibG9jayl7XG5cdFx0dmFyIGJsb2NrSCA9ICRibG9jay5oZWlnaHQoKTtcblx0XHR2YXIgYmxvY2tUb3BQb3MgPSAkYmxvY2suZGF0YSgncG9zaXRpb24nKTtcblx0XHR2YXIgYmxvY2tCb3R0b21Qb3MgPSBibG9ja1RvcFBvcyArIGJsb2NrSDtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dG9wOiBibG9ja1RvcFBvcyxcblx0XHRcdGJvdHRvbTogYmxvY2tCb3R0b21Qb3MsXG5cdFx0XHRoZWlnaHQ6IGJsb2NrSCxcblx0XHRcdHZpc2libGU6IGJsb2NrVG9wUG9zPG1lLndpbmRvd0JvdHRvbVBvcyAmJiBibG9ja0JvdHRvbVBvcz5tZS53aW5kb3dUb3BQb3Ncblx0XHR9O1xuXHR9XG59OyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBhcHBTaGFyZSA9IHJlcXVpcmUoJy4uL2FwcC9hcHAtc2hhcmUuanMnKTtcclxuXHR2YXIgaXNQb29yQnJvd3NlciA9ICQoJ2h0bWwnKS5oYXNDbGFzcygncG9vci1icm93c2VyJyk7XHJcblx0dmFyIGZhZGVUaW1lID0gNDAwMDtcclxuXHR2YXIgbW92ZVRpbWUgPSAxMjAwMDtcclxuXHR2YXIgc3QwID0ge3NjYWxlOiAxfTtcclxuXHR2YXIgc3QxID0ge3NjYWxlOiAxLjF9O1xyXG5cdHZhciBydWxlcyA9IFtcclxuXHRcdFtzdDAsIHN0MV0sXHJcblx0XHRbc3QxLCBzdDBdXHJcblx0XTtcclxuXHR2YXIgb3JpZ2lucyA9IFtcclxuXHRcdHtvcjogJ2xlZnQgdG9wJywgeHI6IDAsIHlyOiAwfSxcclxuXHRcdHtvcjogJ2xlZnQgY2VudGVyJywgeHI6IDAsIHlyOiAxfSxcclxuXHRcdHtvcjogJ3JpZ2h0IHRvcCcsIHhyOiAyLCB5cjogMH0sXHJcblx0XHR7b3I6ICdyaWdodCBjZW50ZXInLCB4cjogMiwgeXI6IDF9XHJcblx0XVxyXG5cdHZhciBsYXN0UnVsZSA9IHJ1bGVzLmxlbmd0aCAtMTtcclxuXHR2YXIgbGFzdE9yaWdpbiA9IG9yaWdpbnMubGVuZ3RoIC0xO1xyXG5cdHZhciBmYWRlRWFzZSA9IFRXRUVOLkVhc2luZy5RdWFydGljLkluT3V0Oy8vUG93ZXI0LmVhc2VJbk91dDtcclxuXHR2YXIgbW92ZUVhc2UgPSBUV0VFTi5FYXNpbmcuTGluZWFyLk5vbmU7Ly9MaW5lYXIuZWFzZU5vbmU7XHJcblx0dGhpcy5ydW4gPSBmdW5jdGlvbigkc2xpZGVzKSB7XHJcblx0XHRpZihpc1Bvb3JCcm93c2VyKSByZXR1cm47XHJcblx0XHR2YXIgbGFzdEkgPSAkc2xpZGVzLmxlbmd0aCAtIDE7XHJcblx0XHRzaG93KGxhc3RJLCB0cnVlKTtcclxuXHRcdGZ1bmN0aW9uIHNob3coaSwgaXNGaXJzdFJ1bikge1xyXG5cdFx0XHR2YXIgc2xpZGUgPSAkc2xpZGVzLmdldChpKTtcclxuXHRcdFx0dmFyICRzbGlkZSA9ICQoc2xpZGUpO1xyXG5cdFx0XHR2YXIgY2ZnID0gJHNsaWRlLmRhdGEoKTtcclxuXHRcdFx0dmFyIHJpID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogbGFzdFJ1bGUpO1xyXG5cdFx0XHR2YXIgb3JpID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogbGFzdE9yaWdpbik7XHJcblx0XHRcdHZhciBydWxlID0gcnVsZXNbcmldO1xyXG5cdFx0XHRjZmcuc3NTY2FsZSA9IHJ1bGVbMF1bJ3NjYWxlJ107XHJcblx0XHRcdGNmZy5zc09yaWcgPSBvcmlnaW5zW29yaV07XHJcblx0XHRcdGNmZy5zc09wYWNpdHkgPSAoaSA9PT0gbGFzdEkgJiYgIWlzRmlyc3RSdW4pID8gMCA6IDE7XHJcblx0XHRcdGlmIChpID09PSBsYXN0SSAmJiAhaXNGaXJzdFJ1bikge1xyXG5cdFx0XHRcdG5ldyBUV0VFTi5Ud2VlbihjZmcpXHJcblx0XHRcdFx0XHQudG8oe3NzT3BhY2l0eTogMX0sIGZhZGVUaW1lKVxyXG5cdFx0XHRcdFx0LmVhc2luZyhmYWRlRWFzZSlcclxuXHRcdFx0XHRcdC5vbkNvbXBsZXRlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdCRzbGlkZXMuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdCQodGhpcykuZGF0YSgpLnNzT3BhY2l0eSA9IDE7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5zdGFydCgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdG5ldyBUV0VFTi5Ud2VlbihjZmcpXHJcblx0XHRcdFx0LnRvKHtzc1NjYWxlOiBydWxlWzFdWydzY2FsZSddfSwgbW92ZVRpbWUpXHJcblx0XHRcdFx0LmVhc2luZyhtb3ZlRWFzZSlcclxuXHRcdFx0XHQuc3RhcnQoKTtcclxuXHRcdFx0aWYgKGkgPiAwKSB7XHJcblx0XHRcdFx0bmV3IFRXRUVOLlR3ZWVuKHtzc09wYWNpdHk6IDF9KVxyXG5cdFx0XHRcdFx0LnRvKHtzc09wYWNpdHk6IDB9LCBmYWRlVGltZSlcclxuXHRcdFx0XHRcdC5vblVwZGF0ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRjZmcuc3NPcGFjaXR5ID0gdGhpcy5zc09wYWNpdHk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LmVhc2luZyhmYWRlRWFzZSlcclxuXHRcdFx0XHRcdC5kZWxheShtb3ZlVGltZSAtIGZhZGVUaW1lKVxyXG5cdFx0XHRcdFx0Lm9uU3RhcnQoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0c2hvdyhpIC0gMSk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LnN0YXJ0KCk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdG5ldyBUV0VFTi5Ud2VlbihjZmcpXHJcblx0XHRcdFx0XHQudG8oe30sIDApXHJcblx0XHRcdFx0XHQuZWFzaW5nKGZhZGVFYXNlKVxyXG5cdFx0XHRcdFx0LmRlbGF5KG1vdmVUaW1lIC0gZmFkZVRpbWUpXHJcblx0XHRcdFx0XHQub25TdGFydChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRzaG93KGxhc3RJKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQuc3RhcnQoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xubW9kdWxlLmV4cG9ydHMgPSBuZXcgKGZ1bmN0aW9uKCl7XG5cdHZhciBtZSA9IHRoaXM7XG5cdHZhciBpc09sZFdpbiA9XG5cdFx0XHQobmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZihcIldpbmRvd3MgTlQgNi4xXCIpIT0tMSkgfHwgLy9XaW43XG5cdFx0XHQobmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZihcIldpbmRvd3MgTlQgNi4wXCIpIT0tMSkgfHwgLy9WaXN0YVxuXHRcdFx0KG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoXCJXaW5kb3dzIE5UIDUuMVwiKSE9LTEpIHx8IC8vWFBcblx0XHRcdChuYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKFwiV2luZG93cyBOVCA1LjBcIikhPS0xKTsgICAvL1dpbjIwMDBcblx0dmFyIGlzSUU5ID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdpZTknKTtcblx0dmFyIGlzSUUxMCA9ICQoJ2h0bWwnKS5oYXNDbGFzcygnaWUxMCcpO1xuXHR2YXIgaXNJRTExID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdpZTExJyk7XG5cdHZhciBpc1Bvb3JCcm93c2VyID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdwb29yLWJyb3dzZXInKTtcblx0dmFyIGlzTW9iaWxlID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKTtcblx0dmFyIGZhY3RvciA9IChmdW5jdGlvbigpe1xuXHRcdGlmKGlzSUU5IHx8IGlzSUUxMCB8fCAoaXNJRTExICYmIGlzT2xkV2luKSl7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9ZWxzZSBpZihpc0lFMTEpe1xuXHRcdFx0cmV0dXJuIC0wLjE1O1xuXHRcdH1lbHNlIGlmKGlzUG9vckJyb3dzZXIpe1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fWVsc2V7XG5cdFx0XHRyZXR1cm4gLTAuMjU7XG5cdFx0fVxuXHR9KSgpO1xuXHR0aGlzLmZvcmNlM0QgPSBpc01vYmlsZSA/IGZhbHNlIDogdHJ1ZTtcblx0dGhpcy5wYXJhbGxheE1hcmdpbiA9IGZ1bmN0aW9uKHNjcmlwdCwgc2VjSW5kLCB2aWV3T2Zmc2V0RnJvbVdpbmRvd1RvcCl7XG5cdFx0dmFyIHZpZXdPZmZzZXRGcm9tTmF2UG9pbnQgPSAodmlld09mZnNldEZyb21XaW5kb3dUb3AgLSAoc2VjSW5kID09PSAwID8gMCA6IHNjcmlwdC50b3BOYXYuc3RhdGUySCkpO1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKGZhY3RvciAqIHZpZXdPZmZzZXRGcm9tTmF2UG9pbnQpO1xuXHR9O1xufSkoKTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XG5tb2R1bGUuZXhwb3J0cyA9IG5ldyAoZnVuY3Rpb24oKXtcblx0dmFyIGFwcFNoYXJlID0gcmVxdWlyZSgnLi9hcHAtc2hhcmUuanMnKTtcblx0dmFyIHRoZW1lcyA9IHJlcXVpcmUoJy4vdGhlbWVzLmpzJyk7XG5cdHZhciBTbGlkZVNob3cgPSByZXF1aXJlKCcuLi9hbmltYXRpb24vc2xpZGUtc2hvdy5qcycpO1xuXHR2YXIgc2xpZGVTaG93ID0gbmV3IFNsaWRlU2hvdygpO1xuXHR2YXIgaXNQb29yQnJvd3NlciA9ICQoJ2h0bWwnKS5oYXNDbGFzcygncG9vci1icm93c2VyJyk7XG5cdHZhciBpc01vYmlsZSA9ICQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJyk7XG5cdHZhciBza2V3SCA9IDYwO1xuXHR2YXIgJGJvcmQgPSAkKCcjdG9wLW5hdiwgLnBhZ2UtYm9yZGVyLCAjZG90LXNjcm9sbCcpO1xuXHR2YXIgJHRvcE5hdiA9ICQoJyN0b3AtbmF2Jyk7XG5cdHZhciBzdGF0ZTFDb2xvcnMgPSAkdG9wTmF2LmRhdGEoJ3N0YXRlMS1jb2xvcnMnKTtcblx0dmFyIHN0YXRlMkNvbG9ycyA9ICR0b3BOYXYuZGF0YSgnc3RhdGUyLWNvbG9ycycpO1xuXHR2YXIgJGJvZHkgPSAkKCdib2R5Jyk7XG5cdHZhciAkdmlld3MgPSAkKCcudmlldycpO1xuXHR2YXIgJGJhY2dyb3VuZHM7XG5cdHRoaXMucHJlcGFyZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblx0XHRpZih3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09ICdmaWxlOicgJiYgISQoJ2JvZHknKS5oYXNDbGFzcygnZXhhbXBsZS1wYWdlJykpe1xuXHRcdFx0JCgnPGRpdiBjbGFzcz1cImZpbGUtcHJvdG9jb2wtYWxlcnQgYWxlcnQgY29sb3JzLWQgYmFja2dyb3VuZC04MCBoZWFkaW5nIGZhZGUgaW5cIj5cdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPsOXPC9idXR0b24+IFVwbG9hZCBmaWxlcyB0byB3ZWIgc2VydmVyIGFuZCBvcGVuIHRlbXBsYXRlIGZyb20gd2ViIHNlcnZlci4gSWYgdGVtcGxhdGUgaXMgb3BlbmVkIGZyb20gbG9jYWwgZmlsZSBzeXN0ZW0sIHNvbWUgbGlua3MsIGZ1bmN0aW9ucyBhbmQgZXhhbXBsZXMgbWF5IHdvcmsgaW5jb3JyZWN0bHkuPC9kaXY+Jylcblx0XHRcdFx0XHQuYXBwZW5kVG8oJ2JvZHknKTtcblx0XHR9XG5cdFx0aWYoYXBwU2hhcmUuZm9yY2UzRCA9PT0gdHJ1ZSl7XG5cdFx0XHQkKCdodG1sJykuYWRkQ2xhc3MoJ2ZvcmNlM2QnKTtcblx0XHR9XG5cdFx0aWYoaXNQb29yQnJvd3Nlcil7XG5cdFx0XHR2YXIgJGJvZHlCZyA9ICQoJ2JvZHk+LmJnJyk7XG5cdFx0XHQkYm9keUJnLmVhY2goZnVuY3Rpb24oaSl7XG5cdFx0XHRcdGlmKGkgPT09ICgkYm9keUJnLmxlbmd0aCAtIDEpKXtcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdCQoJy52aWV3JykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgJHZpZXdCZyA9ICQodGhpcykuY2hpbGRyZW4oJy5iZycpO1xuXHRcdFx0XHQkdmlld0JnLmVhY2goZnVuY3Rpb24oaSl7XG5cdFx0XHRcdFx0aWYoaSA9PT0gKCR2aWV3QmcubGVuZ3RoIC0gMSkpe1xuXHRcdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZihpc01vYmlsZSl7XG5cdFx0XHR2YXIgJGJvZHlJbWcgPSAkKCdib2R5PmltZy5iZycpO1xuXHRcdFx0dmFyICRkZWZJbWdTZXQgPSAkYm9keUltZy5sZW5ndGg+MCA/ICRib2R5SW1nIDogJCgnLnZpZXc+aW1nLmJnJyk7XG5cdFx0XHRpZigkZGVmSW1nU2V0Lmxlbmd0aCA+IDApe1xuXHRcdFx0XHR2YXIgJGRlZkltZyA9ICQoJGRlZkltZ1NldFswXSk7XG5cdFx0XHRcdCQoJy52aWV3JykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdHZhciAkc2VjID0gJCh0aGlzKTtcblx0XHRcdFx0XHR2YXIgJGJnID0gJHNlYy5jaGlsZHJlbignaW1nLmJnJyk7XG5cdFx0XHRcdFx0aWYoJGJnLmxlbmd0aDwxKXtcblx0XHRcdFx0XHRcdCRkZWZJbWcuY2xvbmUoKS5wcmVwZW5kVG8oJHNlYyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdCQoJ2JvZHk+aW1nLmJnJykucmVtb3ZlKCk7XG5cdFx0fVxuXHRcdCRiYWNncm91bmRzID0gJCgnLmJnJyk7XG5cdFx0Y2FsbGJhY2soKTtcblx0fTtcblx0dGhpcy5zZXR1cCA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblx0XHR2YXIgZ29vZENvbG9yID0gZnVuY3Rpb24oJGVsKXtcblx0XHRcdHZhciBiZyA9ICRlbC5jc3MoJ2JhY2tncm91bmQtY29sb3InKTtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0YmcubWF0Y2goLyMvaSkgfHxcblx0XHRcdFx0XHRiZy5tYXRjaCgvcmdiXFwoL2kpIHx8XG5cdFx0XHRcdFx0YmcubWF0Y2goL3JnYmEuKiwwXFwpL2kpXG5cdFx0XHQpO1xuXHRcdH07XG5cdFx0JCgnLnZpZXcuc2VjdGlvbi1oZWFkZXInKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdFx0dmFyICRuZXh0ID0gJHRoaXMubmV4dEFsbCgnLnZpZXcnKS5maXJzdCgpLmNoaWxkcmVuKCcuY29udGVudCcpO1xuXHRcdFx0aWYoJG5leHQubGVuZ3RoPjAgJiYgZ29vZENvbG9yKCRuZXh0KSl7XG5cdFx0XHRcdCR0aGlzLmNoaWxkcmVuKCcuY29udGVudCcpLmFkZENsYXNzKCdza2V3LWJvdHRvbS1yaWdodCcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdCQoJy52aWV3LnNlY3Rpb24tZm9vdGVyJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblx0XHRcdHZhciAkcHJldiA9ICR0aGlzLnByZXZBbGwoJy52aWV3JykuZmlyc3QoKS5jaGlsZHJlbignLmNvbnRlbnQnKTtcblx0XHRcdGlmKCRwcmV2Lmxlbmd0aD4wICYmIGdvb2RDb2xvcigkcHJldikpe1xuXHRcdFx0XHQkdGhpcy5jaGlsZHJlbignLmNvbnRlbnQnKS5hZGRDbGFzcygnc2tldy10b3AtcmlnaHQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQkdmlld3MuZmluZCgnLmNvbnRlbnQnKS5maWx0ZXIoJy5za2V3LXRvcC1yaWdodCwgLnNrZXctdG9wLWxlZnQsIC5za2V3LWJvdHRvbS1sZWZ0LCAuc2tldy1ib3R0b20tcmlnaHQnKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgJGNvbnRlbnQgPSAkKHRoaXMpO1xuXHRcdFx0dmFyICR2aWV3ID0gJGNvbnRlbnQucGFyZW50KCk7XG5cdFx0XHRpZigkY29udGVudC5oYXNDbGFzcygnc2tldy10b3AtcmlnaHQnKSB8fCAkY29udGVudC5oYXNDbGFzcygnc2tldy10b3AtbGVmdCcpKXtcblx0XHRcdFx0dmFyICRwcmV2ID0gJHZpZXcucHJldkFsbCgnLnZpZXcnKS5maXJzdCgpLmNoaWxkcmVuKCcuY29udGVudCcpO1xuXHRcdFx0XHRpZigkcHJldi5sZW5ndGg+MCAmJiBnb29kQ29sb3IoJHByZXYpKXtcblx0XHRcdFx0XHR2YXIgdHlwZSA9ICRjb250ZW50Lmhhc0NsYXNzKCdza2V3LXRvcC1yaWdodCcpID8gMSA6IDI7XG5cdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cInNrZXcgc2tldy10b3AtJysodHlwZSA9PT0gMSA/ICdyaWdodCcgOiAnbGVmdCcpKydcIj48L2Rpdj4nKS5hcHBlbmRUbygkY29udGVudCkuY3NzKHtcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHRcdFx0XHR0b3A6IFwiMHB4XCIsXG5cdFx0XHRcdFx0XHR3aWR0aDogXCIwcHhcIixcblx0XHRcdFx0XHRcdGhlaWdodDogXCIwcHhcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLXRvcC13aWR0aFwiOiB0eXBlID09PSAyID8gKHNrZXdIK1wicHhcIikgOiBcIjBweFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItcmlnaHQtd2lkdGhcIjogXCIyODgwcHhcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLWJvdHRvbS13aWR0aFwiOiB0eXBlID09PSAxID8gKHNrZXdIK1wicHhcIikgOiBcIjBweFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItbGVmdC13aWR0aFwiOiBcIjBweFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItc3R5bGVcIjogXCJzb2xpZCBzb2xpZCBzb2xpZCBkYXNoZWRcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOiBcInRyYW5zcGFyZW50XCIsXG5cdFx0XHRcdFx0XHRcImJvcmRlci1sZWZ0LWNvbG9yXCI6ICBcInRyYW5zcGFyZW50XCJcblx0XHRcdFx0XHR9KS5hZGRDbGFzcyhnZXRDb2xvckNsYXNzKCRwcmV2KSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmKCRjb250ZW50Lmhhc0NsYXNzKCdza2V3LWJvdHRvbS1sZWZ0JykgfHwgJGNvbnRlbnQuaGFzQ2xhc3MoJ3NrZXctYm90dG9tLXJpZ2h0Jykpe1xuXHRcdFx0XHR2YXIgJG5leHQgPSAkdmlldy5uZXh0QWxsKCcudmlldycpLmZpcnN0KCkuY2hpbGRyZW4oJy5jb250ZW50Jyk7XG5cdFx0XHRcdGlmKCRuZXh0Lmxlbmd0aD4wICYmIGdvb2RDb2xvcigkbmV4dCkpe1xuXHRcdFx0XHRcdHZhciB0eXBlID0gJGNvbnRlbnQuaGFzQ2xhc3MoJ3NrZXctYm90dG9tLWxlZnQnKSA/IDEgOiAyO1xuXHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJza2V3IHNrZXctYm90dG9tLScrKHR5cGUgPT09IDEgPyAnbGVmdCcgOiAncmlnaHQnKSsnXCI+PC9kaXY+JykuYXBwZW5kVG8oJGNvbnRlbnQpLmNzcyh7XG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0XHRcdFx0Ym90dG9tOiBcIjBweFwiLFxuXHRcdFx0XHRcdFx0d2lkdGg6IFwiMHB4XCIsXG5cdFx0XHRcdFx0XHRoZWlnaHQ6IFwiMHB4XCIsXG5cdFx0XHRcdFx0XHRcImJvcmRlci10b3Atd2lkdGhcIjogdHlwZSA9PT0gMSA/IChza2V3SCtcInB4XCIpIDogXCIwcHhcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLXJpZ2h0LXdpZHRoXCI6IFwiMHB4XCIsXG5cdFx0XHRcdFx0XHRcImJvcmRlci1ib3R0b20td2lkdGhcIjogdHlwZSA9PT0gMiA/IChza2V3SCtcInB4XCIpIDogXCIwcHhcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLWxlZnQtd2lkdGhcIjogXCIyODgwcHhcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLXN0eWxlXCI6IFwic29saWQgZGFzaGVkIHNvbGlkIHNvbGlkXCIsXG5cdFx0XHRcdFx0XHRcImJvcmRlci10b3AtY29sb3JcIjogXCJ0cmFuc3BhcmVudFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItcmlnaHQtY29sb3JcIjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHRcdFx0fSkuYWRkQ2xhc3MoZ2V0Q29sb3JDbGFzcygkbmV4dCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y2FsbGJhY2soKTtcblx0XHRmdW5jdGlvbiBnZXRDb2xvckNsYXNzKCRlbCl7XG5cdFx0XHRmb3IodmFyIGk9MDsgaTx0aGVtZXMuY29sb3JzOyBpKyspe1xuXHRcdFx0XHR2YXIgY29sb3JDbGFzcyA9ICdjb2xvcnMtJytTdHJpbmcuZnJvbUNoYXJDb2RlKDY1K2kpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdGlmKCRlbC5oYXNDbGFzcyhjb2xvckNsYXNzKSl7XG5cdFx0XHRcdFx0cmV0dXJuIGNvbG9yQ2xhc3M7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHRoaXMudW5nYXRlZCA9IGZ1bmN0aW9uKCl7XG5cdFx0JCgnYm9keSwgLnZpZXcnKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgJGJnID0gJCh0aGlzKS5jaGlsZHJlbignLmJnJyk7XG5cdFx0XHRpZigkYmcubGVuZ3RoID4gMSkgc2xpZGVTaG93LnJ1bigkYmcpO1xuXHRcdH0pO1xuXHR9XG5cdHRoaXMudGljayA9IGZ1bmN0aW9uKCl7XG5cdFx0JGJhY2dyb3VuZHMuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblx0XHRcdHZhciBjZmcgPSAkdGhpcy5kYXRhKCk7XG5cdFx0XHR2YXIgb3BhLCB4ciwgeXIsIG9yO1xuXHRcdFx0aWYoY2ZnLnNzT3BhY2l0eSAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0b3BhID0gY2ZnLnNzT3BhY2l0eTtcblx0XHRcdFx0eHIgPSBjZmcuc3NPcmlnLnhyO1xuXHRcdFx0XHR5ciA9IGNmZy5zc09yaWcueXI7XG5cdFx0XHRcdG9yID0gY2ZnLnNzT3JpZy5vcjtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRvcGEgPSAxO1xuXHRcdFx0XHR4ciA9IDE7XG5cdFx0XHRcdHlyID0gMTtcblx0XHRcdFx0b3IgPSAnY2VudGVyIGNlbnRlcic7XG5cdFx0XHR9XG5cdFx0XHR2YXIgeCA9IGNmZy5ub3JtYWxYICsgKGNmZy56b29tWERlbHRhICogeHIpO1xuXHRcdFx0dmFyIHkgPSBjZmcubm9ybWFsWSArIChjZmcuem9vbVlEZWx0YSAqIHlyKSArIChjZmcucGFyYWxsYXhZICE9PSB1bmRlZmluZWQgPyBjZmcucGFyYWxsYXhZIDogMCk7XG5cdFx0XHR2YXIgc2MgPSBjZmcubm9ybWFsU2NhbGUgKiAoY2ZnLnNzU2NhbGUgIT09IHVuZGVmaW5lZCA/IGNmZy5zc1NjYWxlIDogMSk7XG5cdFx0XHRpZihNb2Rlcm5penIuY3NzdHJhbnNmb3JtczNkICYmIGFwcFNoYXJlLmZvcmNlM0Qpe1xuXHRcdFx0XHQkdGhpcy5jc3Moe3RyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKCcreCsncHgsICcreSsncHgsIDBweCkgc2NhbGUoJytzYysnLCAnK3NjKycpJywgb3BhY2l0eTogb3BhLCAndHJhbnNmb3JtLW9yaWdpbic6IG9yKycgMHB4J30pO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdCR0aGlzLmNzcyh7dHJhbnNmb3JtOiAndHJhbnNsYXRlKCcreCsncHgsICcreSsncHgpIHNjYWxlKCcrc2MrJywgJytzYysnKScsIG9wYWNpdHk6IG9wYSwgJ3RyYW5zZm9ybS1vcmlnaW4nOiBvcn0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHRoaXMuYnVpbGRTaXplcyA9IGZ1bmN0aW9uKHNjcmlwdCl7XG5cdFx0dmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cdFx0dmFyIHdoID0gJHdpbmRvdy5oZWlnaHQoKTtcblx0XHR2YXIgd3cgPSAkd2luZG93LndpZHRoKCk7XG5cdFx0dmFyICR0bmF2ID0gJCgnI3RvcC1uYXY6dmlzaWJsZScpO1xuXHRcdHZhciBzaCA9IHdoIC0gKCR0bmF2Lmxlbmd0aCA+IDAgPyBzY3JpcHQudG9wTmF2LnN0YXRlMkggOiAwKTtcblx0XHR2YXIgJGJib3JkID0gJCgnLnBhZ2UtYm9yZGVyLmJvdHRvbTp2aXNpYmxlJyk7XG5cdFx0dmFyIGJvcmRlckggPSAkYmJvcmQubGVuZ3RoID4gMCA/ICRiYm9yZC5oZWlnaHQoKSA6IDA7XG5cdFx0JCgnLmZ1bGwtc2l6ZSwgLmhhbGYtc2l6ZSwgLm9uZS10aGlyZC1zaXplJykuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XG5cdFx0XHR2YXIgbWluUGFkZGluZ1RvcCA9IHBhcnNlSW50KCR0aGlzLmNzcyh7XG5cdFx0XHRcdCdwYWRkaW5nLXRvcCc6ICcnLFxuXHRcdFx0fSkuY3NzKCdwYWRkaW5nLXRvcCcpLnJlcGxhY2UoJ3B4JywgJycpKTtcblx0XHRcdHZhciBtaW5QYWRkaW5nQm90dG9tID0gcGFyc2VJbnQoJHRoaXMuY3NzKHtcblx0XHRcdFx0J3BhZGRpbmctYm90dG9tJzogJycsXG5cdFx0XHR9KS5jc3MoJ3BhZGRpbmctYm90dG9tJykucmVwbGFjZSgncHgnLCAnJykpO1xuXHRcdFx0dmFyIG1pbkZ1bGxIID0gc2ggLSAoJGJib3JkLmxlbmd0aCA+IDAgPyBib3JkZXJIIDogMCk7XG5cdFx0XHR2YXIgbWluSGFsZkggPSBNYXRoLmNlaWwobWluRnVsbEggLyAyKTtcblx0XHRcdHZhciBtaW4xM0ggPSBNYXRoLmNlaWwobWluRnVsbEggLyAzKTtcblx0XHRcdHZhciBtaW4gPSAkdGhpcy5oYXNDbGFzcygnZnVsbC1zaXplJykgPyBtaW5GdWxsSCA6ICgkdGhpcy5oYXNDbGFzcygnaGFsZi1zaXplJykgPyBtaW5IYWxmSCA6IG1pbjEzSCk7XG5cdFx0XHQkdGhpcy5jc3Moe1xuXHRcdFx0XHQncGFkZGluZy10b3AnOiBtaW5QYWRkaW5nVG9wICsgJ3B4Jyxcblx0XHRcdFx0J3BhZGRpbmctYm90dG9tJzogbWluUGFkZGluZ0JvdHRvbSArICdweCdcblx0XHRcdH0pO1xuXHRcdFx0aWYoJHRoaXMuaGFzQ2xhc3MoJ3N0cmV0Y2gtaGVpZ2h0JykgfHwgJHRoaXMuaGFzQ2xhc3MoJ3N0cmV0Y2gtZnVsbC1oZWlnaHQnKSl7XG5cdFx0XHRcdCR0aGlzLmNzcyh7aGVpZ2h0OiAnJ30pO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHRoaXNIID0gJHRoaXMuaGVpZ2h0KCk7XG5cdFx0XHRpZiAodGhpc0ggPCBtaW4pIHtcblx0XHRcdFx0dmFyIGRlbHRhID0gbWluIC0gdGhpc0ggLSBtaW5QYWRkaW5nVG9wIC0gbWluUGFkZGluZ0JvdHRvbTtcblx0XHRcdFx0aWYoZGVsdGE8MCl7XG5cdFx0XHRcdFx0ZGVsdGE9MDtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgdG9wUGx1cyA9IE1hdGgucm91bmQoZGVsdGEgLyAyKTtcblx0XHRcdFx0dmFyIGJvdHRvbVBsdXMgPSBkZWx0YSAtIHRvcFBsdXM7XG5cdFx0XHRcdHZhciBuZXdQYWRkaW5nVG9wID0gbWluUGFkZGluZ1RvcCArIHRvcFBsdXM7XG5cdFx0XHRcdHZhciBuZXdQYWRkaW5nQm90dG9tID0gbWluUGFkZGluZ0JvdHRvbSArIGJvdHRvbVBsdXM7XG5cdFx0XHRcdCR0aGlzLmNzcyh7XG5cdFx0XHRcdFx0J3BhZGRpbmctdG9wJzogbmV3UGFkZGluZ1RvcCArICdweCcsXG5cdFx0XHRcdFx0J3BhZGRpbmctYm90dG9tJzogbmV3UGFkZGluZ0JvdHRvbSArICdweCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0JCgnLnN0cmV0Y2gtaGVpZ2h0JykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblx0XHRcdHZhciAkcGFyID0gJHRoaXMucGFyZW50KCk7XG5cdFx0XHR2YXIgJHN0cnMgPSAkcGFyLmZpbmQoJy5zdHJldGNoLWhlaWdodCcpO1xuXHRcdFx0JHN0cnMuY3NzKCdoZWlnaHQnLCAnJyk7XG5cdFx0XHRpZigkdGhpcy5vdXRlcldpZHRoKCk8JHBhci5pbm5lcldpZHRoKCkpe1xuXHRcdFx0XHQkc3Rycy5jc3MoJ2hlaWdodCcsICRwYXIuaW5uZXJIZWlnaHQoKSsncHgnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQkKCcuc3RyZXRjaC1mdWxsLWhlaWdodCcpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XG5cdFx0XHR2YXIgJHBhciA9ICR0aGlzLnBhcmVudCgpO1xuXHRcdFx0dmFyICRzdHJzID0gJHBhci5maW5kKCcuc3RyZXRjaC1mdWxsLWhlaWdodCcpO1xuXHRcdFx0JHN0cnMuY3NzKCdoZWlnaHQnLCAnJyk7XG5cdFx0XHRpZigkdGhpcy5vdXRlcldpZHRoKCk8JHBhci5pbm5lcldpZHRoKCkpe1xuXHRcdFx0XHR2YXIgcGFySCA9ICRwYXIuaW5uZXJIZWlnaHQoKTtcblx0XHRcdFx0dmFyIHN0cnNIID0gd2ggPCBwYXJIID8gcGFySCA6IHdoO1xuXHRcdFx0XHQkc3Rycy5jc3MoJ2hlaWdodCcsIHN0cnNIKydweCcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdCR2aWV3cy5lYWNoKGZ1bmN0aW9uKGkpe1xuXHRcdFx0dmFyICR2aWV3ID0gJCh0aGlzKTtcblx0XHRcdHZhciAkY29udGVudCA9ICR2aWV3LmZpbmQoJy5jb250ZW50Jyk7XG5cdFx0XHR2YXIgJHNrZXdUb3AgPSAkY29udGVudC5maW5kKCcuc2tldy5za2V3LXRvcC1yaWdodCwgLnNrZXcuc2tldy10b3AtbGVmdCcpO1xuXHRcdFx0dmFyICRza2V3Qm90dG9tID0gJGNvbnRlbnQuZmluZCgnLnNrZXcuc2tldy1ib3R0b20tbGVmdCwgLnNrZXcuc2tldy1ib3R0b20tcmlnaHQnKTtcblx0XHRcdHZhciBjb250ZW50V1B4ID0gJGNvbnRlbnQud2lkdGgoKStcInB4XCI7XG5cdFx0XHQkc2tld0JvdHRvbS5jc3Moe1xuXHRcdFx0XHRcImJvcmRlci1sZWZ0LXdpZHRoXCI6IGNvbnRlbnRXUHhcblx0XHRcdH0pO1xuXHRcdFx0JHNrZXdUb3AuY3NzKHtcblx0XHRcdFx0XCJib3JkZXItcmlnaHQtd2lkdGhcIjogY29udGVudFdQeFxuXHRcdFx0fSk7XG5cdFx0XHR2YXIgdmlld0ggPSAkdmlldy5oZWlnaHQoKTtcblx0XHRcdHZhciB2aWV3VyA9ICR2aWV3LndpZHRoKCk7XG5cdFx0XHR2YXIgdGFyZ2V0SCA9IChmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgdmlld09mZnNldDEgPSAtMSAqIHZpZXdIO1xuXHRcdFx0XHR2YXIgdmlld09mZnNldDIgPSAwO1xuXHRcdFx0XHR2YXIgdmlld09mZnNldDMgPSB3aCAtIHZpZXdIO1xuXHRcdFx0XHR2YXIgdmlld09mZnNldDQgPSB3aDtcblx0XHRcdFx0dmFyIG1hcmcxID0gYXBwU2hhcmUucGFyYWxsYXhNYXJnaW4oc2NyaXB0LCBpLCB2aWV3T2Zmc2V0MSk7XG5cdFx0XHRcdHZhciBtYXJnMiA9IGFwcFNoYXJlLnBhcmFsbGF4TWFyZ2luKHNjcmlwdCwgaSwgdmlld09mZnNldDIpO1xuXHRcdFx0XHR2YXIgbWFyZzMgPSBhcHBTaGFyZS5wYXJhbGxheE1hcmdpbihzY3JpcHQsIGksIHZpZXdPZmZzZXQzKTtcblx0XHRcdFx0dmFyIG1hcmc0ID0gYXBwU2hhcmUucGFyYWxsYXhNYXJnaW4oc2NyaXB0LCBpLCB2aWV3T2Zmc2V0NCk7XG5cdFx0XHRcdHZhciB0b3BEZWx0YSA9IGZ1bmN0aW9uKHZpZXdPZmZzZXQsIG1hcmcpe1xuXHRcdFx0XHRcdHJldHVybiBtYXJnICsgKHZpZXdPZmZzZXQgPiAwID8gMCA6IHZpZXdPZmZzZXQpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHR2YXIgYm90dG9tRGVsdGEgPSBmdW5jdGlvbih2aWV3T2Zmc2V0LCBtYXJnKXtcblx0XHRcdFx0XHR2YXIgYm90dG9tT2Zmc2V0ID0gdmlld09mZnNldCArIHZpZXdIO1xuXHRcdFx0XHRcdHJldHVybiAtbWFyZyAtIChib3R0b21PZmZzZXQgPCB3aCA/IDAgOiBib3R0b21PZmZzZXQgLSB3aCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHZhciBkZWx0YSA9IDA7XG5cdFx0XHRcdHZhciBjdXJEZWx0YTtcblx0XHRcdFx0Y3VyRGVsdGEgPSB0b3BEZWx0YSh2aWV3T2Zmc2V0MSwgbWFyZzEpOyBpZihjdXJEZWx0YSA+IGRlbHRhKSBkZWx0YSA9IGN1ckRlbHRhO1xuXHRcdFx0XHRjdXJEZWx0YSA9IHRvcERlbHRhKHZpZXdPZmZzZXQyLCBtYXJnMik7IGlmKGN1ckRlbHRhID4gZGVsdGEpIGRlbHRhID0gY3VyRGVsdGE7XG5cdFx0XHRcdGN1ckRlbHRhID0gdG9wRGVsdGEodmlld09mZnNldDMsIG1hcmczKTsgaWYoY3VyRGVsdGEgPiBkZWx0YSkgZGVsdGEgPSBjdXJEZWx0YTtcblx0XHRcdFx0Y3VyRGVsdGEgPSB0b3BEZWx0YSh2aWV3T2Zmc2V0NCwgbWFyZzQpOyBpZihjdXJEZWx0YSA+IGRlbHRhKSBkZWx0YSA9IGN1ckRlbHRhO1xuXHRcdFx0XHRjdXJEZWx0YSA9IGJvdHRvbURlbHRhKHZpZXdPZmZzZXQxLCBtYXJnMSk7IGlmKGN1ckRlbHRhID4gZGVsdGEpIGRlbHRhID0gY3VyRGVsdGE7XG5cdFx0XHRcdGN1ckRlbHRhID0gYm90dG9tRGVsdGEodmlld09mZnNldDIsIG1hcmcyKTsgaWYoY3VyRGVsdGEgPiBkZWx0YSkgZGVsdGEgPSBjdXJEZWx0YTtcblx0XHRcdFx0Y3VyRGVsdGEgPSBib3R0b21EZWx0YSh2aWV3T2Zmc2V0MywgbWFyZzMpOyBpZihjdXJEZWx0YSA+IGRlbHRhKSBkZWx0YSA9IGN1ckRlbHRhO1xuXHRcdFx0XHRjdXJEZWx0YSA9IGJvdHRvbURlbHRhKHZpZXdPZmZzZXQ0LCBtYXJnNCk7IGlmKGN1ckRlbHRhID4gZGVsdGEpIGRlbHRhID0gY3VyRGVsdGE7XG5cdFx0XHRcdHJldHVybiB2aWV3SCArICgyICogZGVsdGEpO1xuXHRcdFx0fSkoKTtcblx0XHRcdCR2aWV3LmNoaWxkcmVuKCdpbWcuYmcnKS5lYWNoKGZ1bmN0aW9uKCl7IFxuXHRcdFx0XHRiZ1NpemUoJCh0aGlzKSwgdGFyZ2V0SCwgdmlld1csIHZpZXdIKTtcblx0XHRcdH0pO1xuXHRcdFx0JHZpZXcuZGF0YSgncG9zaXRpb24nLCAkdmlldy5vZmZzZXQoKS50b3ApO1xuXHRcdH0pO1xuXHRcdCQoJ3NlY3Rpb24nKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdFx0JHRoaXMuZGF0YSgncG9zaXRpb24nLCAkdGhpcy5vZmZzZXQoKS50b3ApO1xuXHRcdH0pO1xuXHRcdCQoJ2JvZHknKS5jaGlsZHJlbignaW1nLmJnJykuZWFjaChmdW5jdGlvbigpeyBcblx0XHRcdGJnU2l6ZSgkKHRoaXMpLCB3aCwgd3csIHdoKTtcblx0XHR9KTtcblx0XHRmdW5jdGlvbiBiZ1NpemUoJGJnLCB0YXJnZXRILCB2aWV3Vywgdmlld0gpe1xuXHRcdFx0dmFyIG5hdCA9IG5hdFNpemUoJGJnKTtcblx0XHRcdHZhciBzY2FsZSA9ICh2aWV3Vy90YXJnZXRIID4gbmF0LncvbmF0LmgpID8gdmlld1cgLyBuYXQudyA6IHRhcmdldEggLyBuYXQuaDtcblx0XHRcdHZhciBuZXdXID0gbmF0LncgKiBzY2FsZTtcblx0XHRcdHZhciBuZXdIID0gbmF0LmggKiBzY2FsZTtcblx0XHRcdHZhciB6b29tWERlbHRhID0gKG5ld1cgLSBuYXQudykvMjtcblx0XHRcdHZhciB6b29tWURlbHRhID0gKG5ld0ggLSBuYXQuaCkvMjtcblx0XHRcdHZhciB4ID0gTWF0aC5yb3VuZCgodmlld1cgLSBuZXdXKS8yKTtcblx0XHRcdHZhciB5ID0gTWF0aC5yb3VuZCgodmlld0ggLSBuZXdIKS8yKTtcblx0XHRcdHZhciBjZmcgPSAkYmcuZGF0YSgpO1xuXHRcdFx0Y2ZnLm5vcm1hbFNjYWxlID0gc2NhbGU7XG5cdFx0XHRjZmcubm9ybWFsWCA9IHg7XG5cdFx0XHRjZmcubm9ybWFsWSA9IHk7XG5cdFx0XHRjZmcuem9vbVhEZWx0YSA9IHpvb21YRGVsdGE7XG5cdFx0XHRjZmcuem9vbVlEZWx0YSA9IHpvb21ZRGVsdGE7XG5cdFx0fVxuXHR9O1xuXHR0aGlzLmNoYW5nZVNlY3Rpb24gPSBmdW5jdGlvbihzY3JpcHQsIHNlY3Rpb25IYXNoKXtcblx0XHR2YXIgJHNlY3QgPSAkKHNlY3Rpb25IYXNoKTtcblx0XHR2YXIgY2xzID0gJHNlY3QuZGF0YSgnYm9yZGVyLWNvbG9ycycpO1xuXHRcdGlmKGNscyl7XG5cdFx0XHQkYm9yZC5yZW1vdmVDbGFzcyh0aGVtZXMuY29sb3JDbGFzc2VzKTtcblx0XHRcdCRib3JkLmFkZENsYXNzKGNscyk7XG5cdFx0fWVsc2V7XG5cdFx0XHRpZigkYm9keS5oYXNDbGFzcygnc3RhdGUyJykgJiYgc3RhdGUyQ29sb3JzKXtcblx0XHRcdFx0JGJvcmQucmVtb3ZlQ2xhc3ModGhlbWVzLmNvbG9yQ2xhc3Nlcyk7XG5cdFx0XHRcdCRib3JkLmFkZENsYXNzKHN0YXRlMkNvbG9ycyk7XG5cdFx0XHR9ZWxzZSBpZihzdGF0ZTFDb2xvcnMpe1xuXHRcdFx0XHQkYm9yZC5yZW1vdmVDbGFzcyh0aGVtZXMuY29sb3JDbGFzc2VzKTtcblx0XHRcdFx0JGJvcmQuYWRkQ2xhc3Moc3RhdGUxQ29sb3JzKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdGZ1bmN0aW9uIG5hdFNpemUoJGJnKXtcblx0XHR2YXIgZWxlbSA9ICRiZy5nZXQoMCk7XG5cdFx0dmFyIG5hdFcsIG5hdEg7XG5cdFx0aWYoZWxlbS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbWcnKXtcblx0XHRcdG5hdFcgPSBlbGVtLndpZHRoO1xuXHRcdFx0bmF0SCA9IGVsZW0uaGVpZ2h0O1xuXHRcdH1lbHNlIGlmKGVsZW0ubmF0dXJhbFdpZHRoKXtcblx0XHRcdG5hdFcgPSBlbGVtLm5hdHVyYWxXaWR0aDtcblx0XHRcdG5hdEggPSBlbGVtLm5hdHVyYWxIZWlnaHQ7XG5cdFx0fWVsc2V7XG5cdFx0XHR2YXIgb3JpZyA9ICRiZy53aWR0aCgpO1xuXHRcdFx0JGJnLmNzcyh7d2lkdGg6ICcnLCBoZWlnaHQ6ICcnfSk7XG5cdFx0XHRuYXRXID0gJGJnLndpZHRoKCk7XG5cdFx0XHRuYXRIID0gJGJnLmhlaWdodCgpO1xuXHRcdFx0JGJnLmNzcyh7d2lkdGg6IG9yaWd9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHt3OiBuYXRXLCBoOiBuYXRIfTtcblx0fVxufSkoKTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNjcm9sbGluZywgc2NyaXB0KXtcblx0dmFyICR2aWV3cyA9ICQoJy52aWV3Jyk7XG5cdHZhciBhcHBTaGFyZSA9IHJlcXVpcmUoJy4vYXBwLXNoYXJlLmpzJyk7XG5cdHZhciBpc1Bvb3JCcm93c2VyID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdwb29yLWJyb3dzZXInKTtcblx0dGhpcy5zY3JvbGwgPSBmdW5jdGlvbigpe1xuXHRcdGlmKGlzUG9vckJyb3dzZXIpIHJldHVybjtcblx0XHQkdmlld3MuZWFjaChmdW5jdGlvbihpKXtcblx0XHRcdHZhciAkdmlldyA9ICQodGhpcyk7XG5cdFx0XHR2YXIgdmlld1BvcyA9IHNjcm9sbGluZy5jYWxjUG9zaXRpb24oJHZpZXcpO1xuXHRcdFx0aWYodmlld1Bvcy52aXNpYmxlKXtcblx0XHRcdFx0dmFyIHZpZXdPZmZzZXQgPSB2aWV3UG9zLnRvcCAtIHNjcm9sbGluZy53aW5kb3dUb3BQb3M7XG5cdFx0XHRcdCR2aWV3LmNoaWxkcmVuKCcuYmc6bm90KC5zdGF0aWMpJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdHZhciBjZmcgPSAkKHRoaXMpLmRhdGEoKTtcblx0XHRcdFx0XHRjZmcucGFyYWxsYXhZID0gYXBwU2hhcmUucGFyYWxsYXhNYXJnaW4oc2NyaXB0LCBpLCB2aWV3T2Zmc2V0KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyAoZnVuY3Rpb24oKXtcclxuXHR2YXIgbWUgPSB0aGlzO1xyXG5cdHRoaXMub3B0aW9ucyA9IHtcclxuXHRcdCdhbmdpZSc6IHtzdHlsZTogJ3RoZW1lLWFuZ2llJywgYmdTeW5jOiBbJyoqLyoudHh0JywgJyoqLyonXSwgdmlkZW9TeW5jOiBbXX0sXHJcblx0XHQnbHluZGEnOiB7c3R5bGU6ICd0aGVtZS1seW5kYScsIGJnU3luYzogWycqKi8qLnR4dCcsICcqKi8qJ10sIHZpZGVvU3luYzogW119LFxyXG5cdFx0J2FsaWNlJzoge3N0eWxlOiAndGhlbWUtYWxpY2UnLCBiZ1N5bmM6IFsnKiovKi50eHQnLCAnKiovKiddLCB2aWRlb1N5bmM6IFtdfSxcclxuXHRcdCdsdWN5Jzoge3N0eWxlOiAndGhlbWUtbHVjeScsIGJnU3luYzogWycqKi8qLnR4dCcsICcqKi8qJ10sIHZpZGVvU3luYzogW119LFxyXG5cdFx0J21hcnknOiB7c3R5bGU6ICd0aGVtZS1hbGljZScsIGJnU3luYzogWycqKi8qLnR4dCcsICcqKi8qJ10sIHZpZGVvU3luYzogW119LFxyXG5cdFx0J3N1emknOiB7c3R5bGU6ICd0aGVtZS1zdXppJywgYmdTeW5jOiBbJyoqLyoudHh0JywgJyoqLyonXSwgdmlkZW9TeW5jOiBbXX0sXHJcblx0XHQndmlraSc6IHtzdHlsZTogJ3RoZW1lLXZpa2knLCBiZ1N5bmM6IFsnKiovKi50eHQnLCAnKiovKiddLCB2aWRlb1N5bmM6IFtdfSxcclxuXHRcdCdsdWl6YSc6IHtzdHlsZTogJ3RoZW1lLWx1aXphJywgYmdTeW5jOiBbJyoqLyoudHh0JywgJyoqLyonXSwgdmlkZW9TeW5jOiBbXX1cclxuXHR9O1xyXG5cdHRoaXMubmFtZXMgPSB7XHJcblx0fTtcclxuXHR0aGlzLmNvbG9ycyA9IDg7XHJcblx0dGhpcy5jb2xvckNsYXNzZXMgPSAoZnVuY3Rpb24oKXtcclxuXHRcdHZhciByZXMgPSAnJztcclxuXHRcdGZvcih2YXIgaT0wOyBpPG1lLmNvbG9yczsgaSsrKXtcclxuXHRcdFx0dmFyIHNlcCA9IGkgPT09IDAgPyAnJyA6ICcgJztcclxuXHRcdFx0cmVzICs9IHNlcCArICdjb2xvcnMtJytTdHJpbmcuZnJvbUNoYXJDb2RlKDY1K2kpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzO1xyXG5cdH0pKCk7XHJcbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNjcmlwdCl7XHJcblx0dmFyIHRoZW1lcyA9IHJlcXVpcmUoJy4uL2FwcC90aGVtZXMuanMnKTtcclxuXHR2YXIgdG9vbHMgPSByZXF1aXJlKCcuLi90b29scy90b29scy5qcycpO1xyXG5cdHZhciBsb2FkaW5nID0gcmVxdWlyZSgnLi4vd2lkZ2V0cy9sb2FkaW5nLmpzJyk7XHJcblx0dmFyIGFwcFNoYXJlID0gcmVxdWlyZSgnLi4vYXBwL2FwcC1zaGFyZS5qcycpO1xyXG5cdHZhciBjb2xvcnMgPSB0aGVtZXMuY29sb3JzO1xyXG5cdHZhciBtZSA9IHRoaXM7XHJcblx0dmFyIGNQYXRoID0gJyc7XHJcblx0dmFyIGN1c3RvbUNzcztcclxuXHR2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcclxuXHR2YXIgJHBhbmVsO1xyXG5cdHZhciAkb3B0O1xyXG5cdHZhciAkdG9nZ2xlO1xyXG5cdHZhciBvcHRXO1xyXG5cdHZhciAkY3VzdG9tQ3NzO1xyXG5cdHZhciAkdGhlbWVzU2VsZWN0O1xyXG5cdHZhciAkY29sb3JzO1xyXG5cdHZhciBpc0luaXRpYWxpemVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5sZXNzVmFycyA9IHt9O1xyXG5cdHRoaXMuaXNTaG93UGFuZWwgPSAoZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjdXN0b21pemVQID0gdG9vbHMuZ2V0VXJsUGFyYW1ldGVyKCdjdXN0b21pemUnKTtcclxuXHRcdGlmKGN1c3RvbWl6ZVAgPT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdGN1c3RvbWl6ZVAgPSAkLmNvb2tpZSgnY3VzdG9taXplJyk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0JC5jb29raWUoJ2N1c3RvbWl6ZScsICd5ZXMnLCB7cGF0aDogY1BhdGh9KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoY3VzdG9taXplUCAmJiAkKCcjdG9wLW5hdicpLmxlbmd0aCA+IDApID8gdHJ1ZSA6IGZhbHNlO1xyXG5cdH0pKCk7XHJcblx0dGhpcy5zaG93ID0gZnVuY3Rpb24oKXtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYoIWlzSW5pdGlhbGl6ZWQpe1xyXG5cdFx0XHRcdGlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdGNyZWF0ZUNzcyh0cnVlKTtcclxuXHRcdFx0XHRpbml0TGVzc1ZhcnMoKTtcclxuXHRcdFx0XHR2YXIgJGdhdGUgPSAkb3B0LmZpbmQoJy5vcHRpb25zLWdhdGUnKTtcclxuXHRcdFx0XHQkZ2F0ZS5jc3Moe29wYWNpdHk6IDB9KTtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHQkZ2F0ZS5jc3Moe3Zpc2liaWxpdHk6ICdoaWRkZW4nfSk7XHJcblx0XHRcdFx0fSwgMTAwMCk7XHJcblx0XHRcdH1cclxuXHRcdH0sIDU1MCk7XHJcblx0XHQkcGFuZWwuY3NzKHtsZWZ0OiAnMHB4J30pO1xyXG5cdFx0JHBhbmVsLmFkZENsYXNzKCdvbicpO1xyXG5cdH07XHJcblx0dGhpcy5oaWRlID0gZnVuY3Rpb24oKXtcclxuXHRcdCRwYW5lbC5jc3Moe2xlZnQ6IC0xKm9wdFcrJ3B4J30pO1xyXG5cdFx0JHBhbmVsLnJlbW92ZUNsYXNzKCdvbicpO1xyXG5cdH07XHJcblx0ZnVuY3Rpb24gcmVzaXplKCl7XHJcblx0XHQkb3B0LmNzcyh7XHJcblx0XHRcdGhlaWdodDogKCR3aW5kb3cuaGVpZ2h0KCkgLSBwYXJzZUludCgkcGFuZWwuY3NzKCd0b3AnKS5yZXBsYWNlKCdweCcsJycpKSAtIDMwKSArICdweCdcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRmdW5jdGlvbiB0aGVtZVNlbGVjdFRvQ3VzdG9tKCl7XHJcblx0XHRpZigkdGhlbWVzU2VsZWN0LnZhbCgpICE9PSAnY3VzdG9tJyl7XHJcblx0XHRcdCQoJzxvcHRpb24gdmFsdWU9XCJjdXN0b21cIj5DdXN0b208L29wdGlvbj4nKS5hcHBlbmRUbygkdGhlbWVzU2VsZWN0KTtcclxuXHRcdFx0JHRoZW1lc1NlbGVjdC52YWwoJ2N1c3RvbScpO1xyXG5cdFx0XHQkLmNvb2tpZS5qc29uID0gZmFsc2U7XHJcblx0XHRcdCQuY29va2llKCd0aGVtZVNlbGVjdCcsICdjdXN0b20nLCB7cGF0aDogY1BhdGh9KTtcclxuXHRcdFx0JC5jb29raWUuanNvbiA9IHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGluaXRMZXNzVmFycygpe1xyXG5cdFx0Zm9yKHZhciBpPTA7IGk8Y29sb3JzOyBpKyspe1xyXG5cdFx0XHRpbml0R3JvdXAoU3RyaW5nLmZyb21DaGFyQ29kZSg2NStpKS50b0xvd2VyQ2FzZSgpKTtcclxuXHRcdH1cclxuXHRcdGluaXRMZXNzVmFyKCc8c3Bhbj48c3BhbiBjbGFzcz1cInByaW1hcnktY29sb3JcIj48L3NwYW4+PC9zcGFuPicsICcucHJpbWFyeS1jb2xvcicsICdjb2xvcicsICdpbnB1dC5wcmltYXJ5LWJnJywgJ3ByaW1hcnktYmcnLCB0b0hleCk7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4+PHNwYW4gY2xhc3M9XCJvdXQtcHJpbWFyeVwiPjwvc3Bhbj48L3NwYW4+JywgJy5vdXQtcHJpbWFyeScsICdvcGFjaXR5JywgJ2lucHV0LnByaW1hcnktb3V0JywgJ3ByaW1hcnktb3V0Jywgb3V0VHJhbnNsYXRvciwgb3V0U2V0VHJhbnNsYXRvcik7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4+PHNwYW4gY2xhc3M9XCJzdWNjZXNzLWNvbG9yXCI+PC9zcGFuPjwvc3Bhbj4nLCAnLnN1Y2Nlc3MtY29sb3InLCAnY29sb3InLCAnaW5wdXQuc3VjY2Vzcy1iZycsICdzdWNjZXNzLWJnJywgdG9IZXgpO1xyXG5cdFx0aW5pdExlc3NWYXIoJzxzcGFuPjxzcGFuIGNsYXNzPVwib3V0LXN1Y2Nlc3NcIj48L3NwYW4+PC9zcGFuPicsICcub3V0LXN1Y2Nlc3MnLCAnb3BhY2l0eScsICdpbnB1dC5zdWNjZXNzLW91dCcsICdzdWNjZXNzLW91dCcsIG91dFRyYW5zbGF0b3IsIG91dFNldFRyYW5zbGF0b3IpO1xyXG5cdFx0aW5pdExlc3NWYXIoJzxzcGFuPjxzcGFuIGNsYXNzPVwiaW5mby1jb2xvclwiPjwvc3Bhbj48L3NwYW4+JywgJy5pbmZvLWNvbG9yJywgJ2NvbG9yJywgJ2lucHV0LmluZm8tYmcnLCAnaW5mby1iZycsIHRvSGV4KTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3Bhbj48c3BhbiBjbGFzcz1cIm91dC1pbmZvXCI+PC9zcGFuPjwvc3Bhbj4nLCAnLm91dC1pbmZvJywgJ29wYWNpdHknLCAnaW5wdXQuaW5mby1vdXQnLCAnaW5mby1vdXQnLCBvdXRUcmFuc2xhdG9yLCBvdXRTZXRUcmFuc2xhdG9yKTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3Bhbj48c3BhbiBjbGFzcz1cIndhcm5pbmctY29sb3JcIj48L3NwYW4+PC9zcGFuPicsICcud2FybmluZy1jb2xvcicsICdjb2xvcicsICdpbnB1dC53YXJuaW5nLWJnJywgJ3dhcm5pbmctYmcnLCB0b0hleCk7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4+PHNwYW4gY2xhc3M9XCJvdXQtd2FybmluZ1wiPjwvc3Bhbj48L3NwYW4+JywgJy5vdXQtd2FybmluZycsICdvcGFjaXR5JywgJ2lucHV0Lndhcm5pbmctb3V0JywgJ3dhcm5pbmctb3V0Jywgb3V0VHJhbnNsYXRvciwgb3V0U2V0VHJhbnNsYXRvcik7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4+PHNwYW4gY2xhc3M9XCJkYW5nZXItY29sb3JcIj48L3NwYW4+PC9zcGFuPicsICcuZGFuZ2VyLWNvbG9yJywgJ2NvbG9yJywgJ2lucHV0LmRhbmdlci1iZycsICdkYW5nZXItYmcnLCB0b0hleCk7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4+PHNwYW4gY2xhc3M9XCJvdXQtZGFuZ2VyXCI+PC9zcGFuPjwvc3Bhbj4nLCAnLm91dC1kYW5nZXInLCAnb3BhY2l0eScsICdpbnB1dC5kYW5nZXItb3V0JywgJ2Rhbmdlci1vdXQnLCBvdXRUcmFuc2xhdG9yLCBvdXRTZXRUcmFuc2xhdG9yKTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gaW5pdEdyb3VwKGdycCl7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4gY2xhc3M9XCJjb2xvcnMtJytncnArJ1wiPjxzcGFuIGNsYXNzPVwiYmctY29sb3JcIj48L3NwYW4+PC9zcGFuPicsICcuYmctY29sb3InLCAnY29sb3InLCAnaW5wdXQuJytncnArJy1iZycsIGdycCsnLWJnJywgdG9IZXgpO1xyXG5cdFx0aW5pdExlc3NWYXIoJzxzcGFuIGNsYXNzPVwiY29sb3JzLScrZ3JwKydcIj48c3BhbiBjbGFzcz1cInRleHRcIj48L3NwYW4+PC9zcGFuPicsICcudGV4dCcsICdjb2xvcicsICdpbnB1dC4nK2dycCsnLXRleHQnLCBncnArJy10ZXh0JywgdG9IZXgpO1xyXG5cdFx0aW5pdExlc3NWYXIoJzxzcGFuIGNsYXNzPVwiY29sb3JzLScrZ3JwKydcIj48c3BhbiBjbGFzcz1cImhpZ2hsaWdodFwiPjwvc3Bhbj48L3NwYW4+JywgJy5oaWdobGlnaHQnLCAnY29sb3InLCAnaW5wdXQuJytncnArJy1oaWdobGlnaHQnLCBncnArJy1oaWdobGlnaHQnLCB0b0hleCk7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4gY2xhc3M9XCJjb2xvcnMtJytncnArJ1wiPjxzcGFuIGNsYXNzPVwibGlua1wiPjwvc3Bhbj48L3NwYW4+JywgJy5saW5rJywgJ2NvbG9yJywgJ2lucHV0LicrZ3JwKyctbGluaycsIGdycCsnLWxpbmsnLCB0b0hleCk7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4gY2xhc3M9XCJjb2xvcnMtJytncnArJ1wiPjxzcGFuIGNsYXNzPVwiaGVhZGluZ1wiPjwvc3Bhbj48L3NwYW4+JywgJy5oZWFkaW5nJywgJ2NvbG9yJywgJ2lucHV0LicrZ3JwKyctaGVhZGluZycsIGdycCsnLWhlYWRpbmcnLCB0b0hleCk7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4gY2xhc3M9XCJjb2xvcnMtJytncnArJ1wiPjxzcGFuIGNsYXNzPVwib3V0XCI+PC9zcGFuPjwvc3Bhbj4nLCAnLm91dCcsICdvcGFjaXR5JywgJ2lucHV0LicrZ3JwKyctb3V0JywgZ3JwKyctb3V0Jywgb3V0VHJhbnNsYXRvciwgb3V0U2V0VHJhbnNsYXRvcik7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIG91dFRyYW5zbGF0b3Iodil7cmV0dXJuIE1hdGgucm91bmQoKDEtdikqMTAwKTt9XHJcblx0ZnVuY3Rpb24gb3V0U2V0VHJhbnNsYXRvcih2KXtyZXR1cm4gTWF0aC5yb3VuZCh2KTt9XHJcblx0ZnVuY3Rpb24gaW5pdExlc3NWYXIoZ2V0dGVySHRtbCwgZ2V0dGVyUSwgY3NzUHJvcGVydHksIGlucHV0USwgbGVzc1ZhciwgdHJhbnNsYXRvciwgc2V0VHJhbnNsYXRvcil7XHJcblx0XHQvL3ZhciBjaGFuZ2VEZWxheSA9IDMwMDtcclxuXHRcdHZhciAkZyA9ICQoJzxzcGFuIGNsYXNzPVwiZ2V0dGVyXCI+PC9zcGFuPicpLmFwcGVuZFRvKCdib2R5Jyk7XHJcblx0XHQkKGdldHRlckh0bWwpLmFwcGVuZFRvKCRnKTtcclxuXHRcdHZhciBnZXR0ZWQgPSAkZy5maW5kKGdldHRlclEpLmNzcyhjc3NQcm9wZXJ0eSk7XHJcblx0XHQkZy5yZW1vdmUoKTtcclxuXHRcdGlmKGdldHRlZCl7XHJcblx0XHRcdGlmKHRyYW5zbGF0b3IpIGdldHRlZCA9IHRyYW5zbGF0b3IoZ2V0dGVkKTtcclxuXHRcdH1cclxuXHRcdG1lLmxlc3NWYXJzW2xlc3NWYXJdID0gZ2V0dGVkO1xyXG5cdFx0dmFyICRpbnAgPSAkb3B0LmZpbmQoaW5wdXRRKTtcclxuXHRcdCRpbnAudmFsKGdldHRlZCk7XHJcblx0XHRpZihjc3NQcm9wZXJ0eSA9PT0gJ2NvbG9yJyl7XHJcblx0XHRcdCRpbnAubWluaWNvbG9ycyh7XHJcblx0XHRcdFx0Y29udHJvbDogJCh0aGlzKS5hdHRyKCdkYXRhLWNvbnRyb2wnKSB8fCAnaHVlJyxcclxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6ICQodGhpcykuYXR0cignZGF0YS1kZWZhdWx0VmFsdWUnKSB8fCAnJyxcclxuXHRcdFx0XHRpbmxpbmU6ICQodGhpcykuYXR0cignZGF0YS1pbmxpbmUnKSA9PT0gJ3RydWUnLFxyXG5cdFx0XHRcdGxldHRlckNhc2U6ICQodGhpcykuYXR0cignZGF0YS1sZXR0ZXJDYXNlJykgfHwgJ2xvd2VyY2FzZScsXHJcblx0XHRcdFx0b3BhY2l0eTogZmFsc2UsXHJcblx0XHRcdFx0cG9zaXRpb246ICQodGhpcykuYXR0cignZGF0YS1wb3NpdGlvbicpIHx8ICd0b3AgbGVmdCcsXHJcblx0XHRcdFx0Ly9jaGFuZ2VEZWxheTogY2hhbmdlRGVsYXksXHJcblx0XHRcdFx0Y2hhbmdlOiBmdW5jdGlvbihoZXgsIG9wYWNpdHkpIHtcclxuXHRcdFx0XHRcdHRoZW1lU2VsZWN0VG9DdXN0b20oKTtcclxuXHRcdFx0XHRcdG1lLmxlc3NWYXJzW2xlc3NWYXJdID0gaGV4O1xyXG5cdFx0XHRcdFx0Y3JlYXRlQ3NzKCk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzaG93OiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0dmFyICRtYyA9ICRpbnAucGFyZW50KCk7XHJcblx0XHRcdFx0XHR2YXIgJG1jUGFuZWwgPSAkbWMuY2hpbGRyZW4oJy5taW5pY29sb3JzLXBhbmVsJyk7XHJcblx0XHRcdFx0XHR2YXIgbWNQYW5lbEggPSAkbWNQYW5lbC5vdXRlckhlaWdodCh0cnVlKTtcclxuXHRcdFx0XHRcdHZhciBtY1BhbmVsVyA9ICRtY1BhbmVsLm91dGVyV2lkdGgodHJ1ZSk7XHJcblx0XHRcdFx0XHR2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcclxuXHRcdFx0XHRcdHZhciB3VyA9ICR3aW5kb3cud2lkdGgoKTtcclxuXHRcdFx0XHRcdHZhciB3SCA9ICR3aW5kb3cuaGVpZ2h0KCk7XHJcblx0XHRcdFx0XHR2YXIgb2Zmc2V0ID0gJG1jUGFuZWwub2Zmc2V0KCk7XHJcblx0XHRcdFx0XHR2YXIgbGVmdCA9IG9mZnNldC5sZWZ0IC0gJChkb2N1bWVudCkuc2Nyb2xsTGVmdCgpO1xyXG5cdFx0XHRcdFx0dmFyIHRvcCA9IG9mZnNldC50b3AgLSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcclxuXHRcdFx0XHRcdGlmKCAobGVmdCttY1BhbmVsVykgPiB3VyApe1xyXG5cdFx0XHRcdFx0XHRsZWZ0ID0gd1cgLSBtY1BhbmVsVyAtIDU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiggKHRvcCttY1BhbmVsSCkgPiB3SCApe1xyXG5cdFx0XHRcdFx0XHR0b3AgPSB3SCAtIG1jUGFuZWxIIC0gMjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKCB0b3AgPCAwICl7XHJcblx0XHRcdFx0XHRcdHRvcCA9IDI7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQkbWNQYW5lbC5jc3Moe1xyXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogJ2ZpeGVkJyxcclxuXHRcdFx0XHRcdFx0bGVmdDogbGVmdCsncHgnLFxyXG5cdFx0XHRcdFx0XHR0b3A6IHRvcCsncHgnXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGhpZGU6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHQkaW5wLnBhcmVudCgpLmNoaWxkcmVuKCcubWluaWNvbG9ycy1wYW5lbCcpLmNzcyh7XHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiAnJyxcclxuXHRcdFx0XHRcdFx0bGVmdDogJycsXHJcblx0XHRcdFx0XHRcdHRvcDogJydcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0dGhlbWU6ICdib290c3RyYXAnXHJcblx0XHRcdH0pO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHZhciB0aW1lcjtcclxuXHRcdFx0JGlucC5jaGFuZ2UoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR2YXIgJGVsID0gJCh0aGlzKTtcclxuXHRcdFx0XHR2YXIgdmFsID0gJGVsLnZhbCgpO1xyXG5cdFx0XHRcdGlmICh0aW1lcil7XHJcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQodGltZXIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvL3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0dGhlbWVTZWxlY3RUb0N1c3RvbSgpO1xyXG5cdFx0XHRcdFx0bWUubGVzc1ZhcnNbbGVzc1Zhcl0gPSB2YWw7XHJcblx0XHRcdFx0XHRjcmVhdGVDc3MoKTtcclxuXHRcdFx0XHQvL30sIGNoYW5nZURlbGF5KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRmdW5jdGlvbiBjb2xvckZvcm1hdCh2YWwpe1xyXG5cdFx0XHRpZighdmFsLm1hdGNoKC9eI1swLTlhLWZBLWZdWzAtOWEtZkEtZl1bMC05YS1mQS1mXVswLTlhLWZBLWZdWzAtOWEtZkEtZl1bMC05YS1mQS1mXSQvaSkpe1xyXG5cdFx0XHRcdGlmKHZhbC5tYXRjaCgvXiNbMC05YS1mQS1mXVswLTlhLWZBLWZdWzAtOWEtZkEtZl0kL2kpKXtcclxuXHRcdFx0XHRcdHJldHVybiBcIiNcIit2YWwuY2hhckF0KDEpK3ZhbC5jaGFyQXQoMSkrdmFsLmNoYXJBdCgyKSt2YWwuY2hhckF0KDIpK3ZhbC5jaGFyQXQoMykrdmFsLmNoYXJBdCgzKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0cmV0dXJuIHZhbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiBidWlsZFBhbmVsKCl7XHJcblx0XHRpZighbWUuaXNTaG93UGFuZWwpe1xyXG5cdFx0XHQkcGFuZWwuaGlkZSgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0aWYoT2JqZWN0LmtleXModGhlbWVzLm5hbWVzKS5sZW5ndGg+MCl7XHJcblx0XHRcdFx0Zm9yICh2YXIgayBpbiB0aGVtZXMubmFtZXMpe1xyXG5cdFx0XHRcdFx0JCgnPG9wdGlvbiB2YWx1ZT1cIicraysnXCI+Jyt0aGVtZXMubmFtZXNba10rJzwvb3B0aW9uPicpLmFwcGVuZFRvKCR0aGVtZXNTZWxlY3QpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0JHRoZW1lc1NlbGVjdC5yZW1vdmUoKTtcclxuXHRcdFx0XHQkKCc8YSBjbGFzcz1cImJ1dHRvblwiIGhyZWY9XCIjXCI+UmVzZXQ8L2E+JykuYXBwZW5kVG8oJG9wdC5maW5kKCcudGhlbWVzJykpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0JC5jb29raWUuanNvbiA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JC5jb29raWUoJ3RoZW1lU2VsZWN0JywgXCJcIiwge3BhdGg6IGNQYXRofSk7XHJcblx0XHRcdFx0XHQkLmNvb2tpZS5qc29uID0gdHJ1ZTtcclxuXHRcdFx0XHRcdG1lLmhpZGUoKTtcclxuXHRcdFx0XHRcdGxvYWRpbmcuZ2F0ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdCQuY29va2llLmpzb24gPSBmYWxzZTtcclxuXHRcdFx0dmFyIHRoZW1lU2VsZWN0QyA9ICQuY29va2llKCd0aGVtZVNlbGVjdCcpO1xyXG5cdFx0XHQkLmNvb2tpZS5qc29uID0gdHJ1ZTtcclxuXHRcdFx0aWYodGhlbWVTZWxlY3RDID09PSAnY3VzdG9tJyl7XHJcblx0XHRcdFx0dGhlbWVTZWxlY3RUb0N1c3RvbSgpO1xyXG5cdFx0XHR9ZWxzZSBpZih0aGVtZVNlbGVjdEMpe1xyXG5cdFx0XHRcdCR0aGVtZXNTZWxlY3QudmFsKHRoZW1lU2VsZWN0Qyk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHZhciAkZmFjdG9yeSA9ICQoJyNmYWN0b3J5LXRoZW1lJyk7XHJcblx0XHRcdFx0aWYoJGZhY3RvcnkubGVuZ3RoID4gMCAmJiAkZmFjdG9yeS5jc3MoJ3Zpc2liaWxpdHknKSA9PT0gJ2hpZGRlbicpe1xyXG5cdFx0XHRcdFx0dmFyIHRzID0gdGhlbWVzLm9wdGlvbnNbJGZhY3RvcnkuaHRtbCgpXS5zdHlsZTtcclxuXHRcdFx0XHRcdCR0aGVtZXNTZWxlY3QudmFsKHRzKTtcclxuXHRcdFx0XHRcdCQuY29va2llLmpzb24gPSBmYWxzZTtcclxuXHRcdFx0XHRcdCQuY29va2llKCd0aGVtZVNlbGVjdCcsIHRzLCB7cGF0aDogY1BhdGh9KTtcclxuXHRcdFx0XHRcdCQuY29va2llLmpzb24gPSB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQkdGhlbWVzU2VsZWN0LmNoYW5nZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdCQoJy5vcHRpb25zIC50aGVtZXMgc2VsZWN0IG9wdGlvblt2YWx1ZT1jdXN0b21dJykucmVtb3ZlKCk7XHJcblx0XHRcdFx0dmFyIGhyZWYgPSAkKHRoaXMpLnZhbCgpO1xyXG5cdFx0XHRcdCQuY29va2llLmpzb24gPSBmYWxzZTtcclxuXHRcdFx0XHQkLmNvb2tpZSgndGhlbWVTZWxlY3QnLCBocmVmLCB7cGF0aDogY1BhdGh9KTtcclxuXHRcdFx0XHQkLmNvb2tpZS5qc29uID0gdHJ1ZTtcclxuXHRcdFx0XHRtZS5oaWRlKCk7XHJcblx0XHRcdFx0bG9hZGluZy5nYXRlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdCRwYW5lbC5jc3Moe2xlZnQ6IC0xKm9wdFcrJ3B4J30pO1xyXG5cdFx0XHQkdG9nZ2xlLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRpZigkcGFuZWwuaGFzQ2xhc3MoJ29uJykpe1xyXG5cdFx0XHRcdFx0bWUuaGlkZSgpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0bWUuc2hvdygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdCRvcHQuZmluZCgnLnNhdmUtY3VzdG9tLWNzcycpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR2YXIgJGNvbnRlbnQgPSAkY3VzdG9tQ3NzLmZpbmQoJy5jb250ZW50Jyk7XHJcblx0XHRcdFx0aWYoJC5jb29raWUoJ3NhdmVBc0xlc3MnKSl7XHJcblx0XHRcdFx0XHR2YXIgbGVzc1N0cj0nQGltcG9ydCBcInRoZW1lLmxlc3NcIjtcXHJcXG5cXHJcXG4nO1xyXG5cdFx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gbWUubGVzc1ZhcnMpe1xyXG5cdFx0XHRcdFx0XHRsZXNzU3RyID0gbGVzc1N0cisnQCcra2V5Kyc6ICcrbWUubGVzc1ZhcnNba2V5XSsnO1xcclxcbic7XHJcblx0XHRcdFx0XHRcdCRjb250ZW50LnRleHQobGVzc1N0cik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRpZighY3VzdG9tQ3NzKSBjcmVhdGVDc3MoKTtcclxuXHRcdFx0XHRcdCRjb250ZW50LnRleHQoXHJcblx0XHRcdFx0XHRcdGN1c3RvbUNzcy5yZXBsYWNlKC8oXFxyXFxufFxccnxcXG4pL2csJ1xcclxcbicpXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRuZXcgVFdFRU4uVHdlZW4oe2F1dG9BbHBoYTogMCwgeDotNDUwfSlcclxuXHRcdFx0XHRcdC50byh7YXV0b0FscGhhOiAxLCB4OiAwfSwgNDAwKVxyXG5cdFx0XHRcdFx0Lm9uVXBkYXRlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdCRjdXN0b21Dc3MuY3NzKHtvcGFjaXR5OiB0aGlzLmF1dG9BbHBoYSwgdmlzaWJpbGl0eTogKHRoaXMuYXV0b0FscGhhID4gMCA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nKX0pO1xyXG5cdFx0XHRcdFx0XHRpZihNb2Rlcm5penIuY3NzdHJhbnNmb3JtczNkICYmIGFwcFNoYXJlLmZvcmNlM0Qpe1xyXG5cdFx0XHRcdFx0XHRcdCRjdXN0b21Dc3MuY3NzKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgnK3RoaXMueCsncHgsIDBweCwgMHB4KSd9KTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0JGN1c3RvbUNzcy5jc3Moe3RyYW5zZm9ybTogJ3RyYW5zbGF0ZSgnK3RoaXMueCsncHgsIDBweCknfSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQuZWFzaW5nKFRXRUVOLkVhc2luZy5RdWFkcmF0aWMuT3V0KVxyXG5cdFx0XHRcdFx0LnN0YXJ0KCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHQkY3VzdG9tQ3NzLmZpbmQoJy5jbG9zZS1wYW5lbCcpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRuZXcgVFdFRU4uVHdlZW4oe2F1dG9BbHBoYTogMSwgeDogMH0pXHJcblx0XHRcdFx0XHQudG8oe2F1dG9BbHBoYTogMCwgeDogLTQ1MH0sIDQwMClcclxuXHRcdFx0XHRcdC5vblVwZGF0ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHQkY3VzdG9tQ3NzLmNzcyh7b3BhY2l0eTogdGhpcy5hdXRvQWxwaGEsIHZpc2liaWxpdHk6ICh0aGlzLmF1dG9BbHBoYSA+IDAgPyAndmlzaWJsZScgOiAnaGlkZGVuJyl9KTtcclxuXHRcdFx0XHRcdFx0aWYoTW9kZXJuaXpyLmNzc3RyYW5zZm9ybXMzZCAmJiBhcHBTaGFyZS5mb3JjZTNEKXtcclxuXHRcdFx0XHRcdFx0XHQkY3VzdG9tQ3NzLmNzcyh7dHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoJyt0aGlzLngrJ3B4LCAwcHgsIDBweCknfSk7XHJcblx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdCRjdXN0b21Dc3MuY3NzKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyt0aGlzLngrJ3B4LCAwcHgpJ30pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LmVhc2luZyhUV0VFTi5FYXNpbmcuTGluZWFyLk5vbmUpXHJcblx0XHRcdFx0XHQuc3RhcnQoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHRvb2xzLnNlbGVjdFRleHRhcmVhKCRjdXN0b21Dc3MuZmluZChcInRleHRhcmVhXCIpKTtcclxuXHRcdFx0dmFyIGNvbG9yc0JnID0gJGNvbG9ycy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcclxuXHRcdFx0aWYoIWNvbG9yc0JnIHx8IGNvbG9yc0JnID09ICdub25lJyl7XHJcblx0XHRcdFx0dmFyICRiZ0ltID0gJCgnaW1nLmJnJyk7XHJcblx0XHRcdFx0aWYoJGJnSW0ubGVuZ3RoPjApe1xyXG5cdFx0XHRcdFx0JGNvbG9ycy5jc3Moe1xyXG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1pbWFnZSc6IFwidXJsKCdcIiskYmdJbS5nZXQoMCkuc3JjK1wiJylcIixcclxuXHRcdFx0XHRcdFx0J2JhY2tncm91bmQtcG9zaXRpb24nOiAnY2VudGVyIGNlbnRlcicsXHJcblx0XHRcdFx0XHRcdCdiYWNrZ3JvdW5kLXNpemUnOiAnY292ZXInXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gY3JlYXRlQ3NzKGlzSW5pdE9ubHkpe1xyXG5cdFx0dmFyIGN1c3RvbSA9IGF0b2IoY3VzdG9tTGVzcyk7XHJcblx0XHQkLmNvb2tpZSgnbGVzc1ZhcnMnLCBtZS5sZXNzVmFycywge3BhdGg6IGNQYXRofSk7XHJcblx0XHRkb0xlc3MoY3VzdG9tLCBmdW5jdGlvbihjc3Mpe1xyXG5cdFx0XHRpZighaXNJbml0T25seSl7XHJcblx0XHRcdFx0dmFyIGVtcyA9ICdlZGl0LW1vZGUtc3R5bGVzJztcclxuXHRcdFx0XHRjdXN0b21Dc3MgPSBjc3M7XHJcblx0XHRcdFx0dmFyICRjdXIgPSAkKCcjJytlbXMpO1xyXG5cdFx0XHRcdGlmKCRjdXIubGVuZ3RoPDEpe1xyXG5cdFx0XHRcdFx0JCgnPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiIGlkPVwiJytlbXMrJ1wiPlxcbicrY3NzKyc8L3N0eWxlPicpLmFwcGVuZFRvKCdoZWFkJyk7XHJcblx0XHRcdFx0XHQkKCcjY3VzdG9tLWNzcycpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0aWYoJGN1clswXS5pbm5lckhUTUwpe1xyXG5cdFx0XHRcdFx0XHQkY3VyWzBdLmlubmVySFRNTCA9IGN1c3RvbUNzcztcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHQkY3VyWzBdLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGN1c3RvbUNzcztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBkb0xlc3MoZGF0YSwgY2FsbGJhY2spe1xyXG5cdFx0bGVzcy5yZW5kZXIoXHJcblx0XHRcdGRhdGEsXHJcblx0XHRcdHtcdGN1cnJlbnREaXJlY3Rvcnk6IFwic3R5bGVzL3RoZW1lcy9cIixcclxuXHRcdFx0XHRmaWxlbmFtZTogXCJzdHlsZXMvdGhlbWVzL3RoZW1lLWRlZmF1bHQubGVzc1wiLFxyXG5cdFx0XHRcdGVudHJ5UGF0aDogXCJzdHlsZXMvdGhlbWVzL1wiLFxyXG5cdFx0XHRcdHJvb3RwYXRoOiBcInN0eWxlcy90aGVtZXMvc3R5bGVzL3RoZW1lcy9cIixcclxuXHRcdFx0XHRyb290RmlsZW5hbWU6IFwic3R5bGVzL3RoZW1lcy90aGVtZS1kZWZhdWx0Lmxlc3NcIixcclxuXHRcdFx0XHRyZWxhdGl2ZVVybHM6IGZhbHNlLFxyXG5cdFx0XHRcdHVzZUZpbGVDYWNoZTogbWUubGVzc1ZhcnMgfHwgbGVzcy5nbG9iYWxWYXJzLFxyXG5cdFx0XHRcdGNvbXByZXNzOiBmYWxzZSxcclxuXHRcdFx0XHRtb2RpZnlWYXJzOiBtZS5sZXNzVmFycyxcclxuXHRcdFx0XHRnbG9iYWxWYXJzOiBsZXNzLmdsb2JhbFZhcnNcclxuXHRcdFx0fSxcclxuXHRcdFx0ZnVuY3Rpb24oZSwgb3V0cHV0KSB7XHJcblx0XHRcdFx0Y2FsbGJhY2sob3V0cHV0LmNzcyk7XHJcblx0XHRcdH1cclxuXHRcdCk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHRvSGV4KHJnYil7XHJcblx0XHRpZihyZ2IuaW5kZXhPZigncmdiJykgPT09IC0xKXtcclxuXHRcdFx0cmV0dXJuIHJnYjtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR2YXIgdHJpcGxldCA9IHJnYi5tYXRjaCgvW14wLTldKihbMC05XSopW14wLTldKihbMC05XSopW14wLTldKihbMC05XSopW14wLTldKi9pKTtcclxuXHRcdFx0cmV0dXJuIFwiI1wiK2RpZ2l0VG9IZXgodHJpcGxldFsxXSkrZGlnaXRUb0hleCh0cmlwbGV0WzJdKStkaWdpdFRvSGV4KHRyaXBsZXRbM10pO1xyXG5cdFx0fVxyXG5cdFx0ZnVuY3Rpb24gZGlnaXRUb0hleChkaWcpe1xyXG5cdFx0XHRpZihpc05hTihkaWcpKXtcclxuXHRcdFx0XHRyZXR1cm4gXCIwMFwiO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR2YXIgaHggPSBwYXJzZUludChkaWcpLnRvU3RyaW5nKDE2KTtcclxuXHRcdFx0XHRyZXR1cm4gaHgubGVuZ3RoID09IDEgPyBcIjBcIitoeCA6IGh4O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmKG1lLmlzU2hvd1BhbmVsKXtcclxuXHRcdCQoJzxkaXYgaWQ9XCJjdXN0b21pemUtcGFuZWxcIj48L2Rpdj4nKS5hcHBlbmRUbygnYm9keScpLmxvYWQoJ2N1c3RvbWl6ZS9jdXN0b21pemUuaHRtbCAjY3VzdG9taXplLXBhbmVsPionLCBmdW5jdGlvbih4aHIsIHN0YXR1c1RleHQsIHJlcXVlc3Qpe1xyXG5cdFx0XHRpZihzdGF0dXNUZXh0ICE9PSBcInN1Y2Nlc3NcIiAmJiBzdGF0dXNUZXh0ICE9PSBcIm5vdG1vZGlmaWVkXCIpe1xyXG5cdFx0XHRcdCQoJyNjdXN0b21pemUtcGFuZWwnKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRzY3JpcHQuYWZ0ZXJDb25maWd1cmUoKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0JC5nZXRTY3JpcHQoIFwiY3VzdG9taXplL2N1c3RvbS1sZXNzLmpzXCIsIGZ1bmN0aW9uKCBkYXRhLCBsZXNzU3RhdHVzVGV4dCwganF4aHIgKSB7XHJcblx0XHRcdFx0XHRpZihsZXNzU3RhdHVzVGV4dCAhPT0gXCJzdWNjZXNzXCIgJiYgbGVzc1N0YXR1c1RleHQgIT09IFwibm90bW9kaWZpZWRcIil7XHJcblx0XHRcdFx0XHRcdCQoJyNjdXN0b21pemUtcGFuZWwnKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdFx0c2NyaXB0LmFmdGVyQ29uZmlndXJlKCk7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0JHBhbmVsID0gJCgnI2N1c3RvbWl6ZS1wYW5lbCcpO1xyXG5cdFx0XHRcdFx0XHQkb3B0ID0gJHBhbmVsLmZpbmQoJy5vcHRpb25zJyk7XHJcblx0XHRcdFx0XHRcdCR0b2dnbGUgPSAkcGFuZWwuZmluZCgnLnRvZ2dsZS1idXR0b24nKTtcclxuXHRcdFx0XHRcdFx0b3B0VyA9ICRvcHQud2lkdGgoKTtcclxuXHRcdFx0XHRcdFx0JGN1c3RvbUNzcyA9ICRwYW5lbC5maW5kKCcuY3VzdG9tLWNzcycpO1xyXG5cdFx0XHRcdFx0XHQkdGhlbWVzU2VsZWN0ID0gJG9wdC5maW5kKCcudGhlbWVzIHNlbGVjdCcpO1xyXG5cdFx0XHRcdFx0XHQkY29sb3JzID0gJG9wdC5maW5kKCcuY29sb3JzJyk7XHJcblx0XHRcdFx0XHRcdCQuY29va2llLmpzb24gPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRidWlsZFBhbmVsKCk7XHJcblx0XHRcdFx0XHRcdGlmKHRvb2xzLmdldFVybFBhcmFtZXRlcignc2F2ZS1hcy1sZXNzJykpe1xyXG5cdFx0XHRcdFx0XHRcdCQuY29va2llKCdzYXZlQXNMZXNzJywgJ3llcycsIHtwYXRoOiBjUGF0aH0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdCQuY29va2llLmpzb24gPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0dmFyIHRzYyA9ICQuY29va2llKCd0aGVtZVNlbGVjdCcpO1xyXG5cdFx0XHRcdFx0XHQkLmNvb2tpZS5qc29uID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0aWYoIHRzYyA9PT0gJ2N1c3RvbScgKXtcclxuXHRcdFx0XHRcdFx0XHRpc0luaXRpYWxpemVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRtZS5sZXNzVmFycyA9ICQuY29va2llKCdsZXNzVmFycycpO1xyXG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUNzcygpO1xyXG5cdFx0XHRcdFx0XHRcdGluaXRMZXNzVmFycygpO1xyXG5cdFx0XHRcdFx0XHRcdCRvcHQuZmluZCgnLm9wdGlvbnMtZ2F0ZScpLmNzcyh7dmlzaWJpbGl0eTogJ2hpZGRlbid9KTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHQkd2luZG93LnJlc2l6ZShyZXNpemUpO1xyXG5cdFx0XHRcdFx0XHRyZXNpemUoKTtcclxuXHRcdFx0XHRcdFx0c2NyaXB0LmFmdGVyQ29uZmlndXJlKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1lbHNle1xyXG5cdFx0c2NyaXB0LmFmdGVyQ29uZmlndXJlKCk7XHJcblx0fVxyXG59OyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxuJChmdW5jdGlvbigpIHsgbmV3IChmdW5jdGlvbigpe1xyXG5cdHZhciBDdXN0b21pemUgPSByZXF1aXJlKCcuL2N1c3RvbWl6ZS9jdXN0b21pemUuanMnKTtcclxuXHR2YXIgVG9wTmF2ID0gcmVxdWlyZSgnLi93aWRnZXRzL3RvcC1uYXYuanMnKTtcclxuXHR2YXIgTWVudVRvZ2dsZSA9IHJlcXVpcmUoJy4vd2lkZ2V0cy9tZW51LXRvZ2dsZS5qcycpO1xyXG5cdHZhciBQbGF5ZXJzID0gcmVxdWlyZSgnLi9hbmltYXRpb24vcGxheWVycy5qcycpO1xyXG5cdHZhciBTY3JvbGxpbmcgPSByZXF1aXJlKCcuL2FuaW1hdGlvbi9zY3JvbGxpbmcuanMnKTtcclxuXHR2YXIgdG9vbHMgPSByZXF1aXJlKCcuL3Rvb2xzL3Rvb2xzLmpzJyk7XHJcblx0dmFyIFNob3dMaXN0ID0gcmVxdWlyZSgnLi93aWRnZXRzL3Nob3ctbGlzdC5qcycpO1xyXG5cdHZhciBHYWxsZXJ5ID0gcmVxdWlyZSgnLi93aWRnZXRzL2dhbGxlcnkuanMnKTtcclxuXHR2YXIgZmx1aWQgPSByZXF1aXJlKCcuL3dpZGdldHMvZmx1aWQuanMnKTtcclxuXHR2YXIgQ291bnRlciA9IHJlcXVpcmUoJy4vd2lkZ2V0cy9jb3VudGVyLmpzJyk7XHJcblx0dmFyIENoYW5nZUNvbG9ycyA9IHJlcXVpcmUoJy4vd2lkZ2V0cy9jaGFuZ2UtY29sb3JzLmpzJyk7XHJcblx0dmFyIFNsaWRlcnMgPSByZXF1aXJlKCcuL3dpZGdldHMvc2xpZGVycy5qcycpO1xyXG5cdHZhciBsb2FkaW5nID0gcmVxdWlyZSgnLi93aWRnZXRzL2xvYWRpbmcuanMnKTtcclxuXHR2YXIgQ3NzQW5pbWF0aW9uID0gcmVxdWlyZSgnLi9hbmltYXRpb24vY3NzLWFuaW1hdGlvbi5qcycpO1xyXG5cdHZhciBkb3RTY3JvbGwgPSByZXF1aXJlKCcuL3dpZGdldHMvZG90LXNjcm9sbC5qcycpO1xyXG5cdHZhciBNYXAgPSByZXF1aXJlKCcuL3dpZGdldHMvbWFwLmpzJyk7XHJcblx0dmFyIFNraWxsYmFyID0gcmVxdWlyZSgnLi93aWRnZXRzL3NraWxsYmFyLmpzJyk7XHJcblx0dmFyIEFqYXhGb3JtID0gcmVxdWlyZSgnLi93aWRnZXRzL2FqYXgtZm9ybS5qcycpO1xyXG5cdHZhciBZb3V0dWJlQkcgPSByZXF1aXJlKCcuL3dpZGdldHMveW91dHViZS1iZy5qcycpO1xyXG5cdHZhciBWaW1lb0JHID0gcmVxdWlyZSgnLi93aWRnZXRzL3ZpbWVvLWJnLmpzJyk7XHJcblx0dmFyIFZpZGVvQkcgPSByZXF1aXJlKCcuL3dpZGdldHMvdmlkZW8tYmcuanMnKTtcclxuXHR2YXIgYXBwID0gcmVxdWlyZSgnLi9hcHAvYXBwLmpzJyk7XHJcblx0dmFyIE92ZXJsYXlXaW5kb3cgPSByZXF1aXJlKCcuL3dpZGdldHMvb3ZlcmxheS13aW5kb3cuanMnKTtcclxuXHR2YXIgaXNQb29yQnJvd3NlciA9ICQoJ2h0bWwnKS5oYXNDbGFzcygncG9vci1icm93c2VyJyk7XHJcblx0dmFyIGlzQW5kcm9pZDQzbWludXMgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ2FuZHJvaWQtYnJvd3Nlci00XzNtaW51cycpO1xyXG5cdHZhciAkcGFnZVRyYW5zaXRpb24gPSAkKCcucGFnZS10cmFuc2l0aW9uJyk7XHJcblx0dmFyIG1lID0gdGhpcztcclxuXHR2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcclxuXHR2YXIgJHNlY3Rpb25zID0gJCgnc2VjdGlvbicpO1xyXG5cdHZhciBzZWN0aW9uVHJpZ2dlcnMgPSBbXTtcclxuXHR2YXIgbGFzdEFjdGl2ZVNlY3Rpb25IYXNoO1xyXG5cdHZhciBsb2NhdGlvbiA9IGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPyBkb2N1bWVudC5sb2NhdGlvbi5ocmVmLnJlcGxhY2UobmV3IFJlZ0V4cChkb2N1bWVudC5sb2NhdGlvbi5oYXNoKyckJyksJycpIDogZG9jdW1lbnQubG9jYXRpb24uaHJlZi5yZXBsYWNlKCcjJywnJyk7XHJcblx0dmFyICRuYXZMaW5rcyA9IChmdW5jdGlvbigpe1xyXG5cdFx0dmFyICRyZXMgPSBqUXVlcnkoKTtcclxuXHRcdCQoJyN0b3AtbmF2IC5uYXZiYXItbmF2IGEnKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XHJcblx0XHRcdGlmKFxyXG5cdFx0XHRcdCghdGhpcy5oYXNoKSB8fFxyXG5cdFx0XHRcdChcclxuXHRcdFx0XHRcdCh0aGlzLmhyZWYgPT09IGxvY2F0aW9uK3RoaXMuaGFzaCkgJiZcclxuXHRcdFx0XHRcdCgkKCdzZWN0aW9uJyt0aGlzLmhhc2gpLmxlbmd0aCA+IDApXHJcblx0XHRcdFx0KVxyXG5cdFx0XHQpe1xyXG5cdFx0XHRcdCRyZXMgPSAkcmVzLmFkZCgkdGhpcyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuICRyZXM7XHJcblx0fSkoKTtcclxuXHR2YXIgaXNNb2JpbGUgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ21vYmlsZScpO1xyXG5cdHZhciBzY3JvbGxpbmc7XHJcblx0dmFyIG1heFNjcm9sbFBvc2l0aW9uO1xyXG5cdHZhciB0aWNrZXIgPSBuZXcgKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0d2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSAoZnVuY3Rpb24oKXtcclxuXHRcdFx0cmV0dXJuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8IFxyXG5cdFx0XHRcdHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgXHJcblx0XHRcdFx0d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fCBcclxuXHRcdFx0XHR3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgIHx8IFxyXG5cdFx0XHRcdHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgfHwgXHJcblx0XHRcdFx0ZnVuY3Rpb24oLyogZnVuY3Rpb24gKi8gY2FsbGJhY2ssIC8qIERPTUVsZW1lbnQgKi8gZWxlbWVudCl7XHJcblx0XHRcdFx0XHR3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0fSkoKTtcclxuXHRcdHZhciBsYXN0UG9zaXRpb24gPSAtMTtcclxuXHRcdHRoaXMucGFnZUlzUmVhZHkgPSBmYWxzZTtcclxuXHRcdChmdW5jdGlvbiBhbmltYXRlKHRpbWUpe1xyXG5cdFx0XHRpZihtZS5wYWdlSXNSZWFkeSl7XHJcblx0XHRcdFx0dmFyIHdpbmRvd1RvcFBvcyA9IHRvb2xzLndpbmRvd1lPZmZzZXQoKTtcclxuXHRcdFx0XHRpZiAobGFzdFBvc2l0aW9uICE9PSB3aW5kb3dUb3BQb3MpIHtcclxuXHRcdFx0XHRcdHNjcm9sbGluZy5zY3JvbGwod2luZG93VG9wUG9zKTtcclxuXHRcdFx0XHRcdHRyaWdOYXZpZ2F0aW9uTGlua3Mod2luZG93VG9wUG9zKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0bGFzdFBvc2l0aW9uID0gd2luZG93VG9wUG9zO1xyXG5cdFx0XHRcdFRXRUVOLnVwZGF0ZSgpO1xyXG5cdFx0XHRcdGFwcC50aWNrKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYobG9hZGluZy5xdWV1ZS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0KGxvYWRpbmcucXVldWUucG9wKCkpKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmVxdWVzdEFuaW1GcmFtZShhbmltYXRlKTtcclxuXHRcdH0pKCk7XHJcblx0fSkoKTtcclxuXHRcclxuXHR0aGlzLnRvcE5hdiA9IHVuZGVmaW5lZDtcclxuXHR0aGlzLnBsYXllcnMgPSBQbGF5ZXJzO1xyXG5cdHRoaXMuYWZ0ZXJDb25maWd1cmUgPSBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcclxuXHRcdGlmIChoaXN0b3J5ICYmIGhpc3RvcnkucmVwbGFjZVN0YXRlKSB7XHJcblx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKFwiXCIsIGRvY3VtZW50LnRpdGxlLCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuXHRcdH1cclxuXHRcdG5ldyBZb3V0dWJlQkcoKTtcclxuXHRcdG5ldyBWaW1lb0JHKCk7XHJcblx0XHRuZXcgVmlkZW9CRygpO1xyXG5cdFx0YXBwLnByZXBhcmUoZnVuY3Rpb24oKXtcclxuXHRcdFx0bG9hZGluZy5sb2FkKGZ1bmN0aW9uICgpe1xyXG5cdFx0XHRcdCRuYXZMaW5rcyA9ICRuYXZMaW5rcy5hZGQoZG90U2Nyb2xsLmxpbmtzKCkpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHQkbmF2TGlua3MucmVtb3ZlQ2xhc3MoJ3RhcmdldCcpO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcygndGFyZ2V0Jyk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0bWUudG9wTmF2ID0gbmV3IFRvcE5hdigpO1xyXG5cdFx0XHRcdG5ldyBNZW51VG9nZ2xlKCk7XHJcblx0XHRcdFx0c2Nyb2xsaW5nID0gbmV3IFNjcm9sbGluZyhtZSk7XHJcblx0XHRcdFx0d2lkZ2V0cygkKCdib2R5JykpO1xyXG5cdFx0XHRcdG5ldyBHYWxsZXJ5KG9uQm9keUhlaWdodFJlc2l6ZSwgd2lkZ2V0cywgdW53aWRnZXRzKTtcclxuXHRcdFx0XHR2YXIgd2luZG93VyA9ICR3aW5kb3cud2lkdGgoKTtcclxuXHRcdFx0XHR2YXIgd2luZG93SCA9ICR3aW5kb3cuaGVpZ2h0KCk7XHJcblx0XHRcdFx0JHdpbmRvdy5yZXNpemUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdHZhciBuZXdXaW5kb3dXID0gJHdpbmRvdy53aWR0aCgpO1xyXG5cdFx0XHRcdFx0dmFyIG5ld1dpbmRvd0ggPSAkd2luZG93LmhlaWdodCgpO1xyXG5cdFx0XHRcdFx0aWYobmV3V2luZG93VyE9PXdpbmRvd1cgfHwgbmV3V2luZG93SCE9PXdpbmRvd0gpeyAvL0lFIDggZml4XHJcblx0XHRcdFx0XHRcdHdpbmRvd1cgPSBuZXdXaW5kb3dXO1xyXG5cdFx0XHRcdFx0XHR3aW5kb3dIID0gbmV3V2luZG93SDtcclxuXHRcdFx0XHRcdFx0Zmx1aWQuc2V0dXAoJCgnYm9keScpKTtcclxuXHRcdFx0XHRcdFx0b25Cb2R5SGVpZ2h0UmVzaXplKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0YXBwLnNldHVwKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR2YXIgZmluaXNoID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0YnVpbGRTaXplcygpO1xyXG5cdFx0XHRcdFx0XHRjYWxjTmF2aWdhdGlvbkxpbmtUcmlnZ2VycygpO1xyXG5cdFx0XHRcdFx0XHR0aWNrZXIucGFnZUlzUmVhZHkgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHQkbmF2TGlua3MuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdGlmKHRoaXMuaHJlZj09bG9jYXRpb24pe1xyXG5cdFx0XHRcdFx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0JCgnLmJpZ3RleHQnKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0JCh0aGlzKS5iaWd0ZXh0KCk7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRhcHAudW5nYXRlZCgpO1xyXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0bG9hZGluZy51bmdhdGUoKTtcclxuXHRcdFx0XHRcdFx0XHRuYXZpZ2F0ZSh3aW5kb3cubG9jYXRpb24uaHJlZiwgaGFzaCk7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdHZhciB0ZXN0ID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0dmFyICRleGNsID0gJCgnLm5vbi1wcmVsb2FkaW5nLCAubm9uLXByZWxvYWRpbmcgaW1nJyk7XHJcblx0XHRcdFx0XHRcdHZhciAkaW1ncyA9ICQoJ2ltZycpLm5vdCgkZXhjbCk7XHJcblx0XHRcdFx0XHRcdGZvcih2YXIgaT0wOyBpPCRpbWdzLmxlbmd0aDsgaSsrKXtcclxuXHRcdFx0XHRcdFx0XHRpZiggKCEkaW1nc1tpXS53aWR0aCB8fCAhJGltZ3NbaV0uaGVpZ2h0KSAmJiAoISRpbWdzW2ldLm5hdHVyYWxXaWR0aCB8fCAhJGltZ3NbaV0ubmF0dXJhbEhlaWdodCkgKXtcclxuXHRcdFx0XHRcdFx0XHRcdHNldFRpbWVvdXQodGVzdCwgMTAwKTtcclxuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0ZmluaXNoKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR0ZXN0KCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIG9uQm9keUhlaWdodFJlc2l6ZSgpIHtcclxuXHRcdGJ1aWxkU2l6ZXMoKTtcclxuXHRcdHNjcm9sbGluZy5zY3JvbGwodG9vbHMud2luZG93WU9mZnNldCgpKTtcclxuXHRcdGNhbGNOYXZpZ2F0aW9uTGlua1RyaWdnZXJzKCk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHdpZGdldHMoJGNvbnRleHQpe1xyXG5cdFx0bmV3IFNob3dMaXN0KCRjb250ZXh0LCBtZSk7XHJcblx0XHRuZXcgU2xpZGVycygkY29udGV4dCk7XHJcblx0XHRpZighaXNNb2JpbGUpICRjb250ZXh0LmZpbmQoJy5ob3Zlci1kaXInKS5lYWNoKCBmdW5jdGlvbigpIHsgJCh0aGlzKS5ob3ZlcmRpcih7c3BlZWQ6IDMwMH0pOyB9ICk7XHJcblx0XHQkY29udGV4dC5maW5kKFwiYVwiKS5jbGljayhmdW5jdGlvbihlKXtcclxuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcclxuXHRcdFx0aWYoJHRoaXMuZGF0YSgndG9nZ2xlJykpIHJldHVybjtcclxuXHRcdFx0bmF2aWdhdGUodGhpcy5ocmVmLCB0aGlzLmhhc2gsIGUsICR0aGlzKVxyXG5cdFx0fSk7XHJcblx0XHRmbHVpZC5zZXR1cCgkY29udGV4dCk7XHJcblx0XHRuZXcgTWFwKCRjb250ZXh0KTtcclxuXHRcdG5ldyBDb3VudGVyKCRjb250ZXh0LCBtZSk7XHJcblx0XHRuZXcgQ2hhbmdlQ29sb3JzKCRjb250ZXh0KTtcclxuXHRcdG5ldyBTa2lsbGJhcigkY29udGV4dCwgbWUpO1xyXG5cdFx0JGNvbnRleHQuZmluZChcImlucHV0LHNlbGVjdCx0ZXh0YXJlYVwiKS5ub3QoXCJbdHlwZT1zdWJtaXRdXCIpLmpxQm9vdHN0cmFwVmFsaWRhdGlvbigpO1xyXG5cdFx0bmV3IEFqYXhGb3JtKCRjb250ZXh0KTtcclxuXHRcdG5ldyBDc3NBbmltYXRpb24oJGNvbnRleHQsIG1lKTtcclxuXHRcdCQoJy53aWRnZXQtdGFicyBhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXHJcblx0XHRcdCQodGhpcykudGFiKCdzaG93JylcclxuXHRcdH0pO1xyXG5cdFx0JCgnLndpZGdldC10b29sdGlwJykudG9vbHRpcCgpO1xyXG5cdFx0JCgnLndpZGdldC1wb3BvdmVyJykucG9wb3ZlcigpO1xyXG5cdFx0JGNvbnRleHQuZmluZCgndmlkZW8nKS5lYWNoKGZ1bmN0aW9uKCl7IC8vIElFIDkgRml4XHJcblx0XHRcdGlmKCQodGhpcykuYXR0cignbXV0ZWQnKSE9PXVuZGVmaW5lZCl7XHJcblx0XHRcdFx0dGhpcy5tdXRlZD10cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdCRjb250ZXh0LmZpbmQoJy5vcGVuLW92ZXJsYXktd2luZG93JykuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgJG92ZXJsYXkgPSAkKCR0aGlzLmRhdGEoJ292ZXJsYXktd2luZG93JykpO1xyXG5cdFx0XHR2YXIgb3ZlcmxheVdpbmRvdyA9IG5ldyBPdmVybGF5V2luZG93KCRvdmVybGF5KTtcclxuXHRcdFx0JHRoaXMuY2xpY2soZnVuY3Rpb24oZSl7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdG92ZXJsYXlXaW5kb3cuc2hvdygpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fSk7XHJcblx0XHRpZihpc1Bvb3JCcm93c2VyKXtcclxuXHRcdFx0JGNvbnRleHQuZmluZCgnLnRsdC1sb29wJykucmVtb3ZlKCk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0JGNvbnRleHQuZmluZCgnLnRleHRpbGxhdGUnKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0dmFyICR0bHQgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdCR0bHQudGV4dGlsbGF0ZShldmFsKCcoJyskdGx0LmRhdGEoJ3RleHRpbGxhdGUtb3B0aW9ucycpKycpJykpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gdW53aWRnZXRzKCRjb250ZXh0KXtcclxuXHRcdG5ldyBTbGlkZXJzKCRjb250ZXh0LCB0cnVlKTtcclxuXHRcdCRjb250ZXh0LmZpbmQoJy5wbGF5ZXInKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBpbmQgPSAkKHRoaXMpLmRhdGEoJ3BsYXllci1pbmQnKTtcclxuXHRcdFx0bWUucGxheWVyc1tpbmRdLnBhdXNlKCk7XHJcblx0XHRcdG1lLnBsYXllcnMuc3BsaWNlKGluZCwgMSk7XHJcblx0XHR9KVxyXG5cdH1cclxuXHRmdW5jdGlvbiBuYXZpZ2F0ZShocmVmLCBoYXNoLCBlLCAkZWxlbSkge1xyXG5cdFx0dmFyIGhyZWZCSCA9IGhhc2ggPyBocmVmLnJlcGxhY2UobmV3IFJlZ0V4cChoYXNoKyckJyksICcnKSA6IGhyZWY7XHJcblx0XHRpZihsb2NhdGlvbiA9PT0gaHJlZkJIICYmIGhhc2ggJiYgaGFzaC5pbmRleE9mKFwiIVwiKSA9PT0gLTEpe1xyXG5cdFx0XHR2YXIgJGNvbnRlbnQgPSAkKGhhc2gpO1xyXG5cdFx0XHRpZiAoZSkge1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZigkY29udGVudC5sZW5ndGggPiAwKXtcclxuXHRcdFx0XHR2YXIgb2Zmc2V0ID0gJGNvbnRlbnQub2Zmc2V0KCkudG9wIC0gbWUudG9wTmF2LnN0YXRlMkg7XHJcblx0XHRcdFx0dmFyIHRuID0gJGNvbnRlbnQuZ2V0KDApLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuXHRcdFx0XHRpZih0biA9PT0gJ2gxJyB8fCB0biA9PT0gJ2gyJyB8fCB0biA9PT0gJ2gzJyB8fCB0biA9PT0gJ2g0JyB8fCB0biA9PT0gJ2g1JyB8fCB0biA9PT0gJ2g2Jyl7XHJcblx0XHRcdFx0XHRvZmZzZXQgLT0gMjA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChvZmZzZXQgPCAwKSBvZmZzZXQgPSAwO1xyXG5cdFx0XHRcdHRvb2xzLnNjcm9sbFRvKG9mZnNldCk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRvb2xzLnNjcm9sbFRvKDApO1xyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZSBpZihlICYmIChocmVmICE9PSBsb2NhdGlvbisnIycpKXtcclxuXHRcdFx0aWYoISRlbGVtLmF0dHIoJ3RhcmdldCcpKXtcclxuXHRcdFx0XHR2YXIgcGFnZVRyYW5zaXRpb24gPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0bWUudG9wTmF2LnN0YXRlMSgpO1xyXG5cdFx0XHRcdFx0bG9hZGluZy5nYXRlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbiA9IGhyZWY7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYoJGVsZW0uaGFzQ2xhc3MoJ3BhZ2UtdHJhbnNpdGlvbicpKXtcclxuXHRcdFx0XHRcdHBhZ2VUcmFuc2l0aW9uKCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHQkcGFnZVRyYW5zaXRpb24uZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHR2YXIgY29udGFpbmVyID0gJCh0aGlzKS5nZXQoMCk7XHJcblx0XHRcdFx0XHRcdGlmKCQuY29udGFpbnMoY29udGFpbmVyLCAkZWxlbVswXSkpe1xyXG5cdFx0XHRcdFx0XHRcdHBhZ2VUcmFuc2l0aW9uKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiBjYWxjTmF2aWdhdGlvbkxpbmtUcmlnZ2Vycygpe1xyXG5cdFx0dmFyIHdoID0gJHdpbmRvdy5oZWlnaHQoKTtcclxuXHRcdHZhciB0cmlnZ2VyRGVsdGEgPSB3aC8zO1xyXG5cdFx0c2VjdGlvblRyaWdnZXJzID0gW107XHJcblx0XHQkc2VjdGlvbnMuZWFjaChmdW5jdGlvbihpKXtcclxuXHRcdFx0dmFyICRzID0gJCh0aGlzKTtcclxuXHRcdFx0dmFyIGlkID0gJHMuYXR0cignaWQnKTtcclxuXHRcdFx0aWYoaWQpe1xyXG5cdFx0XHRcdHNlY3Rpb25UcmlnZ2Vycy5wdXNoKHtoYXNoOiAnIycraWQsIHRyaWdnZXJPZmZzZXQ6ICRzLmRhdGEoJ3Bvc2l0aW9uJyktdHJpZ2dlckRlbHRhfSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0dHJpZ05hdmlnYXRpb25MaW5rcyh0b29scy53aW5kb3dZT2Zmc2V0KCkpO1xyXG5cdH1cclxuXHRmdW5jdGlvbiB0cmlnTmF2aWdhdGlvbkxpbmtzKHdpbmRvd1RvcFBvcyl7XHJcblx0XHR2YXIgYWN0aXZlU2VjdGlvbkhhc2g7XHJcblx0XHRmb3IodmFyIGk9MDsgaTxzZWN0aW9uVHJpZ2dlcnMubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHRpZihzZWN0aW9uVHJpZ2dlcnNbaV0udHJpZ2dlck9mZnNldDx3aW5kb3dUb3BQb3Mpe1xyXG5cdFx0XHRcdGFjdGl2ZVNlY3Rpb25IYXNoID0gc2VjdGlvblRyaWdnZXJzW2ldLmhhc2g7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGFjdGl2ZVNlY3Rpb25IYXNoIT1sYXN0QWN0aXZlU2VjdGlvbkhhc2gpe1xyXG5cdFx0XHR2YXIgc2VjdGlvbkxpbmsgPSBsb2NhdGlvbiArIGFjdGl2ZVNlY3Rpb25IYXNoO1xyXG5cdFx0XHRsYXN0QWN0aXZlU2VjdGlvbkhhc2ggPSBhY3RpdmVTZWN0aW9uSGFzaDtcclxuXHRcdFx0JG5hdkxpbmtzLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR2YXIgJGEgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdGlmKHRoaXMuaHJlZiA9PT0gc2VjdGlvbkxpbmspe1xyXG5cdFx0XHRcdFx0JGEuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0XHRcdFx0JGEucmVtb3ZlQ2xhc3MoJ3RhcmdldCcpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0JGEucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdGFwcC5jaGFuZ2VTZWN0aW9uKG1lLCBhY3RpdmVTZWN0aW9uSGFzaCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGJ1aWxkU2l6ZXMoKXtcclxuXHRcdGFwcC5idWlsZFNpemVzKG1lKTtcclxuXHRcdG1heFNjcm9sbFBvc2l0aW9uID0gJCgnYm9keScpLmhlaWdodCgpIC0gJHdpbmRvdy5oZWlnaHQoKTtcclxuXHRcdGZvcih2YXIgaT0wOyBpPG1lLnBsYXllcnMubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHR2YXIgJHYgPSBtZS5wbGF5ZXJzW2ldLiR2aWV3O1xyXG5cdFx0XHQkdi5kYXRhKCdwb3NpdGlvbicsICR2Lm9mZnNldCgpLnRvcCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHZhciBhbmltRW5kID0gZnVuY3Rpb24oZWxlbXMsIGVuZCwgbW9kZXJuLCBjYWxsYmFjaywgdGltZSl7XHJcblx0XHR2YXIgYWRkaXRpb25UaW1lID0gMTAwO1xyXG5cdFx0dmFyIGRlZmF1bHRUaW1lID0gMTAwMDtcclxuXHRcdHJldHVybiBlbGVtcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgZWxlbSA9IHRoaXM7XHJcblx0XHRcdGlmIChtb2Rlcm4gJiYgIWlzQW5kcm9pZDQzbWludXMpIHtcclxuXHRcdFx0XHR2YXIgZG9uZSA9IGZhbHNlO1xyXG5cdFx0XHRcdCQoZWxlbSkuYmluZChlbmQsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0ZG9uZSA9IHRydWU7XHJcblx0XHRcdFx0XHQkKGVsZW0pLnVuYmluZChlbmQpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrLmNhbGwoZWxlbSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0aWYodGltZSA+PSAwIHx8IHRpbWUgPT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0XHR2YXIgd1RpbWUgPSB0aW1lID09PSB1bmRlZmluZWQgPyAxMDAwIDogZGVmYXVsdFRpbWUgKyBhZGRpdGlvblRpbWU7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdGlmKCFkb25lKXtcclxuXHRcdFx0XHRcdFx0XHQkKGVsZW0pLnVuYmluZChlbmQpO1xyXG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoZWxlbSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0sIHdUaW1lKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0Y2FsbGJhY2suY2FsbChlbGVtKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdCQuZm4uYW5pbWF0aW9uRW5kID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRpbWUpIHtcclxuXHRcdHJldHVybiBhbmltRW5kKHRoaXMsIHRvb2xzLmFuaW1hdGlvbkVuZCwgTW9kZXJuaXpyLmNzc2FuaW1hdGlvbnMsIGNhbGxiYWNrLCB0aW1lKTtcclxuXHR9O1xyXG5cdCQuZm4udHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aW1lKSB7XHJcblx0XHRyZXR1cm4gYW5pbUVuZCh0aGlzLCB0b29scy50cmFuc2l0aW9uRW5kLCBNb2Rlcm5penIuY3NzdHJhbnNpdGlvbnMsIGNhbGxiYWNrLCB0aW1lKTtcclxuXHR9O1xyXG5cdCQuZm4uc3RvcFRyYW5zaXRpb24gPSBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuY3NzKHtcclxuXHRcdFx0Jy13ZWJraXQtdHJhbnNpdGlvbic6ICdub25lJyxcclxuXHRcdFx0Jy1tb3otdHJhbnNpdGlvbic6ICdub25lJyxcclxuXHRcdFx0Jy1tcy10cmFuc2l0aW9uJzogJ25vbmUnLFxyXG5cdFx0XHQnLW8tdHJhbnNpdGlvbic6ICdub25lJyxcclxuXHRcdFx0J3RyYW5zaXRpb24nOiAgJ25vbmUnXHJcblx0XHR9KTtcclxuXHR9XHJcblx0JC5mbi5jbGVhblRyYW5zaXRpb24gPSBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuY3NzKHtcclxuXHRcdFx0Jy13ZWJraXQtdHJhbnNpdGlvbic6ICcnLFxyXG5cdFx0XHQnLW1vei10cmFuc2l0aW9uJzogJycsXHJcblx0XHRcdCctbXMtdHJhbnNpdGlvbic6ICcnLFxyXG5cdFx0XHQnLW8tdHJhbnNpdGlvbic6ICcnLFxyXG5cdFx0XHQndHJhbnNpdGlvbic6ICAnJ1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdCQuZm4ubm9uVHJhbnNpdGlvbiA9ICBmdW5jdGlvbihjc3MpIHtcclxuXHRcdHJldHVybiB0aGlzLnN0b3BUcmFuc2l0aW9uKCkuY3NzKGNzcykuY2xlYW5UcmFuc2l0aW9uKCk7XHJcblx0fTtcclxuXHQkLmZuLnRyYW5zZm9ybSA9ICBmdW5jdGlvbihzdHIsIG9yaWdpbikge1xyXG5cdFx0cmV0dXJuIHRoaXMuY3NzKHRvb2xzLnRyYW5zZm9ybUNzcyhzdHIsIG9yaWdpbikpO1xyXG5cdH07XHJcblx0JCgndmlkZW8nKS5lYWNoKGZ1bmN0aW9uKCl7IC8vIElFIDkgRml4XHJcblx0XHRpZigkKHRoaXMpLmF0dHIoJ211dGVkJykhPT11bmRlZmluZWQpe1xyXG5cdFx0XHR0aGlzLm11dGVkPXRydWU7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0bmV3IEN1c3RvbWl6ZShtZSk7XHJcbn0pKCk7fSk7IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyAoZnVuY3Rpb24oKXtcclxuXHR2YXIgbWUgPSB0aGlzO1xyXG5cdHZhciBzY3JpcHQgPSByZXF1aXJlKCcuLi9zY3JpcHQuanMnKTtcclxuXHR2YXIgaXNBbmRyb2lkQnJvd3NlcjRfM21pbnVzID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdhbmRyb2lkLWJyb3dzZXItNF8zbWludXMnKTtcclxuXHR0aGlzLmFuaW1hdGlvbkVuZCA9ICdhbmltYXRpb25lbmQgd2Via2l0QW5pbWF0aW9uRW5kIG9BbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQnO1xyXG5cdHRoaXMudHJhbnNpdGlvbkVuZCA9ICd0cmFuc2l0aW9uZW5kIHdlYmtpdFRyYW5zaXRpb25FbmQgb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQnO1xyXG5cdHRoaXMudHJhbnNpdGlvbiA9IFsnLXdlYmtpdC10cmFuc2l0aW9uJywgJy1tb3otdHJhbnNpdGlvbicsICctbXMtdHJhbnNpdGlvbicsICctby10cmFuc2l0aW9uJywgJ3RyYW5zaXRpb24nXTtcclxuXHR0aGlzLnRyYW5zZm9ybSA9IFtcIi13ZWJraXQtdHJhbnNmb3JtXCIsIFwiLW1vei10cmFuc2Zvcm1cIiwgXCItbXMtdHJhbnNmb3JtXCIsIFwiLW8tdHJhbnNmb3JtXCIsIFwidHJhbnNmb3JtXCJdO1xyXG5cdHRoaXMucHJvcGVydHkgPSBmdW5jdGlvbihrZXlzLCB2YWx1ZSwgb2JqKXtcclxuXHRcdHZhciByZXMgPSBvYmogPyBvYmogOiB7fTtcclxuXHRcdGZvcih2YXIgaT0wOyBpPGtleXMubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHRyZXNba2V5c1tpXV09dmFsdWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzO1xyXG5cdH1cclxuXHR0aGlzLndpbmRvd1lPZmZzZXQgPSBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHdpbmRvdy5wYWdlWU9mZnNldCAhPSBudWxsID8gd2luZG93LnBhZ2VZT2Zmc2V0IDogKGRvY3VtZW50LmNvbXBhdE1vZGUgPT09IFwiQ1NTMUNvbXBhdFwiID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA6IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wKTtcclxuXHR9XHJcblx0dGhpcy5nZXRVcmxQYXJhbWV0ZXIgPSBmdW5jdGlvbihzUGFyYW0pe1xyXG5cdFx0dmFyIHNQYWdlVVJMID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSk7XHJcblx0XHR2YXIgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCcmJyk7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNVUkxWYXJpYWJsZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0dmFyIHNQYXJhbWV0ZXJOYW1lID0gc1VSTFZhcmlhYmxlc1tpXS5zcGxpdCgnPScpO1xyXG5cdFx0XHRpZiAoc1BhcmFtZXRlck5hbWVbMF0gPT0gc1BhcmFtKSB7XHJcblx0XHRcdFx0cmV0dXJuIGRlY29kZVVSSShzUGFyYW1ldGVyTmFtZVsxXSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5zZWxlY3RUZXh0YXJlYSA9IGZ1bmN0aW9uKCRlbCl7XHJcblx0XHQkZWwuZm9jdXMoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XHJcblx0XHRcdCR0aGlzLnNlbGVjdCgpO1xyXG5cdFx0XHQvLyBXb3JrIGFyb3VuZCBDaHJvbWUncyBsaXR0bGUgcHJvYmxlbVxyXG5cdFx0XHQkdGhpcy5tb3VzZXVwKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdC8vIFByZXZlbnQgZnVydGhlciBtb3VzZXVwIGludGVydmVudGlvblxyXG5cdFx0XHRcdCR0aGlzLnVuYmluZChcIm1vdXNldXBcIik7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHR2YXIgdGltZXI7XHJcblx0dGhpcy50aW1lID0gZnVuY3Rpb24obGFiZWwpe1xyXG5cdFx0aWYoIXRpbWVyKXtcclxuXHRcdFx0dGltZXIgPSBEYXRlLm5vdygpO1xyXG5cdFx0XHRjb25zb2xlLmxvZygnPT09PSBUaW1lciBzdGFydGVkJysobGFiZWwgPyAnIHwgJytsYWJlbCA6ICcnKSlcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR2YXIgdCA9IERhdGUubm93KCk7XHJcblx0XHRcdGNvbnNvbGUubG9nKCc9PT09ICcrKHQtdGltZXIpKycgbXMnKyhsYWJlbCA/ICcgfCAnK2xhYmVsIDogJycpKTtcclxuXHRcdFx0dGltZXIgPSB0O1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLnNjcm9sbFRvID0gZnVuY3Rpb24gKHksIGNhbGxiYWNrLCB0aW1lKSB7XHJcblx0XHRpZih0aW1lID09PSB1bmRlZmluZWQpIHRpbWUgPSAxMjAwO1xyXG5cdFx0bmV3IFRXRUVOLlR3ZWVuKHt5OiBtZS53aW5kb3dZT2Zmc2V0KCl9KVxyXG5cdFx0XHQudG8oe3k6IE1hdGgucm91bmQoeSl9LCB0aW1lKVxyXG5cdFx0XHQub25VcGRhdGUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHQvLyR3LnNjcm9sbFRvcCh0aGlzLnkpO1xyXG5cdFx0XHRcdHdpbmRvdy5zY3JvbGxUbygwLCB0aGlzLnkpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuZWFzaW5nKFRXRUVOLkVhc2luZy5RdWFkcmF0aWMuSW5PdXQpXHJcblx0XHRcdC5vbkNvbXBsZXRlKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRpZihjYWxsYmFjayl7XHJcblx0XHRcdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXJ0KCk7XHJcblx0fVxyXG5cdHRoaXMuYW5kcm9pZFN0eWxlc0ZpeCA9IGZ1bmN0aW9uKCRxKXtcclxuXHRcdGlmKGlzQW5kcm9pZEJyb3dzZXI0XzNtaW51cyl7XHJcblx0XHRcdCRxLmhpZGUoKTtcclxuXHRcdFx0JHEuZ2V0KDApLm9mZnNldEhlaWdodDtcclxuXHRcdFx0JHEuc2hvdygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLnRyYW5zZm9ybUNzcyA9IGZ1bmN0aW9uKHN0ciwgb3JpZ2luKXtcclxuXHRcdHZhciByZXMgPSB7XHJcblx0XHRcdCctd2Via2l0LXRyYW5zZm9ybSc6IHN0cixcclxuXHRcdFx0Jy1tb3otdHJhbnNmb3JtJzogc3RyLFxyXG5cdFx0XHQnLW1zLXRyYW5zZm9ybSc6IHN0cixcclxuXHRcdFx0Jy1vLXRyYW5zZm9ybSc6IHN0cixcclxuXHRcdFx0J3RyYW5zZm9ybSc6ICBzdHJcclxuXHRcdH07XHJcblx0XHRpZihvcmlnaW4pe1xyXG5cdFx0XHRyZXNbJy13ZWJraXQtdHJhbnNmb3JtLW9yaWdpbiddID0gb3JpZ2luO1xyXG5cdFx0XHRyZXNbJy1tb3otdHJhbnNmb3JtLW9yaWdpbiddID0gb3JpZ2luO1xyXG5cdFx0XHRyZXNbJy1tcy10cmFuc2Zvcm0tb3JpZ2luJ10gPSBvcmlnaW47XHJcblx0XHRcdHJlc1snLW8tdHJhbnNmb3JtLW9yaWdpbiddID0gb3JpZ2luO1xyXG5cdFx0XHRyZXNbJ3RyYW5zZm9ybS1vcmlnaW4nXSA9IG9yaWdpbjtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXM7XHJcblx0fVxyXG59KSgpOyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGNvbnRleHQpIHtcblx0dmFyIGxvYWRpbmcgPSByZXF1aXJlKCcuL2xvYWRpbmcuanMnKTtcblx0dmFyICRnYXRlTG9hZGVyID0gJCgnLmdhdGUgLmxvYWRlcicpO1xuXHQkY29udGV4dC5maW5kKCcuYWpheC1mb3JtJykuZWFjaChmdW5jdGlvbigpIHtcblx0XHR2YXIgJGZybSA9ICQodGhpcyk7XG5cdFx0JGZybS5zdWJtaXQoZnVuY3Rpb24oZSkge1xuXHRcdFx0aWYoJGZybS5maW5kKCcuaGVscC1ibG9jayB1bCcpLmxlbmd0aCA8IDEpe1xuXHRcdFx0XHQkZ2F0ZUxvYWRlci5hZGRDbGFzcygnc2hvdycpO1xuXHRcdFx0XHRsb2FkaW5nLmdhdGUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyIG1lc3NhZ2UgPSBmdW5jdGlvbihtc2cpIHtcblx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJhamF4LWZvcm0tYWxlcnQgYWxlcnQgaGVhZGluZyBmYWRlIGluIHRleHQtY2VudGVyXCI+XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgZGF0YS1kaXNtaXNzPVwiYWxlcnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj7DlzwvYnV0dG9uPiAnICsgbXNnICsgJzwvZGl2PicpXG5cdFx0XHRcdFx0XHRcdFx0LmFkZENsYXNzKCRmcm0uZGF0YSgnbWVzc2FnZS1jbGFzcycpKS5hcHBlbmRUbygnYm9keScpO1xuXHRcdFx0XHRcdFx0bG9hZGluZy51bmdhdGUoKTtcblx0XHRcdFx0XHRcdCRnYXRlTG9hZGVyLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHRcdFx0dHlwZTogJGZybS5hdHRyKCdtZXRob2QnKSxcblx0XHRcdFx0XHRcdHVybDogJGZybS5hdHRyKCdhY3Rpb24nKSxcblx0XHRcdFx0XHRcdGRhdGE6ICRmcm0uc2VyaWFsaXplKCksXG5cdFx0XHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0XHRcdCRmcm1bMF0ucmVzZXQoKTtcblx0XHRcdFx0XHRcdFx0bWVzc2FnZShkYXRhKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oeGhyLCBzdHIpIHtcblx0XHRcdFx0XHRcdFx0bWVzc2FnZSgnRXJyb3I6ICcgKyB4aHIucmVzcG9uc2VDb2RlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGNvbnRleHQpe1xyXG5cdHZhciB0aGVtZXMgPSByZXF1aXJlKCcuLi9hcHAvdGhlbWVzLmpzJyk7XHJcblx0JGNvbnRleHQuZmluZCgnLmNoYW5nZS1jb2xvcnMnKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgJGdyb3VwID0gJCh0aGlzKTtcclxuXHRcdHZhciAkdGFyZ2V0ID0gJCgkZ3JvdXAuZGF0YSgndGFyZ2V0JykpO1xyXG5cdFx0dmFyICRsaW5rcyA9ICRncm91cC5maW5kKCdhJyk7XHJcblx0XHR2YXIgY3VycmVudENvbG9ycztcclxuXHRcdGZvcih2YXIgaT0wOyBpPHRoZW1lcy5jb2xvcnM7IGkrKyl7XHJcblx0XHRcdHZhciBjb2xvcnMgPSAnY29sb3JzLScrU3RyaW5nLmZyb21DaGFyQ29kZSg2NStpKS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHRpZigkdGFyZ2V0Lmhhc0NsYXNzKGNvbG9ycykpe1xyXG5cdFx0XHRcdGN1cnJlbnRDb2xvcnMgPSBjb2xvcnM7XHJcblx0XHRcdFx0JGxpbmtzLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdHZhciAkZWwgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdFx0aWYoJGVsLmRhdGEoJ2NvbG9ycycpID09PSBjdXJyZW50Q29sb3JzKXtcclxuXHRcdFx0XHRcdFx0JGVsLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQkbGlua3MuY2xpY2soZnVuY3Rpb24oZSl7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0dmFyICRsaW5rID0gJCh0aGlzKTtcclxuXHRcdFx0JHRhcmdldC5yZW1vdmVDbGFzcyhjdXJyZW50Q29sb3JzKTtcclxuXHRcdFx0Y3VycmVudENvbG9ycyA9ICRsaW5rLmRhdGEoJ2NvbG9ycycpO1xyXG5cdFx0XHQkdGFyZ2V0LmFkZENsYXNzKGN1cnJlbnRDb2xvcnMpO1xyXG5cdFx0XHQkbGlua3MucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0XHQkbGluay5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGNvbnRleHQsIHNjcmlwdCl7XHJcblx0dmFyIGlzUG9vckJyb3dzZXIgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ3Bvb3ItYnJvd3NlcicpO1xyXG5cdGlmKGlzUG9vckJyb3dzZXIpIHJldHVybjtcclxuXHQkY29udGV4dC5maW5kKCcuY291bnRlciAuY291bnQnKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG5cdFx0dmFyIGNvdW50ID0gcGFyc2VJbnQoJHRoaXMudGV4dCgpKTtcclxuXHRcdHZhciBjbnQgPSB7bjogMH1cclxuXHRcdHZhciB0dyA9IG5ldyBUV0VFTi5Ud2VlbihjbnQpXHJcblx0XHRcdC50byh7bjogY291bnR9LCAxMDAwKVxyXG5cdFx0XHQub25VcGRhdGUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHQkdGhpcy50ZXh0KE1hdGgucm91bmQodGhpcy5uKSk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5lYXNpbmcoVFdFRU4uRWFzaW5nLlF1YXJ0aWMuSW5PdXQpO1xyXG5cdFx0dmFyIHBhdXNlID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0dHcuc3RvcCgpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHJlc3VtZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdGNudC5uID0gMDtcclxuXHRcdFx0dHcuc3RhcnQoKTtcclxuXHRcdH1cclxuXHRcdHZhciBzdGFydCA9IHJlc3VtZTtcclxuXHRcdHNjcmlwdC5wbGF5ZXJzLmFkZFBsYXllcigkdGhpcywgc3RhcnQsIHBhdXNlLCByZXN1bWUpO1xyXG5cdH0pO1xyXG59OyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgKGZ1bmN0aW9uKCl7XHJcblx0dmFyIGlzTW9iaWxlID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKTtcclxuXHR2YXIgJHNlYyA9ICQoJ2JvZHk+c2VjdGlvbltpZF0nKTtcclxuXHR2YXIgJGxua3M7XHJcblx0aWYoIWlzTW9iaWxlICYmICRzZWMubGVuZ3RoPjEpe1xyXG5cdFx0dmFyICR1bCA9ICQoJyNkb3Qtc2Nyb2xsJyk7XHJcblx0XHQkc2VjLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0JHVsLmFwcGVuZCgnPGxpPjxhIGhyZWY9XCIjJyskKHRoaXMpLmF0dHIoJ2lkJykrJ1wiPjxzcGFuPjwvc3Bhbj48L2E+PC9saT4nKTtcclxuXHRcdH0pO1xyXG5cdFx0JGxua3MgPSAkdWwuZmluZCgnYScpO1xyXG5cdH1lbHNle1xyXG5cdFx0JGxua3MgPSBqUXVlcnkoKTtcclxuXHR9XHJcblx0dGhpcy5saW5rcyA9IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gJGxua3M7XHJcblx0fVxyXG59KSgpOyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgKGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zZXR1cCA9IGZ1bmN0aW9uKCRjb250ZXh0KXtcclxuXHRcdCRjb250ZXh0LmZpbmQoJy5mbHVpZCAqJykuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyICRlbCA9ICQodGhpcyk7XHJcblx0XHRcdHZhciAkd3JhcCA9ICRlbC5wYXJlbnQoJy5mbHVpZCcpO1xyXG5cdFx0XHR2YXIgbmV3V2lkdGggPSAkd3JhcC53aWR0aCgpO1xyXG5cdFx0XHR2YXIgYXIgPSAkZWwuYXR0cignZGF0YS1hc3BlY3QtcmF0aW8nKTtcclxuXHRcdFx0aWYoIWFyKXtcclxuXHRcdFx0XHRhciA9IHRoaXMuaGVpZ2h0IC8gdGhpcy53aWR0aDtcclxuXHRcdFx0XHQkZWxcclxuXHRcdFx0XHRcdC8vIGpRdWVyeSAuZGF0YSBkb2VzIG5vdCB3b3JrIG9uIG9iamVjdC9lbWJlZCBlbGVtZW50c1xyXG5cdFx0XHRcdFx0LmF0dHIoJ2RhdGEtYXNwZWN0LXJhdGlvJywgYXIpXHJcblx0XHRcdFx0XHQucmVtb3ZlQXR0cignaGVpZ2h0JylcclxuXHRcdFx0XHRcdC5yZW1vdmVBdHRyKCd3aWR0aCcpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhciBuZXdIZWlnaHQgPSBNYXRoLnJvdW5kKG5ld1dpZHRoICogYXIpO1xyXG5cdFx0XHQkZWwud2lkdGgoTWF0aC5yb3VuZChuZXdXaWR0aCkpLmhlaWdodChuZXdIZWlnaHQpO1xyXG5cdFx0XHQkd3JhcC5oZWlnaHQobmV3SGVpZ2h0KTtcclxuXHRcdH0pO1xyXG5cdH07XHJcbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9uQm9keUhlaWdodFJlc2l6ZSwgd2lkZ2V0cywgdW53aWRnZXRzKXtcclxuXHR2YXIgdG9vbHMgPSByZXF1aXJlKCcuLi90b29scy90b29scy5qcycpO1xyXG5cdHZhciBPdmVybGF5V2luZG93ID0gcmVxdWlyZSgnLi9vdmVybGF5LXdpbmRvdy5qcycpO1xyXG5cdHZhciAkdG9wTmF2ID0gJCgnI3RvcC1uYXYnKTtcclxuXHQkKCcuZ2FsbGVyeScpLmVhY2goZnVuY3Rpb24oaSl7XHJcblx0XHR2YXIgJGdhbGxlcnkgPSAkKHRoaXMpO1xyXG5cdFx0dmFyICRvdmVybGF5ID0gJCgkZ2FsbGVyeS5kYXRhKCdvdmVybGF5JykpO1xyXG5cdFx0dmFyIG92ZXJsYXlXaW5kb3cgPSBuZXcgT3ZlcmxheVdpbmRvdygkb3ZlcmxheSwgd2lkZ2V0cywgdW53aWRnZXRzKTtcclxuXHRcdHZhciAkb3ZlcmxheU5leHQgPSAkb3ZlcmxheS5maW5kKCcubmV4dCcpO1xyXG5cdFx0dmFyICRvdmVybGF5UHJldmlvcyA9ICRvdmVybGF5LmZpbmQoJy5wcmV2aW9zJyk7XHJcblx0XHR2YXIgJG92ZXJsYXlDbG9zZSA9ICRvdmVybGF5LmZpbmQoJy5jcm9zcycpO1xyXG5cdFx0dmFyIGlzRmlsdGVyID0gZmFsc2U7XHJcblx0XHR2YXIgZGVmYXVsdEdyb3VwID0gJGdhbGxlcnkuZGF0YSgnZGVmYXVsdC1ncm91cCcpID8gJGdhbGxlcnkuZGF0YSgnZGVmYXVsdC1ncm91cCcpIDogJ2FsbCc7XHJcblx0XHR2YXIgaXNOb25GaXJzdExheW91dCA9IGZhbHNlO1xyXG5cdFx0aWYoIWRlZmF1bHRHcm91cCkgZGVmYXVsdEdyb3VwID0gJ2FsbCc7XHJcblx0XHR2YXIgJGdyaWQgPSAkZ2FsbGVyeS5maW5kKCcuZ3JpZCcpXHJcblx0XHRcdC5zaHVmZmxlKHtcclxuXHRcdFx0XHRncm91cDogZGVmYXVsdEdyb3VwLFxyXG5cdFx0XHRcdHNwZWVkOiA1MDBcclxuXHRcdFx0fSlcclxuXHRcdFx0Lm9uKCdmaWx0ZXIuc2h1ZmZsZScsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGlzRmlsdGVyID0gdHJ1ZTtcclxuXHRcdFx0fSlcclxuXHRcdFx0Lm9uKCdsYXlvdXQuc2h1ZmZsZScsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGlmKGlzTm9uRmlyc3RMYXlvdXQpe1xyXG5cdFx0XHRcdFx0b25Cb2R5SGVpZ2h0UmVzaXplKHRydWUpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0b25Cb2R5SGVpZ2h0UmVzaXplKCk7XHJcblx0XHRcdFx0XHRpc05vbkZpcnN0TGF5b3V0ID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5vbignZmlsdGVyZWQuc2h1ZmZsZScsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGlmKGlzRmlsdGVyKXtcclxuXHRcdFx0XHRcdGlzRmlsdGVyID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdHZhciAkYnRucyA9ICRnYWxsZXJ5LmZpbmQoJy5maWx0ZXIgYScpO1xyXG5cdFx0dmFyICRpdGVtVmlldyA9ICRnYWxsZXJ5LmZpbmQoJy5pdGVtLXZpZXcnKTtcclxuXHRcdHZhciAkYWxsID0gJGdhbGxlcnkuZmluZCgnLmZpbHRlciBhW2RhdGEtZ3JvdXA9YWxsXScpO1xyXG5cdFx0dmFyICRpdGVtcyA9ICRncmlkLmZpbmQoJy5pdGVtJyk7XHJcblx0XHR2YXIgY3VycmVudEdyb3VwID0gZGVmYXVsdEdyb3VwO1xyXG5cdFx0dmFyICRjdXJyZW50SXRlbTtcclxuXHRcdCRnYWxsZXJ5LmZpbmQoJy5maWx0ZXIgYVtkYXRhLWdyb3VwPScrZGVmYXVsdEdyb3VwKyddJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0JGl0ZW1zLmFkZENsYXNzKCdvbicpO1xyXG5cdFx0JG92ZXJsYXlDbG9zZS5jbGljayhmdW5jdGlvbihlKXtcclxuXHRcdFx0JGN1cnJlbnRJdGVtID0gZmFsc2U7XHJcblx0XHR9KTtcclxuXHRcdCRidG5zLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGlmKGlzRmlsdGVyKSByZXR1cm47XHJcblx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XHJcblx0XHRcdHZhciBpc0FjdGl2ZSA9ICR0aGlzLmhhc0NsYXNzKCAnYWN0aXZlJyApO1xyXG5cdFx0XHR2YXJcdGdyb3VwID0gaXNBY3RpdmUgPyAnYWxsJyA6ICR0aGlzLmRhdGEoJ2dyb3VwJyk7XHJcblx0XHRcdGlmKGN1cnJlbnRHcm91cCAhPT0gZ3JvdXApe1xyXG5cdFx0XHRcdGN1cnJlbnRHcm91cCA9IGdyb3VwO1xyXG5cdFx0XHRcdCRidG5zLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0XHRpZighaXNBY3RpdmUpe1xyXG5cdFx0XHRcdFx0JHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0JGFsbC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCRncmlkLnNodWZmbGUoICdzaHVmZmxlJywgZ3JvdXAgKTtcclxuXHRcdFx0XHQkaXRlbXMuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0dmFyICRpID0gJCh0aGlzKTtcclxuXHRcdFx0XHRcdHZhciBmaWx0ZXIgPSBldmFsKCRpLmRhdGEoJ2dyb3VwcycpKTtcclxuXHRcdFx0XHRcdGlmKCBncm91cCA9PSAnYWxsJyB8fCAkLmluQXJyYXkoZ3JvdXAsIGZpbHRlcikhPS0xICl7XHJcblx0XHRcdFx0XHRcdCRpLmFkZENsYXNzKCdvbicpO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdCRpLnJlbW92ZUNsYXNzKCdvbicpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdCRpdGVtcy5jbGljayhmdW5jdGlvbihlKXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRvcGVuSXRlbSgkKHRoaXMpKTtcclxuXHRcdH0pO1xyXG5cdFx0ZnVuY3Rpb24gb3Blbkl0ZW0oJGl0ZW0pe1xyXG5cdFx0XHQkY3VycmVudEl0ZW0gPSAkaXRlbTtcclxuXHRcdFx0dmFyIHVybCA9ICRpdGVtLmNoaWxkcmVuKCdhJylbMF0uaGFzaC5yZXBsYWNlKCcjIScsJycpO1xyXG5cdFx0XHRvdmVybGF5V2luZG93LnNob3codXJsICsnIC5pdGVtLWNvbnRlbnQnKTtcclxuXHRcdH1cclxuXHRcdCRvdmVybGF5TmV4dC5jbGljayhmdW5jdGlvbihlKXtcclxuXHRcdFx0aWYoISRjdXJyZW50SXRlbSl7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0dmFyICRpID0gJGN1cnJlbnRJdGVtLm5leHRBbGwoJy5vbicpLmZpcnN0KCk7XHJcblx0XHRcdGlmKCRpLmxlbmd0aDwxKXtcclxuXHRcdFx0XHQkaSA9ICRpdGVtcy5maWx0ZXIoJy5vbicpLmZpcnN0KCk7XHJcblx0XHRcdH1cclxuXHRcdFx0b3Blbkl0ZW0oJGkpO1xyXG5cdFx0fSk7XHJcblx0XHQkb3ZlcmxheVByZXZpb3MuY2xpY2soZnVuY3Rpb24oZSl7XHJcblx0XHRcdGlmKCEkY3VycmVudEl0ZW0pe1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHZhciAkaSA9ICRjdXJyZW50SXRlbS5wcmV2QWxsKCcub24nKS5maXJzdCgpO1xyXG5cdFx0XHRpZigkaS5sZW5ndGg8MSl7XHJcblx0XHRcdFx0JGkgPSAkaXRlbXMuZmlsdGVyKCcub24nKS5sYXN0KCk7XHJcblx0XHRcdH1cclxuXHRcdFx0b3Blbkl0ZW0oJGkpO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyAoZnVuY3Rpb24oKXtcclxuXHR2YXIgdG9vbHMgPSByZXF1aXJlKCcuLi90b29scy90b29scy5qcycpO1xyXG5cdHZhciAkZ2F0ZSA9ICQoJy5nYXRlJyk7XHJcblx0dmFyICRnYXRlQmFyID0gJGdhdGUuZmluZCgnLmdhdGUtYmFyJyk7XHJcblx0dmFyICRnYXRlTG9hZGVyID0gJGdhdGUuZmluZCgnLmxvYWRlcicpO1xyXG5cdHZhciBpc0FuZHJvaWRCcm93c2VyNF8zbWludXMgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ2FuZHJvaWQtYnJvd3Nlci00XzNtaW51cycpO1xyXG5cdHZhciBtZSA9IHRoaXM7XHJcblx0dGhpcy5xdWV1ZSA9IFtdO1xyXG5cdHRoaXMubG9hZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcclxuXHRcdHZhciB1cmxzID0gW107XHJcblx0XHR2YXIgJGV4Y2wgPSAkKCcubm9uLXByZWxvYWRpbmcsIC5ub24tcHJlbG9hZGluZyBpbWcnKTtcclxuXHRcdCQoJyo6dmlzaWJsZTpub3Qoc2NyaXB0KScpLm5vdCgkZXhjbCkuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHR2YXIgJGVsID0gJCh0aGlzKTtcclxuXHRcdFx0dmFyIG5hbWUgPSAkZWxbMF0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcclxuXHRcdFx0dmFyIGJJbWcgPSAkZWwuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiKTtcclxuXHRcdFx0dmFyIHNyYyA9ICRlbC5hdHRyKCdzcmMnKTtcclxuXHRcdFx0dmFyIGZ1bmMgPSAkZWwuZGF0YSgnbG9hZGluZycpO1xyXG5cdFx0XHRpZihmdW5jKXtcclxuXHRcdFx0XHR1cmxzLnB1c2goZnVuYyk7XHJcblx0XHRcdH1lbHNlIGlmKG5hbWUgPT09ICdpbWcnICYmIHNyYyAmJiAkLmluQXJyYXkoc3JjLCB1cmxzKSA9PT0gLTEpe1xyXG5cdFx0XHRcdHVybHMucHVzaChzcmMpO1xyXG5cdFx0XHR9ZWxzZSBpZiAoYkltZyAhPSAnbm9uZScpe1xyXG5cdFx0XHRcdHZhciBtdXJsID0gYkltZy5tYXRjaCgvdXJsXFwoWydcIl0/KFteJ1wiKV0qKS9pKTtcclxuXHRcdFx0XHRpZihtdXJsICYmIG11cmwubGVuZ3RoPjEgJiYgJC5pbkFycmF5KG11cmxbMV0sIHVybHMpID09PSAtMSl7XHJcblx0XHRcdFx0XHR1cmxzLnB1c2gobXVybFsxXSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHZhciBsb2FkZWQgPSAwO1xyXG5cdFx0aWYodXJscy5sZW5ndGggPT09IDApe1xyXG5cdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdCRnYXRlTG9hZGVyLmFkZENsYXNzKCdzaG93Jyk7XHJcblx0XHRcdHZhciB3YXRlclBlcmMgPSAwO1xyXG5cdFx0XHR2YXIgZG9uZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0bG9hZGVkKys7XHJcblx0XHRcdFx0d2F0ZXJQZXJjID0gbG9hZGVkL3VybHMubGVuZ3RoICogMTAwO1xyXG5cdFx0XHRcdCRnYXRlQmFyLmNzcyh7d2lkdGg6IHdhdGVyUGVyYysnJSd9KTtcclxuXHRcdFx0XHQvLyRnYXRlQ291bnQuaHRtbChNYXRoLmNlaWwod2F0ZXJQZXJjKSk7XHJcblx0XHRcdFx0aWYobG9hZGVkID09PSB1cmxzLmxlbmd0aCl7XHJcblx0XHRcdFx0XHRpZigkZ2F0ZS5sZW5ndGg8MSl7XHJcblx0XHRcdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0JGdhdGVMb2FkZXIudHJhbnNpdGlvbkVuZChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdCRnYXRlTG9hZGVyLnJlbW92ZUNsYXNzKCdoaWRlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdFx0XHRcdH0sIDIwMCkuYWRkQ2xhc3MoJ2hpZGVkJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Zm9yKHZhciBpPTA7IGk8dXJscy5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdFx0aWYodHlwZW9mKHVybHNbaV0pID09ICdmdW5jdGlvbicpe1xyXG5cdFx0XHRcdFx0dXJsc1tpXShkb25lKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuXHRcdFx0XHRcdCQoaW1nKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpe21lLnF1ZXVlLnB1c2goZG9uZSl9KTtcclxuXHRcdFx0XHRcdGltZy5zcmMgPSB1cmxzW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLmdhdGUgPSBmdW5jdGlvbihjYWxsYmFjayl7XHJcblx0XHQvLyRnYXRlQ291bnQuaHRtbCgnMCcpO1xyXG5cdFx0JGdhdGVCYXIuY3NzKHt3aWR0aDogJzAlJ30pO1xyXG5cdFx0JGdhdGUudHJhbnNpdGlvbkVuZChmdW5jdGlvbigpe1xyXG5cdFx0XHRpZihjYWxsYmFjayl7XHJcblx0XHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdFx0fVxyXG5cdFx0fSkuY3NzKHtvcGFjaXR5OiAxLCB2aXNpYmlsaXR5OiAndmlzaWJsZSd9KTtcclxuXHR9XHJcblx0dGhpcy51bmdhdGUgPSBmdW5jdGlvbihjYWxsYmFjayl7XHJcblx0XHQkZ2F0ZS50cmFuc2l0aW9uRW5kKGZ1bmN0aW9uKCl7XHJcblx0XHRcdGlmKGlzQW5kcm9pZEJyb3dzZXI0XzNtaW51cyl7XHJcblx0XHRcdFx0dG9vbHMuYW5kcm9pZFN0eWxlc0ZpeCgkKCdib2R5JykpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGNhbGxiYWNrKXtcclxuXHRcdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0XHR9XHJcblx0XHR9KS5jc3Moe29wYWNpdHk6IDAsIHZpc2liaWxpdHk6ICdoaWRkZW4nfSk7XHJcblx0fTtcclxufSkoKTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGNvbnRleHQpe1xyXG5cdHZhciB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzL3Rvb2xzLmpzJyk7XHJcblx0dmFyIE92ZXJsYXlXaW5kb3cgPSByZXF1aXJlKCcuL292ZXJsYXktd2luZG93LmpzJyk7XHJcblx0aWYodHlwZW9mKGdvb2dsZSkgPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuO1xyXG5cdCRjb250ZXh0LmZpbmQoJy5tYXAtb3BlbicpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdHZhciAkbWFwT3BlbiA9ICQodGhpcyk7XHJcblx0XHR2YXIgJG92ZXJsYXkgPSAkKCRtYXBPcGVuLmRhdGEoJ21hcC1vdmVybGF5JykpO1xyXG5cdFx0dmFyICRtYXBDYW52YXMgPSAkb3ZlcmxheS5maW5kKCcubWFwLWNhbnZhcycpO1xyXG5cdFx0dmFyIG1hcE9wdGlvbnMgPSB7XHJcblx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZygkbWFwQ2FudmFzLmRhdGEoJ2xhdGl0dWRlJyksICRtYXBDYW52YXMuZGF0YSgnbG9uZ2l0dWRlJykpLFxyXG5cdFx0XHR6b29tOiAkbWFwQ2FudmFzLmRhdGEoJ3pvb20nKSxcclxuXHRcdFx0bWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUFxyXG5cdFx0fVxyXG5cdFx0dmFyIG1hcmtlcnMgPSBbXTtcclxuXHRcdCRtYXBDYW52YXMuZmluZCgnLm1hcC1tYXJrZXInKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciAkbWFya2VyID0gJCh0aGlzKTtcclxuXHRcdFx0bWFya2Vycy5wdXNoKHtcclxuXHRcdFx0XHRsYXRpdHVkZTogJG1hcmtlci5kYXRhKCdsYXRpdHVkZScpLFxyXG5cdFx0XHRcdGxvbmdpdHVkZTogJG1hcmtlci5kYXRhKCdsb25naXR1ZGUnKSxcclxuXHRcdFx0XHR0ZXh0OiAkbWFya2VyLmRhdGEoJ3RleHQnKVxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdFx0JG1hcENhbnZhcy5hZGRDbGFzcygnY2xvc2UtbWFwJykud3JhcCgnPGRpdiBjbGFzcz1cIm1hcC12aWV3XCI+PC9kaXY+Jyk7XHJcblx0XHR2YXIgJG1hcFZpZXcgPSAkbWFwQ2FudmFzLnBhcmVudCgpO1xyXG5cdFx0dmFyIG92ZXJsYXlXaW5kb3cgPSBuZXcgT3ZlcmxheVdpbmRvdygkb3ZlcmxheSwgZmFsc2UsIGZhbHNlLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRuZXcgVFdFRU4uVHdlZW4oe2F1dG9BbHBoYTogMX0pXHJcblx0XHRcdFx0XHQudG8oe2F1dG9BbHBoYTogMH0sIDUwMClcclxuXHRcdFx0XHRcdC5vblVwZGF0ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHQkbWFwVmlldy5jc3Moe29wYWNpdHk6IHRoaXMuYXV0b0FscGhhLCB2aXNpYmlsaXR5OiAodGhpcy5hdXRvQWxwaGEgPiAwID8gJ3Zpc2libGUnIDogJ2hpZGRlbicpfSk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LmVhc2luZyhUV0VFTi5FYXNpbmcuTGluZWFyLk5vbmUpXHJcblx0XHRcdFx0XHQuc3RhcnQoKTtcclxuXHRcdH0pO1xyXG5cdFx0dmFyIGlzSW5pdGVkID0gZmFsc2U7XHJcblx0XHQkbWFwT3Blbi5jbGljayhmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRvdmVybGF5V2luZG93LnNob3coZmFsc2UsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGlmICghaXNJbml0ZWQpIHtcclxuXHRcdFx0XHRcdGlzSW5pdGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCRtYXBDYW52YXNbMF0sIG1hcE9wdGlvbnMpO1xyXG5cdFx0XHRcdFx0dmFyIGFkZExpc3RlbmVyID0gZnVuY3Rpb24obWFya2VyLCB0ZXh0KSB7XHJcblx0XHRcdFx0XHRcdHZhciBpbmZvd2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coe1xyXG5cdFx0XHRcdFx0XHRcdGNvbnRlbnQ6IHRleHRcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRpbmZvd2luZG93Lm9wZW4obWFwLCBtYXJrZXIpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHR2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdFx0XHRcdFx0bWFwOiBtYXAsXHJcblx0XHRcdFx0XHRcdFx0cG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobWFya2Vyc1tpXS5sYXRpdHVkZSwgbWFya2Vyc1tpXS5sb25naXR1ZGUpXHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHR2YXIgdGV4dCA9IG1hcmtlcnNbaV0udGV4dDtcclxuXHRcdFx0XHRcdFx0aWYgKHRleHQpIHtcclxuXHRcdFx0XHRcdFx0XHRhZGRMaXN0ZW5lcihtYXJrZXIsIHRleHQpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHZhciAkb2MgPSAkb3ZlcmxheS5maW5kKCcub3ZlcmxheS1jb250cm9sJyk7XHJcblx0XHRcdFx0JG1hcFZpZXcuY3NzKHtoZWlnaHQ6ICgkKHdpbmRvdykuaGVpZ2h0KCkgLSAkb2MuaGVpZ2h0KCkpICsgJ3B4J30pO1xyXG5cdFx0XHRcdG5ldyBUV0VFTi5Ud2Vlbih7YXV0b0FscGhhOiAwfSlcclxuXHRcdFx0XHRcdC50byh7YXV0b0FscGhhOiAxfSwgNTAwKVxyXG5cdFx0XHRcdFx0Lm9uVXBkYXRlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdCRtYXBWaWV3LmNzcyh7b3BhY2l0eTogdGhpcy5hdXRvQWxwaGEsIHZpc2liaWxpdHk6ICh0aGlzLmF1dG9BbHBoYSA+IDAgPyAndmlzaWJsZScgOiAnaGlkZGVuJyl9KTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQuZWFzaW5nKFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZSlcclxuXHRcdFx0XHRcdC5zdGFydCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXHR2YXIgJHRvZ2dsZSA9ICQoJy5tZW51LXRvZ2dsZScpO1xuXHQkdG9nZ2xlLmNsaWNrKGZ1bmN0aW9uKGUpe1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR2YXIgJHRnID0gJCh0aGlzKTtcblx0XHRpZigkdGcuaGFzQ2xhc3MoJ2V4dC1uYXYtdG9nZ2xlJykpe1xuXHRcdFx0dmFyIHRhcmdldFEgPSAkdGcuZGF0YSgndGFyZ2V0Jyk7XG5cdFx0XHR2YXIgJGV4dE5hdiA9ICQodGFyZ2V0USk7XG5cdFx0XHR2YXIgJGNsaWNrRWxzID0gJCh0YXJnZXRRKycsI3RvcC1uYXYgYTpub3QoLm1lbnUtdG9nZ2xlKSwucGFnZS1ib3JkZXIgYScpO1xuXHRcdFx0dmFyIGNsaWNrSG5kID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRleHROYXYucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblx0XHRcdFx0JHRnLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdCQoJ2JvZHknKS5yZW1vdmVDbGFzcygnZXh0LW5hdi1zaG93Jyk7XG5cdFx0XHRcdCQoJ2h0bWwsIGJvZHknKS5jc3Moe292ZXJmbG93OiAnJywgcG9zaXRpb246ICcnfSk7XG5cdFx0XHRcdCRjbGlja0Vscy51bmJpbmQoJ2NsaWNrJywgY2xpY2tIbmQpO1xuXHRcdFx0fVxuXHRcdFx0aWYoJHRnLmhhc0NsYXNzKCdzaG93Jykpe1xuXHRcdFx0XHQkZXh0TmF2LnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdCR0Zy5yZW1vdmVDbGFzcygnc2hvdycpO1xuXHRcdFx0XHQkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2V4dC1uYXYtc2hvdycpO1xuXHRcdFx0XHQkY2xpY2tFbHMudW5iaW5kKCdjbGljaycsIGNsaWNrSG5kKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHQkZXh0TmF2LmFkZENsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdCR0Zy5hZGRDbGFzcygnc2hvdycpO1xuXHRcdFx0XHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4dC1uYXYtc2hvdycpO1xuXHRcdFx0XHQkY2xpY2tFbHMuYmluZCgnY2xpY2snLCBjbGlja0huZCk7XG5cdFx0XHR9XG5cdFx0fWVsc2V7XG5cdFx0XHRpZigkdGcuaGFzQ2xhc3MoJ3Nob3cnKSl7XG5cdFx0XHRcdCR0Zy5yZW1vdmVDbGFzcygnc2hvdycpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdCR0Zy5hZGRDbGFzcygnc2hvdycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59OyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJG92ZXJsYXksIHdpZGdldHMsIHVud2lkZ2V0cywgaGlkZUZ1bmMpe1xuXHR2YXIgJG92ZXJsYXlDbG9zZSA9ICRvdmVybGF5LmZpbmQoJy5jcm9zcycpO1xuXHR2YXIgJG92ZXJsYXlab29tID0gJCgkb3ZlcmxheS5kYXRhKCdvdmVybGF5LXpvb20nKSk7XG5cdHZhciAkb3ZlcmxheVZpZXcgPSAkb3ZlcmxheS5maW5kKCcub3ZlcmxheS12aWV3Jyk7XG5cdHZhciAkb3ZlcmxheUNsb3NlID0gJG92ZXJsYXkuZmluZCgnLmNyb3NzJyk7XG5cdHZhciBtZSA9IHRoaXM7XG5cdHRoaXMuc2hvdyA9IGZ1bmN0aW9uKGxvYWQsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIG9wZW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdCRvdmVybGF5Wm9vbS5hZGRDbGFzcygnb3ZlcmxheS16b29tJyk7XG5cdFx0XHQkb3ZlcmxheS50cmFuc2l0aW9uRW5kKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmIChsb2FkKSB7XG5cdFx0XHRcdFx0dmFyICRsb2FkZXIgPSAkb3ZlcmxheS5maW5kKCcubG9hZGVyJyk7XG5cdFx0XHRcdFx0dmFyICRsb2FkZWRDb250ZW50ID0gJCgnPGRpdiBjbGFzcz1cImxvYWRlZC1jb250ZW50XCI+PC9kaXY+Jyk7XG5cdFx0XHRcdFx0JGxvYWRlci5hZGRDbGFzcygnc2hvdycpO1xuXHRcdFx0XHRcdCRsb2FkZWRDb250ZW50LmFkZENsYXNzKCdjb250ZW50LWNvbnRhaW5lcicpLmFwcGVuZFRvKCRvdmVybGF5Vmlldyk7XG5cdFx0XHRcdFx0JGxvYWRlZENvbnRlbnQubG9hZChsb2FkLCBmdW5jdGlvbih4aHIsIHN0YXR1c1RleHQsIHJlcXVlc3QpIHtcblx0XHRcdFx0XHRcdGlmIChzdGF0dXNUZXh0ICE9PSBcInN1Y2Nlc3NcIiAmJiBzdGF0dXNUZXh0ICE9PSBcIm5vdG1vZGlmaWVkXCIpIHtcblx0XHRcdFx0XHRcdFx0JGxvYWRlZENvbnRlbnQudGV4dChzdGF0dXNUZXh0KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dmFyICRpbWFnZXMgPSAkbG9hZGVkQ29udGVudC5maW5kKCdpbWcnKTtcblx0XHRcdFx0XHRcdHZhciBuaW1hZ2VzID0gJGltYWdlcy5sZW5ndGg7XG5cdFx0XHRcdFx0XHRpZiAobmltYWdlcyA+IDApIHtcblx0XHRcdFx0XHRcdFx0JGltYWdlcy5sb2FkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdG5pbWFnZXMtLTtcblx0XHRcdFx0XHRcdFx0XHRpZiAobmltYWdlcyA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0c2hvdygpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRzaG93KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRmdW5jdGlvbiBzaG93KCkge1xuXHRcdFx0XHRcdFx0XHRpZih3aWRnZXRzKXtcblx0XHRcdFx0XHRcdFx0XHR3aWRnZXRzKCRsb2FkZWRDb250ZW50KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQkbG9hZGVkQ29udGVudC5hZGRDbGFzcygnc2hvdycpO1xuXHRcdFx0XHRcdFx0XHQkbG9hZGVyLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdFx0XHRcdGlmKGNhbGxiYWNrKXtcblx0XHRcdFx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdGlmKGNhbGxiYWNrKXtcblx0XHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KS5hZGRDbGFzcygnc2hvdycpO1xuXHRcdH07XG5cdFx0aWYgKCRvdmVybGF5Lmhhc0NsYXNzKCdzaG93JykpIHtcblx0XHRcdG1lLmhpZGUob3Blbik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9wZW4oKTtcblx0XHR9XG5cdH1cblx0dGhpcy5oaWRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHQkb3ZlcmxheVpvb20ucmVtb3ZlQ2xhc3MoJ292ZXJsYXktem9vbScpO1xuXHRcdCRvdmVybGF5LnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdHZhciAkbG9hZGVkQ29udGVudCA9ICRvdmVybGF5LmZpbmQoJy5sb2FkZWQtY29udGVudCcpO1xuXHRcdFx0aWYoJGxvYWRlZENvbnRlbnQubGVuZ3RoPjApe1xuXHRcdFx0XHRpZih1bndpZGdldHMpe1xuXHRcdFx0XHRcdHVud2lkZ2V0cygkbG9hZGVkQ29udGVudCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0c3RvcElmcmFtZUJlZm9yZVJlbW92ZSgkbG9hZGVkQ29udGVudCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0JGxvYWRlZENvbnRlbnQucmVtb3ZlKCk7XG5cdFx0XHRcdFx0aWYoaGlkZUZ1bmMpe1xuXHRcdFx0XHRcdFx0aGlkZUZ1bmMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGNhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0aWYoaGlkZUZ1bmMpe1xuXHRcdFx0XHRcdGhpZGVGdW5jKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGNhbGxiYWNrKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sIDUwMCk7XG5cdH1cblx0ZnVuY3Rpb24gc3RvcElmcmFtZUJlZm9yZVJlbW92ZSgkY29udGV4dCwgY2FsbGJhY2spIHtcblx0XHR2YXIgaXNEb1N0b3AgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ2llOScpXG5cdFx0XHRcdHx8ICQoJ2h0bWwnKS5oYXNDbGFzcygnaWUxMCcpO1xuXHRcdGlmIChpc0RvU3RvcCkge1xuXHRcdFx0JGNvbnRleHQuZmluZCgnaWZyYW1lJykuYXR0cignc3JjJywgJycpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdH0sIDMwMCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXHR9XG5cdCRvdmVybGF5Q2xvc2UuY2xpY2soZnVuY3Rpb24oZSl7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdG1lLmhpZGUoKTtcblx0fSk7XG59OyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkY29udGV4dCwgc2NyaXB0KXtcclxuXHQkY29udGV4dC5maW5kKCcuc2hvdy1saXN0JykuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0JCh0aGlzKS53cmFwSW5uZXIoJzxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+PC9kaXY+JykudGV4dGlsbGF0ZSh7XHJcblx0XHRcdGxvb3A6dHJ1ZSxcclxuXHRcdFx0aW46e2VmZmVjdDonZmFkZUluUmlnaHQnLCByZXZlcnNlOnRydWV9LFxyXG5cdFx0XHRvdXQ6e2VmZmVjdDonZmFkZU91dExlZnQnLCBzZXF1ZW5jZTp0cnVlfSxcclxuXHRcdFx0c2VsZWN0b3I6Jy53cmFwcGVyJ1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRjb250ZXh0LCBzY3JpcHQpe1xyXG5cdHZhciBpc1Bvb3JCcm93c2VyID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdwb29yLWJyb3dzZXInKTtcclxuXHQkY29udGV4dC5maW5kKCcuc2tpbGxiYXInKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpXHJcblx0XHR2YXIgJGJhciA9ICR0aGlzLmZpbmQoJy5za2lsbGJhci1iYXInKTtcclxuXHRcdHZhciBwZXJjID0gIHBhcnNlSW50KCR0aGlzLmF0dHIoJ2RhdGEtcGVyY2VudCcpLnJlcGxhY2UoJyUnLCcnKSk7XHJcblx0XHRpZihpc1Bvb3JCcm93c2VyKXtcclxuXHRcdFx0JGJhci5jc3Moe3dpZHRoOiBwZXJjKyclJ30pO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHZhciB3ID0ge3dpZHRoOiAwfVxyXG5cdFx0XHR2YXIgdHcgPSBuZXcgVFdFRU4uVHdlZW4odylcclxuXHRcdFx0XHQudG8oe3dpZHRoOiBwZXJjfSwgMTAwMClcclxuXHRcdFx0XHQub25VcGRhdGUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdCRiYXIuY3NzKHt3aWR0aDogdGhpcy53aWR0aCsnJSd9KTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC5lYXNpbmcoVFdFRU4uRWFzaW5nLlF1YXJ0aWMuT3V0KTtcclxuXHRcdFx0dmFyIHBhdXNlID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR0dy5zdG9wKCk7XHJcblx0XHRcdH07XHJcblx0XHRcdHZhciByZXN1bWUgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHcud2lkdGggPSAwO1xyXG5cdFx0XHRcdHR3LnN0YXJ0KCk7XHJcblx0XHRcdH07XHJcblx0XHRcdHZhciBzdGFydCA9IHJlc3VtZTtcclxuXHRcdFx0c2NyaXB0LnBsYXllcnMuYWRkUGxheWVyKCR0aGlzLCBzdGFydCwgcGF1c2UsIHJlc3VtZSk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRjb250ZXh0LCBpc1JlbW92ZWQpe1xyXG5cdGlmKGlzUmVtb3ZlZCl7XHJcblx0XHQkY29udGV4dC5maW5kKFwiLmNhcm91c2VsLCAuc2xpZGVyXCIpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0JCh0aGlzKS5zbGljaygndW5zbGljaycpO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdHZhciB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzL3Rvb2xzLmpzJyk7XHJcblx0JGNvbnRleHQuZmluZChcIi5zbGlkZXJcIikuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0dmFyICR0aGlzID0gJCh0aGlzKVxyXG5cdFx0JHRoaXMuc2xpY2soe1xyXG5cdFx0XHRhdXRvcGxheTogdHJ1ZSxcclxuXHRcdFx0ZG90czogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fSk7XHJcblx0JGNvbnRleHQuZmluZChcIi5jYXJvdXNlbFwiKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpXHJcblx0XHQkdGhpcy5zbGljayh7XHJcblx0XHRcdGF1dG9wbGF5OiBmYWxzZSxcclxuXHRcdFx0ZG90czogdHJ1ZSxcclxuXHRcdFx0aW5maW5pdGU6IHRydWUsXHJcblx0XHRcdHNsaWRlc1RvU2hvdzogMyxcclxuXHRcdFx0c2xpZGVzVG9TY3JvbGw6IDMsXHJcblx0XHRcdHJlc3BvbnNpdmU6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRicmVha3BvaW50OiAxMDAwLFxyXG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcclxuXHRcdFx0XHRcdFx0ZG90czogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0c2xpZGVzVG9TaG93OiAyLFxyXG5cdFx0XHRcdFx0XHRzbGlkZXNUb1Njcm9sbDogMlxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0YnJlYWtwb2ludDogNDgwLFxyXG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcclxuXHRcdFx0XHRcdFx0ZG90czogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0c2xpZGVzVG9TaG93OiAxLFxyXG5cdFx0XHRcdFx0XHRzbGlkZXNUb1Njcm9sbDogMVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XVxyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn0iLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzL3Rvb2xzLmpzJyk7XG5cdHZhciAkdG9wTmF2ID0gICQoJyN0b3AtbmF2Jyk7XG5cdHZhciAkYm9keSA9ICQoJ2JvZHknKTtcblx0dmFyIGlzVG9wTmF2ID0gJHRvcE5hdi5sZW5ndGggPiAwO1xuXHR2YXIgJHRvcE1lbnVOYXYgPSAgJHRvcE5hdi5maW5kKCcubmF2YmFyLWNvbGxhcHNlJyk7XG5cdHZhciB1cHBlckggPSAyMDtcblx0dmFyIGJpZ1RvcE5hdiA9IGlzVG9wTmF2ID8gODkgOiAwO1xuXHR2YXIgc21hbGxUb3BOYXYgPSBpc1RvcE5hdiA/IDQ5IDogMDtcblx0dmFyIHRoZW1lcyA9IHJlcXVpcmUoJy4uL2FwcC90aGVtZXMuanMnKTtcblx0dmFyIHRvcE5hdlN0YXRlMVRvcCA9IChmdW5jdGlvbigpe1xuXHRcdGlmKGlzVG9wTmF2KXtcblx0XHRcdHJldHVybiB1cHBlckg7XG5cdFx0fWVsc2V7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9XG5cdH0pKCk7XG5cdHZhciBpc1RvcE5hdlN0YXRlMSA9IGZhbHNlO1xuXHR2YXIgaXNUb3BOYXZTdGF0ZTIgPSBmYWxzZTtcblx0dmFyIG1lID0gdGhpcztcblx0dmFyIHN0YXRlMUNvbG9ycyA9ICR0b3BOYXYuZGF0YSgnc3RhdGUxLWNvbG9ycycpO1xuXHR2YXIgc3RhdGUyQ29sb3JzID0gJHRvcE5hdi5kYXRhKCdzdGF0ZTItY29sb3JzJyk7XG5cdHRoaXMuc3RhdGUxSCA9IGJpZ1RvcE5hdjtcblx0dGhpcy5zdGF0ZTJIID0gc21hbGxUb3BOYXY7XG5cdHRoaXMuc3RhdGUxVG9wID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRvcE5hdlN0YXRlMVRvcDsgfTtcblx0dGhpcy5zdGF0ZTEgPSBmdW5jdGlvbigpe1xuXHRcdGlmKGlzVG9wTmF2ICYmICFpc1RvcE5hdlN0YXRlMSl7XG5cdFx0XHQkYm9keS5yZW1vdmVDbGFzcygnc3RhdGUyJykuYWRkQ2xhc3MoJ3N0YXRlMScpO1xuXHRcdFx0aXNUb3BOYXZTdGF0ZTEgPSB0cnVlO1xuXHRcdFx0aXNUb3BOYXZTdGF0ZTIgPSBmYWxzZTtcblx0XHRcdHRvb2xzLmFuZHJvaWRTdHlsZXNGaXgoJHRvcE5hdik7XG5cdFx0fVxuXHR9O1xuXHR0aGlzLnN0YXRlMiA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYoaXNUb3BOYXYgJiYgIWlzVG9wTmF2U3RhdGUyKXtcblx0XHRcdCRib2R5LnJlbW92ZUNsYXNzKCdzdGF0ZTEnKS5hZGRDbGFzcygnc3RhdGUyJyk7XG5cdFx0XHRpc1RvcE5hdlN0YXRlMSA9IGZhbHNlO1xuXHRcdFx0aXNUb3BOYXZTdGF0ZTIgPSB0cnVlO1xuXHRcdFx0dG9vbHMuYW5kcm9pZFN0eWxlc0ZpeCgkdG9wTmF2KTtcblx0XHR9XG5cdH07XG5cdHRoaXMuJG1lbnUgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiAkdG9wTWVudU5hdjtcblx0fTtcblx0aWYoaXNUb3BOYXYpe1xuXHRcdG1lLnN0YXRlMSgpO1xuXHRcdCR0b3BNZW51TmF2LmZpbmQoJ2E6bm90KC5kcm9wZG93bi10b2dnbGUpJykuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRcdCR0b3BOYXYuZmluZCgnLm5hdmJhci1jb2xsYXBzZS5pbicpLmNvbGxhcHNlKCdoaWRlJyk7XG5cdFx0XHQkdG9wTmF2LmZpbmQoJy5tZW51LXRvZ2dsZS5uYXZiYXItdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblx0XHR9KTtcblx0XHQkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCl7XG5cdFx0XHQkdG9wTmF2LmZpbmQoJy5uYXZiYXItY29sbGFwc2UuaW4nKS5jb2xsYXBzZSgnaGlkZScpO1xuXHRcdFx0JHRvcE5hdi5maW5kKCcubWVudS10b2dnbGUubmF2YmFyLXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0fSk7XG5cdH1cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyICR2aWRlb0JncyA9ICQoXCIudmlkZW8tYmdcIik7XHJcblx0aWYoJHZpZGVvQmdzLmxlbmd0aCA8MSl7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdHZhciBpc1BsYXlWaWRlbyA9IChmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGlzTW9iaWxlID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKTtcclxuXHRcdHZhciB2PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XHJcblx0XHR2YXIgY2FuTVA0ID0gdi5jYW5QbGF5VHlwZSA/IHYuY2FuUGxheVR5cGUoJ3ZpZGVvL21wNCcpIDogZmFsc2U7XHJcblx0XHRyZXR1cm4gY2FuTVA0ICYmICFpc01vYmlsZTtcclxuXHR9KSgpO1xyXG5cdGlmKCAhaXNQbGF5VmlkZW8gKXtcclxuXHRcdCR2aWRlb0Jncy5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciAkdmlkZW9CZyA9ICQodGhpcyk7XHJcblx0XHRcdHZhciBhbHQgPSAkdmlkZW9CZy5kYXRhKCdhbHRlcm5hdGl2ZScpO1xyXG5cdFx0XHRpZihhbHQpe1xyXG5cdFx0XHRcdHZhciAkaW1nID0gJCgnPGltZyBhbHQgY2xhc3M9XCJiZ1wiIHNyYz1cIicrYWx0KydcIi8+Jyk7XHJcblx0XHRcdFx0JHZpZGVvQmcuYWZ0ZXIoJGltZykucmVtb3ZlKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHQkdmlkZW9CZ3MuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0dmFyICRkaXZCZyA9ICQodGhpcyk7XHJcblx0XHQkZGl2QmcuZGF0YSgnbG9hZGluZycsIGZ1bmN0aW9uKGRvbmUpe1xyXG5cdFx0XHR2YXIgJHZpZGVvQmcgPSAkKCc8dmlkZW8gY2xhc3M9XCJ2aWRlby1iZ1wiPjwvdmlkZW8+Jyk7XHJcblx0XHRcdGlmKCRkaXZCZy5kYXRhKCdtdXRlJyk9PT0neWVzJykgJHZpZGVvQmdbMF0ubXV0ZWQgPSB0cnVlO1xyXG5cdFx0XHR2YXIgdm9sID0gJGRpdkJnLmRhdGEoJ3ZvbHVtZScpO1xyXG5cdFx0XHRpZih2b2wgIT09IHVuZGVmaW5lZCkgJHZpZGVvQmdbMF0udm9sdW1lPSB2b2wvMTAwO1xyXG5cdFx0XHR2YXIgZG9Eb25lID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR2YXIgdncgPSAkdmlkZW9CZy53aWR0aCgpO1xyXG5cdFx0XHRcdHZhciB2aCA9ICR2aWRlb0JnLmhlaWdodCgpO1xyXG5cdFx0XHRcdHZhciB2ciA9IHZ3L3ZoO1xyXG5cdFx0XHRcdHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xyXG5cdFx0XHRcdHZhciByZXNpemUgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0dmFyIHd3ID0gJHdpbmRvdy53aWR0aCgpO1xyXG5cdFx0XHRcdFx0dmFyIHdoID0gJHdpbmRvdy5oZWlnaHQoKTtcclxuXHRcdFx0XHRcdHZhciB3ciA9IHd3L3doO1xyXG5cdFx0XHRcdFx0dmFyIHcsIGg7XHJcblx0XHRcdFx0XHRpZih2ciA+IHdyKXtcclxuXHRcdFx0XHRcdFx0aCA9IE1hdGguY2VpbCh3aCk7XHJcblx0XHRcdFx0XHRcdHcgPSBNYXRoLmNlaWwoaCAqIHZyKTtcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHR3ID0gTWF0aC5jZWlsKHd3KTtcclxuXHRcdFx0XHRcdFx0aCA9IE1hdGguY2VpbCh3IC8gdnIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0JHZpZGVvQmcuY3NzKHtcclxuXHRcdFx0XHRcdFx0d2lkdGg6ICB3KydweCcsXHJcblx0XHRcdFx0XHRcdGhlaWdodDogaCsncHgnLFxyXG5cdFx0XHRcdFx0XHR0b3A6IE1hdGgucm91bmQoKHdoIC0gaCkvMikrJ3B4JyxcclxuXHRcdFx0XHRcdFx0bGVmdDogTWF0aC5yb3VuZCgod3cgLSB3KS8yKSsncHgnXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdCR3aW5kb3cucmVzaXplKHJlc2l6ZSk7XHJcblx0XHRcdFx0cmVzaXplKCk7XHJcblx0XHRcdFx0JHZpZGVvQmdbMF0ucGxheSgpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0JHZpZGVvQmcub24oJ2VuZGVkJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR0aGlzLmN1cnJlbnRUaW1lID0gMDtcclxuXHRcdFx0XHR0aGlzLnBsYXkoKTtcclxuXHRcdFx0XHRpZih0aGlzLmVuZGVkKSB7XHJcblx0XHRcdFx0XHR0aGlzLmxvYWQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR2YXIgaXNOb3REb25lID0gdHJ1ZTtcclxuXHRcdFx0JHZpZGVvQmcub24oJ2NhbnBsYXl0aHJvdWdoJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRpZihpc05vdERvbmUpe1xyXG5cdFx0XHRcdFx0aXNOb3REb25lID0gZmFsc2U7XHJcblx0XHRcdFx0XHRkb0RvbmUoKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHRoaXMucGxheSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdCR2aWRlb0JnWzBdLnNyYyA9ICRkaXZCZy5kYXRhKCd2aWRlbycpO1xyXG5cdFx0XHQkdmlkZW9CZ1swXS5wcmVsb2FkPVwiYXV0b1wiO1xyXG5cdFx0XHQkZGl2QmcuYWZ0ZXIoJHZpZGVvQmcpO1xyXG5cdFx0XHQkZGl2QmcucmVtb3ZlKCk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgJHZpbWVvQmdzID0gJChcIi52aW1lby1iZ1wiKTtcclxuXHRpZigkdmltZW9CZ3MubGVuZ3RoIDwxKXtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0aWYoJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKSl7XHJcblx0XHQkdmltZW9CZ3MuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHR2YXIgJHZpbWVvQmcgPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgYWx0ID0gJHZpbWVvQmcuZGF0YSgnYWx0ZXJuYXRpdmUnKTtcclxuXHRcdFx0aWYoYWx0KXtcclxuXHRcdFx0XHR2YXIgJGltZyA9ICQoJzxpbWcgYWx0IGNsYXNzPVwiYmdcIiBzcmM9XCInK2FsdCsnXCIvPicpO1xyXG5cdFx0XHRcdCR2aW1lb0JnLmFmdGVyKCRpbWcpLnJlbW92ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0dmFyIGRvbmVzID0gW107XHJcblx0JHZpbWVvQmdzLmVhY2goZnVuY3Rpb24oaSl7XHJcblx0XHR2YXIgJHZpbWVvQmcgPSAkKHRoaXMpO1xyXG5cdFx0dmFyIGVsSWQgPSAkdmltZW9CZy5hdHRyKCdpZCcpO1xyXG5cdFx0aWYoIWVsSWQpIHtcclxuXHRcdFx0ZWxJZCA9ICd2aW1lby1iZy0nK2k7XHJcblx0XHRcdCR2aW1lb0JnLmF0dHIoJ2lkJywgZWxJZCk7XHJcblx0XHR9XHJcblx0XHQkdmltZW9CZy5kYXRhKCdsb2FkaW5nJywgZnVuY3Rpb24oZG9uZSl7XHJcblx0XHRcdGRvbmVzW2VsSWRdID0gZG9uZTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cdCQuZ2V0U2NyaXB0KCBcImh0dHBzOi8vZi52aW1lb2Nkbi5jb20vanMvZnJvb2dhbG9vcDIubWluLmpzXCIgKVxyXG5cdFx0LmRvbmUoZnVuY3Rpb24oIHNjcmlwdCwgdGV4dFN0YXR1cyApIHtcclxuXHRcdFx0JHZpbWVvQmdzLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR2YXIgJHZpbWVvQmdEaXYgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdHZhciBpZCA9ICR2aW1lb0JnRGl2LmF0dHIoJ2lkJyk7XHJcblx0XHRcdFx0dmFyIHZvbHVtZSA9IChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0dmFyIHIgPSAkdmltZW9CZ0Rpdi5kYXRhKCd2b2x1bWUnKTtcclxuXHRcdFx0XHRcdHJldHVybiByID09PSB1bmRlZmluZWQgPyAwIDogcjtcclxuXHRcdFx0XHR9KSgpO1xyXG5cdFx0XHRcdHZhciB2aWRlb0lkID0gJHZpbWVvQmdEaXYuZGF0YSgndmlkZW8nKTtcclxuXHRcdFx0XHR2YXIgJHZpbWVvQmcgPSAkKCc8aWZyYW1lIGNsYXNzPVwidmltZW8tYmdcIiBzcmM9XCJodHRwczovL3BsYXllci52aW1lby5jb20vdmlkZW8vJyt2aWRlb0lkKyc/YXBpPTEmYmFkZ2U9MCZieWxpbmU9MCZwb3J0cmFpdD0wJnRpdGxlPTAmYXV0b3BhdXNlPTAmcGxheWVyX2lkPScraWQrJyZsb29wPTFcIiBmcmFtZWJvcmRlcj1cIjBcIiB3ZWJraXRhbGxvd2Z1bGxzY3JlZW4gbW96YWxsb3dmdWxsc2NyZWVuIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT4nKTtcclxuXHRcdFx0XHQkdmltZW9CZ0Rpdi5hZnRlcigkdmltZW9CZyk7XHJcblx0XHRcdFx0JHZpbWVvQmdEaXYucmVtb3ZlKCk7XHJcblx0XHRcdFx0JHZpbWVvQmcuYXR0cignaWQnLCBpZCk7XHJcblx0XHRcdFx0dmFyIHBsYXllciA9ICRmKCR2aW1lb0JnWzBdKTtcclxuXHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3JlYWR5JywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIgcmVzaXplID0gZnVuY3Rpb24odlJhdGlvKXtcclxuXHRcdFx0XHRcdFx0dmFyIHdpbmRvd1cgPSAkKHdpbmRvdykud2lkdGgoKTtcclxuXHRcdFx0XHRcdFx0dmFyIHdpbmRvd0ggPSAkKHdpbmRvdykuaGVpZ2h0KCk7XHJcblx0XHRcdFx0XHRcdHZhciBpRnJhbWVXID0gJHZpbWVvQmcud2lkdGgoKTtcclxuXHRcdFx0XHRcdFx0dmFyIGlGcmFtZUggPSAkdmltZW9CZy5oZWlnaHQoKTtcclxuXHRcdFx0XHRcdFx0dmFyIGlmUmF0aW8gPSBpRnJhbWVXL2lGcmFtZUg7XHJcblx0XHRcdFx0XHRcdHZhciB3UmF0aW8gPSB3aW5kb3dXL3dpbmRvd0g7XHJcblx0XHRcdFx0XHRcdC8vdmFyIHZSYXRpbyA9IHJhdGlvID09PSB1bmRlZmluZWQgPyBpZlJhdGlvIDogZXZhbChyYXRpbyk7XHJcblx0XHRcdFx0XHRcdHZhciBzZXRTaXplID0gZnVuY3Rpb24odncsIHZoKXtcclxuXHRcdFx0XHRcdFx0XHR2YXIgaWZ3LCBpZmg7XHJcblx0XHRcdFx0XHRcdFx0aWYoaWZSYXRpbyA+IHZSYXRpbyl7XHJcblx0XHRcdFx0XHRcdFx0XHRpZmggPSBNYXRoLmNlaWwodmgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWZ3ID0gTWF0aC5jZWlsKGlmaCAqIGlmUmF0aW8pO1xyXG5cdFx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0aWZ3ID0gTWF0aC5jZWlsKHZ3KTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmaCA9IE1hdGguY2VpbChpZncgLyBpZlJhdGlvKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0JHZpbWVvQmcuY3NzKHtcclxuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOiAgaWZ3KydweCcsXHJcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6IGlmaCsncHgnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dG9wOiBNYXRoLnJvdW5kKCh3aW5kb3dIIC0gaWZoKS8yKSsncHgnLFxyXG5cdFx0XHRcdFx0XHRcdFx0bGVmdDogTWF0aC5yb3VuZCgod2luZG93VyAtIGlmdykvMikrJ3B4JyxcclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZih3UmF0aW8gPiB2UmF0aW8pe1xyXG5cdFx0XHRcdFx0XHRcdHZhciB2dyA9IHdpbmRvd1c7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHZoID0gdncvdlJhdGlvO1xyXG5cdFx0XHRcdFx0XHRcdHNldFNpemUodncsIHZoKTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHZoID0gd2luZG93SDtcclxuXHRcdFx0XHRcdFx0XHR2YXIgdncgPSB2aCAqIHZSYXRpbztcclxuXHRcdFx0XHRcdFx0XHRzZXRTaXplKHZ3LCB2aCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ2ZpbmlzaCcsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdHBsYXllci5hcGkoJ3BsYXknKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0dmFyIGlzTm90RG9uZSA9IHRydWU7XHJcblx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BsYXknLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRpZihpc05vdERvbmUpe1xyXG5cdFx0XHRcdFx0XHRcdGlzTm90RG9uZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdGRvbmVzW2lkXSgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdHBsYXllci5hcGkoJ3NldFZvbHVtZScsIHZvbHVtZSk7XHJcblx0XHRcdFx0XHRwbGF5ZXIuYXBpKCdnZXRWaWRlb1dpZHRoJywgZnVuY3Rpb24gKHZhbHVlLCBwbGF5ZXJfaWQpIHtcclxuXHRcdFx0XHRcdFx0dmFyIHcgPSB2YWx1ZVxyXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCdnZXRWaWRlb0hlaWdodCcsIGZ1bmN0aW9uICh2YWx1ZSwgcGxheWVyX2lkKSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGggPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgdlJhdGlvID0gdyAvIGg7XHJcblx0XHRcdFx0XHRcdFx0JCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpe3Jlc2l6ZSh2UmF0aW8pO30pO1xyXG5cdFx0XHRcdFx0XHRcdHJlc2l6ZSh2UmF0aW8pO1xyXG5cdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoJ3BsYXknKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KVxyXG5cdFx0LmZhaWwoZnVuY3Rpb24oIGpxeGhyLCBzZXR0aW5ncywgZXhjZXB0aW9uICkge1xyXG5cdFx0XHRjb25zb2xlLmxvZyggJ1RyaWdnZXJlZCBhamF4RXJyb3IgaGFuZGxlci4nICk7XHJcblx0XHR9KTtcclxufTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgJHlvdXR1YmVCZ3MgPSAkKFwiLnlvdXR1YmUtYmdcIik7XHJcblx0aWYoJHlvdXR1YmVCZ3MubGVuZ3RoIDwxKXtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0aWYoJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKSl7XHJcblx0XHQkeW91dHViZUJncy5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciAkeW91dHViZUJnID0gJCh0aGlzKTtcclxuXHRcdFx0dmFyIGFsdCA9ICR5b3V0dWJlQmcuZGF0YSgnYWx0ZXJuYXRpdmUnKTtcclxuXHRcdFx0aWYoYWx0KXtcclxuXHRcdFx0XHR2YXIgJGltZyA9ICQoJzxpbWcgYWx0IGNsYXNzPVwiYmdcIiBzcmM9XCInK2FsdCsnXCIvPicpO1xyXG5cdFx0XHRcdCR5b3V0dWJlQmcuYWZ0ZXIoJGltZykucmVtb3ZlKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHR2YXIgZG9uZXMgPSBbXTtcclxuXHQkeW91dHViZUJncy5lYWNoKGZ1bmN0aW9uKGkpe1xyXG5cdFx0dmFyICR5b3V0dWJlQmcgPSAkKHRoaXMpO1xyXG5cdFx0dmFyIGVsSWQgPSAkeW91dHViZUJnLmF0dHIoJ2lkJyk7XHJcblx0XHRpZighZWxJZCkge1xyXG5cdFx0XHRlbElkID0gJ3lvdXR1YmUtYmctJytpO1xyXG5cdFx0XHQkeW91dHViZUJnLmF0dHIoJ2lkJywgZWxJZCk7XHJcblx0XHR9XHJcblx0XHQkeW91dHViZUJnLmRhdGEoJ2xvYWRpbmcnLCBmdW5jdGlvbihkb25lKXtcclxuXHRcdFx0ZG9uZXNbZWxJZF0gPSBkb25lO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcblx0dmFyIHRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG5cdHRhZy5zcmMgPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2lmcmFtZV9hcGlcIjtcclxuXHR2YXIgZmlyc3RTY3JpcHRUYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XHJcblx0Zmlyc3RTY3JpcHRUYWcucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGFnLCBmaXJzdFNjcmlwdFRhZyk7XHJcblx0d2luZG93Lm9uWW91VHViZUlmcmFtZUFQSVJlYWR5ID0gZnVuY3Rpb24oKXtcclxuXHRcdCR5b3V0dWJlQmdzLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyICR5b3V0dWJlQmcgPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgdmlkZW9JZCA9ICR5b3V0dWJlQmcuZGF0YSgndmlkZW8nKTtcclxuXHRcdFx0dmFyIHZvbCA9ICR5b3V0dWJlQmcuZGF0YSgndm9sdW1lJyk7XHJcblx0XHRcdHZhciBtdXRlID0gJHlvdXR1YmVCZy5kYXRhKCdtdXRlJyk7XHJcblx0XHRcdHZhciBlbElkID0gJHlvdXR1YmVCZy5hdHRyKCdpZCcpO1xyXG5cdFx0XHR2YXIgaXNOb3REb25lID0gdHJ1ZTtcclxuXHRcdFx0dmFyIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIoZWxJZCwge1xyXG5cdFx0XHRcdHZpZGVvSWQ6IHZpZGVvSWQsXHJcblx0XHRcdFx0cGxheWVyVmFyczoge2h0bWw1OiAxLCBjb250cm9sczogMCwgJ3Nob3dpbmZvJzogMCwgJ21vZGVzdGJyYW5kaW5nJzogMSwgJ3JlbCc6IDAsICdhbGxvd2Z1bGxzY3JlZW4nOiB0cnVlLCAnaXZfbG9hZF9wb2xpY3knOiAzLCB3bW9kZTogJ3RyYW5zcGFyZW50JyB9LFxyXG5cdFx0XHRcdGV2ZW50czoge1xyXG5cdFx0XHRcdFx0b25SZWFkeTogZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0XHRcdFx0XHR2YXIgcmVzaXplID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0XHR2YXIgJGlGcmFtZSA9ICQoZXZlbnQudGFyZ2V0LmdldElmcmFtZSgpKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgd2luZG93VyA9ICQod2luZG93KS53aWR0aCgpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciB3aW5kb3dIID0gJCh3aW5kb3cpLmhlaWdodCgpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBpRnJhbWVXID0gJGlGcmFtZS53aWR0aCgpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBpRnJhbWVIID0gJGlGcmFtZS5oZWlnaHQoKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgaWZSYXRpbyA9IGlGcmFtZVcvaUZyYW1lSDtcclxuXHRcdFx0XHRcdFx0XHR2YXIgd1JhdGlvID0gd2luZG93Vy93aW5kb3dIO1xyXG5cdFx0XHRcdFx0XHRcdHZhciB2UmF0aW8gPSAoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciByID0gJHlvdXR1YmVCZy5kYXRhKCdyYXRpbycpO1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHIgPT09IHVuZGVmaW5lZCA/IGlmUmF0aW8gOiBldmFsKHIpO1xyXG5cdFx0XHRcdFx0XHRcdH0pKCk7IFxyXG5cdFx0XHRcdFx0XHRcdHZhciBzZXRTaXplID0gZnVuY3Rpb24odncsIHZoKXtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBpZncsIGlmaDtcclxuXHRcdFx0XHRcdFx0XHRcdGlmKGlmUmF0aW8gPiB2UmF0aW8pe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZmggPSBNYXRoLmNlaWwodmgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZncgPSBNYXRoLmNlaWwoaWZoICogaWZSYXRpbyk7XHJcblx0XHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdFx0aWZ3ID0gTWF0aC5jZWlsKHZ3KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0aWZoID0gTWF0aC5jZWlsKGlmdyAvIGlmUmF0aW8pO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0JGlGcmFtZS5jc3Moe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR3aWR0aDogIGlmdysncHgnLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6IGlmaCsncHgnLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR0b3A6IE1hdGgucm91bmQoKHdpbmRvd0ggLSBpZmgpLzIpKydweCcsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGxlZnQ6IE1hdGgucm91bmQoKHdpbmRvd1cgLSBpZncpLzIpKydweCcsXHJcblx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0aWYod1JhdGlvID4gdlJhdGlvKXtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciB2dyA9IHdpbmRvd1c7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgdmggPSB2dy92UmF0aW87XHJcblx0XHRcdFx0XHRcdFx0XHRzZXRTaXplKHZ3LCB2aCk7XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgdmggPSB3aW5kb3dIO1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIHZ3ID0gdmggKiB2UmF0aW87XHJcblx0XHRcdFx0XHRcdFx0XHRzZXRTaXplKHZ3LCB2aCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHQkKHdpbmRvdykucmVzaXplKHJlc2l6ZSk7XHJcblx0XHRcdFx0XHRcdHJlc2l6ZSgpO1xyXG5cdFx0XHRcdFx0XHRldmVudC50YXJnZXQuc2V0UGxheWJhY2tRdWFsaXR5KCdoaWdocmVzJyk7XHJcblx0XHRcdFx0XHRcdGlmKHZvbCAhPT0gdW5kZWZpbmVkKSBldmVudC50YXJnZXQuc2V0Vm9sdW1lKHZvbCk7XHJcblx0XHRcdFx0XHRcdGlmKG11dGUgPT09ICd5ZXMnIHx8IG11dGUgPT09IHVuZGVmaW5lZCkgZXZlbnQudGFyZ2V0Lm11dGUoKTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQudGFyZ2V0LnBsYXlWaWRlbygpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdG9uU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdFx0XHRcdFx0aWYoaXNOb3REb25lICYmIGV2ZW50LmRhdGEgPT09IFlULlBsYXllclN0YXRlLlBMQVlJTkcpe1xyXG5cdFx0XHRcdFx0XHRcdGlzTm90RG9uZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdChkb25lc1tlbElkXSkoKTtcclxuXHRcdFx0XHRcdFx0fWVsc2UgaWYoZXZlbnQuZGF0YSA9PT0gWVQuUGxheWVyU3RhdGUuRU5ERUQpe1xyXG5cdFx0XHRcdFx0XHRcdGV2ZW50LnRhcmdldC5wbGF5VmlkZW8oKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcdFxyXG5cdH07XHJcbn07Il19
;