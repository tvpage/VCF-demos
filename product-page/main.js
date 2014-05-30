window.onload = function() {

  var templateString = '<% _.each(items, function(itm) { %> <li class="grid-item background-image ContentItemVideo fade fadeIn" style="background-image: url(<%= itm.thumbnailUrl %>);"><div class="VideoOverlay"><div class="text-center TitleText roman bottom-center" style="height:55px;"><%= itm.titleText %></div><div class="DetailsText top-center" style="top:0;"><div class="upper-left gothic font18">VIDEO</div><div class="upper-right gothic font18"><%= itm.prettyDuration %></div></div><p class="text-center"><button data-video-id="<%= itm.id %>" class="btn gothic PlayLink roman font22" style="font-size: 20px; padding-top:6px;line-height: 20px;">PLAY</button></p></div></li> <% }); %>';
  var productTemplate = '<% _.each(items, function(itm) { %> <li class="grid-item background-image SpotItem" style="background-image: url(<%= itm.imageUrl %>);"><div class="SpotOverlay"><p class="roman" style="font-size:14px;"><%= itm.displayTitle %></p><p><button data-video-id="<%= itm.id %>" class="btn gothic ProductButton" style="font-size: 20px; padding-top:6px;line-height: 20px;"><%= itm.actionText %></button></p></div></li> <% }); %>';

  // Instantiate the api
  var api = new TVPageAPI({
    collectionId: 143889,
    playerDOMId: 'TVPage_Player'
  });

  api.ready(function(API){

    // Get the videos to render the list
    var children = API.collection.getChildren(API.collection.getAtIndex(0).id);
    var items = [];
    for (var i=0,len=children.length;i<len;i++) {
      items.push(children[i].toJSON());
    }

    // Render the Menu list
    var gridList = document.getElementById('grid-list');
    var gridItems =  _.template(templateString, {items:items});
    gridList.innerHTML = gridItems;

    // Set click events on the video list to play their videos
    var playButtons = document.getElementsByClassName('PlayLink');
    for (var i=0,len=playButtons.length;i<len;i++) {
      playButtons[i].onclick = function(e) {

        // Get video object
        var id = e.target.attributes[0].value;
        var video = API.collection.getItemById(id);

        // Load video into player
        API.player.loadVideo(video);
        API.player.ready(function() {

          // Register a video view in analytics
          API.registerVideoView(video);
        }, function(e) {
          console.log('Error Loading Video:', e);
        });

        if (video !== undefined) {

        // Get all of the products for the current video
          API.products.getProducts(video, function(products) {
            var productJSON = [];//products.toJSON();
            for (var i=0,len=products.length;i<len;i++) {

              // Register a product impression in analytics
              API.registerProductImpression(products.at(i));
              var product = products.at(i);
              productJSON.push(JSON.parse(product.get('data')));
              productJSON[i].id = product.get('id');
            }

            // Render products
            var gridList = document.getElementById('product-grid');
            var gridItems =  _.template(productTemplate, {items:productJSON});
            gridList.innerHTML = gridItems;

            // Set click event for button in the product to register the click with analytics
            var productButton = document.getElementsByClassName('ProductButton');
            for (var i=0,len=productButton.length;i<len;i++) {
              productButton[i].onclick = function(e) {
                e.stopPropagation();
                e.preventDefault();

                // Get the video data
                var id = e.target.attributes[0].value;
                var currentProduct = products.findWhere({id: id});

                // Register the click with analytics
                API.registerProductClick(currentProduct);

              }
            }
          }, function(e) {
            console.log(e);
          });
        }
      }
    }

    // Register with analytics that the player was viewed
    API.registerPlayerImpression(API.collection.getAtIndex(0));

  }, function(e){
    console.log('Sorry about this, but something went wrong...', e);
  });

};