(function () {
  function initInlinePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var mask = document.querySelector(".player-mask");
    var ready = false;
    var engine = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        engine = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        engine.loadSource(streamUrl);
        engine.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function play() {
      attach();
      video.controls = true;

      if (mask) {
        mask.classList.add("is-hidden");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (mask) {
      mask.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      attach();
    });

    video.addEventListener("play", function () {
      if (mask) {
        mask.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (engine) {
        engine.destroy();
      }
    });
  }

  window.initInlinePlayer = initInlinePlayer;
})();
