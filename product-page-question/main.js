$(document).ready(function() {
  // Setup the initial DOM structure
  var player = '<div class="tvp-player"><div id="TVPage_Player"></div><div class="stage-control"></div></div>';
  var form = '<div class="tvp-form"><div class="form-buttons"><button class="btn btn-up" type="button">YES</button><button class="btn btn-down" type="button">NO</button></div><div class="form-text">Do you like the look?</div></div>'
  var result = '<div class="tvp-form-result">Thanks!</div>'

  // Inject the initial HTML structure
  $('#tvpage').html(player + form + result);

  // Instantiate the api
  var api = new TVPageAPI({
    collectionId: 171536,
    playerDOMId: 'TVPage_Player'
  });

  var shown = 0;

  var trigger = function(data) {
    //console.log(data);

    if (data.currentTime > 7 && shown == 0) {
      //show the question
      $('.tvp-form').show();
      shown = 1;
    }
  };

  api.ready(function(API){

    var children = API.collection.getChildren(API.collection.getAtIndex(0).id)[0];
    var videoObj = API.collection.getItemById(children.get('id'));

    // Load video into player
    API.player.loadVideo(videoObj);

    var poll = window.setInterval(function() {
      if (API.player.isEnded()) {
        window.clearInterval(poll);
      }

      trigger(API.player.getUpdateInfo());
    }, 200);


    $('.stage-control').on('click', function() {
      if (API.player.isPlaying()) {
        API.player.pause();
      } else {
        API.player.play();
      }
    });

    API.player.on('MEDIA_READY', function() {
      console.log('media-ready');
    });

    API.player.on('MEDIA_VIDEO_ENDED', function() {
      console.log('video-ended');
      $('.tvp-player').css({
        width: '1px',
        height: '1px'
      });
    });

  }, function(e){
    console.log('Sorry about this, but something went wrong...', e);
  });

  // Form Button Events
  // ==================================================================

  $('.btn-down, .btn-up').on('click', function() {
    $('.tvp-form').hide();
    $('.tvp-form-result').show();

    _.delay(function() {
      $('.tvp-form-result').hide();
    }, 1000);
  });
});
