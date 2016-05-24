'use strict';

angular.module('abuseApp').
directive('tooltipMouse', [function () {
    return {
        restrict: 'EA',
        require: '?id',
        scope : {
            tooltipMouseZoneClass  : '@',
            tooltipMouseDisabled   : '=',
            tooltipMouseReposition : '&',
            tooltipMouseClose      : '&'
        },
        link: function(scope, element) {
            element.addClass('tooltip-mouse-menu');

            function closeTooltip () {
                if (element.is('.tooltip-mouse-menu-show') && scope.tooltipMouseClose){
                    element.removeClass('tooltip-mouse-menu-show');

                    //hack for dbl click selection
                    setTimeout(function(){
                        if (window.getSelection && !window.getSelection().toString().length){
                            scope.tooltipMouseClose();
                        }
                    },200);
                }
            }

            $(window.document).on('mouseup', function(e){

                if (!$(e.target).parents('.tooltip-mouse-menu').is($(element)) && !scope.tooltipMouseDisabled) {
                    if (window.getSelection && window.getSelection().toString().length) {
                        if (scope.tooltipMouseZoneClass && !$(window.getSelection().focusNode).parents('.' + scope.tooltipMouseZoneClass).length){
                            return;
                        }
                        if (element.is('.tooltip-mouse-menu-show') && scope.tooltipMouseReposition){
                            scope.tooltipMouseReposition();
                        }

                        var posX = e.clientX,
                            posY = e.clientY;
                        element.css('top', posY + 10 - $(element).parent().offset().top + $(element).parent().scrollTop()).css('left', posX  - $(element).parent().offset().left+ $(element).parent().scrollLeft()).addClass('tooltip-mouse-menu-show');
                    }else{
                        closeTooltip();
                    }
                }
            });

            $(window.document).on('keyup', function(){
                if (window.getSelection && !window.getSelection().toString().length) {
                    closeTooltip();
                }
            });

            scope.$watch('tooltipMouseDisabled', function (value){
                if (value) {
                    closeTooltip();
                }
            });

        }
    };
}]);
