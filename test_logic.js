const boxes = [ [{pid: 1, otid: 1}], [], [{pid: 2, otid: 2}] ];
const activeRun = { graveyardBoxes: [0, 1, 2] };
const graveyardData = (activeRun.graveyardBoxes || []).map(idx => boxes[idx] || []).flat();
console.log(graveyardData);
