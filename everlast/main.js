var videoTemplate = '<% _.each(items, function(itm) { %> <li class="background-image ContentItemVideo fade video-grid-item fadeIn" style="background-image: url(<%= itm.thumbnailUrl %>);"><div class="VideoOverlay"><div class="ActionText"><a class="PlayLink" data-video-id="<%= itm.id %>" href="#">P</a></div><p class="TitleText"><%= itm.titleText %></p> <% }); %>';

// itm.thumbnailUrl
// itm.titleText
// itm.prettyDuration
// itm.videoId

var everlastCollectionId = 136645;//137568 137553 137567 137566
var donnieCollectionId = 146804;

var api = new TVPageAPI({
  collectionId: everlastCollectionId,
  playerDOMId: 'tvp-player'
});

window.onload = function() {

  api.ready(function(API){

    var canvas = document.getElementsByClassName('tvp-canvas');
    var videoContainer = document.getElementById('video-container');

    var spotRenderTimer;
    var spotShowTimer;
    var spotHideTimer;
    // var msTime = 6000;

    function renderSpot(data) {
      var compiled = _.template('<div class="background-image SpotItem"><div class="SpotOverlay"><img class="SpotImage" src="' + data.imageUrl + '"><p>' + data.title + '</p><button class="button">' + data.actionText + '</button></div></div>');
      var spotContainer = document.getElementsByClassName('SpotContainer');
      spotContainer[0].innerHTML = compiled(data);
    }

    function showSpot() {
      var spotShelf = document.getElementsByClassName('tvp-spots');
      spotShelf[0].style['-webkit-transform'] = 'translate(0px, 0%)';
    }

    function hideSpot() {
      var spotShelf = document.getElementsByClassName('tvp-spots');
      spotShelf[0].style['-webkit-transform'] = 'translate(0px, 100%)';
    }

    function showPip() {
      var pipYShift = parseInt((Math.random() * 150), 10);
      var pipXShift = parseInt((Math.random() * 200), 10);
      var ySign = Math.random() >= 0.5 ? '' : '-';
      var xSign = Math.random() >= 0.5 ? '' : '-';

      var pip = document.getElementsByClassName('tvp-remote');
      pip[0].style.top = (parseInt(ySign + pipYShift, 10) + 200) + 'px';
      pip[0].style.left = (parseInt(xSign + pipXShift, 10) + 400) + 'px';
    }

    function hidePip() {
      var pip = document.getElementsByClassName('tvp-remote');
      pip[0].style.left = '1000px';
    }

    function cycle(c, i, data) {
      if (i === 0) {
        return;
      }
      if (c === i) {
        c = 0;
      }
      spotTimer = setTimeout(function() {

        showPip();

        spotShowTimer = setTimeout(function() {

          hidePip();
          renderSpot(data[c]);
          showSpot();
          API.registerProductImpression(data[c].product);

          spotHideTimer = setTimeout(function() {

            hideSpot();
            cycle(++c, i, data);

          }, 4000);

        }, 2000);

      }, 1000);
    }

    API.player.on('MEDIA_VIDEO_PLAYING', function(e) {
      canvas[0].style['-webkit-transform'] = 'translate(0px, 100%)';
      videoContainer.style['-webkit-transform'] = 'translate(0px, 100%)';

      // getSpots();API.player.getVideo()
      API.products.getProducts(API.player.getVideo(), function(products) {
        // var counter = 0;
        var productJSON = [];//products.toJSON();
        for (var i=0,len=products.length;i<len;i++) {

          var product = products.at(i);
          productJSON.push(JSON.parse(product.get('data')));
          productJSON[i].title = product.get('title');
          productJSON[i].product = products.at(i);

        }

        cycle(0, i, productJSON);

        // console.log(productJSON);

      }, function(e) {
        console.log(e);
      });

    });

    API.player.on('MEDIA_VIDEO_ENDED', function() {
      canvas[0].style['-webkit-transform'] = 'translate(0px, 0%)';
      clearTimeout(spotRenderTimer);
      clearTimeout(spotShowTimer);
      clearTimeout(spotHideTimer);
      hideSpot();
      hidePip();
    });

    var children = API.collection.getChildren(API.collection.getAtIndex(0).id);

    var items = [];
    for (var i=0,len=children.length;i<len;i++) {
      items.push(children[i].toJSON());
    }

    var gridList = document.getElementById('grid-list');
    var gridItems =  _.template(videoTemplate, {items:items});
    gridList.innerHTML = gridItems;

    var menuButton = document.getElementById('menu-button');

    menuButton.onclick = function() {

      // var videoContainer = document.getElementById('video-container');

      if (videoContainer.style['-webkit-transform'] === 'translate(0px, 100%)') {
        videoContainer.style['-webkit-transform'] = '';
        videoContainer.style['overflow-y'] = 'scroll';
      } else {
        videoContainer.style['-webkit-transform'] = 'translate(0px, 100%)';
      }

    };

    var anchorElements = document.getElementsByTagName('a');

    for (var i=0,len=anchorElements.length;i<len;i++) {
      anchorElements[i].onclick = function(e) {
        e.stopPropagation();
        e.preventDefault();

        var id = e.target.attributes[1].value;
        var video = API.collection.getItemById(id);

        API.player.loadVideo(video);
        API.player.ready(function() {

          API.registerVideoView(video);

        }, function(e) {
          console.log('Error Loading Video:', e);
        });

        // if (video !== undefined) {

          // API.products.getProducts(video, function(products) {

          //   var productJSON = [];//products.toJSON();
          //   for (var i=0,len=products.length;i<len;i++) {

          //     API.registerProductImpression(products.at(i));

          //     var product = products.at(i);
          //     productJSON.push(JSON.parse(product.get('data')));
          //     productJSON[i].id = product.get('id');
          //   }

          //   // var gridList = document.getElementById('product-grid');
          //   // var gridItems =  _.template(productTemplate, {items:productJSON});
          //   // gridList.innerHTML = gridItems;
          //   console.log(productJSON);

          // }, function(e) {
          //   console.log(e);
          // });
        // }
      }
    }

  }, function(e){
    console.log('Sorry about this, but something went wrong...', e);
  });

};


