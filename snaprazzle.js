$(() => {
  const {remote, electron} = require('electron');
  const screen = require('electron').screen ||
                 require('electron').remote.screen;

  const display = screen.getPrimaryDisplay();

  const constraints = {
    video: {
      width: {
        ideal: display.size.width
      },
      height: {
        ideal: display.size.height
      },
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    const video = document.querySelector('video');
    video.srcObject = stream;
  }).catch((error) => {
    console.error(error);
  });
});
