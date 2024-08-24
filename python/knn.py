import numpy as np
import matplotlib.pyplot as plt
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
from functions import readFeatureFile

# Function to evaluate KNN with different k values
def evaluate_knn(k_values, X_train, y_train, X_test, y_test):
    accuracies = []

    for k in k_values:
        knn = KNeighborsClassifier(
            n_neighbors=k,
            algorithm="brute",
            weights="uniform"
        )
        knn.fit(X_train, y_train)
        accuracy = knn.score(X_test, y_test)
        accuracies.append((k, accuracy))
        print(f"k={k}, Accuracy={accuracy}")

    return accuracies

# Load training and testing data
X_train, y_train = readFeatureFile("../data/dataset/training.csv")
X_test, y_test = readFeatureFile("../data/dataset/testing.csv")

# Convert lists to NumPy arrays
X_train = np.array(X_train)
y_train = np.array(y_train)
X_test = np.array(X_test)
y_test = np.array(y_test)

# Define k values to evaluate
k_values = [1, 3, 5, 10, 20, 30, 50, 75, 100]

# Run evaluation
accuracies = evaluate_knn(k_values, X_train, y_train, X_test, y_test)

# Find the best k value based on highest accuracy
best_k, best_accuracy = max(accuracies, key=lambda item: item[1])
print(f"Best k value: {best_k} with accuracy: {best_accuracy}")

# Plot Accuracy vs. k
k_values_array, accuracy_values = zip(*accuracies)
plt.figure(figsize=(10, 6))
plt.plot(k_values_array, accuracy_values, marker='o', color='blue')
plt.title('Accuracy vs. k')
plt.xlabel('k Value')
plt.ylabel('Accuracy')
plt.grid(True)
plt.savefig('accuracy_chart.png')
plt.show()

# Train KNN using the best k
knn = KNeighborsClassifier(
    n_neighbors=best_k,
    algorithm="brute",
    weights="uniform"
)
knn.fit(X_train, y_train)

# Decision boundary visualization
h = .02  # step size in the mesh
x_min, x_max = 0, 1  # Set x-axis from 0 to 1
y_min, y_max = 0, 1  # Set y-axis from 0 to 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, h),
                     np.arange(y_min, y_max, h))

Z = knn.predict(np.c_[xx.ravel(), yy.ravel()])
Z = Z.reshape(xx.shape)

plt.figure(figsize=(10, 6))
plt.contourf(xx, yy, Z, alpha=0.8)
plt.scatter(X_train[:, 0], X_train[:, 1], c=y_train, edgecolor='k', marker='o')
plt.title(f'Decision Boundary with k={best_k}')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.xlim(0, 1)  # Set x-axis limits to [0, 1]
plt.ylim(0, 1)  # Set y-axis limits to [0, 1]
plt.grid(True)
plt.savefig('decision_boundary.png')
plt.show()
