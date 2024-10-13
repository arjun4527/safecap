// function validateForm() {
//   let valid = true;

//   // Clear previous error messages
//   document.querySelectorAll('.error').forEach(function(error) {
//       error.textContent = '';
//   });

//   // Get form fields
//   const firstName = document.getElementById('firstName').value.trim();
//   const lastName = document.getElementById('lastName').value.trim();
//   const email = document.getElementById('customerEmail').value.trim();
//   const password = document.getElementById('customerPassword').value.trim();
//   const confirmPassword = document.getElementById('customerConfirmPassword').value.trim();

//   // First Name Validation
//   if (firstName === "") {
//       document.getElementById('firstNameError').textContent = "First Name is required.";
//       valid = false;
//   }

//   // Last Name Validation
//   if (lastName === "") {
//       document.getElementById('lastNameError').textContent = "";
//       valid = false;
//   }

//   // Email Validation
//   const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//   if (email === "") {
//       document.getElementById('emailError').textContent = "Email is required.";
//       valid = false;
//   } else if (!emailPattern.test(email)) {
//       document.getElementById('emailError').textContent = "Please enter a valid email address.";
//       valid = false;
//   }

//   // Password Validation
//   if (password === "") {
//       document.getElementById('passwordError').textContent = "Password is required.";
//       valid = false;
//   } else if (password.length < 6) {
//       document.getElementById('passwordError').textContent = "Password must be at least 6 characters.";
//       valid = false;
//   }

//   // Confirm Password Validation
//   if (confirmPassword === "") {
//       document.getElementById('confirmPasswordError').textContent = "Confirm Password is required.";
//       valid = false;
//   } else if (password !== confirmPassword) {
//       document.getElementById('confirmPasswordError').textContent = "Passwords do not match.";
//       valid = false;
//   }

//   // If form is valid, submit it
//   if (valid) {
//       document.getElementById('customerRegistrationForm').submit();
//   }
// }