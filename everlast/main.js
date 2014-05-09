var videoTemplate = '<% _.each(items, function(itm) { %> <li class="background-image ContentItemVideo fade video-grid-item fadeIn" style="background-image: url(<%= itm.thumbnailUrl %>);"><div class="VideoOverlay"><div class="ActionText"><a class="PlayLink" data-video-id="<%= itm.videoId %>" href="#">P</a></div><p class="TitleText"><%= itm.titleText %></p> <% }); %>';
// itm.thumbnailUrl
// itm.titleText
// itm.prettyDuration
// itm.videoId


var donnieCollectionId = 146804;

var api = new TVPageAPI({
  collectionId: donnieCollectionId,
  playerDOMId: 'tvpage'
});

window.onload = function() {

api.ready(function(API){

  console.log('ready: ', arguments);

  // $(document).ready(function(){
  // window.onload = function() {
    var gridList = document.getElementById('grid-list');
    var gridItems =  _.template(videoTemplate, {items:API.collection.getChildren(API.collection.getAtIndex(0).id)});
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
        var videoId = e.target.attributes[1].value;
        API.player.loadByVideoId(videoId);
        if (videoId !== undefined && videoId !== 'undefined') {
          api.products.getProducts(API.collection.getItemByVideoId(videoId).id, function(products) {
            var productJSON = products.toJSON();
            for (var i=0, len = productJSON.length;i<len;i++) {
              productJSON[i] = JSON.parse(productJSON[i].data);
            }
            var gridList = document.getElementById('product-grid');
            var gridItems =  _.template(productTemplate, {items:productJSON});
            gridList.innerHTML = gridItems;
          }, function(e) {
            console.log(e);
          });
        }
      }
    }

    // $(document).on('click', 'a', function(e) {
    //   e.stopPropagation();
    //   e.preventDefault();
    //   API.player.loadByVideoId($(e.target).attr('data-video-id'));

    //   var videoId = $(e.target).attr('data-video-id');

    //   if (videoId !== undefined && videoId !== 'undefined') {
    //     api.products.getProducts(API.collection.getItemByVideoId(videoId).id, function(products) {
    //       var productJSON = products.toJSON();
    //       for (var i=0, len = productJSON.length;i<len;i++) {
    //         productJSON[i] = JSON.parse(productJSON[i].data);
    //       }
    //       var gridItems =  _.template(productTemplate, {items:productJSON});
    //       $('.tvp-spots > .SpotContainer > ul').append(gridItems);
    //     }, function(e) {
    //       console.log(e);
    //     });
    //   }
    // });

  // };
  // });

}, function(e){
  console.log('Sorry about this, but something went wrong...', e);
});

};


