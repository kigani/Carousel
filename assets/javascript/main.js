(function(){
    "use strict";
    window.onload = function () {
        var carousel = new MainCarousel({
            mode: "fade",
            userControl: true,
            autoPlay: {enabled: false, speed: 2000},
            infiniteLoop: false
        });
    }
})();
