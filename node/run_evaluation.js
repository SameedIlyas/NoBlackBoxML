const constants = require('../common/constants.js');
const utils = require('../common/utils.js');
const KNN = require('../common/classifiers/knn.js');
const fs = require('fs');
const QuickChart = require('quickchart-js');

console.log("RUNNING CLASSIFICATION FOR MULTIPLE k VALUES ...");

const { samples: trainingSamples } = JSON.parse(
   fs.readFileSync(constants.TRAINING)
);

const { samples: testingSamples } = JSON.parse(
   fs.readFileSync(constants.TESTING)
);

const accuracies = [];
const kValues = [1, 3, 5, 10, 20, 30, 50, 75, 100]; // Example k values to test

for (const k of kValues) {
   const kNN = new KNN(trainingSamples, k);

   let totalCount = 0;
   let correctCount = 0;
   for (const sample of testingSamples) {
      const { label: predictedLabel } = kNN.predict(sample.point);
      if (predictedLabel == sample.label) correctCount++;
      totalCount++;
   }

   const accuracy = correctCount / totalCount;
   accuracies.push({ k, accuracy });
   console.log(`k=${k}, Accuracy=${utils.formatPercent(accuracy)}`);
}

// Find the best k value based on highest accuracy
const bestK = accuracies.reduce((best, current) => current.accuracy > best.accuracy ? current : best, accuracies[0]).k;

console.log(`Best k value: ${bestK}`);

// Plot the accuracies on a line chart
console.log("GENERATING ACCURACY CHART ...");

const kValuesArray = accuracies.map(a => a.k);
const accuracyValues = accuracies.map(a => a.accuracy);

const chart = new QuickChart();

chart.setConfig({
    type: 'line',
    data: {
        labels: kValuesArray,
        datasets: [{
            label: 'Accuracy vs. k',
            data: accuracyValues,
            borderColor: 'blue',
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'k Value'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Accuracy'
                },
                min: 0,
                max: 1
            }
        }
    }
});

// Render the chart as a PNG and save it to a file
chart.toFile(constants.ACCURACY_CHART)
    .then(() => {
        console.log('Accuracy chart saved as accuracy_chart.png');
    })
    .catch(err => {
        console.error('Error generating chart:', err);
    });

// Generate decision boundaries using the best k value
console.log("GENERATING DECISION BOUNDARY WITH BEST k ...");

const canvasWidth = 1000;
const canvasHeight = 1000;
const { createCanvas } = require('canvas');
const decisionBoundaryCanvas = createCanvas(canvasWidth, canvasHeight);
const ctx = decisionBoundaryCanvas.getContext('2d');

const kNN = new KNN(trainingSamples, bestK);

for (let x = 0; x < decisionBoundaryCanvas.width; x++) {
   for (let y = 0; y < decisionBoundaryCanvas.height; y++) {
      const point = [
         x / decisionBoundaryCanvas.width,
         1 - y / decisionBoundaryCanvas.height
      ];
      const { label } = kNN.predict(point);
      const color = utils.styles[label].color;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
   }
}

const buffer = decisionBoundaryCanvas.toBuffer("image/png");
fs.writeFileSync(constants.DECISION_BOUNDARY, buffer);

console.log("Decision boundary saved as", constants.DECISION_BOUNDARY);
console.log("DONE!");
