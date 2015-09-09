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
        var sliderWrapper, parentElement, currentSlide;

        forEach(_this.slider, function(slider){
            parentElement = slider.parentNode;

            //Build slider wrapper
            sliderWrapper = document.createElement("div");
            sliderWrapper.className = "instaCarousel-wrapper";
            parentElement.replaceChild(sliderWrapper, slider);
            sliderWrapper.appendChild(slider);

            //set currentSlide to the first element of the list
            currentSlide = slider.children[0];
            currentSlide.className = _this.currentSlideName;
        }, _this);

    };

    InstaCarousel.prototype.addSlide = function() {

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

                        if(nextSlide === undefined) {
                            slider.children[0].className = _this.currentSlideName;
                        }
                    }

                }
                currentSlide.className = "";
                if(nextSlide !== undefined) {
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
            forEach(_this.slider, function(slider) {
                slider.className += " instaCarousel--fadeIn";
            }, _this);
        }
    };

    InstaCarousel.prototype.slideEffect = function() {
        var _this = this;
        var slide, sliderWidth;
        forEach(_this.slider, function(slider){
            sliderWidth = 0;
            slider.className += " instaCarousel--slide";
            for(var i= 0, len = slider.children.length; i < len; i++) {
                //calculate slider width
                slide = slider.children[i];
                sliderWidth += slide.offsetWidth;
            }

            slider.style.width = sliderWidth + "px";
        }, _this);
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