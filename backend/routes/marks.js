const express = require("express")
const router = express.Router()
const db = require("../database")

router.get("/marks", (req, res) => {
    const get_all_marks = db.prepare("SELECT * FROM marks")
    const result = get_all_marks.all()
    res.json(result)
})

router.post("/save-mark", (req, res) => {
    const { user_id, assessment_id, earned, total, status } = req.body
    if (earned && total) {
        if (parseFloat(earned) > parseFloat(total)) return res.status(400).json({ error: "Invalid earned" })
        if (parseFloat(total) <= 0) return res.status(400).json({ error: "Invalid total" })
    }
    if (earned && !total) return res.status(400).json({ error: "Invalid total" })
    if (!earned && total) return res.status(400).json({ error: "Invalid earned" })
    if (status && status !== "Pending" && status !== "Complete") return res.status(400).json({ error: "Invalid status" })

    const upsert_mark = db.prepare(`
        INSERT INTO marks (user_id, assessment_id, earned, total, status)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, assessment_id) DO UPDATE SET
        earned = excluded.earned,
        total = excluded.total,
        status = excluded.status
    `)
    const result = upsert_mark.run(user_id, assessment_id, earned, total, status)
    res.json(result)
})

module.exports = router