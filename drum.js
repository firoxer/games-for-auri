const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function loadAudio(url) {
  return new Promise(function(resolve) {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      audioCtx.decodeAudioData(request.response, function(decoded) {
        resolve(decoded);
      });
    };
    request.send();
  });
}

function playAudio(data) {
  if (!data) {
    return;
  }
  
  const source = audioCtx.createBufferSource();
  source.buffer = data;
  source.connect(audioCtx.destination);
  source.start(0);
}

function initDrum() {
  document.ontouchmove = function(event) {
    event.preventDefault();
  };

  const drums = new Array(
    'kick',
    'hihat',
    'snare',
    'crash',
    'ride',
    'high',
    'mid',
    'low'
  );

  const triggerEvent = 'ontouchstart' in window ? 'ontouchstart' : 'onclick';

  drums.forEach(function(drum) {
    loadAudio('drums/' + drum + '.wav').then(function(audio) {
      const element = document.getElementById(drum);

      element[triggerEvent] = function() {
        element.className = 'playing';
        playAudio(audio);
        window.setTimeout(function() {
          element.className = '';
        }, 101);
      };
    });
  });
}
