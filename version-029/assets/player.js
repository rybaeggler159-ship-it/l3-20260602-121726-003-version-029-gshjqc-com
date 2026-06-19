(function() {
    function initPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var status = player.querySelector('[data-player-status]');
        var source = player.getAttribute('data-video-src');
        var hls = null;
        var started = false;

        if (!video || !button || !source) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message || '';
            }
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {
                    setStatus('点击画面继续播放');
                });
            }
        }

        function start() {
            if (started) {
                playVideo();
                return;
            }

            started = true;
            player.classList.add('is-playing');
            setStatus('正在加载影片');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function() {
                    setStatus('');
                    playVideo();
                }, { once: true });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    setStatus('');
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function(event, data) {
                    if (data && data.fatal) {
                        setStatus('播放暂时无法加载，请稍后重试');
                    }
                });
                return;
            }

            video.src = source;
            video.addEventListener('loadedmetadata', function() {
                setStatus('');
                playVideo();
            }, { once: true });
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener('ended', function() {
            player.classList.remove('is-playing');
            started = false;
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    document.querySelectorAll('[data-video-src]').forEach(initPlayer);
})();
