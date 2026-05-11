const { validationResult } = require('express-validator');
const usermodel = require("../models/user.model");
const otpmodel = require("../models/user.otp.model")
const lessonmodel = require('../models/lesson.model')
const tutorialmodel = require('../models/tutorial.model')
const roadmapmodel = require('../models/roadmap.model')
const quizmodel = require('../models/quiz.model')
const { hashPassword, comparePassword } = require("../services/hashPassword")
const { createuser } = require("../services/user.create")
const { generateToken } = require("../services/JwtToken")
const { Resend } = require("resend");



module.exports.register = async function (req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Input error", errors: errors.array(), success: false });
    }

    try {
        const { name, email, password, userCategory } = req.body;

        const userbyemail = await usermodel.findOne({ email });

        if (userbyemail) {
            return res.status(409).json({ message: "You already have an account, please login", success: false });
        }

        const hashedPW = await hashPassword(password);

        const user = await createuser(name, email, hashedPW, userCategory)

        const token = generateToken(user)

        const resend = new Resend(process.env.RESEND_API_KEY);


        const { error } = await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: [user.email],
            subject: "Welcome to SkillHub - Account Created Successfully",

            html: `
    <div
      style="
        font-family: Arial, sans-serif;
        background:#f4f7fb;
        padding:40px 20px;
      "
    >
      <div
        style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          border-radius:12px;
          padding:40px;
          border:1px solid #e5e7eb;
        "
      >

        <div style="text-align:center;">
          <h1 style="margin:0; color:#111827;">
            Welcome to SkillHub 
          </h1>

          <p style="color:#6b7280; margin-top:8px;">
            Your account has been created successfully
          </p>
        </div>

        <div style="margin-top:35px;">

          <h2
            style="
              color:#111827;
              margin-bottom:10px;
            "
          >
            Hello, ${user.name || "User"}
          </h2>

          <p
            style="
              font-size:15px;
              line-height:1.7;
              color:#374151;
            "
          >
            Welcome to <strong>SkillHub</strong>!
            We're excited to have you onboard.
          </p>

          <p
            style="
              font-size:15px;
              line-height:1.7;
              color:#374151;
              margin-top:15px;
            "
          >
            Your account is now ready and you can start exploring
            all the features available on SkillHub.
          </p>

          <div
            style="
              margin-top:25px;
              padding:16px;
              background:#f9fafb;
              border-radius:8px;
              border:1px solid #e5e7eb;
            "
          >
            <p
              style="
                margin:0;
                font-size:14px;
                color:#4b5563;
                line-height:1.7;
              "
            >
              Thank you for joining SkillHub.
              We hope you have a great experience with our platform 
            </p>
          </div>

        </div>

        <hr
          style="
            border:none;
            border-top:1px solid #e5e7eb;
            margin:35px 0;
          "
        />

        <p
          style="
            font-size:12px;
            color:#9ca3af;
            text-align:center;
            line-height:1.6;
          "
        >
          © ${new Date().getFullYear()} SkillHub.
          All rights reserved.
        </p>

      </div>
    </div>
  `,
        });

        if (error) {
            console.error("Email sending error:", error);
            return res.status(500).json({ success: false, message: "Failed to send welcome email" });
        }

        res.cookie("userAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000 * 24,
        });

        return res.status(201).json({
            success: true,
            message: "Account created",
            user: user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports.login = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Input error", errors: errors.array(), success: false });
    }

    try {
        const { email, password } = req.body;

        const user = await usermodel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: "invaled email or password", success: false });
        }

        const isPasswordCorrect = await comparePassword(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "invaled email or password", success: false });
        }

        const responseuser = await usermodel.findOne({ email });

        const token = generateToken(responseuser)



        res.cookie("userAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000 * 24,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: responseuser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports.logout = async function (req, res, next) {
    try {
        res.clearCookie("userAuthToken", {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        return res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

};

module.exports.forgot_password = async function (req, res, next) {

    try {
        const { email } = req.body;

        const user = await usermodel.findOne({ email: email })

        if (!user) {
            return res.status(404).json({ message: "user not found", success: false });
        }

        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

        await otpmodel.deleteMany({ email: user.email });

        const otpid = await otpmodel.create({ email: user.email, otp });

        const useremail = user.email;
        const name = user.name;
        const userotp = otpid.otp;


        const resend = new Resend(process.env.RESEND_API_KEY);

        const { error } = await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: [useremail],
            subject: "SkillHub - Password Reset OTP",

            html: `
    <div
      style="
        font-family: Arial, sans-serif;
        background:#f4f7fb;
        padding:40px 20px;
      "
    >
      <div
        style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          border-radius:12px;
          padding:40px;
          border:1px solid #e5e7eb;
        "
      >

        <div style="text-align:center;">
          <h1 style="margin:0; color:#111827;">
            SkillHub
          </h1>

          <p style="color:#6b7280; margin-top:8px;">
            Password Reset Request
          </p>
        </div>

        <div style="margin-top:35px;">

          <h2
            style="
              color:#111827;
              margin-bottom:10px;
            "
          >
            Reset Your Password
          </h2>

          <p
            style="
              font-size:15px;
              line-height:1.7;
              color:#374151;
            "
          >
             hii, ${name}! We received a request to reset your SkillHub account password.
            Use the OTP below to continue:
          </p>

          <div
            style="
              margin:30px 0;
              text-align:center;
            "
          >
            <div
              style="
                display:inline-block;
                background:#111827;
                color:#ffffff;
                padding:16px 32px;
                font-size:32px;
                letter-spacing:8px;
                font-weight:bold;
                border-radius:10px;
              "
            >
              ${userotp}
            </div>
          </div>

          <p
            style="
              font-size:14px;
              color:#6b7280;
              line-height:1.6;
            "
          >
            This OTP will expire in
            <strong>10 minutes</strong>.
          </p>

          <p
            style="
              font-size:14px;
              color:#6b7280;
              line-height:1.6;
            "
          >
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

        </div>

        <hr
          style="
            border:none;
            border-top:1px solid #e5e7eb;
            margin:35px 0;
          "
        />

        <p
          style="
            font-size:12px;
            color:#9ca3af;
            text-align:center;
            line-height:1.6;
          "
        >
          © ${new Date().getFullYear()} SkillHub.
          All rights reserved.
        </p>

      </div>
    </div>
  `,
        });

        if (error) {
            console.error("Email sending error:", error);
            return res.status(500).json({ success: false, message: "Failed to send OTP email" });
        }

        const token = generateToken(user)

        res.cookie("otpAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 300000 * 2
        });

        return res.status(200).json({ message: "OTP send successfully", user: user, success: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });

    }

}

