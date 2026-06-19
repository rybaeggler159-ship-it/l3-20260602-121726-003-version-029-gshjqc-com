(function () {
    function initVideo(video) {
        var source = video.getAttribute('data-video-src');

        if (!source) {
            return Promise.reject(new Error('缺少播放源'));
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return video.play();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return new Promise(function (resolve, reject) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().then(resolve).catch(reject);
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        reject(new Error('播放源加载失败'));
                    }
                });
            });
        }

        video.src = source;
        return video.play();
    }

    document.querySelectorAll('[data-play-button]').forEach(function (button) {
        button.addEventListener('click', function () {
            var shell = button.closest('.video-shell');
            var video = shell ? shell.querySelector('video') : null;

            if (!video) {
                return;
            }

            initVideo(video).then(function () {
                button.classList.add('is-hidden');
            }).catch(function () {
                button.querySelector('strong').textContent = '请再次点击播放';
                button.querySelector('em').textContent = '浏览器已尝试初始化 HLS 播放源';
            });
        });
    });
})();
