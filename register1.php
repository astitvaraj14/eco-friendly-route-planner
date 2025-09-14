<?php

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bookings";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Enable error reporting (optional, for debugging purposes)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize input data
    $name = htmlspecialchars($_POST["name"]);
    $email = htmlspecialchars($_POST["email"]);
    $destination = htmlspecialchars($_POST["destination"]);
    $departure_date = htmlspecialchars($_POST["departure-date"]);
    $return_date = htmlspecialchars($_POST["return-date"]);

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO booking (name, email, destination, departure_date, return_date) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $name, $email, $destination, $departure_date, $return_date);

    // Execute the statement
    if ($stmt->execute()) {
        echo "Booking successfully saved!";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close statement
    $stmt->close();
}

// Close connection
$conn->close();
?>
