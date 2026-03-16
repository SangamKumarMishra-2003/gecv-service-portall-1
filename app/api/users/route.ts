import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Middleware to verify academics role
async function verifyAcademics(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "academics" && decoded.role !== "hostel-incharge") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

// GET - List all students and faculty
export async function GET(req: Request) {
  const user = await verifyAcademics(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const users = await User.find(
      { role: { $in: ["student", "faculty"] } },
      { password: 0 } // Exclude password
    ).sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch users", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new student or faculty (supports bulk)
export async function POST(req: Request) {
  const user = await verifyAcademics(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Check if it's a bulk request
    if (body.users && Array.isArray(body.users)) {
      // Bulk create
      const { users } = body;
      
      if (users.length === 0) {
        return NextResponse.json(
          { message: "No users to create" },
          { status: 400 }
        );
      }

      await connectToDatabase();

      const createdUsers = [];
      const errors = [];

      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        try {
          const { 
            name, 
            email, 
            password, 
            role, 
            regNo, 
            mobile,
            course,
            branch,
            semester,
            year,
            session,
            fatherName,
            motherName,
            dob,
            admissionDate,
            expectedCompletionYear,
            category
          } = userData;

          if (!name || !email || !password || !role) {
            errors.push({ index: i, message: "Name, email, password, and role are required" });
            continue;
          }

          if (!["student", "faculty"].includes(role)) {
            errors.push({ index: i, message: "Role must be student or faculty" });
            continue;
          }

          if (role === "student" && !regNo) {
            errors.push({ index: i, message: "Registration number is required for students" });
            continue;
          }

          // Name validation
          if (!/^[a-zA-Z\s\.]+$/.test(name) || name.length < 2 || name.length > 50) {
            errors.push({ index: i, message: "Name must be 2-50 characters and contain only letters, spaces, and periods" });
            continue;
          }

          // Email validation
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            errors.push({ index: i, message: "Please enter a valid email address" });
            continue;
          }

          // Password strength validation
          if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
            errors.push({ index: i, message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" });
            continue;
          }

          // Registration number validation for students
          if (role === "student" && regNo && !/^\d{11}$/.test(regNo)) {
            errors.push({ index: i, message: "Registration number must be exactly 11 digits" });
            continue;
          }

          // Mobile validation
          if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
            errors.push({ index: i, message: "Mobile number must start with 6-9 and be 10 digits" });
            continue;
          }

          // Student-specific validations
          if (role === "student") {
            if (!course || !branch || semester === undefined || year === undefined || !session) {
              errors.push({ index: i, message: "Course, branch, semester, year, and session are required for students" });
              continue;
            }

            if (!fatherName || !motherName || !dob || !admissionDate || !expectedCompletionYear || !category) {
              errors.push({ index: i, message: "Father's name, mother's name, date of birth, admission date, expected completion, and category are required for students" });
              continue;
            }

            // Parent names validation
            if (!/^[a-zA-Z\s\.]+$/.test(fatherName) || fatherName.length < 2 || fatherName.length > 50) {
              errors.push({ index: i, message: "Father's name must be 2-50 characters and contain only letters, spaces, and periods" });
              continue;
            }
            if (!/^[a-zA-Z\s\.]+$/.test(motherName) || motherName.length < 2 || motherName.length > 50) {
              errors.push({ index: i, message: "Mother's name must be 2-50 characters and contain only letters, spaces, and periods" });
              continue;
            }

            // Session format validation
            if (!/^\d{4}-\d{4}$/.test(session)) {
              errors.push({ index: i, message: "Session must be in YYYY-YYYY format" });
              continue;
            }

            const sessionStart = parseInt(session.split('-')[0]);
            const sessionEnd = parseInt(session.split('-')[1]);
            if (sessionEnd <= sessionStart) {
              errors.push({ index: i, message: "Session end year must be greater than start year" });
              continue;
            }

            // Expected completion validation
            if (!/^\d{4}$/.test(expectedCompletionYear)) {
              errors.push({ index: i, message: "Expected completion year must be in YYYY format" });
              continue;
            }

            const expectedYear = parseInt(expectedCompletionYear);
            if (expectedYear < sessionStart || expectedYear > sessionEnd + 2) {
              errors.push({ index: i, message: "Expected completion year should be within session range" });
              continue;
            }

            // Semester and year validation
            if (semester < 1 || semester > 8) {
              errors.push({ index: i, message: "Semester must be between 1 and 8" });
              continue;
            }
            if (year < 1 || year > 4) {
              errors.push({ index: i, message: "Year must be between 1 and 4" });
              continue;
            }

            // Date validations
            const today = new Date().toISOString().split('T')[0];
            if (dob > today) {
              errors.push({ index: i, message: "Date of birth cannot be in the future" });
              continue;
            }
            if (admissionDate > today) {
              errors.push({ index: i, message: "Date of admission cannot be in the future" });
              continue;
            }

            const dobDate = new Date(dob);
            const admissionDateObj = new Date(admissionDate);
            const ageAtAdmission = admissionDateObj.getFullYear() - dobDate.getFullYear();
            if (ageAtAdmission < 15 || ageAtAdmission > 30) {
              errors.push({ index: i, message: "Student age at admission should be between 15-30 years" });
              continue;
            }
          }

          // Check if user exists
          const existingUser = await User.findOne({
            $or: [{ email }, ...(regNo ? [{ regNo }] : [])],
          });

          if (existingUser) {
            errors.push({ index: i, message: "User with this email or regNo already exists" });
            continue;
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create user
          const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            regNo: role === "student" ? regNo : undefined,
            mobile,
            course: role === "student" ? course : undefined,
            branch: role === "student" ? branch : undefined,
            semester: role === "student" ? semester : undefined,
            year: role === "student" ? year : undefined,
            session: role === "student" ? session : undefined,
            fatherName: role === "student" ? fatherName : undefined,
            motherName: role === "student" ? motherName : undefined,
            dob: role === "student" ? dob : undefined,
            admissionDate: role === "student" ? admissionDate : undefined,
            expectedCompletionYear: role === "student" ? expectedCompletionYear : undefined,
            category: role === "student" ? category : undefined,
          });

          createdUsers.push({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            regNo: newUser.regNo,
          });
        } catch (error: any) {
          errors.push({ index: i, message: error.message });
        }
      }

      return NextResponse.json(
        {
          message: `Created ${createdUsers.length} users successfully`,
          created: createdUsers,
          errors: errors.length > 0 ? errors : undefined,
        },
        { status: 201 }
      );
    } else {
      // Single create
      const { 
        name, 
        email, 
        password, 
        role, 
        regNo, 
        mobile,
        course,
        branch,
        semester,
        year,
        session,
        fatherName,
        motherName,
        dob,
        admissionDate,
        expectedCompletionYear,
        category
      } = body;

      if (!name || !email || !password || !role) {
        return NextResponse.json(
          { message: "Name, email, password, and role are required" },
          { status: 400 }
        );
      }

    // Name validation
    if (!/^[a-zA-Z\s\.]+$/.test(name) || name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { message: "Name must be 2-50 characters and contain only letters, spaces, and periods" },
        { status: 400 }
      );
    }

    // Email validation
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Password strength validation
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" },
        { status: 400 }
      );
    }

    if (!["student", "faculty"].includes(role)) {
      return NextResponse.json(
        { message: "Role must be student or faculty" },
        { status: 400 }
      );
    }

    if (role === "student" && !regNo) {
      return NextResponse.json(
        { message: "Registration number is required for students" },
        { status: 400 }
      );
    }

    // Registration number validation for students
    if (role === "student" && regNo && !/^\d{11}$/.test(regNo)) {
      return NextResponse.json(
        { message: "Registration number must be exactly 11 digits" },
        { status: 400 }
      );
    }

    // Mobile validation
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { message: "Mobile number must start with 6-9 and be 10 digits" },
        { status: 400 }
      );
    }

    // Student-specific validations
    if (role === "student") {
      if (!course || !branch || semester === undefined || year === undefined || !session) {
        return NextResponse.json(
          { message: "Course, branch, semester, year, and session are required for students" },
          { status: 400 }
        );
      }

      if (!fatherName || !motherName || !dob || !admissionDate || !expectedCompletionYear || !category) {
        return NextResponse.json(
          { message: "Father's name, mother's name, date of birth, admission date, expected completion, and category are required for students" },
          { status: 400 }
        );
      }

      // Parent names validation
      if (!/^[a-zA-Z\s\.]+$/.test(fatherName) || fatherName.length < 2 || fatherName.length > 50) {
        return NextResponse.json(
          { message: "Father's name must be 2-50 characters and contain only letters, spaces, and periods" },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z\s\.]+$/.test(motherName) || motherName.length < 2 || motherName.length > 50) {
        return NextResponse.json(
          { message: "Mother's name must be 2-50 characters and contain only letters, spaces, and periods" },
          { status: 400 }
        );
      }

      // Session format validation
      if (!/^\d{4}-\d{4}$/.test(session)) {
        return NextResponse.json(
          { message: "Session must be in YYYY-YYYY format" },
          { status: 400 }
        );
      }

      const sessionStart = parseInt(session.split('-')[0]);
      const sessionEnd = parseInt(session.split('-')[1]);
      if (sessionEnd <= sessionStart) {
        return NextResponse.json(
          { message: "Session end year must be greater than start year" },
          { status: 400 }
        );
      }

      // Expected completion validation
      if (!/^\d{4}$/.test(expectedCompletionYear)) {
        return NextResponse.json(
          { message: "Expected completion year must be in YYYY format" },
          { status: 400 }
        );
      }

      const expectedYear = parseInt(expectedCompletionYear);
      if (expectedYear < sessionStart || expectedYear > sessionEnd + 2) {
        return NextResponse.json(
          { message: "Expected completion year should be within session range" },
          { status: 400 }
        );
      }

      // Semester and year validation
      if (semester < 1 || semester > 8) {
        return NextResponse.json(
          { message: "Semester must be between 1 and 8" },
          { status: 400 }
        );
      }
      if (year < 1 || year > 4) {
        return NextResponse.json(
          { message: "Year must be between 1 and 4" },
          { status: 400 }
        );
      }

      // Date validations
      const today = new Date().toISOString().split('T')[0];
      if (dob > today) {
        return NextResponse.json(
          { message: "Date of birth cannot be in the future" },
          { status: 400 }
        );
      }
      if (admissionDate > today) {
        return NextResponse.json(
          { message: "Date of admission cannot be in the future" },
          { status: 400 }
        );
      }

      const dobDate = new Date(dob);
      const admissionDateObj = new Date(admissionDate);
      const ageAtAdmission = admissionDateObj.getFullYear() - dobDate.getFullYear();
      if (ageAtAdmission < 15 || ageAtAdmission > 30) {
        return NextResponse.json(
          { message: "Student age at admission should be between 15-30 years" },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, ...(regNo ? [{ regNo }] : [])],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or regNo already exists" },
        { status: 400 }
      );
    }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        regNo: role === "student" ? regNo : undefined,
        mobile,
        course: role === "student" ? course : undefined,
        branch: role === "student" ? branch : undefined,
        semester: role === "student" ? semester : undefined,
        year: role === "student" ? year : undefined,
        session: role === "student" ? session : undefined,
        fatherName: role === "student" ? fatherName : undefined,
        motherName: role === "student" ? motherName : undefined,
        dob: role === "student" ? dob : undefined,
        admissionDate: role === "student" ? admissionDate : undefined,
        expectedCompletionYear: role === "student" ? expectedCompletionYear : undefined,
        category: role === "student" ? category : undefined,
      });

      return NextResponse.json(
        {
          message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            regNo: newUser.regNo,
          },
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { message: "Failed to create user", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(req: Request) {
  const user = await verifyAcademics(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update user details
export async function PATCH(req: Request) {
  const user = await verifyAcademics(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { _id, name, email, mobile, regNo, course, branch, semester, session, year, fatherName, motherName, dob, admissionDate, expectedCompletionYear, category } = await req.json();

    if (!_id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if email or regNo is already taken by another user
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: _id } },
        { $or: [{ email }, ...(regNo ? [{ regNo }] : [])] }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email or Registration Number already in use by another user" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      email,
      mobile,
    };

    // Only update academic fields if provided (and maybe check if role is student, but frontend should handle that visibility)
    if (regNo !== undefined) updateData.regNo = regNo;
    if (course !== undefined) updateData.course = course;
    if (branch !== undefined) updateData.branch = branch;
    if (semester !== undefined) updateData.semester = semester;
    if (session !== undefined) updateData.session = session;
    if (year !== undefined) updateData.year = year;
    if (fatherName !== undefined) updateData.fatherName = fatherName;
    if (motherName !== undefined) updateData.motherName = motherName;
    if (dob !== undefined) updateData.dob = dob;
    if (admissionDate !== undefined) updateData.admissionDate = admissionDate;
    if (expectedCompletionYear !== undefined) updateData.expectedCompletionYear = expectedCompletionYear;
    if (category !== undefined) updateData.category = category;

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 }
    );
  }
}
