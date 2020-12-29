
var spark = window.spark || {};

spark.button = (function() 
{
  var buttonPrototype,
    getPagePosition,
    hasTouch = !window.hasOwnProperty( 'ontouchstart' ),
    MOVEMENT_ALLOWED = 15;

	getPagePosition = function( e )
	{
		e = e.touches ? e.touches[0] : e;
		return { x : e.pageX , y : e.pageY };
	};

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
			that.touchStartXY = getPagePosition( e );

			document.body.addEventListener( 'touchmove', that, false );
			document.body.addEventListener( 'touchend', that, false );

			return false;
		},
		
		handleTouchMove : function( e )
		{
			var that = this;
			
			that.previousEvent = e;

			if( that.outOfBounds( that.touchStartXY, getPagePosition( e ) ) ) {
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
				that.invokeCallback( e, that.target );
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

			if( hasTouch ) {
				target.onclick = function( e ) {
					invokeCallback( e, target );
					e.preventDefault();
					return false;
				};
			}
		}
	};
}());

document.addEventListener("DOMContentLoaded", function(){
	var doc = document,
		photos = doc.getElementsByClassName('illustration-hero'),
		showIllustration,
		closeIllustration,
		scrollHandler,
		popup,
		i;

	scrollHandler = function(e){
		e.preventDefault();
		e.stopPropagation();
	};

	closeIllustration = function(){
		if( popup ){
			popup.className = '';
		}
		document.body.removeEventListener('wheel', scrollHandler);
	};

	showIllustration = function(e, target){
		if( !popup ){
			popup = doc.createElement('div');
			popup.id = 'popup-wrapper';
			spark.button.create(popup,closeIllustration);
		}
		popup.innerHTML = '<div class="popup" style="background-image:url(' + target.src + ');"></div>';
		if( !popup.parentNode ) {
			document.body.appendChild( popup );
		}
		document.body.addEventListener('wheel', scrollHandler);
		setTimeout(function(){
			popup.className = 'show';
		},0);
	};

	for( i = 0; i < photos.length; i++ ){
		spark.button.create( photos[i], showIllustration );
	}
});