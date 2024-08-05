const n = 20;
const array = [];
let audioCtx = null;
let animationTimeout = null; // to hold the timeout ID for animation

function playNote(freq) {
  if (audioCtx === null) {
    audioCtx = new (AudioContext || webkitAudioContext || window.webkitAudioContext)();
  }

  const dur = 0.1;
  const osc = audioCtx.createOscillator();
  osc.frequency.value = freq;
  osc.start();
  osc.stop(audioCtx.currentTime + dur);

  const node = audioCtx.createGain();
  node.gain.value = 0.1;
  node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
  osc.connect(node);
  node.connect(audioCtx.destination);
}

function init() {
  for (let i = 0; i < n; i++) {
    array[i] = Math.random();
  }
  showBars();
}

function showBars(move) {
  const container = document.getElementById('container');
  container.innerHTML = '';
  for (let i = 0; i < array.length; i++) {
    const bar = document.createElement('div');
    bar.style.height = array[i] * 100 + '%';
    bar.classList.add('bar');

    if (move && move.indices.includes(i)) {
      bar.style.backgroundColor = move.type === 'swap' ? '#BA55D0' : '#CBC3E3';
    }

    container.appendChild(bar);
  }
}

function createSortingButton(sortName, sortFunction) {
  const button = document.createElement('button');
  button.textContent = sortName;
  button.classList.add('sort-button');
  button.addEventListener('click', () => {
    array.length = 0;
    init();
    const copy = [...array];
    const moves = sortFunction(copy);
    animate(moves);
  });
  return button;
}

function animate(moves) {
  if (moves.length === 0) {
    showBars();
    return;
  }

  const move = moves.shift();
  const [i, j] = move.indices;

  if (move.type === 'swap') {
    [array[i], array[j]] = [array[j], array[i]];
    playNote(300 + array[i] * 500);
    playNote(300 + array[j] * 500);
  } else if (move.type === 'comp') {
    playNote(200 + array[i] * 200);
    playNote(200 + array[j] * 200);
  }

  showBars(move);
  animationTimeout = setTimeout(() => animate(moves), 200);
}

function bubbleSort(array) {
  const moves = [];
  do {
    var swapped = false;
    for (let i = 1; i < array.length; i++) {
      moves.push({ indices: [i - 1, i], type: 'comp' });
      if (array[i - 1] > array[i]) {
        swapped = true;
        moves.push({ indices: [i - 1, i], type: 'swap' });
        [array[i - 1], array[i]] = [array[i], array[i - 1]];
      }
    }
  } while (swapped);
  return moves;
}

function selectionSort(array) {
  const moves = [];
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      moves.push({ indices: [minIndex, j], type: 'comp' });
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      moves.push({ indices: [i, minIndex], type: 'swap' });
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
    }
  }
  return moves;
}

function insertionSort(array) {
  const moves = [];
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      moves.push({ indices: [j, j + 1], type: 'comp' });
      array[j + 1] = array[j];
      j--;
    }
    moves.push({ indices: [j + 1, j + 1], type: 'swap' });
    array[j + 1] = key;
  }
  return moves;
}

function merge(left, right, moves) {
  let result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    moves.push({ indices: [left[i], right[j]], type: 'comp' });
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

function mergeSort(array) {
  const moves = [];

  const mergeSortHelper = (array) => {
    if (array.length <= 1) {
      return array;
    }

    const middle = Math.floor(array.length / 2);
    const left = array.slice(0, middle);
    const right = array.slice(middle);

    return merge(mergeSortHelper(left), mergeSortHelper(right), moves);
  };

  mergeSortHelper(array);
  return moves;
}

function partition(array, low, high, moves) {
  const pivot = array[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    moves.push({ indices: [array[j], pivot], type: 'comp' });
    if (array[j] < pivot) {
      i++;
      moves.push({ indices: [array[i], array[j]], type: 'swap' });
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  moves.push({ indices: [array[i + 1], pivot], type: 'swap' });
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  return i + 1;
}

function quickSort(array) {
  const moves = [];

  const quickSortHelper = (array, low, high) => {
    if (low < high) {
      const pi = partition(array, low, high, moves);

      quickSortHelper(array, low, pi - 1);
      quickSortHelper(array, pi + 1, high);
    }
  };

  quickSortHelper(array, 0, array.length - 1);
  return moves;
}

// Stop animation function
function stopAnimation() {
  clearTimeout(animationTimeout); // Stop the current animation timeout
}

// Reset animation function
function resetAnimation() {
  stopAnimation(); // Stop the current animation
  init(); // Re-initialize the array and display bars
}

// Add more sorting algorithms as needed

const buttonContainer = document.getElementById('button-container');

// Create and append Stop and Reset buttons
const stopButton = document.createElement('button');
stopButton.textContent = 'Stop';
stopButton.classList.add('control-button');
stopButton.addEventListener('click', stopAnimation);

const resetButton = document.createElement('button');
resetButton.textContent = 'Reset';
resetButton.classList.add('control-button');
resetButton.addEventListener('click', resetAnimation);

buttonContainer.appendChild(stopButton);
buttonContainer.appendChild(resetButton);

// Add a line break to separate control buttons from sorting buttons
const lineBreak = document.createElement('br');
buttonContainer.appendChild(lineBreak);

// Append sorting buttons
buttonContainer.appendChild(createSortingButton('Bubble Sort', bubbleSort));
buttonContainer.appendChild(createSortingButton('Selection Sort', selectionSort));
buttonContainer.appendChild(createSortingButton('Insertion Sort', insertionSort));
buttonContainer.appendChild(createSortingButton('Merge Sort', mergeSort));
buttonContainer.appendChild(createSortingButton('Quick Sort', quickSort));

init();
