
var templateString = '<% _.each(items, function(itm) { %> <li class="grid-item background-image ContentItemVideo fade fadeIn" style="background-image: url(<%= itm.thumbnailUrl %>);"><div class="VideoOverlay"><div class="text-center TitleText roman bottom-center" style="height:55px;"><%= itm.titleText %></div><div class="DetailsText top-center" style="top:0;"><div class="upper-left gothic font18">VIDEO</div><div class="upper-right gothic font18"><%= itm.prettyDuration %></div></div><p class="text-center"><a class="PlayLink roman font22" data-video-id="<%= itm.videoId %>" href="#">PLAY</a></p></div></li> <% }); %>';

var leaderBikesCollectionId = 143889;
var donnieCollectionId = 146804;






var api = new TVPageAPI({
  collectionId: donnieCollectionId,
  playerDOMId: 'TVPage_Player'
});

api.ready(function(API){

  console.log('ready: ', arguments);

  // Launch App from here
  $(document).ready(function(){
    var gridList = document.getElementById('grid-list');
    var gridItems =  _.template(templateString, {items:API.collection.getChildren(API.collection.getAtIndex(0).id)});
    gridList.innerHTML = gridItems;

    $(document).on('click', 'a', function(e) {
      e.stopPropagation();
      e.preventDefault();
      API.player.loadByVideoId($(e.target).attr('data-video-id'));

      var videoId = $(e.target).attr('data-video-id');

      if (videoId !== undefined && videoId !== 'undefined') {
        api.products.getProducts(API.collection.getItemByVideoId(videoId).id, function(products) {
          console.log(products);
        }, function(e) {
          console.log(e);
        });
      }
      // api.products.getProducts('150707', function(products) {


    });

  });

}, function(e){
  console.log('Sorry about this, but something went wrong...', e);
});


// var api2 = new TVPageAPI({
//   collectionId: donnieCollectionId,
//   playerDOMId: 'TVPage_Player2'
// });

// api2.ready(function(API){

//   $(document).ready(function(){

//     var testArray = [];
//     API.collection.each(function(itm) {
//       testArray.push(itm.get('titleText'));
//     });

//     console.log('Titles:', testArray);

//   });

// }, function(e){
//   console.log('Sorry about this, but something went wrong...', e);
// });