module.exports.otp_verify = async function (req, res, next) {

    try {

        const { userotp } = req.body;
        const userid = req.userid;
        const user = await usermodel.findById(userid);
        if (!user) {
            return res.status(404).json({ message: "user not found", success: false });
        }

        const userofotp = await otpmodel.findOne({ email: user.email })
        const userdbotp = userofotp.otp;

        if (parseInt(userotp) !== parseInt(userdbotp)) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        await otpmodel.deleteOne({ _id: userofotp._id });

        const token = generateToken(user);

        res.cookie("changePassAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 300000 * 2
        });

        res.clearCookie("otpAuthToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"

        });



        return res.status(200).json({ message: "valed OTP", success: true });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });

    }

}

module.exports.change_password = async function (req, res, next) {

    try {

        const { newpassword } = req.body;

        const userid = req.userid;
        const user = await usermodel.findById(userid);
        if (!user) {
            return res.status(404).json({ message: "user not found", success: false });
        }

        const hashedPassword = await hashPassword(newpassword);

        await usermodel.findByIdAndUpdate(userid, { password: hashedPassword }, { new: true });

        res.clearCookie("changePassAuthToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        return res.status(200).json({ message: "Password updated successfully", success: true })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}

module.exports.profile = async function (req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user data" });
        }

        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports.home = async function (req, res, next) {
    try {

        const user = await usermodel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "user not found" })
        }

        const suggestedlesson = await lessonmodel.find({ "lesson_category": user.userCategory })

        if (!suggestedlesson) {
            return res.status(404).json({ success: false, message: "suggestedlesson not found" })
        }

        const suggestedtutorial = await tutorialmodel.find({ "tutorial_category": user.userCategory })

        if (!suggestedtutorial) {
            return res.status(404).json({ success: false, message: "tutorial not found" })
        }

        const roadmaps = await roadmapmodel.find({ "roadmap_category": user.userCategory })

        if (!roadmaps) {
            return res.status(404).json({ success: false, message: "roadmaps not found" })
        }


        return res.status(200).json({
            success: true,
            message: "homepage success",
            lessons: suggestedlesson,
            tutorials: suggestedtutorial,
            roadmaps: roadmaps
        })



    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

};

module.exports.quiz = async function (req, res, next) {
    try {
        const user = await usermodel.findById(req.user);

        const quizes = await quizmodel.find({ "quizCategory": user.userCategory })
        if (!quizes) {
            return res.status(404).json({ success: false, message: "quizes not find" })
        }
        return res.status(200).json({ success: true, message: "quizes find", quizes: quizes })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.lesson = async function (req, res, next) {
    try {

        const lesson = await lessonmodel.find()

        if (!lesson) {
            return res.status(404).json({ success: false, message: " lesson not found" })
        }

        return res.status(200).json({
            success: true,
            message: lesson.length === 0 ? "No lesson found" : "lesson found",
            lessons: lesson
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.edit_profile = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "validationResult error", errors: errors.array(), success: false, })
    }
    try {
        const { name, email, userCategory } = req.body;

        const user = req.user;
        if (!user) {
            return res.status(400).json({ message: "url error", success: false, })
        }

        await usermodel.findOneAndUpdate({ _id: user._id }, { name, email, userCategory }, { new: true, runValidators: true })

        const newuser = await usermodel.findById(user._id);

        const token = generateToken(newuser)

        res.cookie("userAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000 * 24,
        });

        return res.status(200).json({ message: "user update", success: true, user: newuser });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.tutorial = async function (req, res, next) {

    try {
        const tutorial = await tutorialmodel.find().sort({ _id: -1 });

        if (!tutorial) {
            return res.status(404).json({ success: false, message: "tutorial fetch failed" });
        }
        return res.status(200).json({ success: true, message: "tutorial fetch", tutorial: tutorial });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.roadmap = async function (req, res, next) {
    try {
        const roadmap = await roadmapmodel.find().sort({ _id: -1 });

        if (!roadmap) {
            return res.status(404).json({ success: false, message: "roadmap fetch failed" });
        }
        return res.status(200).json({ success: true, message: "roadmap fetch", roadmap: roadmap });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.auth_check = async function (req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        res.status(200).json({ success: true, message: "Authorized" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}