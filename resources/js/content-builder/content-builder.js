$.noConflict(); // enable save mode

var widgetTemplates; // holds static markup for sidebar widgets

// entry point
jQuery(document).ready(function()
{
    initCeresForGridstack();
});

// inject all shop-builder functions
function initCeresForGridstack()
{
    initWidgetTemplates();
    removeDefaultLinks();
    injectGridstackMarkup();
    addBackendEventListeners();
}

// get static markup for loaded sidebar widgets
function initWidgetTemplates()
{
    widgetTemplates = {
        'CategoryHighlight': [jQuery('#categoryHighlight').clone()[0].outerHTML, jQuery('#categoryHighlight').outerHeight(true)],
        'CategoryFeature': [jQuery('#categoryFeature').clone()[0].outerHTML, jQuery('#categoryFeature').outerHeight(true)],
        'ImageSlider': [jQuery('#imageSlider').clone()[0].outerHTML, jQuery('#imageSlider').outerHeight(true)],
        'CategoryList': [jQuery('#categoryList').clone()[0].outerHTML, jQuery('#categoryList').outerHeight(true)],
    };
}

/**
 * add context menu for hovered element
 * @param element
 */
function addContextMenu(element)
{
    // inject menu markup into given element
    jQuery(element).append('<div class="context-menu"></div>');

    // show context menu
    jQuery(element).mouseenter(function ()
    {
        jQuery(this).find('.context-menu').css('display','block');
    });

    // hide context menu
    jQuery(element).mouseleave(function ()
    {
        jQuery(this).find('.context-menu').css('display','none');
    });

    // add buttons
    addEditButton(element);
    addDeleteButton(element);
}

/**
 * add delete button element to context menu
 * @param element
 */
function addDeleteButton(element)
{
    // inject button markup into given context element
    jQuery(element).find('.context-menu').append('<div class="shopbuilder-icon delete-icon fa fa-trash"></div>');

    // delete widget container
    jQuery(element).find('.delete-icon').click(function ()
    {
        // todo: @vwiebe fix dropzone scope
        jQuery('.grid-stack-0').data('gridstack').removeWidget(jQuery(this).closest('.grid-stack-item'));
    });
}

/**
 * add edit button element for context menu
 * @param element
 */
function addEditButton(element)
{
    // inject button markup into given context element
    jQuery(element).find('.context-menu').append('<div class="shopbuilder-icon edit-icon fa fa-pencil"></div>');

    // open properties
    jQuery(element).find('.edit-icon').click(function ()
    {
        // dummy data
        var propertiesObject = {
            widgetWidth: {
                controlType:"inputNumber",
                options:{
                    label:"Breite",
                    required:false
                }
            },
            widgetHeadline: {
                controlType:"inputText",
                options:{
                    label:"Header",
                    required:false
                }
            }
        };

        // trigger properties event
        var customEvent = new CustomEvent('CustomEvent');
        customEvent.initCustomEvent('shopbuilder_open_properties', true, true, propertiesObject);
        window.parent.window.dispatchEvent(customEvent);
        jQuery('body').trigger('shopbuilder_open_properties', propertiesObject);
    });
}

function addBackendEventListeners()
{
    // drop element into iframe
    jQuery('body').on('shopbuilder_drop', function(element)
    {
        addContentWidget(element.originalEvent.detail.identifier);
    });

    // reset iframe
    jQuery('body').on('shopbuilder_reset', function()
    {
        jQuery('body').html('');
        jQuery('body').addClass('loading');

        window.location.reload(true);
    });

    // zoom iframe
    jQuery('body').on('shopbuilder_zoom', function(event)
    {
        var value = event.originalEvent.detail.value;
        jQuery('body').css('zoom', value * 100 + '%')
    })

    // open properties
    jQuery('body').on('shopbuilder_open_properties', function(event, object)
    {
        console.log(object);
    });

    // test
    // jQuery('.brand-wrapper').append('<button id="testEventButton">trigger event</button>');
    // jQuery('#testEventButton').on('click', function ()
    // {
    //     jQuery('body').trigger('shopbuilder_zoom', 0.5);
    // });
}

/**
 * add new content element to iframe
 * @param element
 */
function addContentWidget(element)
{
    // get element markup by element identifier
    var object = widgetTemplates[element][0];
    var height = widgetTemplates[element][1];

    // wrap element with gridstack containers
    var gridStackItem = jQuery(  '<div class="grid-stack-item"' +
        '     data-gs-height="' + Math.round(height / 40) + '"><div class="grid-stack-item-content">' + object + '</div>' +
        '</div>');

    setDragCursorToChildElements(gridStackItem);
    addContextMenu(gridStackItem);

    jQuery('.grid-stack-0').data('gridstack').addWidget(gridStackItem);
}

/**
 * set drag cursor on all element layers
 * @param element
 */
function setDragCursorToChildElements(element)
{
    // iterate over all child elements
    jQuery(element).find('*').each(function()
    {
        jQuery(this).css('cursor','move');
    });
}

function removeDefaultLinks()
{
    // iterate over all body elements
    jQuery('body').find('*').each(function()
    {
        jQuery(this).click(function (event)
        {
            // prevent default click action
            event.preventDefault();
        })
    });
}

function injectGridstackMarkup()
{
    // select drag & drop areas
    jQuery('#page-body > .container-max > .row > .col').each(function(i)
        // jQuery('.mkt-homepage').each(function(i)
    {
        jQuery(this).css('position', 'relative');

        // iterate over all sub-elements
        jQuery(this).find('> *').each(function(j)
        {
            // create gridstack item markup
            var gridStackItem = jQuery(  '<div class="grid-stack-item"' +
                '     data-gs-height="' + Math.round(jQuery(this).outerHeight(true) / 40) + '"><div class="grid-stack-item-content"></div>' +
                '</div>');

            // overwrite cursor for all contained elements
            setDragCursorToChildElements(jQuery(this));

            // add hover menu to container
            addContextMenu(gridStackItem);

            // wrap current element with gridstack item markup
            jQuery(this).wrap(gridStackItem)

            ++j;
        });

        // add gridstack container class for current drag & drop area
        jQuery(this).addClass('grid-stack-' + i);

        // initialize gridstack for current gridstack container
        initGridstack(i);

        ++i;
    });
}

/**
 * init function for gridstack
 * @param identifier
 */
function initGridstack(identifier)
{
    var options = {
        width:1,
        cellHeight: 40,
        verticalMargin: 0,
        acceptWidgets: '.grid-stack-item'
    };

    var selector = '.grid-stack-' + identifier;
    jQuery(selector).gridstack(options);
}
