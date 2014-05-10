window.onload = function() {

  var videoTemplate = '<% _.each(items, function(itm) { %> <li class="background-image ContentItemVideo fade video-list-item fadeIn"><div class="list-item-media background-image" style="background-image:url(<%= itm.thumbnailUrl %>);"></div><div class="list-item-body"><h4 class="list-item-heading"><a class="PlayLink" data-video-id="<%= itm.id %>" href="#"><%= itm.titleText %></a></h4></div></li> <% }); %>';

  var api = new TVPageAPI({
    collectionId: 138014,
    playerDOMId: 'tvp-player'
  });

  api.ready(function(API){

    var canvas = document.getElementsByClassName('tvp-canvas');
    var videoContainer = document.getElementById('video-container');

    var spotPipTimer;
    var spotShowTimer;
    var spotHideTimer;

    function renderSpot(data) {
      var compiled = _.template('<div class="background-image SpotItem"><div class="SpotOverlay"><img class="SpotImage" src="' + data.imageUrl + '"><p>' + data.title + '</p><button class="spot-action button">' + data.actionText + '</button></div></div>');//data-video-id="' + data.connectId + '"
      var spotContainer = document.getElementsByClassName('SpotContainer');
      spotContainer[0].innerHTML = compiled(data);

      var buttonSpot = document.getElementsByClassName('spot-action');
      buttonSpot[0].onclick = function() {
        API.registerProductClick(data.product);
      }
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
      var pipYShift = parseInt((Math.random() * 225), 10);
      var pipXShift = parseInt((Math.random() * 300), 10);
      var ySign = Math.random() >= 0.5 ? '' : '-';
      var xSign = Math.random() >= 0.5 ? '' : '-';

      var pip = document.getElementsByClassName('tvp-remote');
      pip[0].style.top = (parseInt(ySign + pipYShift, 10) + 260) + 'px';
      pip[0].style.left = (parseInt(xSign + pipXShift, 10) + 465) + 'px';
    }

    function hidePip() {
      var pip = document.getElementsByClassName('tvp-remote');
      pip[0].style.left = '1000px';
    }

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
          renderSpot(data[c]);
          showSpot();
          API.registerProductImpression(data[c].product);
          spotHideTimer = setTimeout(function() {
            hideSpot();
            cycleProducts(++c, i, data);
          }, 4000);
        }, 2000);
      }, 1000);
    }

    API.player.on('MEDIA_VIDEO_PLAYING', function(e) {
      canvas[0].style['-webkit-transform'] = 'translate(0px, 100%)';
      videoContainer.style['-webkit-transform'] = 'translate(-100%, 0px)';
      API.products.getProducts(API.player.getVideo(), function(products) {
        var productJSON = [];
        for (var i=0,len=products.length;i<len;i++) {
          var product = products.at(i);
          productJSON.push(JSON.parse(product.get('data')));
          productJSON[i].title = product.get('title');
          productJSON[i].connectId = product.get('connectId');
          productJSON[i].product = products.at(i);
        }
        cycleProducts(0, i, productJSON);
      }, function(e) {
        console.log(e);
      });

    });

    API.player.on('MEDIA_VIDEO_ENDED', function() {
      canvas[0].style['-webkit-transform'] = 'translate(0px, 0%)';
      clearTimeout(spotPipTimer);
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
    var gridList = document.getElementsByClassName('list');
    var gridItems =  _.template(videoTemplate, {items:items});
    gridList[0].innerHTML = gridItems;

    var menuButton = document.getElementById('menu-button');
    menuButton.onclick = function() {
      if (videoContainer.style['-webkit-transform'] === 'translate(-100%, 0px)') {
        videoContainer.style['-webkit-transform'] = '';
        videoContainer.style['overflow-y'] = 'scroll';
      } else {
        videoContainer.style['-webkit-transform'] = 'translate(-100%, 0px)';
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

      }
    }

  }, function(e){
    console.log('Sorry about this, but something went wrong...', e);
  });

};