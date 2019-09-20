const fs     = require('fs');
const app    = require('electron').app    || require('electron').remote.app;
const screen = require('electron').screen || require('electron').remote.screen;

// wait for page to be ready
$(() => {
  const display = screen.getPrimaryDisplay();
  const snaprazzle = {
    video: document.querySelector('video'),
    canvas: document.querySelector('canvas'),
    constraints: {
      video: {
          width: {
            ideal: display.size.width
          },
          height: {
            ideal: display.size.height
          },
        }
      },
    createDir: function(path) {
      if (!fs.existsSync(path)) {
        fs.mkdir(path, (err) => { if (err) throw err });
      }
    },
    saveImage: function(path, image) {
      const imgData = image.replace(/^data:image\/\w+;base64,/, '');
      const stamp   = new Date().toISOString().replace(/[:.\/]/g, '-');
      // each photo named with unique timestamp

      fs.writeFile(`${path}/${stamp}.png`, imgData, {encoding: 'base64'}, (err) => {
        if (err) throw err;
      });
    },
    snapPhoto: function() {
      const ctx = this.canvas.getContext('2d');
      if ($(this.video).hasClass('filter')) { ctx.filter = 'grayscale(100%)'; }

      // capture image
      ctx.drawImage(this.video, 0, 0, 500, 300);
      // reset filter prop
      ctx.filter = 'none';

      $('audio')[0].play();
      const image   = this.canvas.toDataURL("image/png");
      const path    = `${app.getPath('desktop')}/snaprazzle`;

      this.createDir(path);
      this.saveImage(path, image);
    },
    snapMultiPhotos: function(e) {
      this.snapPhoto();

      e.data.i++;

      // take 3 photos with 1 sec pause between
      setTimeout(() => {
        if (e.data.i < 3) {
          this.snapMultiPhotos(e);
        } else {
          e.data.i = 0;
        }
      }, 1000);
    },
    toggleFilter: function() {
      if ($('#filter input').is(':checked')) {
        $(this.video).addClass('filter');
      } else {
        $(this.video).removeClass('filter');
      }
    },
    attachEventListeners: function() {
      $('#snap').on('click', () => { this.snapPhoto() });
      $('#multi-snap').on('click', {i: 0}, (e) => { this.snapMultiPhotos(e) });
      $('#filter').on('change', () => { this.toggleFilter() });
    },
    init: function() {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
      navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {
        const desktop = app.getPath('desktop');
        const path    = `${desktop}/snaprazzle`;

        // stream webcam video
        this.video.srcObject = stream;

        this.attachEventListeners();

      }).catch((error) => {
        console.error(error);
      });
    },
  };

  snaprazzle.init();
});
