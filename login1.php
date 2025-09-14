<?php
$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "mydatabase";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);

    // Check if any field is empty
    if (empty($email) || empty($password)) {
        die("All fields are required.");
    }

    // Sanitize form data
    $email = $conn->real_escape_string(htmlspecialchars($email));

    // Prepare and execute query to check email
    $stmt = $conn->prepare("SELECT password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Email exists, fetch hashed password
        $stmt->bind_result($hashed_password);
        $stmt->fetch();

        // Verify the password
        if (password_verify($password, $hashed_password)) {
            // Successful login, redirect to index.html
            header("Location: index.html");
            exit();
        } else {
            echo "Invalid password. Please try again.";
        }
    } else {
        echo "No user found with that email address.";
    }

    // Close statement
    $stmt->close();
}

// Close connection
$conn->close();
?>
