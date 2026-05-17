// 📁 backend/middleware/validationMiddleware.js

// 🔹 Capitalize each word (Auto fix)
const capitalizeWords = (value) => {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// 🔹 Validate Student
export const validateStudent = (req, res, next) => {
  let { name, email, mobile, birth_date } = req.body;

  // 1️⃣ Required Fields Check
  if (!name || !email || !mobile || !birth_date) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  // 2️⃣ Auto Format Name (First Letter Capital)
  name = capitalizeWords(name);
  req.body.name = name;

  // 3️⃣ Email Lowercase
  email = email.toLowerCase();
  req.body.email = email;

  // 4️⃣ Mobile Validation (10 digits only)
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
      message: "Mobile must be 10 digits and start with 6-9"
    });
  }

  // 5️⃣ Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format"
    });
  }

  // 6️⃣ Birth Date Validation
  const date = new Date(birth_date);
  if (isNaN(date.getTime())) {
    return res.status(400).json({
      message: "Invalid birth date"
    });
  }

  next(); // ✅ move to controller
};