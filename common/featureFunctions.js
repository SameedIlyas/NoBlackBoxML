const featureFunctions = {};

featureFunctions.getPathCount = (paths) => paths.length;

featureFunctions.getPointCount = (paths) => paths.flat().length;

featureFunctions.getAspectRatio = (paths) => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    paths.forEach(path => {
        path.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });
    });

    const width = maxX - minX;
    const height = maxY - minY;

    return height !== 0 ? width / height : 0;
};

featureFunctions.getSymmetry = (paths) => {
    let minX = Infinity, maxX = -Infinity;
    const pointsSet = new Set();

    paths.forEach(path => {
        path.forEach(([x, y]) => {
            pointsSet.add(`${x},${y}`);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
        });
    });

    const centerX = (minX + maxX) / 2;
    let symmetryScore = 0;

    paths.forEach(path => {
        path.forEach(([x, y]) => {
            const mirroredX = centerX * 2 - x;
            if (pointsSet.has(`${mirroredX},${y}`)) {
                symmetryScore++;
            }
        });
    });

    const totalPoints = pointsSet.size;
    return totalPoints ? symmetryScore / totalPoints : 0;
};

featureFunctions.getStrokeDirectionality = (paths) => {
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

featureFunctions.getConvexHull = (points) => {
    // Jarvis March algorithm to compute the convex hull
    points = points.slice().sort((a, b) => a[0] - b[0]); // Sort by x coordinate

    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

    const lower = [];
    for (let i = 0; i < points.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
            lower.pop();
        }
        lower.push(points[i]);
    }

    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
            upper.pop();
        }
        upper.push(points[i]);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
};

featureFunctions.getRotatedBoundingBoxWidth = (paths) => {
    const points = paths.flat();
    if (points.length === 0) {
        console.warn("No points provided for bounding box calculation.");
        return null;
    }

    const hull = featureFunctions.getConvexHull(points);

    if (hull.length === 0) {
        console.warn("Convex hull could not be generated.");
        return null;
    }

    let minArea = Infinity;
    let minWidth = null;

    for (let i = 0; i < hull.length; i++) {
        const p1 = hull[i];
        const p2 = hull[(i + 1) % hull.length];
        const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);

        const rotatedPoints = points.map(p => [
            p[0] * Math.cos(-angle) - p[1] * Math.sin(-angle),
            p[0] * Math.sin(-angle) + p[1] * Math.cos(-angle)
        ]);

        const xs = rotatedPoints.map(p => p[0]);
        const ys = rotatedPoints.map(p => p[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const area = (maxX - minX) * (maxY - minY);
        if (area < minArea) {
            minArea = area;
            minWidth = maxX - minX;
        }
    }

    if (minWidth === null) {
        console.warn("No minimum bounding box width found.");
    }

    return minWidth;
};

featureFunctions.getRotatedBoundingBoxHeight = (paths) => {
    const points = paths.flat();
    if (points.length === 0) {
        console.warn("No points provided for bounding box calculation.");
        return null;
    }

    const hull = featureFunctions.getConvexHull(points);

    if (hull.length === 0) {
        console.warn("Convex hull could not be generated.");
        return null;
    }

    let minArea = Infinity;
    let minHeight = null;

    for (let i = 0; i < hull.length; i++) {
        const p1 = hull[i];
        const p2 = hull[(i + 1) % hull.length];
        const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);

        const rotatedPoints = points.map(p => [
            p[0] * Math.cos(-angle) - p[1] * Math.sin(-angle),
            p[0] * Math.sin(-angle) + p[1] * Math.cos(-angle)
        ]);

        const xs = rotatedPoints.map(p => p[0]);
        const ys = rotatedPoints.map(p => p[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const area = (maxX - minX) * (maxY - minY);
        if (area < minArea) {
            minArea = area;
            minHeight = maxY - minY;
        }
    }

    if (minHeight === null) {
        console.warn("No minimum bounding box height found.");
    }

    return minHeight;
};



featureFunctions.inUse = [
    {name:"Height", function:featureFunctions.getRotatedBoundingBoxHeight},
    {name:"Width", function:featureFunctions.getRotatedBoundingBoxWidth}
];
  //  {name:"Stroke Directionality", function:featureFunctions.getStrokeDirectionality},
    //{name:"Path Count", function:featureFunctions.getPathCount},
    //{name:"Point Count", function:featureFunctions.getPointCount}

if (typeof module !== 'undefined') {
    module.exports = featureFunctions
;
}

