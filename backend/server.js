const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const assessments_router = require("./routes/assessments")
const courses_router = require("./routes/courses")
const enrollments_router = require("./routes/enrollments")
const marks_router = require("./routes/marks")
const statistics_router = require("./routes/statistics")
const users_router = require("./routes/users")

app.use("/", assessments_router)
app.use("/", courses_router)
app.use("/", enrollments_router)
app.use("/", marks_router)
app.use("/", statistics_router)
app.use("/", users_router)

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001")
})