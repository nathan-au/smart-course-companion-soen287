const express = require("express")
const router = express.Router()
const db = require("../database")

router.get("/courses", (req, res) => {
    const get_all_courses = db.prepare("SELECT * FROM courses")
    const result = get_all_courses.all()
    res.json(result)
})

router.post("/add-course", (req, res) => {
    const { name, code, instructor, term } = req.body
    if (!name || !code || !instructor || !term) return res.status(400).json({ error: "All fields are required" })
    const existing = db.prepare("SELECT id FROM courses WHERE code = ?").get(code)
    if (existing) return res.status(400).json({ error: "Invalid code" })
    const insert_course = db.prepare("INSERT INTO courses (name, code, instructor, term) VALUES (?, ?, ?, ?)")
    const result = insert_course.run(name, code, instructor, term)
    res.json(result)
})

router.post("/edit-course", (req, res) => {
    const { id, name, code, instructor, term } = req.body
    if (!name || !code || !instructor || !term) return res.status(400).json({ error: "All fields are required" })
    const existing = db.prepare("SELECT id FROM courses WHERE code = ? AND id != ?").get(code, id)
    if (existing) return res.status(400).json({ error: "Invalid code" })
    const update_course = db.prepare("UPDATE courses SET name = ?, code = ?, instructor = ?, term = ? WHERE id = ?")
    const result = update_course.run(name, code, instructor, term, id);
    res.json(result);
})

router.post("/delete-course", (req, res) => {
    const { id } = req.body
    const delete_course = db.prepare("DELETE FROM courses WHERE id = ?")
    const result = delete_course.run(id)
    res.json(result)
})

router.post("/toggle-course", (req, res) => {
    const { id } = req.body
    const toggle_course = db.prepare("UPDATE courses SET enabled = 1 - enabled WHERE id = ?")
    const result = toggle_course.run(id)
    res.json(result)
})

router.get("/enabled-courses", (req, res) => {
    const get_enabled_courses = db.prepare("SELECT * FROM courses WHERE enabled = 1")
    const result = get_enabled_courses.all()
    res.json(result)
})

module.exports = router