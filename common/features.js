const features = {};

// Existing features
features.getPathCount = (paths) => paths.length;

features.getPointCount = (paths) => {
    const points = paths.flat();
    return points.length;
}

// New Feature: Symmetry
features.getSymmetry = (paths) => {
    let minX = Infinity, maxX = -Infinity;

    const pointsSet = new Set();

    // Populate pointsSet and determine min/max X values
    paths.flat().forEach(([x, y]) => {
        pointsSet.add(`${x},${y}`);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
    });

    const centerX = (minX + maxX) / 2;
    let symmetryScore = 0;

    paths.flat().forEach(([x, y]) => {
        const mirroredX = centerX * 2 - x;
        if (pointsSet.has(`${mirroredX},${y}`)) {
            symmetryScore++;
        }
    });

    const totalPoints = pointsSet.size;
    return totalPoints ? symmetryScore / totalPoints : 0;
};


// New Feature: Stroke Directionality
features.getStrokeDirectionality = (paths) => {
    let directionSum = 0;
    let totalSegments = 0;

    paths.forEach(path => {
        for (let i = 1; i < path.length; i++) {
            const [x1, y1] = path[i - 1];
            const [x2, y2] = path[i];
            const direction = Math.atan2(y2 - y1, x2 - x1);
            directionSum += Math.abs(direction);
            totalSegments++;
        }
    });

    return totalSegments ? directionSum / totalSegments : 0;
};

if (typeof module !== 'undefined') {
    module.exports = features;
}

