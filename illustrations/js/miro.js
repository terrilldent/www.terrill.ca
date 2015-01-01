/*jslint bitwise: true, browser: true, continue: true, devel: true, newcap: true, nomen: true, plusplus: true, sloppy: true, todo: true, white: true */
/*global btoa, document, window, iScroll, DOMParser */

/* A Utility Library */

var $ = function( id )
{
    return document.getElementById( id );
};

Object.create = function( prototype )
{
    var Obj = function(){return undefined;};
    Obj.prototype = prototype;
    return new Obj();
};

var miro = {};

miro.simulateTouch = !window.hasOwnProperty( 'ontouchstart' );

miro.create = function( tagName, attributes )
{
    var element = document.createElement( tagName ),
        key;

    for( key in attributes ) {
        if( attributes.hasOwnProperty( key ) ) {
            element[ key ] = attributes[ key ];
        }
    }
    
    return element;
};

miro.createEventSource = function( existingObject )
{
    var obj = existingObject || {};

    obj.listeners = [];

    obj.addListener = function( listener ) {
        obj.listeners.push( listener );
    };

    obj.removeListener = function( listener ) {
        var index = obj.listeners.indexOf( listener );
        if( index >= 0 ) {
            obj.listeners.splice( obj.listeners.indexOf( listener ), 1 );
        }
    };

    obj.fire = function( eventName, message ) {
        miro.forEach( obj.listeners, function( listener ) {
            if( listener && listener[ eventName ] ) {
                listener[ eventName ]( message ); 
            }
        });
    };

    return obj;
};

miro.getEvent = function( e )
{
    return e.touches ? e.touches[0] : e;
};

miro.getPagePosition = function( e )
{
    e = e.touches ? e.touches[0] : e;
    return { x : e.pageX , y : e.pageY };
};
    
miro.getEventTarget = function( e )
{
    if( event.touches && event.touches[0] && event.touches[0].target ) {
        return event.touches[0].target;
    }
    return e.target;
};

miro.consumeScrollEvents = function( element )
{
    element.addEventListener( 'touchstart', function( e ) {
        e.stopPropagation();
        e.preventDefault();
    }, false );
};

miro.getTransformAttribute = function( element, attribute )
{
    var transformString = element.style.webkitTransform,
        parts = transformString.split( ' ' ),
        numParts = parts.length,
        i;

    for( i = 0; i < numParts; i++ ) {
        if( parts[ i ].indexOf( attribute ) === 0 ) {
            return parseInt( parts[ i ].substring( attribute.length + 1, parts[ i ].length - 1 ), 10 );
        }
    }
};

miro.remove = function( element )
{
    if( element.parentNode ) {
        element.parentNode.removeChild( element );
    }
};

miro.forEach = function( arrayCollection, callback )
{
    var num = arrayCollection.length,
        i;

    for( i = 0; i < num; i++ ) {
        callback( arrayCollection[ i ] );
    }
};

miro.hasClass = function( element, className )
{
    return element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));                    
};

miro.addClass = function( element, className )
{
    if( !miro.hasClass( element, className ) ){
         element.className += " " + className;
    }
};

miro.removeClass = function( element, className )
{
    if( miro.hasClass( element, className ) ){
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace( reg, ' ' );
    }
};

miro.setClass = function( element, className, addClass )
{
    if( addClass ) {
        miro.addClass( element, className );
    } else {
        miro.removeClass( element, className );
    }
};

miro.getStyle = function( element, style )
{
    if( element.currentStyle ) {
        return element.currentStyle[ style ];
    }
    if( window.getComputedStyle ) {
        return document.defaultView.getComputedStyle( element, null ).getPropertyValue( style );
    }
};  

miro.button = (function() 
{
    var buttonPrototype,
        MOVEMENT_ALLOWED = 15;

    buttonPrototype = {
        
        handleEvent : function( e )
        {
            switch( e.type ) {
                case 'touchstart':
                    this.handleTouchStart( e );
                    break;
                case 'touchmove':
                    this.handleTouchMove( e );
                    break;
                case 'touchend':
                    this.handleTouchEnd( e );
                    break;
            }
        },
        
        reset : function()
        {
            var that = this;
            document.body.removeEventListener( 'touchmove', that, false );
            document.body.removeEventListener( 'touchend',  that, false );
        },
            
        handleTouchStart : function( e )
        {
            var that = this;

            that.previousEvent = e;       
            that.touchStartXY = miro.getPagePosition( e );

            document.body.addEventListener( 'touchmove', that, false );
            document.body.addEventListener( 'touchend', that, false );

            return false;
        },
        
        handleTouchMove : function( e )
        {
            var that = this;
            
            that.previousEvent = e;

            if( that.outOfBounds( that.touchStartXY, miro.getPagePosition( e ) ) ) {
                that.reset();
            }

            return false;
        },
          
        handleTouchEnd : function( e )
        {
            var that = this;
            
            e.stopPropagation();
            e.preventDefault();
            
            that.reset();
            
            if( that.invokeCallback ) {
                that.invokeCallback( that.target, e );
            }

            return false;
        },

        outOfBounds : function( point1, point2 )
        {
            if( Math.abs( point2.x - point1.x ) > MOVEMENT_ALLOWED ||
                Math.abs( point2.y - point1.y ) > MOVEMENT_ALLOWED ) {  
                return true;
            }
            return false;
        }
    };

    return {
        create : function( target, invokeCallback ) {

            var button = Object.create( buttonPrototype );
            
            if( !target ) {
                return;
            }
            
            button.target = target;
            button.invokeCallback = invokeCallback;
            target.ontouchstart = function( e ) {
                button.handleEvent( e ); 
            };

            if( miro.simulateTouch ) {
                target.onclick = function( e ) {
                    invokeCallback( target, e );
                    e.preventDefault();
                    return false;
                };
            }
        }
    };
}());



