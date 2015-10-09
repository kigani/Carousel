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

    var MainCarousel = function () {
        var _this = this;
        var defaults = {
            slider: ".instaCarousel",
            mode: "fade",
            slideSpeed: 500,
            infiniteLoop: true,
            autoPlay: {enabled: true, duration: 5000},
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

        _this.options = options;
        _this.slider = slider;
        _this.currentSlideName = "currentSlide";
        _this.currentSlideIndex = 0;
        _this.cloneSlideName = "instaCarousel-clone";
        _this.isAnimating = false;

        _this.slides = null;
        _this.slidesCount = null;
        _this.autoPlayTimer = null;
        _this.currentSlide = null;
        _this.previousSlide = null;
        _this.nextSlide = null;

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
        //Build slider wrapper
        var sliderWrapper =document.createElement("div");
        var parentElement = _this.slider.parentNode;
        var firstSlide =_this.slider.children[0];

        sliderWrapper.className = "instaCarousel-wrapper";
        parentElement.replaceChild(sliderWrapper, _this.slider);
        sliderWrapper.appendChild(_this.slider);
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
                _this.currentSlideIndex = 1;
                _this.setCssSlideEffect(firstSlide.offsetWidth * _this.currentSlideIndex);
                sliderWrapper.style.width = firstSlide.offsetWidth + 'px';
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

        var firstSlide = _this.slides[0];
        var lastSlide = _this.slides[_this.slides.length - 1];
        var firstSlideClone = firstSlide.cloneNode(true);
        var lastSlideClone = lastSlide.cloneNode(true);

        firstSlideClone.className = _this.cloneSlideName;
        lastSlideClone.className = _this.cloneSlideName;

        _this.slider.insertBefore(lastSlideClone, firstSlide);
        _this.slider.appendChild(firstSlideClone);
    };

    Carousel.prototype.changeSlide = function (slideIndex, direction) {
        var _this = this;
        _this.isAnimating = true;
        _this.currentSlideIndex = slideIndex;
        _this.currentSlide = _this.slides[slideIndex];

        if(direction === "rtl") {
            _this.previousSlide = _this.nextSlide = _this.slides[slideIndex+1];
        } else if(direction === "ltr") {
            _this.previousSlide = _this.slides[slideIndex-1];
        }

        //Assumption - All slides have the same width (set in css)
        var itemWidth =  _this.slider.children[0].offsetWidth;
        var duration = _this.options.slideSpeed;

        if(_this.options.mode === "slide") {
            _this.slider.style.transition = "all " + duration / 1000 + "s";
            _this.setCssSlideEffect(itemWidth * _this.currentSlideIndex);

            _this.inifiniteLoop(1, _this.slidesCount, function(){
                _this.slider.style.transition = "all 0s";
                _this.setCssSlideEffect(itemWidth * _this.currentSlideIndex);
            });
        }

        if(_this.options.mode === "fade") {
            _this.inifiniteLoop(0, _this.slidesCount -1);
        }

        //remove class from previous slide
        if(_this.previousSlide) {
            _this.previousSlide.classList.remove(_this.currentSlideName);
        }
        //add class to current slide
        _this.currentSlide.classList.add(_this.currentSlideName);

        if (_this.options.autoPlay.enabled) {
            _this.pause();
            _this.autoPlay();
        }
    };

    Carousel.prototype.inifiniteLoop = function(index, elementsLength, callback) {
        var _this = this;

        if (_this.currentSlideIndex > elementsLength) {
            _this.currentSlideIndex = index;
            _this.currentSlide = _this.slides[_this.currentSlideIndex];
        } else if (_this.currentSlideIndex < index) {
            _this.currentSlideIndex = elementsLength;
            _this.currentSlide = _this.slides[_this.currentSlideIndex];
        }

        //wait for the end of the animation
        setTimeout(function () {
            if(callback) {
                callback();
            }

            _this.isAnimating = false;
        }, _this.options.slideSpeed);

    };

    Carousel.prototype.autoPlay = function () {
        var _this = this;
        _this.pause();
        _this.autoPlayTimer = setInterval(function () {
            _this.changeSlide(_this.currentSlideIndex + 1, "ltr");
        }, _this.options.autoPlay.duration);
    };

    Carousel.prototype.pause = function () {
        var _this = this;

        if(_this.autoPlayTimer) {
            clearInterval(_this.autoPlayTimer);
        }
    };

    Carousel.prototype.fadeEffect = function () {
        var _this = this;
        if (_this.cssTransitions) {

        }
    };

    Carousel.prototype.setCssSlideEffect = function (distance) {
        var _this =this;
        _this.slider.style.webkitTransform = 'translate3d(' + (-distance) + 'px, 0, 0)';
        _this.slider.style.msTransform = 'translate3d(' + (-distance) + 'px, 0, 0)';
        _this.slider.style.transform = 'translate3d(' + (-distance) + 'px, 0, 0)';
    };

    Carousel.prototype.buildNavigation = function (sliderWrapper) {
        var _this = this;
        var buttonNext = document.createElement("button");
        var buttonPrev = document.createElement("button");

        buttonNext.innerHTML = "Next";
        buttonNext.className = "instaCarousel-next";
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
                _this.changeSlide(_this.currentSlideIndex - 1, "rtl");
            }
        });
        buttonNext.addEventListener('click', function () {
            if(!_this.isAnimating){
                _this.changeSlide(_this.currentSlideIndex + 1, "ltr");
            }
        });

        if (_this.options.autoPlay.enabled) {
            _this.autoPlay();
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
