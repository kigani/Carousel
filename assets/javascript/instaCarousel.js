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

    /**
     * A simple forEach() implementation for Arrays, Objects and NodeLists
     * @private
     * @param {Array|Object|NodeList} collection Collection of items to iterate
     * @param {Function} callback Callback function for each iteration
     * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
     */

    var forEach = function (collection, callback, scope) {
        if (Object.prototype.toString.call(collection) === '[object Object]') {
            for (var prop in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                    callback.call(scope, collection[prop], prop, collection);
                }
            }
        } else {
            for (var i = 0, len = collection.length; i < len; i++) {
                callback.call(scope, collection[i], i, collection);
            }
        }
    };

    var whichTransitionEvent = function(){
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
            'transition':'transitionend',
            'OTransition':'oTransitionEnd',
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        }

        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }
    }

    var InstaCarousel = function () {
        var _this = this;
        var defaults = {
            slider: ".instaCarousel",
            mode: "fade",
            duration: 500,
            infiniteLoop: true,
            auto: true,
            userControl: true
        };

        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }

        _this.slider = document.querySelectorAll(_this.options.slider);
        _this.currentSlideName = "currentSlide";
        _this.currentSlideIndex = 0;
        _this.cloneSlideName = "instaCarousel-clone";
        _this.slides;
        _this.slidesCount;

        this.init();
    };

    InstaCarousel.prototype.init = function () {
        var _this = this;
        _this.setProps();

        forEach(_this.slider, function (slider) {
            _this.buildSlider(slider);
            if (_this.options.mode === "fade") {
                _this.fadeEffect(slider);
            }
            //if(_this.options.mode === "slide") {
            //    _this.slideEffect(slider);
            //}
            if (_this.options.infiniteLoop) {
                _this.playContinously(slider);
            }
        }, _this);
    };

    //Build basic slider structure
    InstaCarousel.prototype.buildSlider = function (slider) {
        var _this = this;
        var sliderWrapper, parentElement, firstSlide;

            parentElement = slider.parentNode;

            //Build slider wrapper
            sliderWrapper = document.createElement("div");
            sliderWrapper.className = "instaCarousel-wrapper";
            parentElement.replaceChild(sliderWrapper, slider);
            sliderWrapper.appendChild(slider);
            firstSlide = slider.children[0];
            firstSlide.className = _this.currentSlideName;

            _this.slides = slider.children;
            _this.slidesCount = _this.slides.length;
            //set proper class based on slides change mode
            switch (_this.options.mode) {
                case "fade":
                    slider.className += " instaCarousel--fadeIn";
                    break;
                case "slide":
                    slider.className += " instaCarousel--slide";
                    _this.cloneSlides(slider);
                    _this.changeSlide(slider, 1);
                    var width = firstSlide.offsetWidth;
                    sliderWrapper.style.width = width + 'px';


                    break;
                default:
                    return false;
            }
            if (_this.options.userControl === true) {
                _this.buildNavigation(slider, sliderWrapper);
            }

    };

    InstaCarousel.prototype.cloneSlides = function (slider) {
        var _this = this;
        var firstSlide, lastSlide;

        firstSlide = _this.slides[0];
        lastSlide = _this.slides[_this.slides.length - 1];

        var firstSlideClone = firstSlide.cloneNode(true);
        var lastSlideClone = lastSlide.cloneNode(true);

        firstSlideClone.className = _this.cloneSlideName;
        lastSlideClone.className = _this.cloneSlideName;

        slider.insertBefore(lastSlideClone, firstSlide);
        slider.appendChild(firstSlideClone);
    };

    InstaCarousel.prototype.changeSlide = function (slider, slideIndex) {
        var _this = this;

        var currentSlide;
        var nextSlide;
        var prevSlide;
        //Assumption - All slides have the same width (set in css)
        var itemWidth =  slider.children[0].offsetWidth;
        var transitionEvent = whichTransitionEvent();

        slider.style.transition = "all 0.5s";
        _this.currentSlideIndex = slideIndex;
        _this.setCssSlideEffect(slider, itemWidth * _this.currentSlideIndex);

        if (slideIndex > _this.slidesCount) {

            slider.addEventListener(transitionEvent, function() {
                _this.currentSlideIndex = 1;
                slider.style.transition = "all 0s";
                _this.setCssSlideEffect(slider, itemWidth * _this.currentSlideIndex);
            });
        } else if(slideIndex < 1){
            slider.addEventListener(transitionEvent, function() {
                _this.currentSlideIndex = _this.slidesCount;
                _this.setCssSlideEffect(slider, itemWidth * _this.currentSlideIndex);
                slider.style.transition = "all 0s";
            });
        }
    };

    InstaCarousel.prototype.playContinously = function (slider) {
        var _this = this;
        setInterval(function () {
            //add logic to change slides automatically
        }, _this.options.duration);
    };

    InstaCarousel.prototype.fadeEffect = function (slider) {
        var _this = this;
        if (_this.cssTransitions) {

        }
    };

    InstaCarousel.prototype.setCssSlideEffect = function (slider, distance) {
        slider.style.webkitTransform = 'translateX(' + (-distance) + 'px)';
        slider.style.msTransform = 'translateX(' + (-distance) + 'px)';
        slider.style.transform = 'translateX(' + (-distance) + 'px)';
    };

    InstaCarousel.prototype.buildNavigation = function (slider, sliderWrapper) {
        var _this = this;
        var buttonNext = document.createElement("button");
        buttonNext.innerHTML = "Next";
        buttonNext.className = "instaCarousel-next";

        var buttonPrev = document.createElement("button");
        buttonPrev.innerHTML = "Prev";
        buttonPrev.className = "instaCarousel-prev";

        sliderWrapper.insertBefore(buttonPrev, slider);
        sliderWrapper.appendChild(buttonNext);

        _this.initNavigation(slider, buttonPrev, buttonNext);
    };
    InstaCarousel.prototype.initNavigation = function (slider, buttonPrev, buttonNext) {
        var _this = this;
        buttonPrev.addEventListener('click', function () {
            _this.changeSlide(slider, _this.currentSlideIndex - 1);
        });
        buttonNext.addEventListener('click', function () {
            _this.changeSlide(slider, _this.currentSlideIndex + 1);
        });
    };

    InstaCarousel.prototype.setProps = function () {
        var _this = this;
        var bodyStyle = document.body.style;

        if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
            _this.cssTransitions = true;
        }
    };

    window.InstaCarousel = InstaCarousel;

})();
