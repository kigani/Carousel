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
            autoPlay: {enabled: false, speed: 5000}, //autoplay is available only if infinite loop is set to true
            userControl: true
        };

        //Extend defaults with options passed by a user
        _this.options = extendDefaults(defaults, arguments[0]);

        //Iterate over all sliders instances
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
        _this.slideWidth = null; //used only in slide mode
        _this.firstItemIndex = null; //index of the first item depends on mode (in "slide" mode first and last slide is cloned, cloned items shouldn't be counted)
        _this.lastItemIndex = null; //index of the last item depends on mode (in "slide" mode first and last slide is cloned, cloned items shouldn't be counted)
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
        var sliderWrapper = document.createElement("div");
        var parentElement = _this.slider.parentNode;
        var firstSlide = _this.slider.children[0];

        sliderWrapper.className = "instaCarousel-wrapper";
        parentElement.replaceChild(sliderWrapper, _this.slider);
        sliderWrapper.appendChild(_this.slider);
        firstSlide.className = _this.currentSlideName;
        _this.currentSlide = firstSlide;

        _this.slides = _this.slider.children;
        _this.slidesCount = _this.slides.length;

        /**
         * set up proper class based on slides change mode
         * set up first and last elements' index
         * Slide mode: clone first and last slide
         * Slide mode: set up width for slider wrapper
         * Slide mode: move to the first, not cloned slide
         */
        switch (_this.options.mode) {
            case "fade":
                _this.slider.className += " instaCarousel--fadeIn";
                _this.firstItemIndex = 0;
                _this.lastItemIndex = _this.slidesCount - 1;
                break;
            case "slide":
                _this.slider.className += " instaCarousel--slide";
                _this.cloneSlides(_this.slider);
                _this.firstItemIndex = 1;
                _this.lastItemIndex = _this.slidesCount;
                //Assumption - All slides have the same width (set in css)
                _this.slideWidth = firstSlide.offsetWidth;
                _this.setCssSlideEffect(_this.slideWidth * _this.currentSlideIndex, "ltr");
                sliderWrapper.style.width = _this.slideWidth + 'px';
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

        if (direction === "rtl") {
            _this.previousSlide = _this.nextSlide = _this.slides[slideIndex + 1];
        } else if (direction === "ltr") {
            _this.previousSlide = _this.slides[slideIndex - 1];
        }

        if (_this.options.mode === "slide") {
            _this.slider.style.transition = "all " + _this.options.slideSpeed / 1000 + "s";
            _this.setCssSlideEffect(_this.slideWidth * _this.currentSlideIndex, direction);
        }

        if (_this.options.mode === "slide" && (_this.currentSlideIndex > _this.lastItemIndex || _this.currentSlideIndex < _this.firstItemIndex)) {
            //wait for the end of the animation
            setTimeout(function () {
                _this.slider.style.transition = "all 0s";
                _this.setCssSlideEffect(_this.slideWidth * _this.currentSlideIndex, direction);
                _this.isAnimating = false;
            }, _this.options.slideSpeed);

        } else {
            //wait for the end of the animation
            setTimeout(function () {
                _this.isAnimating = false;
            }, _this.options.slideSpeed);
        }

        //change slide and slide index from the last one to the first one
        if (_this.currentSlideIndex > _this.lastItemIndex) {
            _this.currentSlideIndex = _this.firstItemIndex;
            _this.currentSlide = _this.slides[_this.currentSlideIndex];
            //change slide and slide index from the first one to the last one
        } else if (_this.currentSlideIndex < _this.firstItemIndex) {
            _this.currentSlideIndex = _this.lastItemIndex;
            _this.currentSlide = _this.slides[_this.currentSlideIndex];
        }

        //remove class from previous slide
        if (_this.previousSlide) {
            if (_this.options.mode === "fade" && !_this.cssTransitions) {
                $.fadeOut(_this.previousSlide, {duration: _this.options.slideSpeed});
            }
            _this.previousSlide.classList.remove(_this.currentSlideName);
        }

        //animation for browsers that don't support css transitions (<= ie9)
        if (_this.options.mode === "fade" && !_this.cssTransitions) {
            $.fadeIn(_this.currentSlide, {duration: _this.options.slideSpeed});
        }
        //add class to current slide
        _this.currentSlide.classList.add(_this.currentSlideName);

        //reset autoplay timer after each slide change
        if (_this.options.autoPlay.enabled && _this.options.infiniteLoop) {
            _this.pause();
            _this.autoPlay();
        }
    };

    Carousel.prototype.autoPlay = function () {
        var _this = this;
        _this.pause();
        _this.autoPlayTimer = setInterval(function () {
            _this.next();
        }, _this.options.autoPlay.speed);
    };

    Carousel.prototype.pause = function () {
        var _this = this;

        if (_this.autoPlayTimer) {
            clearInterval(_this.autoPlayTimer);
        }
    };

    Carousel.prototype.fadeEffect = function () {
        var _this = this;

        //initialization of the slides elements
        if (_this.cssTransitions) {
            for (var i = 0; i < _this.slides.length; i++) {
                _this.slides[i].style.transition = 'opacity ' + _this.options.slideSpeed / 1000 + 's';
            }
        //initialization of the first slide for browsers that don't support css transitions
        } else {
            _this.currentSlide.style.opacity = 1;
        }
    };

    Carousel.prototype.setCssSlideEffect = function (distance) {
        var _this = this;
        if (_this.cssTransform3d) {
            _this.slider.style.webkitTransform = 'translate3d(' + (-distance) + 'px, 0, 0)';
            _this.slider.style.transform = 'translate3d(' + (-distance) + 'px, 0, 0)';
        }
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

        buttonPrev.addEventListener('click', function (event) {
            //if infinite loop is set to true action on click should be always invoked
            if (_this.options.infiniteLoop) {
                _this.prev();
            } else {
                //if infinite loop is set to false action on click shouldn't be invoked on the first slide
                if (!_this.options.infiniteLoop && _this.currentSlideIndex > _this.firstItemIndex) {
                    _this.prev();
                } else {
                    return false;
                }
            }
        });

        buttonNext.addEventListener('click', function () {
            //if infinite loop is set to true action on click should be always invoked
            if (_this.options.infiniteLoop) {
                _this.next();
            } else {
                //if infinite loop is set to false action on click shouldn't be invoked on the last slide
                if (_this.currentSlideIndex < _this.lastItemIndex) {
                    _this.next();
                } else {
                    return false;
                }
            }
        });

        //init autoplay
        if (_this.options.autoPlay.enabled && _this.options.infiniteLoop) {
            _this.autoPlay();
        }
    };

    Carousel.prototype.next = function () {
        var _this = this;
        if (!_this.isAnimating) {
            _this.changeSlide(_this.currentSlideIndex + 1, "ltr");
        }
    };

    Carousel.prototype.prev = function () {
        var _this = this;
        if (!_this.isAnimating) {
            _this.changeSlide(_this.currentSlideIndex - 1, "rtl");
        }
    };

    Carousel.prototype.setProps = function () {
        var _this = this;
        var bodyStyle = document.body.style;
        if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined || bodyStyle.transition !== undefined) {
            _this.cssTransitions = true;
        }

        if (bodyStyle.webkitPerspective !== undefined || bodyStyle.MozPerspective !== undefined) {
            _this.cssTransform3d = true;
        }

    };

    window.MainCarousel = MainCarousel;
})();
