var templateString = '<% _.each(items, function(itm) { %> <li class="grid-item background-image ContentItemVideo fade fadeIn" style="background-image: url(<%= itm.thumbnailUrl %>);"><div class="VideoOverlay"><div class="text-center TitleText roman bottom-center" style="height:55px;"><%= itm.titleText %></div><div class="DetailsText top-center" style="top:0;"><div class="upper-left gothic font18">VIDEO</div><div class="upper-right gothic font18"><%= itm.prettyDuration %></div></div><p class="text-center"><button data-video-id="<%= itm.id %>" class="btn gothic PlayLink roman font22" style="font-size: 20px; padding-top:6px;line-height: 20px;">PLAY</button></p></div></li> <% }); %>';
var productTemplate = '<% _.each(items, function(itm) { %> <li class="grid-item background-image SpotItem" style="background-image: url(<%= itm.imageUrl %>);"><div class="SpotOverlay"><p class="roman" style="font-size:14px;"><%= itm.displayTitle %></p><p><button data-video-id="<%= itm.id %>" class="btn gothic ProductButton" style="font-size: 20px; padding-top:6px;line-height: 20px;"><%= itm.actionText %></button></p></div></li> <% }); %>';
var leaderBikesCollectionId = 143889;
var donnieCollectionId = 146804;

var api = new TVPageAPI({
  collectionId: leaderBikesCollectionId,
  playerDOMId: 'TVPage_Player'
});

window.onload = function() {

api.ready(function(API){

  console.log('ready: ', arguments);

    var gridList = document.getElementById('grid-list');

    var children = API.collection.getChildren(API.collection.getAtIndex(0).id);
    var items = [];
    for (var i=0,len=children.length;i<len;i++) {
      items.push(children[i].toJSON());
    }

    var gridItems =  _.template(templateString, {items:items});
    gridList.innerHTML = gridItems;

    var playButtons = document.getElementsByClassName('PlayLink');

    for (var i=0,len=playButtons.length;i<len;i++) {
      playButtons[i].onclick = function(e) {
        e.stopPropagation();
        e.preventDefault();

        var id = e.target.attributes[0].value;
        var video = API.collection.getItemById(id);
        API.player.loadVideo(video);
        API.player.ready(function() {
          API.registerVideoView(API.collection.getKey(), video.get('id'));
        }, function(e) {
          console.log('Error Loading Video:', e);
        });

        if (video !== undefined) {
          API.products.getProducts(video.get('id'), function(products) {
            var productJSON = products.toJSON();
            for (var i=0, len = productJSON.length;i<len;i++) {
              var productId = productJSON[i].id;
              API.registerProductImpression(API.collection.getKey(), video.get('id'), productJSON[i].id);
              productJSON[i] = JSON.parse(productJSON[i].data);
              productJSON[i].id = productId;
            }
            var gridList = document.getElementById('product-grid');
            var gridItems =  _.template(productTemplate, {items:productJSON});
            gridList.innerHTML = gridItems;

            var productButton = document.getElementsByClassName('ProductButton');

            for (var i=0,len=productButton.length;i<len;i++) {
              productButton[i].onclick = function(e) {
                e.stopPropagation();
                e.preventDefault();
                var id = e.target.attributes[0].value;
                API.registerProductClick(API.collection.getKey(), video.get('id'), id);
              }
            }
          }, function(e) {
            console.log(e);
          });
        }
      }
    }

    API.registerPlayerImpression(API.collection.getKey());

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