const express = require("express")
const router = express.Router()
const db = require("../database")

router.get("/assessments", (req, res) => {
    const get_all_assessments = db.prepare("SELECT * FROM assessments")
    const result = get_all_assessments.all()
    res.json(result)
})

router.post("/course-assessments", (req, res) => {
    const { course_id } = req.body
    const get_course_assessments = db.prepare("SELECT * FROM assessments WHERE course_id = ?")
    res.json(get_course_assessments.all(course_id))
})

router.post("/add-assessment", (req, res) => {
    const { course_id, name, category, description, weight, due_date } = req.body
    if (!name || !category || !weight) return res.status(400).json({ error: "Name, category, and weight are required" })
    if (isNaN(weight) || weight <= 0 || weight > 100) return res.status(400).json({ error: "Invalid weight" })

    const insert_assessment = db.prepare("INSERT INTO assessments (course_id, name, category, description, weight, due_date) VALUES (?, ?, ?, ?, ?, ?)")
    const result = insert_assessment.run(course_id, name, category, description, weight, due_date)
    res.json({ id: result.lastInsertRowid })
})

router.post("/delete-assessment", (req, res) => {
    const { id } = req.body
    const delete_assessment = db.prepare("DELETE FROM assessments WHERE id = ?")
    const result = delete_assessment.run(id)
    res.json(result)
})

router.post("/student-assessments", (req, res) => {
    const { user_id, course_id } = req.body
    const get_course_assessments_with_marks = db.prepare(`
        SELECT assessments.*, marks.earned, marks.total, marks.status
        FROM assessments
        LEFT JOIN marks ON marks.assessment_id = assessments.id AND marks.user_id = ?
        WHERE assessments.course_id = ?
    `)
    res.json(get_course_assessments_with_marks.all(user_id, course_id))
})

router.post("/student-upcoming-assessments", (req, res) => {
    const { user_id } = req.body
    const get_upcoming = db.prepare(`
        SELECT assessments.*, courses.name as course_name, courses.code as course_code,
               marks.earned, marks.total, marks.status
        FROM assessments
        JOIN enrollments ON enrollments.course_id = assessments.course_id AND enrollments.user_id = ?
        JOIN courses ON courses.id = assessments.course_id
        LEFT JOIN marks ON marks.assessment_id = assessments.id AND marks.user_id = ?
        WHERE marks.status IS NULL OR marks.status = 'Pending'
        ORDER BY assessments.due_date ASC
    `)
    const result = get_upcoming.all(user_id, user_id)
    res.json(result)
})

module.exports = router