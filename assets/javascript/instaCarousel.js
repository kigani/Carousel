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
            auto: true,
            userControl: true
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
        //if(_this.options.mode === "slide") {
        //    _this.slideEffect();
        //}
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
            firstSlide = slider.children[0];
            //set proper class based on slides change mode
            switch(_this.options.mode) {
                case "fade":
                    slider.className  += " instaCarousel--fadeIn";
                    break;
                case "slide":
                    slider.className  += " instaCarousel--slide";
                    _this.cloneSlides(slider);
                    var width = firstSlide.offsetWidth;
                    console.log(width)
                    sliderWrapper.style.width = width + 'px';
                    _this.setCssSlideEffect(slider, width);
                    break;
                default:
                    return false;
            }
            if(_this.options.userControl === true) {
                _this.buildNavigation(slider, sliderWrapper);
            }

            //set currentSlide to the first element of the list
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

            var currentSlide, nextSlide, prevSlide, distance;
            forEach(_this.slider, function(slider) {

                //Assumption - All slides have the same width (set in css)
                distance = slider.children[0].offsetWidth;
                for(var i= 0, len = slider.children.length; i < len; i++) {

                    //Set current slide className
                    if(slider.children[i].className === _this.currentSlideName) {
                        currentSlide = slider.children[i];
                        nextSlide = slider.children[i+1];

                        //TODO correct logic - it fails in the first iteration
                        if(_this.options.mode === "slide") {
                            distance = distance * i;
                           _this.setCssSlideEffect(slider, distance);
                        }

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

    InstaCarousel.prototype.setCssSlideEffect = function(slider, distance) {
        slider.style.webkitTransform = 'translateX('+(-distance)+'px)';
        slider.style.msTransform = 'translateX('+(-distance)+'px)';
        slider.style.transform = 'translateX('+(-distance)+'px)';

    };

    InstaCarousel.prototype.buildNavigation = function(slider, sliderWrapper) {
        var _this = this;
        var buttonNext = document.createElement("button");
        buttonNext.innerHTML = "Next";
        buttonNext.className = "instaCarousel-next";

        var buttonPrev = document.createElement("button");
        buttonPrev.innerHTML = "Prev";
        buttonPrev.className = "instaCarousel-prev";

        sliderWrapper.insertBefore(buttonPrev, slider);
        sliderWrapper.appendChild(buttonNext);

        _this.initNavigation(buttonPrev, buttonNext);
    };
    InstaCarousel.prototype.initNavigation = function(buttonPrev, buttonNext) {
        var _this = this;
        buttonNext.addEventListener('click', function() {
            _this.changeSlide();
        });
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
