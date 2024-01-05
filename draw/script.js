window.draw = function(rootElement) {
  const brushesContainer = document.createElement('div');
  brushesContainer.classList.add('brushes');
  rootElement.appendChild(brushesContainer);

  const colorsContainer = document.createElement('div');
  colorsContainer.classList.add('colors');
  rootElement.appendChild(colorsContainer);

  const permanentCanvas = document.createElement('canvas');
  const permanentContext = permanentCanvas.getContext('2d');
  rootElement.appendChild(permanentCanvas);

  const workingCanvas = document.createElement('canvas');
  const workingContext = workingCanvas.getContext('2d');
  rootElement.appendChild(workingCanvas);

  const createBrushSelection = function(size) {
    return function() {
      event.preventDefault();
      Array.from(brushesContainer.children).forEach(function(child) {
        child.classList.remove('selected');
      });
        
      workingContext.lineWidth = size;

      event.target.classList.add('selected');
    };
  };

  const brushes = [
    { drawSize: 100, buttonSize: '8rem' },
    { drawSize: 50, buttonSize: '6rem' },
    { drawSize: 20, buttonSize: '4rem' }
  ];

  const brushButtons = brushes.map(function(brush) {
    const button = document.createElement('button');
    button.style.height = brush.buttonSize;
    button.style.width = brush.buttonSize;
    button.onclick = createBrushSelection(brush.drawSize);
    button.ontouchstart = createBrushSelection(brush.drawSize);
    brushesContainer.appendChild(button);

    return button;
  });

  const createColorSelection = function(color) {
    return function() {
      event.preventDefault();
      Array.from(colorsContainer.children).forEach(function(child) {
        child.classList.remove('selected');
      });
        
      workingContext.fillStyle = color;
      workingContext.strokeStyle = color;

      event.target.classList.add('selected');
    };
  };

  const colors = [ 
    '#1b1c33',
    '#d32734',
    '#da7d22',
    '#e6da29',
    '#28c641',
    '#2d93dd',
    '#7b53ad',
    '#fdfdf8',
  ];

  const colorButtons = colors.map(function(color, index) {
    const button = document.createElement('button');
    button.style.color = color;
    button.onclick = createColorSelection(color);
    button.ontouchstart = createColorSelection(color);
    colorsContainer.appendChild(button);

    if (index === colors.length - 1) { // FIXME
      button.classList.add('background');
    }

    return button;
  });

  // Preselect medium brush
  brushesContainer.children[1].click();

  // Preselect the first color, i.e. black
  colorsContainer.children[0].click();

  function onResize() {
    permanentCanvas.width = document.documentElement.clientWidth;
    permanentCanvas.height = document.documentElement.clientHeight;

    workingCanvas.width = permanentCanvas.width;
    workingCanvas.height = permanentCanvas.height;

    // Font size affects the size of color buttons
    const fontSize = Math.min(32, Math.min(permanentCanvas.width, permanentCanvas.height) / 48) + 'px';
    document.documentElement.style.fontSize = fontSize;

    workingContext.lineCap = 'round';
    workingContext.lineJoin = 'round';

    // Canvas stroke gets reset, so let's select something to prevent browser defaults
    brushesContainer.children[1].click();
    colorsContainer.children[0].click();
  }
  window.addEventListener('resize', onResize);
  onResize();

  function render(points) {
    workingContext.clearRect(0, 0, workingCanvas.width, workingCanvas.height);

    if (points.length === 0) {
      return;
    }

    if (points.length < 3) {
      var point = points[0];
      workingContext.beginPath();
      workingContext.arc(point.x, point.y, workingContext.lineWidth / 2, 0, Math.PI * 2);
      workingContext.fill();
      workingContext.closePath();

      return;
    }

    workingContext.beginPath();
    workingContext.moveTo(points[0].x, points[0].y);

    for (var i = 1; i < points.length - 2; i++) {
      workingContext.quadraticCurveTo(
        points[i].x,
        points[i].y,
        (points[i].x + points[i + 1].x) / 2,
        (points[i].y + points[i + 1].y) / 2
      );
    }

    // For the last 2 points
    workingContext.quadraticCurveTo(
      points[i].x,
      points[i].y,
      points[i + 1].x,
      points[i + 1].y
    );

    workingContext.stroke();
  }

  function flush() {
    permanentContext.drawImage(workingCanvas, 0, 0);
    workingContext.clearRect(0, 0, workingCanvas.width, workingCanvas.height);
    points = [];
  }

  var points = [];
  var isDrawing = false;

  function startDrawing(x, y) {
    isDrawing = true;
    points.push({ x, y });
    render(points);
  }
                        
  function continueDrawing(x, y) {
    if (!isDrawing) {
      return;
    }

    var point = { x, y };
    points.push(point);

    render(points);

    // Rendering gets linearly more intensive so it's good to flush
    // the buffer every now and then
    if (points.length > 50) {
      flush();
      points.push(point);
    }
  }
  
  function stopDrawing() {
    isDrawing = false;
    render(points);
    flush();
  } 

  const drawElement = document.getElementById('draw');

  drawElement.addEventListener('mousedown', function (e) {
    if (!(e.target instanceof HTMLButtonElement)) {
      startDrawing(e.clientX, e.clientY);
    }
  });
  drawElement.addEventListener('mousemove', function (e) {
    continueDrawing(e.clientX, e.clientY);
  });
  drawElement.addEventListener('mouseup', function (e) {
    stopDrawing(e.clientX, e.clientY);
  });
  drawElement.addEventListener('mouseout', function (e) {
    stopDrawing(e.clientX, e.clientY);
  });
  drawElement.addEventListener('mousein', function (e) {
    startDrawing(e.clientX, e.clientY);
  });

  drawElement.addEventListener('touchstart', function (e) {
    e.preventDefault();

    if (!(e.target instanceof HTMLButtonElement)) {
      startDrawing(e.touches[0].clientX, e.touches[0].clientY);
    }
  });
  drawElement.addEventListener('touchmove', function (e) {
    continueDrawing(e.touches[0].clientX, e.touches[0].clientY);
  });
  drawElement.addEventListener('touchend', function (e) {
    stopDrawing();
  });
};
