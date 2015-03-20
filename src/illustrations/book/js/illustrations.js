/*jslint bitwise: true, browser: true, continue: false, devel: true, plusplus: true, regexp: true, sloppy: true, white: true */
/*global td, miro, flip, $, document, window */

/* Copyright Terrill Dent, 2013 */

var illustrations = window.illustrations || {};

illustrations = (function()
{
        // Objects
    var pages = [],
        
        // Functions
        currentIndex = 0,
        handleShowComplete,
        createPage;


    handleShowComplete = function( index )
    {
        return function() {
            currentIndex = index;

            if( pages[ index + 1 ] ) {
                flip.prime( pages[ index + 1 ] );
            }
        };
    };

    createPage = function( div, index )
    {
        var menuButton = miro.create( 'b',  { className : 'global-menu', innerHTML : '<b>&nbsp;</b>' } ),
            masthead   = miro.create( 'span', { className : 'legal-text', innerHTML : 'Terrill Dent' } ),
            pageNumber = miro.create( 'span', { className : 'page-number', textContent : index } );
          
        
        miro.remove( div );
        div.appendChild( menuButton );
        if( index > 1 ) {
            div.appendChild( masthead );
        }
        if( index > 1 ) {
            div.appendChild( pageNumber );
        }
        miro.button.create( menuButton, miro.menu.show );

        return flip.page.create( div, { onShowComplete : handleShowComplete( index ) } );
    };
    
    return {
        showPage : function( index )
        {
            return function() {
                var delay = 300;
                miro.menu.hide();
                if( currentIndex === index ) {
                    return;
                } 
                if( currentIndex > index ) {
                    flip.close();
                    delay = 700;
                }
                setTimeout( function() {
                    flip.push( pages[ index ] );
                }, delay );            
            };
        },

        init : function()
        {
            var bookPagesParent = $('book-pages'),
                pageIndex = 0;

            miro.remove( bookPagesParent );
            while( bookPagesParent.firstElementChild ) {
                //console.log( bookPagesParent.firstElementChild );
                pages.push( createPage( bookPagesParent.firstElementChild, pageIndex ) );
                pageIndex++;
            }

            //console.log( pages );

            // Show the first page
            flip.init( $('all-pages'), $('flip-pages'), $('shadow'), pages[ 0 ] );
        }
    };
}());

window.addEventListener( 'DOMContentLoaded', illustrations.init, true );

