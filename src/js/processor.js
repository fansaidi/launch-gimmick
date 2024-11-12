export const processor = {
  timerCallback: function () {
    if (this.video.paused || this.video.ended) {
      return;
    }
    this.computeFrame();
    let self = this;
    setTimeout(function () {
      self.timerCallback();
    }, 0);
  },

  doLoad: function () {
    this.video = document.getElementById("video");
    this.c1 = document.getElementById("c1");

    const height = window.screen.height;
    const width = window.screen.width;

    this.c1.setAttribute('width', width);
    this.c1.setAttribute('height', height);

    this.ctx1 = this.c1.getContext("2d");

    let self = this;

    this.video.addEventListener("seeked", function () {
      // Draw the initial frame when seeked to the first frame
      self.width = width;
      self.height = height;
      self.computeFrame();
    }, false);

    this.video.addEventListener("play", function () {
      self.width = width;
      self.height = height;
      self.timerCallback();
    }, false);
  },

  computeFrame: function () {
    this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
    let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
    let l = frame.data.length / 4;

    for (let i = 0; i < l; i++) {
      let r = frame.data[i * 4 + 0];
      let g = frame.data[i * 4 + 1];
      let b = frame.data[i * 4 + 2];
      if (r >= 30 && r <= 200 && g >= 140 && g <= 255 && b <= 120) {
        frame.data[i * 4 + 3] = 0;
      }
    }
    this.ctx1.putImageData(frame, 0, 0);
    return;
  }
};
