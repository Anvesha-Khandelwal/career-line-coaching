const express = require("express");
const Student = require("../models/student");

const router = express.Router();

// Add student
router.post("/", async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.json(student);
});

// Get all students
router.get("/", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// Update student
router.put("/:id", async (req, res) => {
  const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete student
router.delete("/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
