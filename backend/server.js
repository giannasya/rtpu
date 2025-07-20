const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "token";

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3001" }));
app.use(bodyParser.json());

// Konfigurasi Multer untuk unggah file (hanya untuk course image dan file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Batas 100MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("File type not supported"));
  },
});

// Buat folder uploads
if (!fs.existsSync("Uploads")) {
  fs.mkdirSync("Uploads");
}

// Serve file unggahan
app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));

// Koneksi MySQL menggunakan Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "rtpu_pnj",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Tes koneksi MySQL saat startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL Connected");
    connection.release();
  } catch (err) {
    console.error("MySQL Connection Error:", err);
    process.exit(1);
  }
})();

// Middleware autentikasi
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Authorization header:", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    
    if (err) console.log("Token verification failed:", err);
    console.log("JWT verify result:", { err, user });
    if (err) {
      console.log("Invalid token:", err.message);
      return res.status(403).json({ message: "Token tidak valid", error: err.message });
    }
    req.user = user;
    console.log("Authenticated user:", user);
    next();
  });
}

// Middleware untuk role teacher
function restrictToTeacher(req, res, next) {
  console.log("Checking teacher role for user:", req.user);
  if (req.user.role !== "teacher") {
    console.log("Access denied: User is not a teacher", { userId: req.user.id, email: req.user.email });
    return res.status(403).json({ message: "Access restricted to teachers" });
  }
  next();
}

// Middleware untuk role teacher ATAU admin
function restrictToTeacherOrAdmin(req, res, next) {
  console.log("Checking role for teacher or admin:", req.user);
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access restricted to teachers or admins" });
  }
  next();
}


// Middleware untuk role admin
function restrictToAdmin(req, res, next) {
  console.log("Checking admin role for user:", req.user);
  if (req.user.role !== "admin") {
    console.log("Unauthorized access attempt:", req.user.id, req.user.email);
    return res.status(403).json({ message: "Akses dibatasi untuk admin" });
  }
  next();
}

