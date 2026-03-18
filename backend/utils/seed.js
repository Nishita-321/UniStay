/**
 * Database Seeder — Run with: node utils/seed.js
 *
 * Creates:
 *   - 1 Admin
 *   - 2 Security guards
 *   - 4 Hostels (2 boys, 2 girls)
 *   - 8 Wardens (2 per hostel, 1 assigned)
 *   - 100 Students (25 per hostel, with rooms)
 *   - 100 Hostel fees (60% paid, 40% pending)
 *   - 30 Gatepasses (mixed statuses)
 *
 * All passwords: "password123"
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../modules/user/user.model.js";
import Student from "../modules/student/student.model.js";
import Warden from "../modules/warden/warden.model.js";
import Hostel from "../modules/hostel/hostel.model.js";
import Fee from "../modules/fee/fee.model.js";
import Gatepass from "../modules/gatepass/gatepass.model.js";

// Helper: create a base User (admin/security) bypassing discriminator check
// We insert directly into the collection to avoid Mongoose discriminator validation,
// but we still hash the password and respect the schema.
const createBaseUser = async (data) => {
  const hashed = await bcrypt.hash(data.password, 12);
  const doc = {
    ...data,
    password: hashed,
    isActive: true,
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await User.collection.insertOne(doc);
  return doc;
};

dotenv.config();

const PASSWORD = "password123";

// ─── Name data ──────────────────────────────────────────────
const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Ananya", "Diya", "Myra", "Sara", "Aanya", "Aadhya", "Isha", "Riya", "Priya", "Neha",
  "Rohan", "Karan", "Rahul", "Vikram", "Amit", "Nikhil", "Pranav", "Dhruv", "Yash", "Manish",
  "Pooja", "Sneha", "Kavya", "Meera", "Tanvi", "Shruti", "Nisha", "Anita", "Divya", "Pallavi",
  "Harish", "Suresh", "Rajesh", "Deepak", "Gaurav", "Akash", "Siddharth", "Varun", "Tarun", "Naveen",
  "Ritika", "Komal", "Sakshi", "Trisha", "Aditi", "Swati", "Bhavna", "Jyoti", "Megha", "Anjali",
  "Mohit", "Rishabh", "Kartik", "Shivam", "Tushar", "Aman", "Chirag", "Kunal", "Pankaj", "Vikas",
  "Simran", "Preeti", "Rashmi", "Sonal", "Kiran", "Nandini", "Deepika", "Archana", "Sunita", "Rekha",
  "Aryan", "Dev", "Sahil", "Abhay", "Harsh", "Vishal", "Ankur", "Ravi", "Ajay", "Manoj",
  "Aparna", "Geeta", "Hema", "Lakshmi", "Madhu", "Padma", "Radha", "Uma", "Veena", "Yamini",
  "Ashok", "Bharat", "Chandra", "Dinesh", "Ganesh", "Hemant", "Jatin", "Lalit", "Mukesh", "Neeraj",
];

const lastNames = [
  "Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Joshi", "Mishra", "Yadav", "Chauhan",
  "Reddy", "Nair", "Iyer", "Menon", "Pillai", "Desai", "Shah", "Mehta", "Chopra", "Malhotra",
  "Bhat", "Kaur", "Das", "Roy", "Sen", "Dutta", "Ghosh", "Banerjee", "Mukherjee", "Sinha",
];

const departments = ["CSE", "ECE", "ME", "CE", "EE", "IT", "BT", "CH"];
const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Pune", "Hyderabad", "Kolkata", "Jaipur"];
const states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Maharashtra", "Telangana", "West Bengal", "Rajasthan"];

const gpReasons = [
  "Going home for the weekend", "Medical appointment in the city", "Family function",
  "Internship interview", "College fest at another university", "Buying supplies",
  "Dental checkup", "Sibling's birthday celebration", "Train reservation to hometown",
  "Project meeting with external guide", "Passport appointment", "Attending a wedding",
  "Library visit at central university", "Part-time job shift", "Visiting parents at hotel",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randPhone = () => String(Math.floor(7000000000 + Math.random() * 2999999999));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // ─── CLEAR EXISTING DATA ──────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Hostel.deleteMany({}),
      Fee.deleteMany({}),
      Gatepass.deleteMany({}),
    ]);
    console.log("Cleared existing data.");

    // ─── 1. ADMIN ─────────────────────────────────────────────
    const admin = await createBaseUser({
      name: "Super Admin",
      email: "admin@unistay.com",
      password: PASSWORD,
      role: "admin",
      phone: "9999999999",
    });
    console.log(`Admin created: admin@unistay.com`);

    // ─── 2. SECURITY GUARDS ──────────────────────────────────
    const sec1 = await createBaseUser({ name: "Rajendra Pal", email: "security1@unistay.com", password: PASSWORD, role: "security", phone: randPhone() });
    const sec2 = await createBaseUser({ name: "Mohan Lal", email: "security2@unistay.com", password: PASSWORD, role: "security", phone: randPhone() });
    const securityUsers = [sec1, sec2];
    console.log(`2 Security guards created.`);

    // ─── 3. HOSTELS ───────────────────────────────────────────
    const hostelData = [
      { name: "Vivekananda Boys Hostel", type: "boys", totalRooms: 50, capacity: 50, address: "Block A, North Campus" },
      { name: "Raman Boys Hostel", type: "boys", totalRooms: 50, capacity: 50, address: "Block B, North Campus" },
      { name: "Sarojini Girls Hostel", type: "girls", totalRooms: 50, capacity: 50, address: "Block C, South Campus" },
      { name: "Kalpana Girls Hostel", type: "girls", totalRooms: 50, capacity: 50, address: "Block D, South Campus" },
    ];

    const hostels = await Hostel.create(hostelData);
    console.log(`4 Hostels created.`);

    // ─── 4. WARDENS (8 total, 2 per hostel) ──────────────────
    const wardenNames = [
      "Dr. Ramesh Chandra", "Prof. Sunil Kapoor",
      "Dr. Anil Mehra", "Prof. Vikash Tiwari",
      "Dr. Sunita Devi", "Prof. Kavita Rao",
      "Dr. Meena Kumari", "Prof. Asha Bhatt",
    ];

    const wardenDocs = [];
    for (let i = 0; i < 8; i++) {
      const hostelIndex = Math.floor(i / 2);
      const warden = await Warden.create({
        name: wardenNames[i],
        email: `warden${i + 1}@unistay.com`,
        password: PASSWORD,
        role: "warden",
        phone: randPhone(),
        employeeId: `EMP${String(1000 + i)}`,
        assignedHostel: hostels[hostelIndex]._id,
      });
      wardenDocs.push(warden);
    }

    // Assign first warden of each pair to the hostel
    for (let i = 0; i < 4; i++) {
      hostels[i].warden = wardenDocs[i * 2]._id;
      await hostels[i].save();
    }
    console.log(`8 Wardens created (2 per hostel, 1 assigned each).`);

    // ─── 5. STUDENTS (100 total, 25 per hostel) ──────────────
    const studentDocs = [];
    let nameIdx = 0;

    for (let h = 0; h < 4; h++) {
      const hostel = hostels[h];
      const isBoys = hostel.type === "boys";

      for (let s = 0; s < 25; s++) {
        const firstName = firstNames[nameIdx % firstNames.length];
        const lastName = pick(lastNames);
        const dept = pick(departments);
        const yr = randInt(1, 4);
        const rollNum = `${dept}${2020 + yr}${String(nameIdx + 1).padStart(3, "0")}`;
        const cityIdx = randInt(0, cities.length - 1);
        const roomFloor = randInt(1, 3);
        const roomNum = `${String.fromCharCode(65 + h)}${roomFloor}${String(s + 1).padStart(2, "0")}`;

        const student = await Student.create({
          name: `${firstName} ${lastName}`,
          email: `student${nameIdx + 1}@unistay.com`,
          password: PASSWORD,
          role: "student",
          phone: randPhone(),
          rollNumber: rollNum,
          hostel: hostel._id,
          roomNumber: roomNum,
          year: yr,
          department: dept,
          parentName: `${pick(firstNames)} ${lastName}`,
          parentPhone: randPhone(),
          parentEmail: `parent.${lastName.toLowerCase()}${nameIdx + 1}@gmail.com`,
          address: {
            street: `${randInt(1, 999)}, Sector ${randInt(1, 50)}`,
            city: cities[cityIdx],
            state: states[cityIdx],
            pincode: String(randInt(100000, 999999)),
          },
          messCardActive: Math.random() > 0.3,
        });

        studentDocs.push(student);
        nameIdx++;
      }

      // Update hostel occupancy
      hostel.occupancy = 25;
      await hostel.save();
    }
    console.log(`100 Students created (25 per hostel).`);

    // ─── 6. HOSTEL FEES (60% paid, 40% pending) ─────────────
    const feeDocs = [];
    for (let i = 0; i < studentDocs.length; i++) {
      const student = studentDocs[i];
      const isPaid = i < 60; // first 60 = paid, last 40 = pending

      const fee = {
        student: student._id,
        type: "hostel",
        description: "Hostel Fee — Spring 2026",
        amount: 45000,
        dueDate: new Date("2026-03-01"),
        semester: "2026-Spring",
        status: isPaid ? "paid" : "pending",
        createdBy: admin._id,
      };

      if (isPaid) {
        fee.paidAt = new Date(2026, 1, randInt(1, 28));
        fee.transactionId = `TXN_SEED_${String(i + 1).padStart(4, "0")}`;
      }

      feeDocs.push(fee);

      // Add a mess fee too
      const messIsPaid = Math.random() < 0.6;
      feeDocs.push({
        student: student._id,
        type: "mess",
        description: "Mess Fee — Spring 2026",
        amount: 18000,
        dueDate: new Date("2026-03-15"),
        semester: "2026-Spring",
        status: messIsPaid ? "paid" : "pending",
        paidAt: messIsPaid ? new Date(2026, 1, randInt(1, 28)) : undefined,
        transactionId: messIsPaid ? `TXN_MESS_${String(i + 1).padStart(4, "0")}` : undefined,
        createdBy: admin._id,
      });

      // Random fine for ~15% of students
      if (Math.random() < 0.15) {
        feeDocs.push({
          student: student._id,
          type: "fine",
          description: pick(["Late night return fine", "Room damage fine", "Mess wastage fine", "Library late fine"]),
          amount: randInt(200, 2000),
          dueDate: new Date("2026-04-01"),
          semester: "2026-Spring",
          status: "pending",
          createdBy: admin._id,
        });
      }
    }

    await Fee.insertMany(feeDocs);
    console.log(`${feeDocs.length} Fee records created (hostel 60:40 paid:pending + mess + fines).`);

    // ─── 7. GATEPASSES (30 mixed) ────────────────────────────
    const gpStatuses = ["pending", "approved", "approved", "rejected", "approved"];
    const gpTypes = ["day", "day", "overnight", "day", "emergency"];
    const gpDocs = [];

    for (let i = 0; i < 30; i++) {
      const student = studentDocs[randInt(0, 99)];
      const status = pick(gpStatuses);
      const fromDate = new Date(2026, 2, randInt(20, 28), randInt(6, 12));
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + randInt(1, 3));

      const gp = {
        student: student._id,
        hostel: student.hostel,
        reason: pick(gpReasons),
        type: pick(gpTypes),
        fromDate,
        toDate,
        status,
      };

      if (status === "approved" || status === "rejected") {
        // Find the warden for this hostel
        const hostelIdx = hostels.findIndex((h) => h._id.equals(student.hostel));
        gp.approvedBy = wardenDocs[hostelIdx * 2]._id;
        gp.approvedAt = new Date(2026, 2, randInt(18, 20));
      }

      if (status === "rejected") {
        gp.rejectionReason = pick(["Exams approaching", "Already too many leaves", "Insufficient notice period"]);
      }

      // Some approved ones have been used (out/in)
      if (status === "approved" && Math.random() < 0.4) {
        gp.outTime = new Date(fromDate.getTime() + randInt(0, 3) * 3600000);
        gp.outMarkedBy = securityUsers[0]._id;

        if (Math.random() < 0.6) {
          gp.inTime = new Date(toDate.getTime() - randInt(0, 6) * 3600000);
          gp.inMarkedBy = securityUsers[1]._id;
        }
      }

      gpDocs.push(gp);
    }

    await Gatepass.insertMany(gpDocs);
    console.log(`30 Gatepasses created (mixed statuses).`);

    // ─── SUMMARY ─────────────────────────────────────────────
    console.log("\n═══════════════════════════════════════════");
    console.log("  SEED COMPLETE — Login credentials:");
    console.log("═══════════════════════════════════════════");
    console.log(`  Admin:     admin@unistay.com`);
    console.log(`  Wardens:   warden1@unistay.com ... warden8@unistay.com`);
    console.log(`  Security:  security1@unistay.com, security2@unistay.com`);
    console.log(`  Students:  student1@unistay.com ... student100@unistay.com`);
    console.log(`  Password:  ${PASSWORD} (all accounts)`);
    console.log("═══════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
