const express = require("express")
const router = express.Router()
const db = require("../database")

router.post("/all-course-averages", (req, res) => {
    const { user_id } = req.body
    const get_enrollments = db.prepare("SELECT course_id FROM enrollments WHERE user_id = ?")
    const enrollments = get_enrollments.all(user_id)

    const get_marks = db.prepare(`
        SELECT assessments.weight, marks.earned, marks.total
        FROM assessments
        LEFT JOIN marks ON marks.assessment_id = assessments.id AND marks.user_id = ?
        WHERE assessments.course_id = ? AND marks.status = 'Complete'
    `)

    const averages = {}
    for (const enrollment of enrollments) {
        const marks = get_marks.all(user_id, enrollment.course_id)
        const valid_marks = marks.filter(m => 
            m.earned != null && m.earned !== "" &&
            m.total != null && m.total !== "" && 
            m.total != 0
        )
        if (valid_marks.length === 0) {
            averages[enrollment.course_id] = null
        } else {
            const weighted_sum = valid_marks.reduce((sum, m) => sum + (parseFloat(m.earned) / parseFloat(m.total)) * m.weight, 0)
            const total_weight = valid_marks.reduce((sum, m) => sum + m.weight, 0)
            averages[enrollment.course_id] = ((weighted_sum / total_weight) * 100).toFixed(2)
        }
    }

    res.json(averages)
})

router.get("/admin-course-statistics", (req, res) => {
    const courses = db.prepare("SELECT * FROM courses").all()

    const result = courses.map(course => {
        const enrolled = db.prepare("SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?").get(course.id)
        const assessments = db.prepare("SELECT * FROM assessments WHERE course_id = ?").all(course.id)

        const assessments_with_completion = assessments.map(assessment => {
            const completed = db.prepare(`
                SELECT COUNT(*) as count FROM marks 
                WHERE assessment_id = ? AND status = 'Complete'
            `).get(assessment.id)
            return {
                ...assessment,
                completed: completed.count,
                enrolled: enrolled.count
            }
        })

        return {
            ...course,
            enrolled: enrolled.count,
            assessments: assessments_with_completion
        }
    })

    res.json(result)
})

router.post("/course-statistics", (req, res) => {
    const { course_id } = req.body
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(course_id)
    const enrolled = db.prepare("SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?").get(course_id)
    const assessments = db.prepare("SELECT * FROM assessments WHERE course_id = ?").all(course_id)

    const assessments_with_completion = assessments.map(assessment => {
        const completed = db.prepare("SELECT COUNT(*) as count FROM marks WHERE assessment_id = ? AND status = 'Complete'").get(assessment.id)
        return { ...assessment, completed: completed.count, enrolled: enrolled.count }
    })

    res.json({ ...course, enrolled: enrolled.count, assessments: assessments_with_completion })
})

module.exports = router