// Get all available courses (public, no authentication)
app.get("/api/courses/all", async (req, res) => {
  console.log("Fetching all available courses");
  try {
    const [courses] = await pool.query(`
      SELECT id, title, date, description, image_url, file_url, students, created_at
      FROM courses
    `);
    console.log("Courses fetched:", courses);
    res.status(200).json({ courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});


app.get('/api/courses/:id/full', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Get course with teacher info and enrollment status
    const [courseRows] = await pool.query(
      `SELECT c.*, u.name as teacher_name,
       EXISTS(SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = c.id) as is_enrolled
       FROM courses c 
       LEFT JOIN users u ON u.id = c.teacher_id 
       WHERE c.id = ?`,
      [userId, courseId]
    );

    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = courseRows[0];

    // Get modules with their submaterials
    const [modulesWithSubmaterials] = await pool.query(`
      SELECT m.id as module_id, m.title as module_title,
             s.id as submaterial_id, s.title as submaterial_title, 
             s.file_url as submaterial_file_url
      FROM modules m
      LEFT JOIN submaterials s ON m.id = s.module_id
      WHERE m.course_id = ?
      ORDER BY m.id, s.id
    `, [courseId]);

    // Transform the data into hierarchical structure
    const modulesMap = new Map();
    
    modulesWithSubmaterials.forEach(row => {
      if (!modulesMap.has(row.module_id)) {
        modulesMap.set(row.module_id, {
          id: row.module_id,
          title: row.module_title || 'Untitled Module', // Fallback for empty titles
          submaterials: []
        });
      }
      
      if (row.submaterial_id) {
        modulesMap.get(row.module_id).submaterials.push({
          id: row.submaterial_id,
          title: row.submaterial_title || 'Untitled Material', // Fallback
          file_url: row.submaterial_file_url
        });
      }
    });

    const modules = Array.from(modulesMap.values());

    res.json({ 
      success: true,
      course: {
        ...course,
        image_url: course.image_url ? `http://localhost:3000${course.image_url}` : null,
        file_url: course.file_url ? `http://localhost:3000${course.file_url}` : null
      },
      modules,
      isEnrolled: !!course.is_enrolled
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

app.post('/api/enrollments', authenticateToken, async (req, res) => {
  try {
    const { course_id } = req.body;
    const userId = req.user.id;

    if (!course_id) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Check if already enrolled
    const [existing] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, course_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add enrollment
    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, course_id]
    );

    // Update student count - FIXED: use course_id instead of undefined courseId
    await pool.query(
      'UPDATE courses SET students = students + 1 WHERE id = ?',
      [course_id]  // Changed from courseId to course_id
    );

    // Get updated course data
    const [courseResponse] = await pool.query(
      `SELECT c.*, u.name as teacher_name 
       FROM courses c 
       LEFT JOIN users u ON u.id = c.teacher_id 
       WHERE c.id = ?`,
      [course_id]
    );

    if (courseResponse.length === 0) {
      return res.status(404).json({ message: 'Course not found after enrollment' });
    }

    // Return success with course data - FIXED: only one response
    res.status(201).json({ 
      success: true, 
      message: 'Successfully enrolled',
      course: courseResponse[0]
    });

  } catch (err) {
    console.error('Error enrolling:', err);
    // FIXED: only one error response
    res.status(500).json({ 
      message: 'Failed to enroll in course',
      error: err.message 
    });
  }
});

app.get('/api/enrollments/check', authenticateToken, async (req, res) => {
  try {
    const { course_id } = req.query;
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, course_id]
    );

    res.json({ enrolled: rows.length > 0 });
  } catch (err) {
    console.error('Error checking enrollment:', err);
    res.status(500).json({ message: 'Failed to check enrollment status' });
  }
});
// Improved enrolled courses endpoint
app.get('/api/enrolled-courses', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const [courses] = await pool.query(`
      SELECT c.id, c.title, c.date, c.description, 
             c.image_url, c.file_url, c.students, c.created_at,
             (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as module_count
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = ?
      ORDER BY c.created_at DESC
    `, [userId]);

    // Format URLs and dates consistently
    const formattedCourses = courses.map(course => ({
      ...course,
      image_url: course.image_url ? 
        `${process.env.BASE_URL || 'http://localhost:3000'}${course.image_url}` : null,
      file_url: course.file_url ? 
        `${process.env.BASE_URL || 'http://localhost:3000'}${course.file_url}` : null,
      created_at: new Date(course.created_at).toLocaleDateString()
    }));

    res.status(200).json({ courses: formattedCourses });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});
// Get modules and submaterials for a course
app.get("/api/courses/:id/modules", authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching modules for course ID: ${id}`);

  try {
    // Get course details
    const [course] = await pool.query(
      "SELECT id, title, description, image_url, file_url FROM courses WHERE id = ?",
      [id]
    );

    if (course.length === 0) {
      console.log("Course not found:", id);
      return res.status(404).json({ message: "Course not found" });
    }

    // Get modules for this course
    const [modules] = await pool.query(
      "SELECT id, title FROM modules WHERE course_id = ?",
      [id]
    );

    // Get submaterials for each module
    if (modules.length > 0) {
      const moduleIds = modules.map(m => m.id);
      const [submaterials] = await pool.query(
        `SELECT id, module_id, title, file_url FROM submaterials 
         WHERE module_id IN (${moduleIds.map(() => '?').join(',')})`,
        moduleIds
      );

      // Attach submaterials to their modules
      const modulesWithSubmaterials = modules.map(module => ({
        ...module,
        submaterials: submaterials.filter(sub => sub.module_id === module.id)
      }));

      return res.status(200).json({ 
        course: course[0],
        modules: modulesWithSubmaterials 
      });
    }

    res.status(200).json({ 
      course: course[0],
      modules: [] 
    });
  } catch (err) {
    console.error("Error fetching modules:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Get all courses for admin
app.get("/api/courses/admin", authenticateToken, restrictToTeacherOrAdmin, async (req, res) => {
  console.log("Fetching all courses for admin");
  try {
    const [courses] = await pool.query(`
      SELECT id, teacher_id, title, date, description, image_url, file_url, students, created_at
      FROM courses
    `);
    console.log("Courses fetched for admin:", courses);
    res.status(200).json({ message: "Courses fetched successfully", courses });
  } catch (err) {
    console.error("Error fetching courses for admin:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Get enrolled courses for a user
app.get("/api/enrolled-courses", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log(`Fetching enrolled courses for user ID: ${userId}, role: ${req.user.role}`);
  
  try {
    // Jika pengguna adalah admin, kembalikan array kosong karena admin tidak enroll kursus
    if (req.user.role === "admin") {
      console.log("Admin user, returning empty enrolled courses");
      return res.status(200).json({ message: "No enrolled courses for admin", courses: [] });
    }

    const [courses] = await pool.query(
      `
      SELECT c.id, c.title, c.date, c.description, c.image_url, c.file_url, c.students, c.created_at
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = ?
      `,
      [userId]
    );
    console.log("Enrolled courses fetched:", courses);
    res.status(200).json({ message: "Enrolled courses fetched successfully", courses: courses || [] });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Get all courses for a teacher
// app.get("/api/courses", authenticateToken, restrictToTeacher, async (req, res) => {
//   const teacherId = req.user.id;
//   console.log(`Fetching courses for teacher ID: ${teacherId}`);
//   try {
//     const [courses] = await pool.query(
//       `
//       SELECT id, teacher_id, title, date, description, image_url, file_url, students, created_at
//       FROM courses
//       WHERE teacher_id = ?
//       `,
//       [teacherId]
//     );
//     if (courses.length === 0) {
//       console.log("No courses found for teacher ID:", teacherId);
//       return res.status(200).json({ courses: [] });
//     }

//     const courseIds = courses.map((c) => c.id);
//     console.log("Course IDs:", courseIds);

//     const [modules] = await pool.query(
//       `
//       SELECT m.id, m.course_id, m.title
//       FROM modules m
//       WHERE m.course_id IN (${courseIds.map(() => "?").join(",")})
//       `,
//       courseIds
//     );
//     console.log("Modules fetched:", modules);

//     const moduleIds = modules.map((m) => m.id);
//     let submaterials = [];
//     if (moduleIds.length > 0) {
//       [submaterials] = await pool.query(
//         `
//         SELECT s.id, s.module_id, s.title, s.file_url
//         FROM submaterials s
//         WHERE s.module_id IN (${moduleIds.map(() => "?").join(",")})
//         `,
//         moduleIds
//       );
//     }
//     console.log("Submaterials fetched:", submaterials);

//     const coursesWithModules = courses.map((course) => {
//       const courseModules = modules
//         .filter((m) => m.course_id === course.id)
//         .map((m) => ({
//           id: m.id,
//           title: m.title,
//           submaterials: submaterials
//             .filter((s) => s.module_id === m.id)
//             .map((s) => ({
//               id: s.id,
//               title: s.title,
//               file_url: s.file_url,
//             })),
//         }));
//       return { ...course, modules: courseModules };
//     });

//     console.log(`Fetched ${coursesWithModules.length} courses`);
//     res.status(200).json({ courses: coursesWithModules });
//   } catch (err) {
//     console.error("Error fetching courses:", err);
//     res.status(500).json({ message: "Database error", error: err.message });
//   }
// });

// coba gianna
app.get("/api/courses", authenticateToken, restrictToTeacher, async (req, res) => {
  const teacherId = req.user.id;
  console.log(`Fetching courses for teacher ID: ${teacherId}`);

  try {
    // ✅ Ambil course milik teacher dan juga course dari admin
    const [courses] = await pool.query(
      `
      SELECT id, teacher_id, title, date, description, image_url, file_url, students, created_at
      FROM courses
      WHERE teacher_id = ? OR teacher_id IS NULL
      `,
      [teacherId]
    );

    if (courses.length === 0) {
      console.log("No courses found for teacher ID or admin");
      return res.status(200).json({ courses: [] });
    }

    const courseIds = courses.map((c) => c.id);
    console.log("Course IDs:", courseIds);

    const [modules] = await pool.query(
      `
      SELECT m.id, m.course_id, m.title
      FROM modules m
      WHERE m.course_id IN (${courseIds.map(() => "?").join(",")})
      `,
      courseIds
    );
    console.log("Modules fetched:", modules);

    const moduleIds = modules.map((m) => m.id);
    let submaterials = [];
    if (moduleIds.length > 0) {
      [submaterials] = await pool.query(
        `
        SELECT s.id, s.module_id, s.title, s.file_url
        FROM submaterials s
        WHERE s.module_id IN (${moduleIds.map(() => "?").join(",")})
        `,
        moduleIds
      );
    }
    console.log("Submaterials fetched:", submaterials);

    const coursesWithModules = courses.map((course) => {
      const courseModules = modules
        .filter((m) => m.course_id === course.id)
        .map((m) => ({
          id: m.id,
          title: m.title,
          submaterials: submaterials
            .filter((s) => s.module_id === m.id)
            .map((s) => ({
              id: s.id,
              title: s.title,
              file_url: s.file_url,
            })),
        }));
      return { ...course, modules: courseModules };
    });

    console.log(`Fetched ${coursesWithModules.length} courses`);
    res.status(200).json({ courses: coursesWithModules });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});


// Get all courses for students
app.get("/api/courses/student", authenticateToken, async (req, res) => {
  console.log(`Fetching all courses for student ID: ${req.user.id}`);
  try {
    const [courses] = await pool.query(`
      SELECT id, teacher_id, title, date, description, image_url, file_url, students, created_at
      FROM courses
    `);
    if (courses.length === 0) {
      console.log("No courses found");
      return res.status(200).json({ courses: [] });
    }

    const courseIds = courses.map((c) => c.id);
    console.log("Course IDs:", courseIds);

    const [modules] = await pool.query(
      `
      SELECT m.id, m.course_id, m.title
      FROM modules m
      WHERE m.course_id IN (${courseIds.map(() => "?").join(",")})
      `,
      courseIds
    );
    console.log("Modules fetched:", modules);

    const moduleIds = modules.map((m) => m.id);
    let submaterials = [];
    if (moduleIds.length > 0) {
      [submaterials] = await pool.query(
        `
        SELECT s.id, s.module_id, s.title, s.file_url
        FROM submaterials s
        WHERE s.module_id IN (${moduleIds.map(() => "?").join(",")})
        `,
        moduleIds
      );
    }
    console.log("Submaterials fetched:", submaterials);

    const coursesWithModules = courses.map((course) => {
      const courseModules = modules
        .filter((m) => m.course_id === course.id)
        .map((m) => ({
          id: m.id,
          title: m.title,
          submaterials: submaterials
            .filter((s) => s.module_id === m.id)
            .map((s) => ({
              id: s.id,
              title: s.title,
              file_url: s.file_url,
            })),
        }));
      return { ...course, modules: courseModules };
    });

    console.log(`Fetched ${coursesWithModules.length} courses for student`);
    res.status(200).json({ courses: coursesWithModules });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// app.post(
//   "/api/courses",
//   authenticateToken,
//   restrictToTeacherOrAdmin, // ✅ perubahan di sini
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "file", maxCount: 1 },
//     { name: "submaterialFiles", maxCount: 10 },
//   ]),
//   async (req, res) => {
//     console.log("Received POST /api/courses request");
//     console.log("Uploaded files:", req.files);
//     const { title, date, description, modules } = req.body;
//     const teacherId = req.user.id;
//     const imageUrl = req.files.image ? `/Uploads/${req.files.image[0].filename}` : null;
//     const fileUrl = req.files.file ? `/Uploads/${req.files.file[0].filename}` : null;

//     if (!title || !date) {
//       console.log("Missing required fields: title or date");
//       return res.status(400).json({ message: "Title and date are required" });
//     }

//     let connection;
//     try {
//       connection = await pool.getConnection();
//       await connection.beginTransaction();

//       const [result] = await connection.query(
//         "INSERT INTO courses (teacher_id, title, date, description, image_url, file_url) VALUES (?, ?, ?, ?, ?, ?)",
//         [teacherId, title, date, description || null, imageUrl, fileUrl]
//       );
//       const courseId = result.insertId;
//       console.log(`Course created with ID: ${courseId}`);

//       if (modules) {
//         let parsedModules;
//         try {
//           parsedModules = JSON.parse(modules);
//         } catch (parseErr) {
//           console.error("Error parsing modules JSON:", parseErr);
//           throw new Error("Invalid modules data");
//         }

//         for (const module of parsedModules) {
//           console.log(`Inserting module: ${module.title}`);
//           const [modResult] = await connection.query(
//             "INSERT INTO modules (course_id, title) VALUES (?, ?)",
//             [courseId, module.title]
//           );
//           const moduleId = modResult.insertId;
//           console.log(`Module created with ID: ${moduleId}`);

//           for (const [index, sub] of module.submaterials.entries()) {
//             const subFile =
//               req.files.submaterialFiles && req.files.submaterialFiles[index]
//                 ? `/Uploads/${req.files.submaterialFiles[index].filename}`
//                 : null;
//             console.log(`Inserting submaterial: ${sub.title}, file: ${subFile}`);
//             await connection.query(
//               "INSERT INTO submaterials (module_id, title, file_url) VALUES (?, ?, ?)",
//               [moduleId, sub.title, subFile]
//             );
//           }
//         }
//       }

//       await connection.commit();
//       console.log(`Course ${courseId} saved successfully`);
//       res.status(201).json({ message: "Course created successfully", courseId });
//     } catch (err) {
//       if (connection) await connection.rollback();
//       console.error("Error saving course:", err);
//       res.status(500).json({ message: "Database error", error: err.message });
//     } finally {
//       if (connection) connection.release();
//     }
//   }
// );

// coba gianna

app.post(
  "/api/courses",
  authenticateToken,
  restrictToTeacherOrAdmin, // ✅ hanya admin & guru bisa akses
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "submaterialFiles", maxCount: 10 },
  ]),
  async (req, res) => {
    console.log("Received POST /api/courses request");
    console.log("Uploaded files:", req.files);
    const { title, date, description, modules } = req.body;

    // ✅ FIX: admin -> teacherId = null, teacher -> teacherId = user.id
    const teacherId = req.user.role === "admin" ? null : req.user.id;

    const imageUrl = req.files.image ? `/Uploads/${req.files.image[0].filename}` : null;
    const fileUrl = req.files.file ? `/Uploads/${req.files.file[0].filename}` : null;

    if (!title || !date) {
      console.log("Missing required fields: title or date");
      return res.status(400).json({ message: "Title and date are required" });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        "INSERT INTO courses (teacher_id, title, date, description, image_url, file_url) VALUES (?, ?, ?, ?, ?, ?)",
        [teacherId, title, date, description || null, imageUrl, fileUrl]
      );
      const courseId = result.insertId;
      console.log(`Course created with ID: ${courseId}`);

      if (modules) {
        let parsedModules;
        try {
          parsedModules = JSON.parse(modules);
        } catch (parseErr) {
          console.error("Error parsing modules JSON:", parseErr);
          throw new Error("Invalid modules data");
        }

        for (const module of parsedModules) {
          console.log(`Inserting module: ${module.title}`);
          const [modResult] = await connection.query(
            "INSERT INTO modules (course_id, title) VALUES (?, ?)",
            [courseId, module.title]
          );
          const moduleId = modResult.insertId;
          console.log(`Module created with ID: ${moduleId}`);

          for (const [index, sub] of module.submaterials.entries()) {
            const subFile =
              req.files.submaterialFiles && req.files.submaterialFiles[index]
                ? `/Uploads/${req.files.submaterialFiles[index].filename}`
                : null;
            console.log(`Inserting submaterial: ${sub.title}, file: ${subFile}`);
            await connection.query(
              "INSERT INTO submaterials (module_id, title, file_url) VALUES (?, ?, ?)",
              [moduleId, sub.title, subFile]
            );
          }
        }
      }

      await connection.commit();
      console.log(`Course ${courseId} saved successfully`);
      res.status(201).json({ message: "Course created successfully", courseId });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Error saving course:", err);
      res.status(500).json({ message: "Database error", error: err.message });
    } finally {
      if (connection) connection.release();
    }
  }
);



// Update a course
app.put(
  "/api/courses/:id",
  authenticateToken,
  async (req, res, next) => {
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      console.log("Access denied: User is neither teacher nor admin");
      return res.status(403).json({ message: "Access restricted to teachers or admins" });
    }
    next();
  },
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "submaterialFiles", maxCount: 10 },
  ]),
  async (req, res) => {
    console.log("Received PUT /api/courses/:id request");
    console.log("Uploaded files:", req.files);
    const { id } = req.params;
    const { title, date, description, image_url, file_url, modules } = req.body;
    const teacherId = req.user.id;
    const newImageUrl = req.files.image ? `/Uploads/${req.files.image[0].filename}` : image_url;
    const newFileUrl = req.files.file ? `/Uploads/${req.files.file[0].filename}` : file_url;

    if (!title || !date) {
      console.log("Missing required fields: title or date");
      return res.status(400).json({ message: "Title and date are required" });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Verifikasi kursus milik teacher (jika bukan admin)
      const [result] = await connection.query("SELECT teacher_id, image_url, file_url FROM courses WHERE id = ?", [id]);
      if (result.length === 0) {
        console.log("Course not found:", id);
        throw new Error("Course not found");
      }
      if (req.user.role !== "admin" && result[0].teacher_id !== teacherId) {
        console.log("Unauthorized: Course does not belong to teacher", { courseId: id, teacherId });
        throw new Error("Unauthorized: You can only edit your own courses");
      }

      // Hapus file lama jika ada file baru
      if (result[0].image_url && newImageUrl !== result[0].image_url) {
        try {
          await fs.promises.unlink(path.join(__dirname, result[0].image_url));
          console.log(`Old image deleted: ${result[0].image_url}`);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.error(`Error deleting old image: ${err}`);
          }
        }
      }
      if (result[0].file_url && newFileUrl !== result[0].file_url) {
        try {
          await fs.promises.unlink(path.join(__dirname, result[0].file_url));
          console.log(`Old file deleted: ${result[0].file_url}`);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.error(`Error deleting old file: ${err}`);
          }
        }
      }

      // Update kursus
      await connection.query(
        `
        UPDATE courses
        SET title = ?, date = ?, description = ?, image_url = ?, file_url = ?
        WHERE id = ?
        `,
        [title, date, description || null, newImageUrl, newFileUrl, id]
      );
      console.log(`Course updated with ID: ${id}`);

      if (modules) {
        let parsedModules;
        try {
          parsedModules = JSON.parse(modules);
        } catch (parseErr) {
          console.error("Error parsing modules JSON:", parseErr);
          throw new Error("Invalid modules data");
        }

        // Hapus modules dan submaterials lama
        await connection.query(
          "DELETE FROM submaterials WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?)",
          [id]
        );
        await connection.query("DELETE FROM modules WHERE course_id = ?", [id]);

        // Insert modules baru
        for (const [modIndex, module] of parsedModules.entries()) {
          console.log(`Inserting module: ${module.title}`);
          const [modResult] = await connection.query(
            "INSERT INTO modules (course_id, title) VALUES (?, ?)",
            [id, module.title]
          );
          const moduleId = modResult.insertId;
          console.log(`Module created with ID: ${moduleId}`);

          for (const [index, sub] of module.submaterials.entries()) {
            const subFile =
              req.files.submaterialFiles && req.files.submaterialFiles[index]
                ? `/Uploads/${req.files.submaterialFiles[index].filename}`
                : req.body[`submaterialFiles_${index}_${modIndex}`] || null;
            console.log(`Inserting submaterial: ${sub.title}, file: ${subFile}`);
            await connection.query(
              "INSERT INTO submaterials (module_id, title, file_url) VALUES (?, ?, ?)",
              [moduleId, sub.title, subFile]
            );
          }
        }
      }

      await connection.commit();
      console.log(`Course ${id} updated successfully`);
      res.status(200).json({ message: "Course updated successfully", courseId: id });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Error updating course:", err);
      res.status(500).json({ message: "Database error", error: err.message });
    } finally {
      if (connection) connection.release();
    }
  }
);

