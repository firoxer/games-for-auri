window.drum = (function() {
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

  return function(rootElement) {
    rootElement.ontouchmove = function(event) {
      event.preventDefault();
    };

    const drums = [ 
      'kick',
      'hihat',
      'snare',
      'crash',
      'ride',
      'high',
      'mid',
      'low'
    ];

    const triggerEvent = 'ontouchstart' in window ? 'ontouchstart' : 'onclick';

    const drumsElement = document.createElement('div');
    drumsElement.id = 'drums';
    rootElement.appendChild(drumsElement);

    drums.forEach(function(drum) {
      loadAudio('drum/samples/' + drum + '.wav').then(function(audio) {
        const drumElement = document.createElement('button');
        drumElement.classList.add(drum);
        drumElement.innerHTML = drum;
        drumsElement.appendChild(drumElement);

        drumElement[triggerEvent] = function() {
          drumElement.classList.add('playing');
          playAudio(audio);
          window.setTimeout(function() {
            drumElement.classList.remove('playing');
          }, 101);
        };
      });
    });
  }
})();
