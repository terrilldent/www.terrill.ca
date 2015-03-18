window.onload = function()
{
	var thumbnails = document.getElementById('thumbnails'),
		viewer = document.getElementById('background_example'),
		changeBackground,
		curSrc;
		
	changeBackground = function( e )
	{
		var target = e.touches ? e.touches[ 0 ].target : e.target;
		if( target.tagName.toUpperCase() === 'IMG' && curSrc !== target.src ) {
			curSrc = target.src;
			viewer.style.backgroundImage = 'url(' + curSrc + ')';
		}
	};

	thumbnails.addEventListener('mousemove', changeBackground, false );
	thumbnails.addEventListener('touchmove', changeBackground, false );
};