// Delete a course
app.delete("/api/courses/:id", authenticateToken, async (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    console.log("Access denied: User is neither teacher nor admin");
    return res.status(403).json({ message: "Access restricted to teachers or admins" });
  }
  next();
}, async (req, res) => {
  console.log("Received DELETE /api/courses/:id request");
  const { id } = req.params;
  const teacherId = req.user.id;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verifikasi kursus milik teacher (jika bukan admin)
    const [result] = await connection.query("SELECT teacher_id, image_url, file_url FROM courses WHERE id = ?", [id]);
    if (result.length === 0) {
      console.log("Course not found:", id);
      throw new Error("Course not found");
    }
    if (req.user.role !== "admin" && result[0].teacher_id !== teacherId) {
      console.log("Unauthorized: Course does not belong to teacher", { courseId: id, teacherId });
      throw new Error("Unauthorized: You can only delete your own courses");
    }

    // Ambil semua file_url dari submaterials
    const [submaterialFiles] = await pool.query(
      `
      SELECT s.file_url
      FROM submaterials s
      JOIN modules m ON s.module_id = m.id
      WHERE m.course_id = ?
      `,
      [id]
    );

    // Hapus file dari folder uploads
    const filesToDelete = [];
    if (result[0].image_url) filesToDelete.push(path.join(__dirname, result[0].image_url));
    if (result[0].file_url) filesToDelete.push(path.join(__dirname, result[0].file_url));
    submaterialFiles.forEach((file) => {
      if (file.file_url && file.file_url.startsWith('/Uploads/')) {
        filesToDelete.push(path.join(__dirname, file.file_url));
      }
    });

    for (const filePath of filesToDelete) {
      try {
        await fs.promises.unlink(filePath);
        console.log(`File deleted: ${filePath}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    }

    // Hapus submaterials, modules, dan course
    await connection.query(
      "DELETE FROM submaterials WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?)",
      [id]
    );
    await connection.query("DELETE FROM modules WHERE course_id = ?", [id]);
    const [deleteResult] = await connection.query("DELETE FROM courses WHERE id = ?", [id]);
    if (deleteResult.affectedRows === 0) {
      console.log("No course deleted, ID:", id);
      throw new Error("Course not found");
    }

    await connection.commit();
    console.log(`Course deleted with ID: ${id}`);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// Update this route in server.js
// app.post(
//   "/api/courses/:id/modules",
//   authenticateToken,
//   restrictToTeacher,
//   async (req, res) => {

  //coba gianna
  app.post(
  "/api/courses/:id/modules",
  authenticateToken,
  restrictToTeacherOrAdmin,
  async (req, res) => {

    console.log("Received POST /api/courses/:id/modules request");
    console.log("Request body:", req.body);
    const { id } = req.params;
    const { modules } = req.body; // No need to parse as it's already an object
    const teacherId = req.user.id;

    if (!modules) {
      console.log("Missing modules data");
      return res.status(400).json({ message: "Modules data is required" });
    }

    // Validate modules structure
    if (!Array.isArray(modules)) {
      console.log("Invalid modules format - should be an array");
      return res.status(400).json({ message: "Modules should be an array" });
    }

    const googleDriveRegex = /^https:\/\/(drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)[a-zA-Z0-9_-]+/;
    for (const module of modules) {
      if (!module.title) {
        console.log("Missing module title");
        return res.status(400).json({ message: `Module title is required` });
      }
      if (!module.submaterials || !Array.isArray(module.submaterials)) {
        console.log("Invalid submaterials format");
        return res.status(400).json({ message: `Submaterials should be an array for module: ${module.title}` });
      }
      for (const sub of module.submaterials) {
        if (!sub.title) {
          console.log("Missing submaterial title");
          return res.status(400).json({ message: `Submaterial title is required` });
        }
        if (sub.video_url && !googleDriveRegex.test(sub.video_url)) {
          console.log("Invalid Google Drive URL:", sub.video_url);
          return res.status(400).json({ message: `Invalid Google Drive URL for submaterial: ${sub.title}` });
        }
      }
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Verifikasi kursus milik teacher
      // const [result] = await connection.query("SELECT teacher_id FROM courses WHERE id = ?", [id]);
      // if (result.length === 0) {
      //   console.log("Course not found:", id);
      //   throw new Error("Course not found");
      // }
      // if (result[0].teacher_id !== teacherId) {
      //   console.log("Unauthorized: Course does not belong to teacher", { courseId: id, teacherId });
      //   throw new Error("Unauthorized: You can only add modules to your own courses");
      // }

      //coba gianna
      const [result] = await connection.query("SELECT teacher_id FROM courses WHERE id = ?", [id]);
        if (result.length === 0) {
          console.log("Course not found:", id);
          return res.status(404).json({ message: "Course not found" });
        }

        // Jika role teacher: hanya bisa edit kursus sendiri atau dari admin
        if (req.user.role === "teacher") {
          if (result[0].teacher_id !== req.user.id && result[0].teacher_id !== null) {
            return res.status(403).json({ message: "Teacher can only edit own or admin-created courses" });
          }
        }

      // Insert modules baru
      for (const module of modules) {
        console.log(`Inserting module: ${module.title}`);
        const [modResult] = await connection.query(
          "INSERT INTO modules (course_id, title) VALUES (?, ?)",
          [id, module.title]
        );
        const moduleId = modResult.insertId;
        console.log(`Module created with ID: ${moduleId}`);

        for (const sub of module.submaterials) {
          console.log(`Inserting submaterial: ${sub.title}, video_url: ${sub.video_url}`);
          await connection.query(
            "INSERT INTO submaterials (module_id, title, file_url) VALUES (?, ?, ?)",
            [moduleId, sub.title, sub.video_url || null]
          );
        }
      }

      await connection.commit();
      console.log(`Modules added to course ${id} successfully`);
      res.status(201).json({ message: "Modules added successfully", courseId: id });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Error adding modules:", err);
      res.status(500).json({ message: "Database error", error: err.message });
    } finally {
      if (connection) connection.release();
    }
  }
);
// Register route
app.post("/register", async (req, res) => {
  const { email, password, role, agree } = req.body;
  if (!email || !password || !role || !agree) {
    console.log("Missing required fields for registration");
    return res.status(400).json({ message: "All fields are required and agreement must be checked." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (email, password, role, agreed_terms, created_at) VALUES (?, ?, ?, ?, CURDATE())",
      [email, hashedPassword, role, agree]
    );
    const newUser = { id: result.insertId, email, role };
    console.log("User registered:", newUser);
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.log("Email already exists:", email);
      return res.status(409).json({ message: "Email already exists." });
    }
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const currentTime = new Date();
  console.log("Current server time for token generation:", currentTime);
  const { email, password } = req.body;
  if (!email || !password) {
    console.log("Missing email or password");
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const [results] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) {
      console.log("User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Log waktu server saat ini
    const currentTime = new Date();
    console.log("Current server time for token generation:", currentTime);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });

    // Log token yang dihasilkan
    console.log("Generated token:", token);

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || "",
      bio: user.bio || "",
      portfolio: user.portfolio || "",
      created_at: user.created_at,
    };

    console.log("User logged in:", userData.email, "Role:", userData.role);
    res.status(200).json({ message: "Login successful", user: userData, token });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get user details
app.get("/users/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  if (req.user.id !== parseInt(userId)) {
    console.log("Unauthorized access attempt:", req.user.id, userId);
    return res.status(403).json({ message: "Unauthorized access" });
  }

  try {
    const [results] = await pool.query(
      "SELECT id, email, role, name, bio, portfolio, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (results.length === 0) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    const user = results[0];
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Get current user details
app.get("/users/me", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log(`Fetching user details for user ID: ${userId}`);

  try {
    const [results] = await pool.query(
      "SELECT id, email, role, name, bio, portfolio, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (results.length === 0) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    const user = results[0];
    console.log("User data fetched:", user);
    res.status(200).json({ message: "User fetched successfully", user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Update user details
app.put("/users/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  if (req.user.id !== parseInt(userId)) {
    console.log("Unauthorized access attempt:", req.user.id, userId);
    return res.status(403).json({ message: "Unauthorized access" });
  }
  const { name, bio, portfolio } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE users SET name = ?, bio = ?, portfolio = ? WHERE id = ?",
      [name || null, bio || null, portfolio || null, userId]
    );
    if (result.affectedRows === 0) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    const updatedUser = { id: parseInt(userId), email: req.user.email, role: req.user.role, name, bio, portfolio };
    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Add a new quiz
// app.post("/api/quizzes", authenticateToken, restrictToTeacher, async (req, res) => {
//   console.log("Received POST /api/quizzes request");
//   const { title, retryLimit, questions } = req.body;
//   const teacherId = req.user.id;

//   // Validasi input
//   if (!title || !retryLimit || !questions || !Array.isArray(questions)) {
//     console.log("Invalid quiz data:", { title, retryLimit, questions });
//     return res.status(400).json({ error: "Data kuis tidak lengkap" });
//   }
//   if (retryLimit < 1 || retryLimit > 3) {
//     console.log("Invalid retry limit:", retryLimit);
//     return res.status(400).json({ error: "Batas retry harus antara 1 dan 3" });
//   }
//   for (const q of questions) {
//     if (!q.text || !Array.isArray(q.choices) || q.choices.length < 2 || q.correctIndex < 0 || q.correctIndex >= q.choices.length) {
//       console.log("Invalid question data:", q);
//       return res.status(400).json({ error: "Pertanyaan atau pilihan tidak valid" });
//     }
//     if (q.choices.some((choice) => !choice)) {
//       console.log("Empty choice detected:", q.choices);
//       return res.status(400).json({ error: "Semua pilihan harus diisi" });
//     }
//   }

//   let connection;
//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Insert kuis
//     const [quizResult] = await connection.query(
//       "INSERT INTO quizzes (title, retry_limit, teacher_id) VALUES (?, ?, ?)",
//       [title, retryLimit, teacherId]
//     );
//     const quizId = quizResult.insertId;
//     console.log(`Quiz created with ID: ${quizId}`);

//     // Insert pertanyaan dan pilihan
//     for (const q of questions) {
//       const [questionResult] = await connection.query(
//         "INSERT INTO questions (quiz_id, text, correct_index) VALUES (?, ?, ?)",
//         [quizId, q.text, q.correctIndex]
//       );
//       const questionId = questionResult.insertId;
//       console.log(`Question created with ID: ${questionId}`);

//       for (const choice of q.choices) {
//         await connection.query("INSERT INTO choices (question_id, text) VALUES (?, ?)", [questionId, choice]);
//         console.log(`Choice added for question ID: ${questionId}`);
//       }
//     }

//     await connection.commit();
//     console.log(`Quiz ${quizId} saved successfully`);
//     res.status(201).json({ message: "Kuis berhasil disimpan", quizId });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("Error saving quiz:", err);
//     res.status(500).json({ error: "Gagal menyimpan kuis ke database", message: err.message });
//   } finally {
//     if (connection) connection.release();
//   }
// });

//coba gianna

app.post("/api/quizzes", authenticateToken, restrictToTeacher, async (req, res) => {
  console.log("Received POST /api/quizzes request");
  const { title, retryLimit, timeLimit, questions } = req.body;  // ⬅️ Tambahkan timeLimit
  const teacherId = req.user.id;

  // Validasi input
  if (!title || !retryLimit || !timeLimit || !questions || !Array.isArray(questions)) {
    console.log("Invalid quiz data:", { title, retryLimit, timeLimit, questions });
    return res.status(400).json({ error: "Data kuis tidak lengkap" });
  }
  if (retryLimit < 1 || retryLimit > 3) {
    console.log("Invalid retry limit:", retryLimit);
    return res.status(400).json({ error: "Batas retry harus antara 1 dan 3" });
  }
  if (timeLimit < 1) {
    console.log("Invalid time limit:", timeLimit);
    return res.status(400).json({ error: "Waktu pengerjaan minimal 1 menit" });
  }

  for (const q of questions) {
    if (!q.text || !Array.isArray(q.choices) || q.choices.length < 2 || q.correctIndex < 0 || q.correctIndex >= q.choices.length) {
      console.log("Invalid question data:", q);
      return res.status(400).json({ error: "Pertanyaan atau pilihan tidak valid" });
    }
    if (q.choices.some((choice) => !choice)) {
      console.log("Empty choice detected:", q.choices);
      return res.status(400).json({ error: "Semua pilihan harus diisi" });
    }
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // ⬅️ Simpan timeLimit di database
    const [quizResult] = await connection.query(
      "INSERT INTO quizzes (title, retry_limit, time_limit, teacher_id) VALUES (?, ?, ?, ?)",
      [title, retryLimit, timeLimit, teacherId]
    );
    const quizId = quizResult.insertId;
    console.log(`Quiz created with ID: ${quizId}`);

    for (const q of questions) {
      const [questionResult] = await connection.query(
        "INSERT INTO questions (quiz_id, text, correct_index) VALUES (?, ?, ?)",
        [quizId, q.text, q.correctIndex]
      );
      const questionId = questionResult.insertId;
      console.log(`Question created with ID: ${questionId}`);

      for (const choice of q.choices) {
        await connection.query("INSERT INTO choices (question_id, text) VALUES (?, ?)", [questionId, choice]);
        console.log(`Choice added for question ID: ${questionId}`);
      }
    }

    await connection.commit();
    console.log(`Quiz ${quizId} saved successfully`);
    res.status(201).json({ message: "Kuis berhasil disimpan", quizId });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error saving quiz:", err);
    res.status(500).json({ error: "Gagal menyimpan kuis ke database", message: err.message });
  } finally {
    if (connection) connection.release();
  }
});


// Get all quizzes
app.get("/api/quizzes", authenticateToken, async (req, res) => {
  console.log(`Fetching quizzes for user ID: ${req.user.id}, role: ${req.user.role}`);
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let quizzes;
    if (userRole === "teacher") {
      [quizzes] = await pool.query(
        `
        SELECT q.id, q.title, q.retry_limit, 
               (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count
        FROM quizzes q
        WHERE q.teacher_id = ?
        `,
        [userId]
      );
    } else {
      [quizzes] = await pool.query(
        `
        SELECT q.id, q.title, q.retry_limit, 
               (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
               MAX(qr.score) as highest_score,
               (q.retry_limit - COALESCE(
                 (SELECT COUNT(*) FROM quiz_results WHERE quiz_id = q.id AND user_id = ?), 0)
               ) as remaining_retries
        FROM quizzes q
        LEFT JOIN quiz_results qr ON q.id = qr.quiz_id AND qr.user_id = ?
        GROUP BY q.id, q.title, q.retry_limit
        `,
        [userId, userId]
      );
    }

    console.log("Quizzes fetched:", quizzes);
    res.status(200).json({ quizzes });
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ error: "Gagal mengambil daftar kuis", message: err.message });
  }
});

// Get quiz details by ID
app.get("/api/quizzes/:id", authenticateToken, async (req, res) => {
  const quizId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Validasi quiz ID
    if (!quizId || quizId === 'undefined') {
      return res.status(400).json({ error: "ID kuis tidak valid" });
    }

    // Ambil data quiz
    let quizResult;
    if (userRole === "teacher") {
      [quizResult] = await pool.query(
        "SELECT id, title, retry_limit, time_limit FROM quizzes WHERE id = ? AND teacher_id = ?",
        [quizId, userId]
      );
    } else {
      [quizResult] = await pool.query(
        "SELECT id, title, retry_limit, time_limit FROM quizzes WHERE id = ?",
        [quizId]
      );
    }

    if (quizResult.length === 0) {
      return res.status(404).json({ error: "Kuis tidak ditemukan atau Anda tidak memiliki akses" });
    }

    // Hitung sisa percobaan untuk siswa
    let remainingRetries = quizResult[0].retry_limit;
    if (userRole === "student") {
      const [attempts] = await pool.query(
        "SELECT COUNT(*) as attempt_count FROM quiz_results WHERE quiz_id = ? AND user_id = ?",
        [quizId, userId]
      );
      remainingRetries = Math.max(0, quizResult[0].retry_limit - attempts[0].attempt_count);
    }

    // Ambil pertanyaan dan pilihan
    const [questions] = await pool.query(
      "SELECT id, text, correct_index FROM questions WHERE quiz_id = ?",
      [quizId]
    );
    
    const [choices] = await pool.query(
      "SELECT id, question_id, text FROM choices WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)",
      [quizId]
    );

    // Format response
    const quiz = quizResult[0];
    quiz.questions = questions.map((q) => ({
      id: q.id,
      text: q.text,
      correctIndex: q.correct_index,
      choices: choices.filter((c) => c.question_id === q.id).map((c) => c.text),
    }));
    
    quiz.remainingRetries = remainingRetries;
    quiz.time_limit = quiz.time_limit; // Default 10 menit jika null

    res.status(200).json(quiz);
  } catch (err) {
    console.error("Error fetching quiz details:", err);
    res.status(500).json({ error: "Gagal mengambil detail kuis", message: err.message });
  }
});

// Get quiz results for teacher by quiz ID
app.get("/api/quizzes/:id/results", authenticateToken, restrictToTeacher, async (req, res) => {
  const quizId = req.params.id;
  const teacherId = req.user.id;

  try {
    // Cek apakah quiz dimiliki oleh teacher
    const [quizCheck] = await pool.query(
      "SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?",
      [quizId, teacherId]
    );

    if (quizCheck.length === 0) {
      return res.status(404).json({ error: "Kuis tidak ditemukan atau bukan milik Anda." });
    }

    // Ambil hasil quiz + nama user yang sudah mengerjakan
    const [results] = await pool.query(
      `
      SELECT qr.id, u.name as student_name, qr.score, qr.created_at
      FROM quiz_results qr
      JOIN users u ON qr.user_id = u.id
      WHERE qr.quiz_id = ?
      ORDER BY qr.created_at DESC
      `,
      [quizId]
    );

    res.status(200).json({ quizId, results });
  } catch (err) {
    console.error("Error fetching quiz results:", err);
    res.status(500).json({ error: "Gagal mengambil hasil kuis", message: err.message });
  }
});

app.get("/api/students/quiz", authenticateToken, restrictToTeacher, async (req, res) => {
  const [students] = await pool.query(`
    SELECT DISTINCT u.id, u.name
    FROM quiz_results qr
    JOIN users u ON qr.user_id = u.id
    ORDER BY u.name ASC
  `);
  res.json({ students });
});

app.get("/api/students/:id/results", authenticateToken, restrictToTeacher, async (req, res) => {
  const studentId = req.params.id;
  const [results] = await pool.query(`
    SELECT q.title, qr.score, qr.created_at
    FROM quiz_results qr
    JOIN quizzes q ON qr.quiz_id = q.id
    WHERE qr.user_id = ?
    ORDER BY qr.created_at DESC
  `, [studentId]);
  res.json({ results });
});


app.get('/api/courses/public', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM courses ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// [NEW] Get all courses for admin and teacher
app.get("/api/courses/manage", authenticateToken, async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;
  console.log(`Fetching courses for user ID: ${userId}, role: ${userRole}`);

  try {
    let courses;
    if (userRole === 'admin') {
      [courses] = await pool.query(
        `SELECT id, teacher_id, title, date, description, image_url, file_url, students, created_at FROM courses`
      );
    } else if (userRole === 'teacher') {
      [courses] = await pool.query(
        `SELECT id, teacher_id, title, date, description, image_url, file_url, students, created_at FROM courses WHERE teacher_id = ?`,
        [userId]
      );
    } else {
      return res.status(403).json({ message: "Access restricted to admin or teacher" });
    }

    res.status(200).json({ courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});


// Save quiz result
app.post("/api/quiz-results", authenticateToken, async (req, res) => {
  console.log("Received POST /api/quiz-results request");
  const { quizId, score } = req.body;
  const userId = req.user.id;

  // Validasi input
  if (!quizId || score === undefined) {
    console.log("Invalid quiz result data:", { quizId, score });
    return res.status(400).json({ error: "Quiz ID dan skor diperlukan" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verifikasi kuis ada dan ambil retry_limit
    const [quizResult] = await connection.query(
      "SELECT id, retry_limit FROM quizzes WHERE id = ?",
      [quizId]
    );
    if (quizResult.length === 0) {
      console.log("Quiz not found:", quizId);
      throw new Error("Kuis tidak ditemukan");
    }

    // Cek jumlah percobaan user
    const [attempts] = await pool.query(
      "SELECT COUNT(*) as attempt_count FROM quiz_results WHERE quiz_id = ? AND user_id = ?",
      [quizId, userId]
    );
    const remainingRetries = quizResult[0].retry_limit - attempts[0].attempt_count;
    if (remainingRetries <= 0) {
      console.log(`No retries left for user ID: ${userId}, quiz ID: ${quizId}`);
      throw new Error("Anda telah mencapai batas maksimum percobaan untuk kuis ini");
    }

    // Simpan hasil kuis
    await connection.query(
      "INSERT INTO quiz_results (user_id, quiz_id, score, created_at) VALUES (?, ?, ?, NOW())",
      [userId, quizId, score]
    );

    await connection.commit();
    console.log(`Quiz result saved for user ID: ${userId}, quiz ID: ${quizId}, score: ${score}`);
    res.status(201).json({ message: "Hasil kuis berhasil disimpan" });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error saving quiz result:", err);
    res.status(500).json({ error: err.message || "Gagal menyimpan hasil kuis" });
  } finally {
    if (connection) connection.release();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ message: "Unexpected server error", error: err.message });
});

app.listen(PORT, () => {
  console.log("Server time:", new Date());
  console.log(`Server running on http://localhost:${PORT}`);
});