/*jslint bitwise: true, browser: true, continue: false, devel: true, plusplus: true, regexp: true, sloppy: true, white: true */
/*global miro, $, document, window */

/* Copyright Terrill Dent, 2013 */


var miro = miro || {};

miro.menu = (function()
{
    var menu = miro.createEventSource(),
        menuHTML,
        init;

    init = function()
    {
        var item,
            menuDismiss    = miro.create( 'div', { id : 'menu-dismiss' } ),
            collectionList = miro.create( 'div', { id : 'collection-list' } ),
            menuHeader     = miro.create( 'div', { id : 'menu-header',
                                                   innerHTML : '<h1>Contents</h1>' } );


        menuHTML = miro.create( 'div', { id : 'menu' } );

        // Dismiss overlay
        miro.consumeScrollEvents( menuDismiss );
        miro.button.create( menuDismiss, menu.hide );


        // List
        item = miro.create( 'div', { className : 'collection-item', textContent: 'Cover' } ),
        miro.button.create( item, function() {
            menu.hide();
            setTimeout( function() {
                flip.close();
            }, 200 );
        } );
        collectionList.appendChild( item );

        item = miro.create( 'div', { className : 'collection-item', textContent: 'Pencil Crayon' } ),
        miro.button.create( item, illustrations.showPage( 1 ) );
        collectionList.appendChild( item );

        item = miro.create( 'div', { className : 'collection-item', textContent: 'Vector' } ),
        miro.button.create( item, illustrations.showPage( 6 ) );
        collectionList.appendChild( item );

        item = miro.create( 'div', { className : 'collection-item', textContent: 'Digital Paint' } ),
        miro.button.create( item, illustrations.showPage( 8 ) );
        collectionList.appendChild( item );


        // Menu
        miro.consumeScrollEvents( menuHTML );
        menuHTML.appendChild( menuHeader ); 
        menuHTML.appendChild( collectionList );


        document.body.insertBefore( menuHTML, document.body.childNodes[ 0 ] );
        document.body.appendChild( menuDismiss );

    };

    menu.hide = function()
    {
        miro.removeClass( document.body, 'show-menu' );
        setTimeout( function() {
            miro.addClass( menuHTML, 'hidden' );
        }, 600 );
    };

    menu.show = function()
    {
        var firstInit = !menuHTML;
        if( firstInit ) {
            init();
        }
        miro.removeClass( menuHTML, 'hidden' );

        setTimeout( function() {
            miro.addClass( document.body, 'show-menu' );    
        }, firstInit ? 20 : 0 );
    };

    return menu;

}());
