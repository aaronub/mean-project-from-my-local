const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const Profile = require("../models/Profile");
const House = require("../models/House");
const nodemailer = require("nodemailer");


const nextStep = {
  0: "submit onboarding application",
  1: "wait for HR approval",
  2: "submit OPT EAD",
  3: "wait for HR approval",
  4: "submit I-983",
  5: "wait for HR approval",
  6: "submit I-20",
  7: "wait for HR approval",
};

exports.rejectApplication = async (req, res) => {
  try {
    const { id, feedback } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true }
    );
    await Profile.findByIdAndUpdate(
      user.profile,
      { feedback: feedback },
      { new: true }
    );
    return res.status(200).json({ message: "Reject successfully" });
  } catch (e) {
    console.log(e);
  }
};
exports.approveApplication = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findByIdAndUpdate(id, { status: "Approved" });
    // assign house to user
    const house = await House.findOne({ "residents.3": { $exists: false } });
    await House.findByIdAndUpdate(
      house,
      { residents: [...house.residents, user._id] },
      { new: true }
    );
    await Profile.findByIdAndUpdate(
      user.profile,
      { house: house._id },
      { new: true }
    );
    return res.status(200).json({ message: "Approve successfully" });
  } catch (e) {
    console.log(e);
  }
};
exports.getPendingApplication = async (req, res) => {
  try {
    const profiles = await User.find({ status: "Pending" }).populate("profile");
    return res.status(201).json({ data: profiles });
  } catch (e) {
    console.log(e);
  }
};
exports.getApprovedApplication = async (req, res) => {
  try {
    const profiles = await User.find({ status: "Approved" }).populate(
      "profile"
    );
    return res.status(201).json({ data: profiles });
  } catch (e) {
    console.log(e);
  }
};
exports.getRejectedApplication = async (req, res) => {
  try {
    const profiles = await User.find({ status: "Rejected" }).populate(
      "profile"
    );
    return res.status(201).json({ data: profiles });
  } catch (e) {
    console.log(e);
  }
};
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find();
    return res.status(201).json({ data: profiles });
  } catch (e) {
    console.log(e);
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id).populate("profile");
    return res.status(200).json({ data: employee });
  } catch (e) {
    console.log(e);
  }
};

exports.getInProgressVisa = async (req, res) => {
  try {
    const profiles = await Profile.find({ step: 2 });
    return res.status(201).json({ data: profiles });
  } catch (e) {
    console.log(e);
  }
};

exports.getVisas = async (req, res) => {
  try {
    const profiles = await Profile.find({
      $or: [{ step: 2 }, { step: 3 }],
    });
    return res.status(201).json({ data: profiles });
  } catch (e) {
    console.log(e);
  }
};
exports.reject = async (req, res) => {
  try {
    const { pid, nextstep, feedback } = req.body;
    console.log(pid);
    console.log(nextstep);
    console.log(feedback);
    await Profile.findByIdAndUpdate(
      { _id: pid },
      { nextStep: nextstep,documentFeedback: feedback},
    );
    // profile.nextStep = profile.nextStep - 1;
    // if (req.params.feedback) profile.feedback = req.params.feedback;
    // await profile.save();
    return res.status(201).json({ message: "reject successfully" });
  } catch (e) {
    console.log(e);
  }
};
exports.approve = async (req, res) => {
  try {
    const { pid, nextStep } = req.body;
    console.log(pid);
    if (pid) {
      await Profile.findByIdAndUpdate({ _id: pid }, { nextStep: nextStep});
      // profile.nextStep = profile.nextStep + 1;
      // await profile.save();
      return res.status(201).json({ message: "approve successfully" });
    }
    return res.status(201).json({ message: "approve error" });
  } catch (e) {
    console.log(e);
  }
};

exports.searchProfiles = async (req, res) => {
  try {
    const name = req.query.name;
    const type = req.query.type;
    if (type) {
      if (
        type !== "firstName" &&
        type !== "lastName" &&
        type !== "preferredName"
      )
        return res.status(401).json({ message: "invalid type" });
      let query;
      if (name) query = { [type]: name };
      else query = {};
      console.log(query);

      const profiles = await Profile.find(query);
      return res.status(201).json({ data: profiles });
    } else return res.status(401).json({ message: "invalid page" });
  } catch (e) {
    console.log(e);
  }
};
exports.e = async (req, res) => {
  try {
    const email = req.params.email;
    const next = nextStep[req.params.nextStep];
    const profiles = await Profile.find({
      $or: [{ step: 0 }, { step: 2 }, { step: 3 }],
    });
    return res.status(201).json({ messgae: "send notification successfully" });
  } catch (e) {
    console.log(e);
  }
};

exports.sendNotification = async (req, res) => {
  const myemail = "aaronguan200@gmail.com";
  const mypassword = "dkdyvoawruuewbqb";
  try {
    const { name, email,nextstep} = req.body;
    const next = nextStep[nextstep];
    console.log("name" + name);
    console.log("email" + email);
    console.log("nextstep" + nextstep);
    if (name && email) {
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
        subject: `Next Step`,
        text: `Hello ${name}, your last upload document was approved!`,
        html: `<p>Hello ${name}, here is your next step!</p><br/><b>${next}</b>`,
      };
      transporter.sendMail(mail_configs, function (error, info) {
        if (error) {
          console.log("inside transporter.sendMail");
          console.log(error);
          return reject({ message: "An error has occured" });
        }
        return resolve({ message: "notification sent successfully!" });
      });
      res.status(200).json({ message: "ok" });
    }
  } catch (e) {
    console.log("fail to send notification: ", e);
    res.status(500).send({ error: "Fail to send notification" });
  }
};

exports.getAllInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find();
    res.status(200).json({ invitations: invitations });
  } catch (e) {
    console.log("fail to get all invitations, ", e);
  }
};
