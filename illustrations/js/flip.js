/*!
 * flip 0.9.0 - Copyright 2013 Terrill Dent, http://terrill.ca
 * Released under MIT license, http://terrill.ca/flipjs/license
 */





var flip = (function()
{
    var flip = {},

        listeners = [],

        

        // Functions
        onResize,
        getAngle,
        //getShadowOpacity,
        commonEndTransition,
        onTransitionEndStay,
        onTransitionEndNext,
        onTransitionEndPrev,

        // HTML
        pagesContainer,
        flipPagesContainer,
        frontPage,
        shadow,

        // Variables
        transitionForward,
        previousAngle,
        windowWidth,

        // Objects
        draggableControl,
        dragListener,
        pageStack = [],

        prevPage,
        topPage,
        nextPage,

        leftBase,
        rightBase,

        leftFlip,
        rightFlip;

    flip.simulateTouch = !window.hasOwnProperty( 'ontouchstart' );

    getAngle = function()
    {
        var deltaX = draggableControl.startXY.x - draggableControl.curXY.x,
            angle;

        if( transitionForward ) {

            // Going to Next
            angle = 180 * deltaX / Math.min( windowWidth / 2, draggableControl.startXY.x * 0.9 );

            if( !nextPage ) {
                // Dampening using x^.6
                angle = Math.min( 60, Math.pow( angle, 0.8 ) );
            } else {
                // Linear
                angle = Math.max( 0, Math.min( 180, angle ) );
            }

        } else {
            // Going to Previous
            angle = 180 * deltaX / Math.min( windowWidth / 2, ( windowWidth - draggableControl.startXY.x ) * 0.9 );

            if( !prevPage ) {
                // Dampening using x^.6
                angle = Math.max( 120, 180 - Math.pow( Math.abs( angle ), 0.8 ) );
            } else {
                // Linear
                angle = 180 - Math.abs( Math.min( 0, Math.max( -180, angle ) ) );
            }
        }

        return angle;
    };

    

    onResize = function() 
    {
        windowWidth = window.innerWidth;
    };

    commonEndTransition = function()
    {
        flip.transitioning = false;
        shadow.style.display = 'none';
        flipPagesContainer.style.display = 'none';  

        setTimeout( function() {
            flip.fire( 'globalTransitionEnd' );
        }, 0 );
    };

    onTransitionEndStay = function() 
    {
        commonEndTransition();  

        if( leftFlip ) {
            leftFlip.removeEventListener( 'webkitTransitionEnd', onTransitionEndStay, false);
        }
        if( rightFlip ) {
            rightFlip.removeEventListener( 'webkitTransitionEnd', onTransitionEndStay, false);
        }

        if( transitionForward ) {
            if( nextPage ) {
                nextPage.html.style.display = 'none';
            }
            flip.removeClass( topPage.html, 'left' );
        } else {
            if( prevPage ) {
                prevPage.html.style.display = 'none';
            }
            flip.removeClass( topPage.html, 'right' );
        }

        setTimeout( function() {
            topPage.onStay();
        }, 0 );
    };

    onTransitionEndNext = function() 
    {
        if( nextPage ) {
            flip.removeClass( nextPage.html, 'right' );
        }

        commonEndTransition();
        topPage.html.style.display = 'none';

        // Add new top page to stack
        pageStack.push( topPage );

        if( leftFlip ) {
            leftFlip.removeEventListener( 'webkitTransitionEnd', onTransitionEndNext, false);
        }

        if( prevPage ) {
            // We are moving forward and we no longer need to keep prevPage's 
            // HTML on the screen. Remove it for memory and performance
            flip.remove( prevPage.html );
            flip.remove( prevPage.flip );
        }

        prevPage = topPage;
        topPage = nextPage;
        nextPage = null;

        topPage.onShowComplete();
    };

    onTransitionEndPrev = function() 
    {
        if( prevPage ) {
            flip.removeClass( prevPage.html, 'left' );
        }

        commonEndTransition();
        topPage.html.style.display = 'none';

        // Remove the top page from stack
        pageStack.pop();

        if( rightFlip ) {
            rightFlip.removeEventListener( 'webkitTransitionEnd', onTransitionEndPrev, false);
        }

        if( nextPage ) {
            // We no longer need the element in the Next position
            // Remove for memory and performance
            flip.remove( nextPage.html );
            flip.remove( nextPage.flip );
        }

        nextPage = topPage;
        topPage = prevPage;
        prevPage = null;
        if( pageStack.length > 0 ) {

            prevPage = pageStack[ pageStack.length - 1 ] || null;

            prevPage.html.style.display = 'none';
            pagesContainer.appendChild( prevPage.html );

            prevPage.flip.style.display = 'none';
            flipPagesContainer.appendChild( prevPage.flip );
        }

        topPage.onShowComplete();
    };

    
    dragListener = {

        breach : function( deltaX ) 
        {       
            flip.transitioning = true;
            flip.addClass( flipPagesContainer, 'dragging' );

            previousAngle = null;

            if( leftFlip ) {                
                leftFlip.style.webkitTransition  = '-webkit-transform 0';
                leftFlip.removeEventListener( 'webkitTransitionEnd', onTransitionEndStay, false);
                leftFlip.removeEventListener( 'webkitTransitionEnd', onTransitionEndNext, false);
            }
            if( rightFlip ) {
                rightFlip.style.webkitTransition  = '-webkit-transform 0';
                rightFlip.removeEventListener( 'webkitTransitionEnd', onTransitionEndStay, false);
                rightFlip.removeEventListener( 'webkitTransitionEnd', onTransitionEndPrev, false);
            }
            
            // TODO: refresh flip?
                   
            if( deltaX > 0 ) {

                // Going forward (to next)
                transitionForward = true;

                leftBase   = topPage.html;
                rightFlip  = topPage.flip;
                
                rightBase  = ( nextPage ? nextPage.html : null );
                leftFlip   = ( nextPage ? nextPage.flip : null );
                
            } else {

                // Going backward (to prev)
                transitionForward = false;

                rightBase  = topPage.html;
                leftFlip   = topPage.flip;
                
                leftBase   = ( prevPage ? prevPage.html : null );
                rightFlip  = ( prevPage ? prevPage.flip : null );
            }

            topPage.onObscure();
            
            // Hide any panels from next/previous transitions
            // that might already be underway
            if( transitionForward && prevPage ) {
                prevPage.html.style.display = 'none';
            } else if( nextPage ) {
                nextPage.html.style.display = 'none';
            }
            
            // Base Panels
            if( rightBase ) {
                flip.addClass( rightBase, 'right' );
                flip.removeClass( rightBase, 'left' );
                rightBase.style.display = 'block';
            }

            if( leftBase ) {
                flip.addClass( leftBase, 'left' );
                flip.removeClass( leftBase, 'right' );
                leftBase.style.display = 'block';
            }

            // Flip Panels
            if( rightFlip ) {
                flip.addClass( rightFlip, 'right' );
                flip.removeClass( rightFlip, 'left' );
                rightFlip.style.display = 'block';
            }
            
            if( leftFlip ) {
                flip.addClass( leftFlip, 'left' );
                flip.removeClass( leftFlip, 'right' );
                leftFlip.style.display = 'block';
            }
            
            shadow.style.display = 'block';
            
            shadow.style.opacity = 0;
            
            flipPagesContainer.style.display = 'block';
        },
        
        reset : function()
        {   
            if( !leftFlip && !rightFlip ) {
                return;
            }

            var angle = getAngle(),
                dropLeftHandler,
                dropRightHandler;
            
            previousAngle = null;

            flip.removeClass( flipPagesContainer, 'dragging' );

            // TODO: Set Shadow

            if( transitionForward ) {
                dropLeftHandler = onTransitionEndNext;
                dropRightHandler = onTransitionEndStay;
            } else { 
                dropLeftHandler = onTransitionEndStay;
                dropRightHandler = onTransitionEndPrev;
            }

            if( angle === 0 ) {
                dropRightHandler();
            } else if( angle >= 180 ) {
                dropLeftHandler();
            } else if( angle < 90 && rightFlip ) {
                rightFlip.style.webkitTransform  = 'translateX( 0 ) perspective( ' + 3000 + ') rotateY( -0deg )';
                rightFlip.style.webkitTransition  = '-webkit-transform ' + ( 500 * angle / 90 ) + 'ms ease-in';
                rightFlip.addEventListener( 'webkitTransitionEnd', dropRightHandler, false);
            } else if( leftFlip ) {
                leftFlip.style.webkitTransform = 'translateX( 0 ) perspective( ' + 3000 + ') rotateY( -360deg )';
                leftFlip.style.webkitTransition  = '-webkit-transform ' + ( 500 * ( 180 - angle ) / 90 ) + 'ms ease-in';
                leftFlip.addEventListener( 'webkitTransitionEnd', dropLeftHandler, false);
            }
        },

        move : function()
        {
            if( !leftFlip && !rightFlip ) {
                return;
            }

            var angle = getAngle();

            //shadow.style.backgroundColor = "rgba( 0, 0, 0, " +  getShadowOpacity( angle ) + " )";
            //shadow.style.opacity = getShadowOpacity( angle );

            if( angle < 90 ) {
                if( ( !previousAngle || previousAngle >= 90 ) && leftFlip ) {
                    leftFlip.style.webkitTransform = 'translateX( 4000px )';    
                }
                rightFlip.style.webkitTransform = 'translateX( 0 ) perspective( ' + 3000 + ') rotateY( -' + angle + 'deg )';

            } else if( angle >= 90 ) {
                if( ( !previousAngle || previousAngle < 90 ) && rightFlip ) {
                    rightFlip.style.webkitTransform = 'translateX( 4000px )';
                }
                leftFlip.style.webkitTransform  = 'translateX( 0 ) perspective( ' + 3000 + ') rotateY( -' + ( 180 + angle ) + 'deg )';
            }
            
            previousAngle = angle;
        }
    };



    // -------- PUBLIC HTML FUNCTIONS -------- //

    flip.remove = function( element )
    {
        if( element.parentNode ) {
            element.parentNode.removeChild( element );
        }
    };

    flip.forEach = function( arrayCollection, callback )
    {
        var num = arrayCollection.length,
            i;

        for( i = 0; i < num; i++ ) {
            callback( arrayCollection[ i ] );
        }
    };

    flip.hasClass = function( element, className )
    {
        return element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));                    
    };

    flip.addClass = function( element, className )
    {
        if( !flip.hasClass( element, className ) ){
             element.className += " " + className;
        }
    };

    flip.removeClass = function( element, className )
    {
        if( flip.hasClass( element, className ) ){
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            element.className = element.className.replace( reg, ' ' );
        }
    };


    // -------- PUBLIC LISTENER FUNCTIONS -------- //

    flip.addListener = function( listener ) {
        listeners.push( listener );
    };

    flip.removeListener = function( listener ) {
        var index = listeners.indexOf( listener );
        if( index >= 0 ) {
            listeners.splice( listeners.indexOf( listener ), 1 );
        }
    };

    flip.fire = function( eventName, message ) {
        flip.forEach( listeners, function( listener ) {
            if( listener && listener[ eventName ] ) {
                listener[ eventName ]( message ); 
            }
        });
    };

    // -------- PUBLIC FLIP FUNCTIONS -------- //

    flip.close = function()
    {
        if( topPage !== frontPage ) {

            if( pageStack.length > 1 ) {

                if( prevPage ) {
                    flip.remove( prevPage.flip );
                    flip.remove( prevPage.html );
                }

                // Remove pages between top and front
                pageStack.splice( 0, pageStack.length - 1 );

                prevPage = frontPage;
                prevPage.html.style.display = '';
                pagesContainer.insertBefore( prevPage.html, topPage.html );
                flipPagesContainer.insertBefore( prevPage.flip, topPage.flip );

                topPage.refreshFlip();
            }

            flip.pop();
        }
    };

    flip.pop = function()
    {
        if( topPage !== frontPage ) {

            // This invokes an artificial page flip backwards
            // This outter timeout allows any modifications that happened to the page order
            // to complete first, before the transitions start
            setTimeout( function() {

                // Start the artificial transition
                dragListener.breach( -20, 0 );

                rightFlip.style.webkitTransform = 'translateX( 0 ) perspective(3000) rotateY( -90deg )'; 
                leftFlip.style.webkitTransform = 'translateX( 0 ) perspective(3000) rotateY( 0deg )';
                
                rightFlip.style.webkitTransition  = '-webkit-transform 300ms ease-in';  
                leftFlip.style.webkitTransition  = '-webkit-transform 300ms ease-in';   
             
                setTimeout( function() {
                  
                    leftFlip.style.webkitTransform = 'translateX( 0 ) perspective(3000) rotateY( 90deg )';

                    // Wait for the second half
                    setTimeout( function() {
                    
                        rightFlip.style.webkitTransform = 'translateX( 0 ) perspective(3000) rotateY( 0deg )';
                        
                        // Wait for completion
                        setTimeout( function() {
                            
                            // Cleanup
                            onTransitionEndPrev();
                            
                        }, 300 );
                    }, 300 );
                }, 0 );
            }, 0 );
        }
    };

    flip.push = function( newPageControl )
    {
        if( !frontPage ) {
            
            // This is the base case
            // That happens on startup
            // No animation for now
            
            topPage = newPageControl;
            frontPage = topPage;
            pagesContainer.appendChild( topPage.html );
            flipPagesContainer.appendChild( topPage.flip );

            topPage.onShowComplete();
        
        } else {

            // This invokes an artificial page flip
            // The News uses this to open
            
            flip.prime( newPageControl );
          
            setTimeout( function() {
                
                // Start the artificial transition
                dragListener.breach( 20, 0 );    
        
                rightFlip.style.webkitTransform = 'translateX( 0 ) perspective(3000) rotateY( 0deg )'; 
                leftFlip.style.webkitTransform = 'translateX( 0 ) perspective(3000) rotateY( 90deg )';
                
                rightFlip.style.webkitTransition  = '-webkit-transform 300ms ease-in';  
                leftFlip.style.webkitTransition  = '-webkit-transform 300ms ease-in';   
             
                setTimeout( function() {
                  
                    rightFlip.style.webkitTransform = 'translateX( 0 ) perspective(3000) rotateY( -90deg )';

                    // Wait for the second half
                    setTimeout( function() {
                    
                        leftFlip.style.webkitTransform = 'translateX( 0 ) perspective(3000) rotateY( 0deg )';
                    
                        // Wait for completion
                        setTimeout( function() {
                            
                            // Cleanup
                            onTransitionEndNext();
                            
                        }, 300 );
                    }, 300 );
                }, 0 );
            }, 0 );
        }
    };

    flip.getStackHeight = function()
    {
        return pageStack.length;
    };

    flip.prime = function( nextPageControl )
    {
        if( nextPage && nextPage !== nextPageControl ) {
            flip.remove( nextPage.html );
            flip.remove( nextPage.flip );
        }

        nextPage = nextPageControl;

        nextPage.html.style.display = 'none';
        pagesContainer.appendChild( nextPage.html );

        nextPage.flip.style.display = 'none';
        flipPagesContainer.appendChild( nextPage.flip );
    };

    flip.init = function( basePagesContainer, flipContainer, shadowPanel, firstPage )
    {
        pagesContainer = basePagesContainer;
        flipPagesContainer = flipContainer;
        shadow = shadowPanel;

        if( firstPage ) {
            flip.push( firstPage );
        }

        draggableControl = flip.draggable.create( pagesContainer, dragListener, 10 );

        window.addEventListener( 'resize', onResize, false );
        onResize();
    };

    return flip;
}());




