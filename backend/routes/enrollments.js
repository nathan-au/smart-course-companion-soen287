const express = require("express")
const router = express.Router()
const db = require("../database")

router.get("/enrollments", (req, res) => {
    const get_all_enrollments = db.prepare("SELECT * FROM enrollments")
    const result = get_all_enrollments.all()
    res.json(result)
})

router.post("/user-enrollments", (req, res) => {
    const { user_id } = req.body
    const get_user_enrollments = db.prepare("SELECT courses.* FROM enrollments JOIN courses ON courses.id = enrollments.course_id WHERE enrollments.user_id = ?")
    res.json(get_user_enrollments.all(user_id))
})

router.post("/enroll", (req, res) => {
    const { user_id, course_id } = req.body
    const insert_enrollment = db.prepare("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)")
    const result = insert_enrollment.run(user_id, course_id)
    res.json(result)
})

router.post("/unenroll", (req, res) => {
    const { user_id, course_id } = req.body

    db.prepare("DELETE FROM marks WHERE user_id = ? AND assessment_id IN (SELECT id FROM assessments WHERE course_id = ?)").run(user_id, course_id)

    const delete_enrollment = db.prepare("DELETE FROM enrollments WHERE user_id = ? AND course_id = ?")
    const result = delete_enrollment.run(user_id, course_id)
    res.json(result)
})

module.exports = router