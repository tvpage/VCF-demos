var videoTemplate = '<% _.each(items, function(itm) { %> <li class="background-image ContentItemVideo fade video-grid-item fadeIn" style="background-image: url(<%= itm.thumbnailUrl %>);"><div class="VideoOverlay"><div class="ActionText"><a class="PlayLink" data-video-id="<%= itm.id %>" href="#">P</a></div><p class="TitleText"><%= itm.titleText %></p> <% }); %>';
// itm.thumbnailUrl
// itm.titleText
// itm.prettyDuration
// itm.videoId

var everlastCollectionId = 136645;//137568 137553 137567 137566
var donnieCollectionId = 146804;

var api = new TVPageAPI({
  collectionId: everlastCollectionId,
  playerDOMId: 'tvpage'
});

window.onload = function() {

  api.ready(function(API){

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

      var videoContainer = document.getElementById('video-container');

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

        if (video !== undefined) {

          API.products.getProducts(video, function(products) {

            var productJSON = [];//products.toJSON();
            for (var i=0,len=products.length;i<len;i++) {

              API.registerProductImpression(products.at(i));

              var product = products.at(i);
              productJSON.push(JSON.parse(product.get('data')));
              productJSON[i].id = product.get('id');
            }

            // var gridList = document.getElementById('product-grid');
            // var gridItems =  _.template(productTemplate, {items:productJSON});
            // gridList.innerHTML = gridItems;
            console.log(productJSON);

          }, function(e) {
            console.log(e);
          });
        }
      }
    }

  }, function(e){
    console.log('Sorry about this, but something went wrong...', e);
  });

};