flip.draggable = (function() 
{
    var draggablePrototype = {
            
        getPagePosition : function( e )
        {
            e = e.touches ? e.touches[0] : e;
            return { x : e.pageX , y : e.pageY };
        },
            
        handleEvent : function( e )
        {
            var that = this;
            
            switch( e.type ) {
                case 'touchstart': // Fall through
                case 'mousedown':
                    that.handleTouchStart( e );
                    break;
                case 'touchmove': // Fall through
                case 'mousemove':
                    that.handleTouchMove( e );
                    break;
                case 'touchend': // Fall through
                case 'mouseup':
                    that.handleTouchEnd( e );
                    break;
                case 'mouseout':
                    // This filters the mouseout events to only those when you leave the window
                    if( e.relatedTarget && e.relatedTarget.tagName === 'HTML' ){
                        that.handleTouchEnd( e );
                    }
                    break;
            }
        },
        
        reset : function()
        {
            var that = this;
            
            document.body.removeEventListener( 'touchmove', that, false );
            document.body.removeEventListener( 'touchend',  that,  false );
            
            if( flip.simulateTouch ) {
                document.body.removeEventListener( 'mousemove', that, false );
                document.body.removeEventListener( 'mouseup',   that,  false );
                window.removeEventListener( 'mouseout', that, false );
            }
            
            if( !that.curXY  ) {
                return;
            }
            
            if( that.listener.reset ) {
                that.listener.reset();
            }

            that.curXY = null;
        },
            
        handleTouchStart : function( e )
        {
            var that = this;
            
            // TODO: add condition if target is an input, then return.
            
            e.preventDefault();
            
            if( that.curXY && e.touches && e.touches.length > 1 ) {
                that.reset();
                return;
            }
            
            if( ( e.touches && e.touches.length ) > 1 ||
                (e.which && e.which === 3) || (e.button && e.button === 2) ) {
                // Ignore right click and second finger press
                return;
            }
            
            that.outsideBuffer = false;
            that.curXY = null;
            
            document.body.addEventListener( 'touchmove', that, false );
            document.body.addEventListener( 'touchend', that, false );
            
            if( flip.simulateTouch ) {
                document.body.addEventListener( 'mousemove', that, false );
                document.body.addEventListener( 'mouseup', that, false );
                window.addEventListener( 'mouseout', that, false );
            }
            
            that.startXY = that.getPagePosition( e );
            that.curXY = that.startXY;
            if( that.listener.start ) {
                that.listener.start();
            }
        },
        
        // This is bound to the document.body
        handleTouchMove : function( e )
        {
            var that = this,
                deltaY,
                deltaX;
            
            e.preventDefault();
            
            if( e.touches && e.touches.length > 1 ) {
                that.reset();
                return;
            }
                        
            // Check if we are outside the horizontal scroll buffer
            that.curXY = that.getPagePosition( e );
            deltaX = that.startXY.x - that.curXY.x;
            deltaY = that.startXY.y - that.curXY.y;
            
            if( that.buffer ) {
                if( !that.outsideBuffer && Math.abs( deltaX ) >= that.buffer ) {
                        
                    if( that.listener.breach ) {
                        that.listener.breach( deltaX, deltaY );
                    }

                    that.outsideBuffer = true;
                }
            }
            
            if( !that.buffer || that.outsideBuffer ) {
                if( that.listener.move ) {
                    that.listener.move();
                }
            }
        },
          
        handleTouchEnd : function( e )
        {
            var that = this;
            
            e.preventDefault();
            that.reset();
        }
    };
    
    return {
        
        create : function( target, listener, buffer ) {
            
            var draggable = Object.create( draggablePrototype );
            
            draggable.target = target;
            draggable.listener = listener;
            draggable.buffer = buffer;

            target.addEventListener( 'touchstart', draggable, false );
            if( flip.simulateTouch ) {
                target.addEventListener( 'mousedown', draggable, false );
            }
            return draggable;
        }
    };
}());







