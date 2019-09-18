const fs     = require('fs');
const app    = require('electron').app    || require('electron').remote.app;
const screen = require('electron').screen || require('electron').remote.screen;
const emoji  = require('node-emoji');
const screenshot = require('electron-screenshot');

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
  $('#filter').on('change', toggleFilter);
  $('#add-emoji').on('click', addEmoji);
}

function snapPhoto() {
  const video   = document.querySelector('video');
  const canvas  = document.querySelector('canvas');

  ctx = canvas.getContext('2d');
  if ($(video).hasClass('filter')) { ctx.filter = 'grayscale(100%)'; }

  // capture image
  ctx.drawImage(video, 0, 0, 500, 300);
  // reset filter prop
  ctx.filter = 'none';

  $('audio')[0].play();
  const image   = canvas.toDataURL("image/png");
  const path    = `${app.getPath('desktop')}/snaprazzle`;

  createDir(path);
  saveImg(path, image);
}

function snapMultiPhotos(e) {
  snapPhoto();

  e.data.i++;

  // take 3 photos with 1 sec pause between
  setTimeout(function() {
    if (e.data.i < 3) {
      snapMultiPhotos(e);
    } else {
      e.data.i = 0;
    }
  }, 1000);
}

function toggleFilter() {
  if ($('#filter input').is(':checked')) {
    $('video').addClass('filter');
  } else {
    $('video').removeClass('filter');
  }
}

function addEmoji() {
  const emojiSpan = document.createElement('span');
  const newEmoji = emoji.random().emoji;
  emojiSpan.append(newEmoji);

  document.body.append(emojiSpan);
  $(emojiSpan).css({position: 'absolute', top: '50%',
               left: '50%', fontSize: '72px'});
  $(emojiSpan).draggable();
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
  // each photo named with unique timestamp=

  fs.writeFile(`${path}/${stamp}.png`, imgData, {encoding: 'base64'}, (err) => {
    if (err) throw err;
  });
}
