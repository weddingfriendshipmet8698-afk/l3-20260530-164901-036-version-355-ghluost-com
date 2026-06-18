(function () {
  function beginPlayback(shell) {
    var video = shell.querySelector('video');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-video-url');
    if (!url) {
      return;
    }
    shell.classList.add('is-playing');
    video.setAttribute('controls', 'controls');

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      }
      video.play().catch(function () {});
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', url);
      }
      video.play().catch(function () {});
      return;
    }

    if (!video.getAttribute('src')) {
      video.setAttribute('src', url);
    }
    video.play().catch(function () {});
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var button = shell.querySelector('.player-start');
    if (button) {
      button.addEventListener('click', function () {
        beginPlayback(shell);
      });
    }
    shell.addEventListener('dblclick', function () {
      beginPlayback(shell);
    });
  });
})();