flip.page = (function() 
{
    var pagePrototype = {
    
        refreshFlip : function()
        {
            var that = this,
                oldFlip = that.flip,
                oldFlipParent;

            if( flip.transitioning ) {
                if( !that.dirty ) {
                    that.dirty = true;
                    flip.addListener( that );
                }
                return;
            }

            if( that.dirty ){
                that.dirty = false;
                flip.removeListener( that );
            }

            that.flip = that.html.cloneNode( true );
                
            if( oldFlip && oldFlip.parentNode ) {
                oldFlipParent = oldFlip.parentNode;
                if( oldFlipParent ) {
                    oldFlipParent.removeChild( oldFlip );
                    oldFlipParent.appendChild( that.flip );
                }
            }
        },

        globalTransitionEnd : function() {
            this.refreshFlip();
        },

        // When a transition is started
        onObscure : function()
        {
            var that = this;
            if( that.listener.onObscure ) {
                that.listener.onObscure();
            }
        },

        // When the page is the topmost
        onStay : function()
        {
            var that = this;
            if( that.listener.onStay ) {
                that.listener.onStay();
            }
        },

        // When the page is originally shown
        onShowComplete : function()
        {
            var that = this;
            if( that.listener.onShowComplete ) {
                that.listener.onShowComplete();
            }
            that.onStay();
        }
    };
    
    return {

        // Create a custom page using provided HTML
        create : function( html, listener ) {
            
            var draggable = Object.create( pagePrototype );
    
            draggable.listener = listener;
            draggable.html = document.createElement( 'div' );
            draggable.html.className = 'page-wrapper';
            draggable.html.appendChild( html );
            draggable.flip = draggable.html.cloneNode( true );

            return draggable;
        }
    };
}());

