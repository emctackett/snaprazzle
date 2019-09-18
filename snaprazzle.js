const fs     = require('fs');
const app    = require('electron').app    || require('electron').remote.app;
const screen = require('electron').screen || require('electron').remote.screen;

// wait for page to be ready
$(() => {
  const display = screen.getPrimaryDisplay();
  const video   = document.querySelector('video');

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
    const canvas  = document.querySelector('canvas');
    const desktop = app.getPath('desktop');
    const path    = `${desktop}/snaprazzle`;

    // stream webcam video
    video.srcObject = stream;

    attachEventListeners();

  }).catch((error) => {
    console.error(error);
  });
});

function attachEventListeners() {
  $('#snap').on('click', snapPhoto);
  $('#multi-snap').on('click', {i: 0}, snapMultiPhotos);
}

function snapPhoto() {
  console.log('snapping photo');
  const video   = document.querySelector('video');
  const canvas  = document.querySelector('canvas');
  // capture image
  canvas.getContext('2d').drawImage(video, 0, 0, 500, 300);
  $('audio')[0].play();
  const image   = canvas.toDataURL("image/png");
  const path    = `${app.getPath('desktop')}/snaprazzle`;

  createDir(path);
  saveImg(path, image);
}

function snapMultiPhotos(e) {
  snapPhoto();

  e.data.i++;

  setTimeout(function() {
    if (e.data.i !== 3) snapMultiPhotos(e);
  }, 2000);
}

function createDir(path) {
  // if dir doesn't exist, create it
  if (!fs.existsSync(path)) {
    fs.mkdir(path, (err) => { if (err) throw err });
  }
}

function saveImg(path, image) {
  const imgData = image.replace(/^data:image\/\w+;base64,/, '');
  const stamp   = new Date().toISOString();
  // each photo named with unique timestamp

  fs.writeFile(`${path}/${stamp}.png`, imgData, {encoding: 'base64'}, (err) => {
    if (err) throw err;
  });
}
