(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve);
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setMessage(shell, message) {
    var messageNode = shell.querySelector('[data-player-message]');

    if (messageNode) {
      messageNode.textContent = message || '';
    }
  }

  function initializePlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');

    button.addEventListener('click', function () {
      if (!source) {
        setMessage(shell, '当前页面没有绑定播放源。');
        return;
      }

      setMessage(shell, '正在初始化播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().then(function () {
          button.classList.add('is-hidden');
          setMessage(shell, '');
        }).catch(function () {
          setMessage(shell, '浏览器阻止了自动播放，请再次点击播放器播放。');
        });
        return;
      }

      loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest')
        .then(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().then(function () {
                button.classList.add('is-hidden');
                setMessage(shell, '');
              }).catch(function () {
                setMessage(shell, '播放已就绪，请再次点击播放器开始。');
              });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setMessage(shell, '播放源加载失败，请稍后重试或更换 m3u8 地址。');
              }
            });
          } else {
            setMessage(shell, '当前浏览器不支持 HLS 播放。');
          }
        })
        .catch(function () {
          setMessage(shell, 'HLS 播放组件加载失败，请检查网络。');
        });
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
})();
