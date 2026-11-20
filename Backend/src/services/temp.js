// 1. Expanded Resume with Projects and Education
const resume = `
Ankur Sharma
Bhopal, India
ankur.sharma@email.com
+91 9876543210
LinkedIn: linkedin.com/in/ankursharma
GitHub: github.com/ankursharma

PROFESSIONAL SUMMARY
MERN Stack Developer with 3+ years of experience building scalable web applications and robust backend architectures.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript
Frontend: React.js, Redux Toolkit, Tailwind CSS
Backend: Node.js, Express.js
Database: MongoDB, Mongoose
DevOps & Tools: Git, Docker (basic), Postman, Linux
Concepts: REST APIs, JWT Authentication, MVC Architect

WORK EXPERIENCE
Backend Developer
TechNova Solutions | Jan 2023 - Present
- Designed and maintained 15+ secure RESTful APIs using Node.js and Express.js.
- Optimized MongoDB queries, reducing API response times by 20%.

PROJECTS
1. E-Commerce Platform (Full-Stack)
- Built a complete MERN stack application with JWT authentication and state management via Redux Toolkit.
- Integrated Stripe payment gateway and implemented a custom product filtering system.

2. Task Management API (Backend)
- Developed a TypeScript-based role-based access control (RBAC) task manager API.
- Containerized the application using Docker for streamlined local deployment.

EDUCATION
Bachelor of Technology (B.Tech) in Computer Science
Rajiv Gandhi Proudyogiki Vishwavidyalaya, Bhopal
Graduated: 2022
`;

// 2. Self-Description
const selfDescription = `
I am a passionate Backend and Full-Stack Developer specializing in the MERN ecosystem. 
Over the past 3 years, I have focused on building scalable RESTful APIs, securing applications 
with JWT, and managing databases with MongoDB. I enjoy solving complex architecture problems 
using the MVC pattern and have basic experience containerizing apps with Docker. I am looking 
for a challenging role where I can optimize backend performance and collaborate on modern web apps.
`;

// 3. Updated Job Description with clear Required and Preferred sections
const jobDescription = `
Position: Senior Node.js / Backend Developer
Location: Remote / Hybrid

ROLE OVERVIEW
We are looking for a backend-heavy engineer to join our team to build next-generation web platforms. You will be responsible for managing data exchange between servers and users, and integrating frontend elements.

REQUIRED SKILLS
- 3+ years of professional backend engineering experience.
- Strong proficiency in JavaScript (ES6+) and TypeScript.
- Deep understanding of Node.js and frameworks like Express.js.
- Hands-on experience with NoSQL databases (specifically MongoDB and Mongoose ODM).
- Solid grasp of RESTful API design, JWT authentication, and MVC architecture.
- Proficient understanding of code versioning tools, such as Git.

PREFERRED SKILLS
- Experience with frontend frameworks like React.js and state management (Redux).
- Basic understanding of containerization tools like Docker.
- Familiarity with Linux server environments and CLI tools.
- Understanding of performance optimization and database indexing.
`;

module.exports = {
    jobDescription, selfDescription, resume
}
