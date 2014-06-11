window.onload = function() {

  var videoTemplate = '<% _.each(items, function(itm) { %> <li class="background-image ContentItemVideo fade video-list-item fadeIn"><div class="list-item-media background-image" style="background-image:url(<%= itm.thumbnailUrl %>);"></div><div class="list-item-body"><h4 class="list-item-heading"><a class="PlayLink" data-video-id="<%= itm.id %>" href="#"><%= itm.titleText %></a></h4></div></li> <% }); %>';

  // Instantiate the api
  var api = new TVPageAPI({
    collectionId: 138014,
    playerDOMId: 'tvp-player'
  });

  api.ready(function(API){

    // var canvas = document.getElementsByClassName('tvp-canvas');
    var canvas = document.querySelectorAll('.tvp-canvas');
    var videoContainer = document.getElementById('video-container');

    // Timer vars;
    var spotPipTimer;
    var spotShowTimer;
    var spotHideTimer;

    function renderProduct(data) {
      var compiled = _.template('<div class="background-image SpotItem"><div class="SpotOverlay"><img class="SpotImage" src="' + data.imageUrl + '"><p>' + data.title + '</p><button class="spot-action button">' + data.actionText + '</button></div></div>');
      // var spotContainer = document.getElementsByClassName('SpotContainer');
      var spotContainer = document.querySelectorAll('.SpotContainer');
      spotContainer[0].innerHTML = compiled(data);

      // Set click event for button in the spot to register the click with analytics
      // var buttonSpot = document.getElementsByClassName('spot-action');
      var buttonSpot = document.querySelectorAll('.spot-action');
      buttonSpot[0].onclick = function() {
        API.registerProductClick(data.product);
      }
    }

    function showProduct() {
      // var spotShelf = document.getElementsByClassName('tvp-spots');
      var spotShelf = document.querySelectorAll('.tvp-spots');
      spotShelf[0].style.WebkitTransform = 'translate(0px, 0%)';
      spotShelf[0].style.msTransform = 'translate(0px, 0%)';
      spotShelf[0].style.transform = 'translate(0px, 0%)';
    }

    function hideProduct() {
      // var spotShelf = document.getElementsByClassName('tvp-spots');
      var spotShelf = document.querySelectorAll('.tvp-spots');
      spotShelf[0].style.WebkitTransform = 'translate(0px, 100%)';
      spotShelf[0].style.msTransform = 'translate(0px, 100%)';
      spotShelf[0].style.transform = 'translate(0px, 100%)';
    }

    function showPip() {
      var pipYShift = parseInt((Math.random() * 225), 10);
      var pipXShift = parseInt((Math.random() * 300), 10);
      var ySign = Math.random() >= 0.5 ? '' : '-';
      var xSign = Math.random() >= 0.5 ? '' : '-';

      // var pip = document.getElementsByClassName('tvp-remote');
      var pip = document.querySelectorAll('.tvp-remote');
      pip[0].style.top = (parseInt(ySign + pipYShift, 10) + 260) + 'px';
      pip[0].style.left = (parseInt(xSign + pipXShift, 10) + 465) + 'px';
    }

    function hidePip() {
      // var pip = document.getElementsByClassName('tvp-remote');
      var pip = document.querySelectorAll('.tvp-remote');
      pip[0].style.left = '1000px';
    }

    // Logic and timers to show video products in a more unique way
    function cycleProducts(c, i, data) {
      if (i === 0) {
        return;
      }
      if (c === i) {
        c = 0;
      }
      spotPipTimer = setTimeout(function() {
        showPip();
        spotShowTimer = setTimeout(function() {
          hidePip();
          renderProduct(data[c]);
          showProduct();

          // Register a product impression in analytics
          API.registerProductImpression(data[c].product);
          spotHideTimer = setTimeout(function() {
            hideProduct();
            cycleProducts(++c, i, data);
          }, 4000);
        }, 2000);
      }, 1000);
    }

    // When the video starts
    API.player.on('MEDIA_VIDEO_PLAYING', function(e) {

      // Hide the canvas and video list
      canvas[0].style.WebkitTransform = 'translate(0px, 100%)';
      canvas[0].style.msTransform = 'translate(0px, 100%)';
      canvas[0].style.transform = 'translate(0px, 100%)';
      videoContainer.style.WebkitTransform = 'translate(-100%, 0px)';
      videoContainer.style.msTransform = 'translate(-100%, 0px)';
      videoContainer.style.transform = 'translate(-100%, 0px)';

      // Get all of the products for the current video
      API.products.getProducts(API.player.getVideo(), function(products) {
        var productJSON = [];
        for (var i=0,len=products.length;i<len;i++) {
          var product = products.at(i);
          productJSON.push(JSON.parse(product.get('data')));
          productJSON[i].title = product.get('title');
          productJSON[i].product = products.at(i);
        }

        // Show the user the products
        cycleProducts(0, i, productJSON);
      }, function(e) {
        console.log(e);
      });

    });

    // When the video ends
    API.player.on('MEDIA_VIDEO_ENDED', function() {

      // Put the canvas image back
      canvas[0].style.WebkitTransform = 'translate(0px, 0%)';
      canvas[0].style.msTransform = 'translate(0px, 0%)';
      canvas[0].style.transform = 'translate(0px, 0%)';

      // Stop all spot activity
      clearTimeout(spotPipTimer);
      clearTimeout(spotShowTimer);
      clearTimeout(spotHideTimer);
      hideProduct();
      hidePip();
    });

    // Set up menu button click: hide/show the video list
    var menuButton = document.getElementById('menu-button');
    menuButton.onclick = function() {
      if (videoContainer.style.WebkitTransform === 'translate(-100%, 0px)' ||
            videoContainer.style.transform === 'translate(-100%, 0px)' ||
            videoContainer.style.msTransform === 'translate(-100%, 0px)') {

        videoContainer.style.WebkitTransform = '';
        videoContainer.style.msTransform = '';
        videoContainer.style.transform = '';
        videoContainer.style['overflow-y'] = 'scroll';
      } else {
        videoContainer.style.WebkitTransform = 'translate(-100%, 0px)';
        videoContainer.style.msTransform = 'translate(-100%, 0px)';
        videoContainer.style.transform = 'translate(-100%, 0px)';
      }
    };

    // Get the videos to render the list
    var children = API.collection.getChildren(API.collection.getAtIndex(0).id);
    var items = [];
    for (var i=0,len=children.length;i<len;i++) {
      items.push(children[i].toJSON());
    }

    // Render the Menu list
    // var gridList = document.getElementsByClassName('list');
    var gridList = document.querySelectorAll('.list');
    var gridItems =  _.template(videoTemplate, {items:items});
    gridList[0].innerHTML = gridItems;

    // Set click events on the video list to play their videos
    var anchorElements = document.getElementsByTagName('a');
    for (var i=0,len=anchorElements.length;i<len;i++) {
      anchorElements[i].onclick = function(e) {

        // Don't use default <a> tag behavior
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        } else if (event) {
          event.returnValue = false;
        }

        // Get video object
        var id;
        if (e) {
          var attributes = e.target.attributes;
        } else if (event) {
          var attributes = event.srcElement.attributes;
        }

        for (var i=0,len=attributes.length;i<len;i++) {
          if (attributes[i].nodeName === 'data-video-id') {
            id = attributes[i].nodeValue;
            break;
          }
        }

        if (!id) {
          return false;
        }
        var video = API.collection.getItemById(id);

        // Load video into player
        API.player.loadVideo(video);
        API.player.ready(function() {

          // Register a video view in analytics
          API.registerVideoView(video);
        }, function(e) {
          console.log('Error Loading Video:', e);
        });

      }
    }

    // Register with analytics that the player was viewed
    API.registerPlayerImpression(API.collection.getAtIndex(0));

  }, function(e){
    console.log('Sorry about this, but something went wrong...', e);
  });

};