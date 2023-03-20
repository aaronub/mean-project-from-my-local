const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Profile = require("../models/Profile");
const House = require("../models/House");
const Report = require("../models/Report");
const Invitation = require("../models/Invitation");
const { s3Old } = require("../middleware/aws");
const BUCKET = process.env.BUCKET;

exports.user_register = async (req, res) => {
  const header = req.headers["authorization"];
  let token;

  if (!header) {
    res.status(400).json({ message: "register token required" });
    return;
  }
  token = header.split(" ")[1];
  console.log("register token: ", token);
  try {
    const invitation = await Invitation.updateOne(
      { token: token },
      { status: "Accept" }
    );
    const { username, password, email } = req.body;
    const userExist = await User.findOne({
      username: username,
      email: email,
    });

    if (userExist) {
      res.status(409).json({ message: "user already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.HASH_SALT)
    );

    const user = await User.create({
      username: username,
      password: hashedPassword,
      email: email,
      role: "employee",
      status: "Not Started",
    });

    res.status(201).json({ message: "successfully register" });
  } catch (e) {
    console.log("failed to register: ", e);
    res.status(500).json({ message: "fail to register" });
    return;
  }
};

exports.sent_register_invitation = async (req, res) => {
  const myemail = "aaronguan200@gmail.com";
  const mypassword = "dkdyvoawruuewbqb";
  try {
    const { name, email } = req.body;
    const payload = {
      name: name,
      email: email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: myemail,
        pass: mypassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mail_configs = {
      from: myemail,
      to: email,
      subject: `Register Invitation`,
      text: `Hello ${name}, here is your register token!`,
      // html: `<p>Hello ${name}, here is your register token!</p><br/><b>${token}</b>`
      html: `<a href='http://localhost:4200/register?token=${token}'>Click to register!</a>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log("inside transporter.sendMail");
        console.log(error);
        return reject({ message: "An error has occured" });
      }
      return resolve({ message: "Email sent successfully!" });
    });
    const invitation = await Invitation.create({
      name: name,
      email: email,
      token: token,
      status: "Pending",
    });
    console.log("Invitation details: ", invitation);
    res.status(200).json({ message: "Invitation sent" });
  } catch (e) {
    console.log("fail to send invitation: ", e);
    res.status(500).send({ error: "Fail to send invitation" });
  }
};

exports.user_login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({
      username: username,
      email: email,
    }).populate("profile");
    if (!user) {
      res
        .status(401)
        .json({ message: "user not exists, check username and password" });
      return;
    } else {
      if (username !== user.username) {
        res.status(401).json({ message: "wrong username" });
        return;
      } else if (email !== user.email) {
        res.status(401).json({ message: "wrong email" });
        return;
      } else if (!(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: "wrong password" });
        return;
      }
      const payload = {
        username: user.username,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "3h",
      });
      res.status(200).json({ jwt: token, user: user });
    }
  } catch (e) {
    console.log("fail to login: ", e);
  }
};
//onboarind upload
async function updateProfile(username, profileData) {
  try {
    console.log(username);
    const user = await User.findOne({ username: username });
    if (user.profile) {
      Profile.findById(user.profile, (err, profile) => {
        if (err) {
          console.log(err);
        } else {
          console.log("id", user.profile);
          console.log("Original profile:", profile);
          if (profile) {
            // update the profile fields
            if (profileData.step) profile.step = profileData.step;
            profile.firstName = profileData.firstName;
            profile.lastName = profileData.lastName;
            profile.middleName = profileData.middleName;
            profile.preferredName = profileData.preferredName;
            if (profileData.pic) profile.pic = profileData.pic;
            if (profileData.address) profile.address = profileData.address;
            if (profileData.cellPhoneNumber)
              profile.cellPhoneNumber = profileData.cellPhoneNumber;
            if (profileData.workPhoneNumber)
              profile.workPhoneNumber = profileData.workPhoneNumber;
            if (profileData.car) profile.car = profileData.car;
            if (profileData.SSN) profile.SSN = profileData.SSN;
            profile.dateOfBirth = profileData.dateOfBirth;
            profile.gender = profileData.gender;
            profile.reference = profileData.reference;
            if (profileData.emergencyContacts)
              profile.emergencyContacts = profileData.emergencyContacts;
            if (profileData.optReceipt)
              profile.optReceipt = profileData.optReceipt;
            if (profileData.driverLicense)
              profile.driverLicense = profileData.driverLicense;
            if (profileData.title)
                  profile.title=profileData.title
            if (profileData.startDate)
      profile.startDate=profileData.startDate
            if (profileData.endDate)
      profile.endDate=profileData.endDate
            // save the updated profile to MongoDB
            profile.save((err, updatedProfile) => {
              if (err) {
                console.log("err", err);
              } else {
                console.log("Updated profile:", updatedProfile);
              }
            });
          } else {
            var profile = new Profile();
            profile.step = profileData.step;
            profile.firstName = profileData.firstName;
            profile.lastName = profileData.lastName;
            profile.middleName = profileData.middleName;
            profile.preferredName = profileData.preferredName;
            profile.pic = profileData.pic;
            profile.address = profileData.address;
            profile.cellPhoneNumber = profileData.cellPhoneNumber;
            profile.workPhoneNumber = profileData.workPhoneNumber;
            profile.car = profileData.car;
            profile.SSN = profileData.SSN;
            profile.dateOfBirth = profileData.dateOfBirth;
            profile.gender = profileData.gender;
            profile.reference = profileData.reference;
            profile.emergencyContacts = profileData.emergencyContacts;
            profile.optReceipt = profileData.optReceipt;
            profile.driverLicense = profileData.driverLicense;
                  profile.title=profileData.title
      profile.startDate=profileData.startDate
      profile.endDate=profileData.endDate
            profile.save();
            User.updateOne({ username: username }, { profile: profile._id });
          }
        }
      });
    } else {
      user.status = "Pending";
      await user.save();
      var profile = new Profile();
      profile.step = profileData.step;
      profile.nextStep = profileData.nextStep;
      profile.firstName = profileData.firstName;
      profile.lastName = profileData.lastName;
      profile.middleName = profileData.middleName;
      profile.preferredName = profileData.preferredName;
      profile.pic = profileData.pic;
      profile.address = profileData.address;
      profile.cellPhoneNumber = profileData.cellPhoneNumber;
      profile.workPhoneNumber = profileData.workPhoneNumber;
      profile.car = profileData.car;
      profile.SSN = profileData.SSN;
      profile.dateOfBirth = profileData.dateOfBirth;
      profile.gender = profileData.gender;
      profile.reference = profileData.reference;
      profile.emergencyContacts = profileData.emergencyContacts;
      profile.optReceipt = profileData.optReceipt;
      profile.driverLicense = profileData.driverLicense;
            profile.title=profileData.title
      profile.startDate=profileData.startDate
      profile.endDate=profileData.endDate
      await profile.save();
      await User.updateOne({ username: username }, { profile: profile._id });
    }

    return profile;
  } catch (err) {
    console.error("errrr", err);
    throw err;
  }
}
exports.profile_upload = async (req, res) => {
  try {
    const payload = req.payload;
    const { profileData } = req.body;
    const username = payload.username;
    console.log("payload" + payload);
    console.log("username" + username);
    await updateProfile(username, profileData);
    res.status(201).json({ message: "successfully update profile" });
  } catch (e) {
    console.log("failed to update profile: ", e);
  }
};
exports.emergencyContacts_upload = async (req, res) => {
  try {
    const payload = req.payload;
    const { profileData } = req.body;
    const username = payload.username;
    const employee = await User.findOne({ username: username });
    // const profile = await Profile.findById(employee.profile);
    await Profile.findByIdAndUpdate(employee.profile, profileData);
    res.status(201).json({ message: "successfully update emergencyContacts" });
  } catch (e) {
    console.log("failed to update emergencyContacts: ", e);
  }
};
//make nextStep+1, update optEAD, i983, i20 file name if any
exports.employee_updateVisa = async (req, res) => {
  try {
    const { username, optEAD, i983, i20 } = req.body;
    const employee = await User.findOne({ username: username });
    const profile = await Profile.findById(employee.profile);
    const updatedStep = profile.nextStep + 1;
    let updatedProfile = await Profile.findByIdAndUpdate(
      employee.profile,
      { nextStep: updatedStep },
      { new: true }
    );
    if (optEAD) {
      updatedProfile = await Profile.findByIdAndUpdate(
        employee.profile,
        { optEAD: optEAD },
        { new: true }
      );
    }
    if (i983) {
      updatedProfile = await Profile.findByIdAndUpdate(
        employee.profile,
        { i983: i983 },
        { new: true }
      );
    }
    if (i20) {
      updatedProfile = await Profile.findByIdAndUpdate(
        employee.profile,
        { i20: i20 },
        { new: true }
      );
    }
    res.status(200).json({ profile: updatedProfile });
  } catch (e) {
    console.log("failed to update profile: ", e);
  }
};

// Housing
// Employee get house details
exports.get_house = async (req, res) => {
  try {
    const { email, role } = req.payload;
    if (role === "HR")
      return res.status(403).json({ message: "Not authorized" });
    const employee = await User.findOne({ email: email });
    const profile = await Profile.findById(employee.profile);
    const house = await House.findById(profile.house)
      .populate({
        path: "residents",
        populate: {
          path: "profile",
          select: ["firstName", "lastName", "cellPhoneNumber"],
        },
      })
      .populate("reports");
    if (!house)
      return res
        .status(200)
        .json({ message: "House hasn't been assigned by HR" });
    const houseInfo = {
      address: house.address,
      roommates: house.residents.filter(async (user) => user.email !== email),
      reports: house.reports.filter((report) =>
        report.createdBy.equals(employee.id)
      ),
    };
    console.log(houseInfo)
    res.status(200).json({ house: houseInfo });
  } catch (err) {
    console.log(err);
  }
};

// Employee post new facility report
exports.post_report = async (req, res) => {
  try {
    const { email, role } = req.payload;
    if (role === "HR")
      return res.status(403).json({ message: "Not authorized" });
    const { title, description } = req.body;
    const employee = await User.findOne({ email: email });
    const profile = await Profile.findById(employee.profile);
    const report = {
      title,
      description,
      date: Date.now(),
      status: "Open",
      createdBy: employee.id,
      username: employee.username,
    };
    const createdReport = await Report.create(report);
    const house = await House.findById(profile.house);
    await House.findByIdAndUpdate(
      house,
      { reports: [...house.reports, createdReport] },
      { new: true }
    );
    res.status(200).json({ report: createdReport });
  } catch (err) {
    console.log(err);
  }
};

// Employee view existing reports
exports.get_reports = async (req, res) => {
  try {
    const { email, role } = req.payload;
    if (role === "HR")
      return res.status(403).json({ message: "Not authorized" });
    const employee = await User.findOne({ email: email });
    const profile = await Profile.findById(employee.profile);
    const house = await House.findById(profile.house)
      .populate("residents")
      .populate("reports");
    // console.log(house);
    const reports = house.reports.filter((report) =>
      report.createdBy.equals(employee.id)
    );
    res.status(200).json({ reports });
  } catch (err) {
    console.log(err);
  }
};

// Employee get certain report's details
exports.get_report = async (req, res) => {
  try {
    const { email, role } = req.payload;
    if (role === "HR")
      return res.status(403).json({ message: "Not authorized" });
    const { id } = req.params;
    const employee = await User.findOne({ email: email });
    const report = await Report.findById(id);
    if (!report.createdBy.equals(employee.id))
      return res.status(403).json({ message: "Not authorized" });
    res.status(200).json({ report });
  } catch (err) {
    console.log(err);
  }
};

// Employee or HR add/update comments of facility report, HR close a facility report
exports.put_report = async (req, res) => {
  try {
    const { email, role } = req.payload;
    const user = await User.findOne({ email: email });
    const profile = await Profile.findById(user.profile);
    const { reportId, commentId, description, status } = req.body;
    if (!reportId) res.status(400).json({ message: "Report ID is required" });
    const report = await Report.findById(reportId);
    let updatedReport = report;
    if (role === "HR" && status) {
      // HR close a facility report
      updatedReport = await Report.findByIdAndUpdate(
        report,
        { status: status },
        { new: true }
      );
    } else if (commentId) {
      // update comment
      const updatedComment = {
        description,
        createdBy: user.username,
        timestamp: Date.now(),
      };
      const updatedComments = report.comments.map((comment) =>
        comment.id === commentId ? updatedComment : comment
      );
      updatedComments.sort((a, b) => a.timestamp - b.timestamp);
      updatedReport = await Report.findByIdAndUpdate(
        report,
        { comments: updatedComments },
        { new: true }
      );
    } else {
      // add comment
      const comment = {
        description,
        createdBy: user.username,
        timestamp: Date.now(),
      };
      updatedReport = await Report.findByIdAndUpdate(
        report,
        { comments: [...report.comments, comment] },
        { new: true }
      );
      if (role === "HR" && report.status === "Open") {
        updatedReport = await Report.findByIdAndUpdate(
          report,
          { status: "InProgress" },
          { new: true }
        );
      }
    }
    res.status(200).json({ report: updatedReport });
  } catch (err) {
    console.log(err);
  }
};

// HR view all houses
exports.get_houses = async (req, res) => {
  try {
    const { role } = req.payload;
    if (role === "employee")
      return res.status(403).json({ message: "Not authorized" });
    const houses = await House.find()
      .populate({
        path: "residents",
        populate: {
          path: "profile",
          select: ["firstName", "lastName", "cellPhoneNumber", "car"],
        },
      })
      .populate("reports");
    res.status(200).json({ houses });
  } catch (err) {
    console.log(err);
  }
};

// HR view certain house details
exports.get_house_by_id = async (req, res) => {
  try {
    const { role } = req.payload;
    if (role === "employee")
      return res.status(403).json({ message: "Not authorized" });
    const { id } = req.params;
    const house = await House.findById(id)
      .populate("residents")
      .populate("reports");
    return res.status(200).json({ house });
  } catch (err) {
    console.log(err);
  }
};

// HR add new house
exports.post_house = async (req, res) => {
  try {
    const { role } = req.payload;
    if (role === "employee")
      return res.status(403).json({ message: "Not authorized" });
    const { address, landlord, facilityInfo } = req.body;
    const house = { address, landlord, facilityInfo };
    const createdHouse = await House.create(house);
    res.status(200).json({ house: createdHouse });
  } catch (err) {
    console.log(err);
  }
};

// HR edit house info
exports.put_house = async (req, res) => {
  try {
    const { role } = req.payload;
    if (role === "employee")
      return res.status(403).json({ message: "Not authorized" });
    const { id, address, landlord, facilityInfo, resident } = req.body;
    if (!id) res.status(400).json({ message: "House ID is required" });
    const house = await House.findById(id);
    const update = {};
    address && (update.address = address);
    landlord && (update.landlord = landlord);
    facilityInfo && (update.facilityInfo = facilityInfo);
    if (resident) {
      const employee = await User.findById(resident);
      const profile = await Profile.findById(employee.profile);
      if (profile.house)
        return res
          .status(409)
          .json({ message: "Employee already been assigned a house" });
      update.residents = [...house.residents, employee.id];
    }
    const updatedHouse = await House.findByIdAndUpdate(house, update, {
      new: true,
    })
      .populate("residents")
      .populate("reports");
    res.status(200).json({ house: updatedHouse });
  } catch (err) {
    console.log(err);
  }
};

// HR delete house
exports.delete_house = async (req, res) => {
  try {
    const { role } = req.payload;
    if (role === "employee")
      return res.status(403).json({ message: "Not authorized" });
    const { id } = req.params;
    const house = await House.findById(id).populate("residents");
    // console.log(house)
    house.residents.forEach(async (resident) => {
      const employee = await User.findById(resident);
      await Profile.findByIdAndUpdate(
        employee.profile,
        { $unset: { house: 1 } },
        { new: true }
      );
    });
    await Report.deleteMany({ id: { $in: house.reports } });
    const deletedHouse = await House.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Successfully delete house", house: deletedHouse });
  } catch (err) {
    console.log(err);
  }
};

//AWS s3, unload a file
exports.user_upload = async function (req, res) {
  console.log("req.file.key =", req.file.key);
  console.log("req.file.location =", req.file.location);
  // res.send([req.file.location])
  res.send([req.file.key]);
};

//AWS s3, download a file
exports.download_file = async (req, res) => {
  const filename = req.params.filename;
  let x = await s3Old.getObject({ Bucket: BUCKET, Key: filename }).promise();
  res.send(x.Body);
};

//AWS s3, list all files
exports.get_fileList = async (req, res) => {
  let r = await s3Old.listObjectsV2({ Bucket: BUCKET }).promise();
  let x = r.Contents.map((item) => item.Key);
  res.send(x);
};


exports.get_updated_employee_info = async (req, res) => {
  const header = req.headers["authorization"];
  let token;

  if (!header) {
    res.status(400).json({ message: "token required" });
    return;
  }
  token = header.split(" ")[1];
  console.log("register token: ", token);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('payload: ', payload)
    const user = await User.findOne({
      username: payload.username,
      email: payload.email
    }).populate('profile')
    res.status(200).json({ user : user})
    
  } catch (e) {
    throw new Error('fail fetch updated info')
  }
}
