const express = require("express")
const router = express.Router()
const db = require("../database")
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const bcrypt = require('bcrypt')

router.get("/users", (req, res) => {
    const get_all_users = db.prepare("SELECT * FROM users")
    const result = get_all_users.all()
    res.json(result)
})

router.get("/students", (req, res) => {
    const get_all_students = db.prepare("SELECT * FROM users WHERE role ='Student'")
    const result = get_all_students.all()
    res.json(result)
})

router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body
    const role = "Student"
    if (!name || !email || !password || !role) return res.status(400).json({ error: "All fields are required" })
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Invalid email" })
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
    if (existing) return res.status(400).json({ error: "Invalid email" })
    const hashed_password = await bcrypt.hash(password, 10)
    const insert_user = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
    const result = insert_user.run(name, email, hashed_password, role)
    res.json({ id: result.lastInsertRowid, name, email, role })
})

router.post("/signin", async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: "All fields are required" })
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Invalid email" })
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email)
    if (!user) return res.status(401).json({ error: "Invalid email or password" })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: "Invalid email or password" })
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    })
})

router.post("/edit-user", async (req, res) => {
    const { id, name, email, password } = req.body
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" })
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Invalid email" })
    const existing = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, id)
    if (existing) return res.status(400).json({ error: "Invalid email" })
    if (password && password !== "") {
        const hashed_password = await bcrypt.hash(password, 10)
        db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?").run(name, email, hashed_password, id)
    } else {
        db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, id)
    }
    res.json({ success: true })
})

module.exports = router