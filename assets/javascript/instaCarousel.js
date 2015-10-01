(function () {
    "use strict";

    /**
     * Merge defaults with user options
     * @private
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     * @returns {Object} Merged values of defaults and options
     */
    var extendDefaults = function (defaults, options) {
        var property;
        for (var property in options) {
            if (options.hasOwnProperty(property)) {
                defaults[property] = options[property];
            }
        }
        return defaults;
    };


    var whichTransitionEvent = function(){
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
            'transition':'transitionend',
            'OTransition':'oTransitionEnd',
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        };

        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }
    };
    var interval;

    var MainCarousel = function () {
        var _this = this;
        var defaults = {
            slider: ".instaCarousel",
            mode: "fade",
            slideChangeDuration: 500,
            infiniteLoop: true,
            autoPlay: {enable: true, duration: 3000},
            userControl: true
        };

        if (arguments[0] && typeof arguments[0] === "object") {
            _this.options = extendDefaults(defaults, arguments[0]);
        }

        var elements = document.querySelectorAll(_this.options.slider);
        [].forEach.call(elements, function (carousel) {
            new Carousel(carousel, _this.options);
        });
    };

    //Single Slider instance
    var Carousel = function (slider, options) {
        var _this = this;

        _this.options = options
        _this.slider = slider;
        _this.currentSlideName = "currentSlide";
        _this.currentSlideIndex = 0;
        _this.cloneSlideName = "instaCarousel-clone";
        _this.slides;
        _this.slidesCount;
        _this.isAnimating = false;
        _this.transitionEvent = whichTransitionEvent();
        _this.init();
    };


    Carousel.prototype.init = function () {
        var _this = this;
        _this.setProps();

        _this.buildSlider();
        if (_this.options.mode === "fade") {
            _this.fadeEffect();
        }

    };

    //Build basic slider structure
    Carousel.prototype.buildSlider = function () {
        var _this = this;
        var sliderWrapper, parentElement, firstSlide;

            parentElement = _this.slider.parentNode;

            //Build slider wrapper
            sliderWrapper = document.createElement("div");
            sliderWrapper.className = "instaCarousel-wrapper";
            parentElement.replaceChild(sliderWrapper, _this.slider);
            sliderWrapper.appendChild(_this.slider);
            firstSlide = _this.slider.children[0];
            firstSlide.className = _this.currentSlideName;

            _this.slides = _this.slider.children;
            _this.slidesCount = _this.slides.length;
            //set proper class based on slides change mode
            switch (_this.options.mode) {
                case "fade":
                    _this.slider.className += " instaCarousel--fadeIn";
                    break;
                case "slide":
                    _this.slider.className += " instaCarousel--slide";
                    _this.cloneSlides(_this.slider);
                    _this.changeSlide(1);
                    var width = firstSlide.offsetWidth;
                    sliderWrapper.style.width = width + 'px';


                    break;
                default:
                    return false;
            }
            if (_this.options.userControl === true) {
                _this.buildNavigation(sliderWrapper);
            }

    };

    Carousel.prototype.cloneSlides = function () {
        var _this = this;
        var firstSlide, lastSlide;

        firstSlide = _this.slides[0];
        lastSlide = _this.slides[_this.slides.length - 1];

        var firstSlideClone = firstSlide.cloneNode(true);
        var lastSlideClone = lastSlide.cloneNode(true);

        firstSlideClone.className = _this.cloneSlideName;
        lastSlideClone.className = _this.cloneSlideName;

        _this.slider.insertBefore(lastSlideClone, firstSlide);
        _this.slider.appendChild(firstSlideClone);
    };

    Carousel.prototype.changeSlide = function (slideIndex) {
        var _this = this;
        //Assumption - All slides have the same width (set in css)
        var itemWidth =  _this.slider.children[0].offsetWidth;

        _this.isAnimating = true;
        _this.slider.style.transition = "all " + _this.options.slideChangeDuration/1000 + "s";
        _this.currentSlideIndex = slideIndex;
        _this.setCssSlideEffect(itemWidth * _this.currentSlideIndex);

        var onTransitionEndFn = function() {
            if (slideIndex > _this.slidesCount) {
                _this.currentSlideIndex = 1;
                _this.slider.style.transition = "all 0s";
                _this.setCssSlideEffect(itemWidth * _this.currentSlideIndex);
            } else if(slideIndex < 1) {
                _this.currentSlideIndex = _this.slidesCount;
                _this.slider.style.transition = "all 0s";
                _this.setCssSlideEffect(itemWidth * _this.currentSlideIndex);
            }
            _this.isAnimating = false;
            _this.slider.removeEventListener(_this.transitionEvent, onTransitionEndFn);
        };
        _this.slider.addEventListener(_this.transitionEvent, onTransitionEndFn);
    };


    Carousel.prototype.playContinously = function (buttonNext) {
        var _this = this;
        var transitionEvent = whichTransitionEvent();
       interval = setInterval(function () {
           //_this.isAnimating = false;
           //buttonNext.click();
        }, _this.options.autoPlay.duration);
    };

    Carousel.prototype.fadeEffect = function () {
        var _this = this;
        if (_this.cssTransitions) {

        }
    };

    Carousel.prototype.setCssSlideEffect = function (distance) {
        var _this =this;
        _this.slider.style.webkitTransform = 'translateX(' + (-distance) + 'px)';
        _this.slider.style.msTransform = 'translateX(' + (-distance) + 'px)';
        _this.slider.style.transform = 'translateX(' + (-distance) + 'px)';
    };

    Carousel.prototype.buildNavigation = function (sliderWrapper) {
        var _this = this;
        var buttonNext = document.createElement("button");
        buttonNext.innerHTML = "Next";
        buttonNext.className = "instaCarousel-next";

        var buttonPrev = document.createElement("button");
        buttonPrev.innerHTML = "Prev";
        buttonPrev.className = "instaCarousel-prev";

        sliderWrapper.insertBefore(buttonPrev, _this.slider);
        sliderWrapper.appendChild(buttonNext);

        _this.initNavigation(buttonPrev, buttonNext);
    };

    Carousel.prototype.initNavigation = function (buttonPrev, buttonNext) {
        var _this = this;

        buttonPrev.addEventListener('click', function () {
            if(!_this.isAnimating){
                _this.changeSlide(_this.currentSlideIndex - 1);
            }
        });
        buttonNext.addEventListener('click', function () {
            if(!_this.isAnimating){
                _this.changeSlide(_this.currentSlideIndex + 1);
            }
        });

        if (_this.options.autoPlay) {
            _this.playContinously(buttonNext);
        }
    };

    Carousel.prototype.setProps = function () {
        var _this = this;
        var bodyStyle = document.body.style;

        if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
            _this.cssTransitions = true;
        }
    };


    window.MainCarousel = MainCarousel;

})();
