(function() {
    "use strict";

    /**
     * Merge defaults with user options
     * @private
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     * @returns {Object} Merged values of defaults and options
     */
    var extendDefaults = function(defaults, options) {
        var property;
        for(var property in options) {
            if(options.hasOwnProperty(property)){
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

     var forEach = function(collection, callback, scope) {
        if(Object.prototype.toString.call(collection) === '[object Object]') {
            for(var prop in collection) {
                if(Object.prototype.hasOwnProperty.call(collection, prop)){
                    callback.call(scope, collection[prop], prop, collection);
                }
            }
        }else {
            for(var i = 0, len = collection.length; i < len; i++) {
                callback.call(scope, collection[i], i, collection);
            }
        }
    }

    var  InstaCarousel = function() {
        var _this = this;
        var defaults = {
            slider: ".instaCarousel",
            mode: "fade",
            duration: 500,
            infiniteLoop: true,
            auto: true
        };

        if(arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }

        _this.slider = document.querySelectorAll(_this.options.slider);
        _this.currentSlideName = "currentSlide";
        _this.cloneSlideName = "instaCarousel-clone";

        this.init();
    };

    InstaCarousel.prototype.init = function() {
        var _this = this;
        _this.setProps();
        _this.buildSlider();
        if(_this.options.mode === "fade") {
            _this.fadeEffect();
        }
        if(_this.options.mode === "slide") {
            _this.slideEffect();
        }
        if(_this.options.infiniteLoop) {
            _this.playContinously();
        }

    };

    //Build basic slider structure
    InstaCarousel.prototype.buildSlider = function() {
        var _this = this;
        var sliderWrapper, parentElement, firstSlide;

        forEach(_this.slider, function(slider){
            parentElement = slider.parentNode;

            //Build slider wrapper
            sliderWrapper = document.createElement("div");
            sliderWrapper.className = "instaCarousel-wrapper";
            parentElement.replaceChild(sliderWrapper, slider);
            sliderWrapper.appendChild(slider);

            //set proper class based on slides change mode
            switch(_this.options.mode) {
                case "fade":
                    slider.className  += " instaCarousel--fadeIn";
                    break;
                case "slide":
                    slider.className  += " instaCarousel--slide";
                    _this.cloneSlides(slider);
                    break;
                default:
                    return false;
            }

            //set currentSlide to the first element of the list
            firstSlide = slider.children[0];
            if(firstSlide.className === _this.cloneSlideName) {
                firstSlide = slider.children[1];
            }
            firstSlide.className = _this.currentSlideName;

        }, _this);

    };

    InstaCarousel.prototype.cloneSlides = function(slider) {
        var _this = this;
        var firstSlide, lastSlide;
        var slides = slider.children;

        firstSlide = slides[0];
        lastSlide = slides[slides.length-1];

        var firstSlideClone = firstSlide.cloneNode(true);
        var lastSlideClone = lastSlide.cloneNode(true);

        firstSlideClone.className = _this.cloneSlideName;
        lastSlideClone.className = _this.cloneSlideName;

        slider.insertBefore(lastSlideClone, firstSlide);
        slider.appendChild(firstSlideClone);

    };

    InstaCarousel.prototype.changeSlide = function() {
            var _this = this;

            var currentSlide, nextSlide, prevSlide;
            forEach(_this.slider, function(slider) {
                var counter = 0;
                for(var i= 0, len = slider.children.length; i < len; i++) {
                    counter++;
                    if(slider.children[i].className === _this.currentSlideName) {
                        currentSlide = slider.children[i];
                        nextSlide = slider.children[i+1];

                        if(nextSlide === undefined || nextSlide.className === _this.cloneSlideName) {
                            if(slider.children[0].className !== _this.cloneSlideName) {
                                slider.children[0].className = _this.currentSlideName;
                            } else {
                                slider.children[1].className = _this.currentSlideName;
                            }
                        }
                    }
                }
                currentSlide.className = "";
                if(nextSlide !== undefined && nextSlide.className !== _this.cloneSlideName) {
                    nextSlide.className = _this.currentSlideName;
                }
            }, _this);
    };

    InstaCarousel.prototype.playContinously = function() {
        var _this= this;
        setInterval(function(){
            _this.changeSlide();
        }, _this.options.duration);
    };

    InstaCarousel.prototype.fadeEffect = function() {
        var _this = this;
        if(_this.cssTransitions) {

        }
    };

    InstaCarousel.prototype.slideEffect = function() {
        var _this = this;
        var slide;
    };

    InstaCarousel.prototype.setProps = function() {
        var _this = this;
        var bodyStyle = document.body.style;

        if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
            _this.cssTransitions = true;
        }
    };

    window.InstaCarousel = InstaCarousel;

})();