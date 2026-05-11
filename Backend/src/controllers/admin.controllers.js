const { validationResult } = require('express-validator');
const adminmodel = require("../models/admin.model");
const usermodel = require("../models/user.model");
const quizmodel = require("../models//quiz.model");
const { createadmin } = require("../services/admin.create");
const { hashPassword, comparePassword } = require("../services/hashPassword")
const { generateToken } = require("../services/JwtToken");
const AdminOtpModel = require("../models/admin.otp.model")
const sharp = require("sharp");
const cloudinary = require("../utils/cloudinary");
const lessonmodel = require("../models/lesson.model")
const tutorialmodel = require("../models/tutorial.model")
const roadmapmodel = require("../models/roadmap.model")
const { Resend } = require("resend");



module.exports.register = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Input error", errors: errors.array(), success: false });
    }
    try {
        const { name, email, password } = req.body;

        const admincount = await adminmodel.countDocuments();

        if (admincount >= 2) {
            return res.status(400).json({ message: "maximun 2 admin allowed", success: false })
        }

        const cheakbyemail = await adminmodel.findOne({ email })
        if (cheakbyemail) {
            return res.status(409).json({ message: "You already have an account, please login", success: false });
        }

        const hashpass = await hashPassword(password);
        const admin = await createadmin(name, email, hashpass);

        const token = generateToken(admin);

        const resend = new Resend(process.env.RESEND_API_KEY);


        const { error } = await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: [admin.email],
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
            Hello, ${admin.name || "User"} (admin) !
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


        res.cookie("adminAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 3600000 * 24,
        });

        return res.status(201).json({
            success: true,
            message: "Account created",
            admin: admin
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}
module.exports.login = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Input error", errors: errors.array(), success: false })
    }

    try {
        const { email, password } = req.body;

        const admin = await adminmodel.findOne({ email }).select('+password');
        if (!admin) {
            return res.status(401).json({ message: "invaled email or password", success: false });
        }

        const isPasswordCorrect = await comparePassword(password, admin.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "invaled email or password", success: false });
        }

        const token = generateToken(admin);

        res.cookie("adminAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 3600000 * 24,
        });

        return res.status(200).json({
            success: true,
            message: "Account login",
            admin: admin
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}
module.exports.logout = async function (req, res, next) {
    try {
        res.clearCookie("adminAuthToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
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


        const admin = await adminmodel.findOne({ email: email })

        if (!admin) {
            return res.status(404).json({ message: "admin not found", success: false });
        }

        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

        await AdminOtpModel.deleteMany({ email: admin.email });

        const otpid = await AdminOtpModel.create({ email: admin.email, otp });

        const adminemail = admin.email;
        const name = admin.name;
        const adminotp = otpid.otp;

        const resend = new Resend(process.env.RESEND_API_KEY);

        const { error } = await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: [adminemail],
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
             hii, ${name}(admin)! We received a request to reset your SkillHub account password.
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
              ${adminotp}
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

        const token = generateToken(admin)

        res.cookie("otpAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 300000 * 2
        });

        return res.status(200).json({ message: "OTP send successfully", admin: admin, success: true });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });

    }



}
module.exports.otp_verify = async function (req, res, next) {


    try {

        const { otp } = req.body;
        const adminid = req.adminid;
        const admin = await adminmodel.findById(adminid);
        if (!admin) {
            return res.status(404).json({ message: "admin not found", success: false });
        }

        const adminofotp = await AdminOtpModel.findOne({ email: admin.email })
        const admindbotp = adminofotp.otp;

        if (parseInt(otp) !== parseInt(admindbotp)) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        await AdminOtpModel.deleteOne({ _id: adminofotp._id });

        const token = generateToken(admin);

        res.cookie("changePassAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 300000
        });

        res.clearCookie("otpAuthToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
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

        const adminid = req.adminid;
        const admin = await adminmodel.findById(adminid);
        if (!admin) {
            return res.status(404).json({ message: "admin not found", success: false });
        }

        const hashedPassword = await hashPassword(newpassword);

        await adminmodel.findByIdAndUpdate(adminid, { password: hashedPassword }, { new: true });

        res.clearCookie("changePassAuthToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return res.status(201).json({ message: "Password updated successfully", success: true })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}

module.exports.profile = async function (req, res, next) {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({ success: false, message: "you need to login first" })
        }
        return res.status(200).json({ success: true, admin: admin })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
module.exports.edit_profile = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Input error", errors: errors.array(), success: false })
    }

    try {
        const admin = await adminmodel.findById(req.admin._id);

        const { name, email } = req.body;

        await adminmodel.findOneAndUpdate(
            { _id: admin._id },
            { name: name, email: email },
            { new: true, runValidators: true }
        );

        const newadmin = await adminmodel.findById(admin._id);

        const token = generateToken(newadmin);


        res.cookie("adminAuthToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000 * 24,
        });


        return res.status(200).json({ message: "admin update", success: true, admin: newadmin })



    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
module.exports.auth_check = async function (req, res, next) {
    try {
        if (!req.admin) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        res.status(200).json({ success: true, message: "Authorized" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.all_users = async function (req, res, next) {
    try {
        const allusers = await usermodel.find().sort({ _id: -1 });
        if (!allusers) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        return res.status(200).json({ success: true, allusers: allusers })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}
module.exports.delete_user = async function (req, res, next) {
    try {
        const { userid } = req.params;
        const user = await usermodel.findByIdAndDelete(userid);
        if (!user) {
            return res.status(400).json({ success: false, message: "user not found" })
        }
        return res.status(200).json({ success: true, message: "User deleted successfully!" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.quiz_create = async function (req, res, next) {

    try {

        const { quiz, quizCategory, options } = req.body;

        if (!quiz || !Array.isArray(options) || options.length !== 4) {
            return res.status(401).json({ message: "Quiz must have 4 options", success: false });
        }

        const correctCount = options.filter(opt => opt.isCorrect).length;
        if (correctCount !== 1) {
            return res.status(401).json({ message: "Exactly one option must be correct", success: false });
        }

        const newquiz = await quizmodel.create({ quiz, quizCategory, options });

        return res.status(201).json({ success: true, message: "Quiz created", quiz: newquiz });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }



}
module.exports.all_quizzes = async function (req, res, next) {
    try {
        const allquizs = await quizmodel.find().sort({ _id: -1 });
        if (!allquizs) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        return res.status(200).json({ success: true, allquizs: allquizs })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
module.exports.quiz_update = async function (req, res, next) {
    try {
        const { quiz, quizCategory, options } = req.body;
        const { quizId } = req.params;

        const quizcheak = await quizmodel.findById(quizId);

        if (!quizcheak) return res.status(400).json({ message: "quiz not found", success: false });


        if (!quiz || !Array.isArray(options) || options.length !== 4 || !quizCategory) {
            return res.status(401).json({ message: "Quiz must have 4 options", success: false });
        }

        const correctCount = options.filter(opt => opt.isCorrect).length;
        if (correctCount !== 1) {
            return res.status(401).json({ message: "Exactly one option must be correct", success: false });
        }

        const updatequiz = await quizmodel.findByIdAndUpdate(quizId, { $set: { quiz: quiz, quizCategory: quizCategory, options: options } }, { new: true, runValidators: true })

        if (!updatequiz) return res.status(400).json({ message: "quiz updating error", success: false });

        const allquizs = await quizmodel.find().sort({ _id: -1 });

        if (!allquizs) {
            return res.status(400).json({ success: false, message: "quizzes not found" })
        }

        return res.status(200).json({ message: "quiz updated", success: true, allquizs: allquizs });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });

    }
}
module.exports.quiz_delete = async function (req, res, next) {

    try {
        const { quizId } = req.params;
        const quiz = await quizmodel.findByIdAndDelete(quizId);
        if (!quiz) {
            return res.status(400).json({ success: false, message: "URL is incorrect" })
        }
        return res.status(200).json({ success: true, message: "quiz deleted successfully!" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.lesson_create = async function (req, res, next) {
    try {
        const { title, description, lessonlink, lesson_category } = req.body;
        const thumbnail = req.file?.buffer;

        // Validate input
        if (!thumbnail) {
            return res.status(400).json({ message: "Thumbnail required", success: false });
        }
        if (!title || !description || !lessonlink || !lesson_category) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        // Optimize image
        const optimizedImageBuffer = await sharp(thumbnail)
            .resize({ width: 800, height: 800 })
            .toFormat("jpeg", { quality: 80 })
            .toBuffer();

        // Convert to Data URI
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;

        // Upload to Cloudinary
        const cloudResponse = await cloudinary.uploader.upload(fileUri, {
            folder: "lessons", // optional: organize in Cloudinary
            overwrite: true,
        });

        // Save lesson in DB
        const lesson = await lessonmodel.create({
            title,
            description,
            lessonlink,
            thumbnail: cloudResponse.secure_url,
            public_thumbnail: cloudResponse.public_id,
            lesson_category,
        });

        if (!lesson) {
            return res.status(500).json({ message: "lesson not created", success: false });
        }

        // Success response
        return res.status(201).json({
            message: "lesson created successfully",
            success: true,
            lesson: lesson,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
module.exports.all_lessons = async function (req, res, next) {
    try {
        const alllesson = await lessonmodel.find().sort({ _id: -1 });

        if (!alllesson || alllesson.length === 0) {
            return res.status(404).json({ success: false, message: "No lessons found" });
        }

        return res.status(200).json({
            success: true,
            count: alllesson.length, // optional: total lesson
            lessons: alllesson
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}
module.exports.lesson_update = async function (req, res, next) {
    try {
        const { lessonId } = req.params; // lesson id from URL
        const { title, description, lessonlink, lesson_category } = req.body;

        const lesson = await lessonmodel.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "lesson not found" });
        }

        if (!title || !description || !lessonlink || !lesson_category) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        let updatedThumbnail;
        let public_thumbnail;

        // If new thumbnail uploaded → optimize + upload
        if (req.file?.buffer) {
            if (lesson.public_thumbnail) {
                await cloudinary.uploader.destroy(lesson.public_thumbnail);

            }

            const optimizedImageBuffer = await sharp(req.file.buffer)
                .resize({ width: 800, height: 800 })
                .toFormat("jpeg", { quality: 80 })
                .toBuffer();



            const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
            const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: "lessons",
                overwrite: true,
            });

            updatedThumbnail = cloudResponse.secure_url;
            public_thumbnail = cloudResponse.public_id;
        }

        // Update lesson using findByIdAndUpdate
        const updatedlesson = await lessonmodel.findByIdAndUpdate(
            lessonId,
            {
                title,
                description,
                lessonlink,
                lesson_category,
                ...(public_thumbnail && { public_thumbnail: public_thumbnail }),
                ...(updatedThumbnail && { thumbnail: updatedThumbnail })
            },
            { new: true } // return updated document
        );

        if (!updatedlesson) {
            return res.status(404).json({ success: false, message: "lesson not found" });
        }

        const alllesson = await lessonmodel.find().sort({ _id: -1 });

        if (!alllesson || alllesson.length === 0) {
            return res.status(404).json({ success: false, message: "No lesson found" });
        }

        return res.status(200).json({
            success: true,
            message: "lesson updated successfully",
            lessons: alllesson
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
module.exports.lesson_delete = async function (req, res, next) {
    try {
        const { lessonId } = req.params;

        // Find lesson first
        const lesson = await lessonmodel.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "lesson not found" });
        }

        // Optional: delete old image from Cloudinary
        if (lesson.thumbnail) {
            try {
                // Extract public_id from Cloudinary URL
                const publicId = lesson.public_thumbnail;
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.warn("Cloudinary delete failed:", err.message);
            }
        }

        // Delete lesson from DB
        await lessonmodel.findByIdAndDelete(lessonId);

        return res.status(200).json({
            success: true,
            message: "Lessons deleted successfully!",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports.tutorial_create = async function (req, res, next) {

    try {
        const { title, description, icon, channelname, link, tutorial_category } = req.body;
        if (!title || !description || !icon || !channelname || !link || !tutorial_category) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const tutorial = await tutorialmodel.create({
            title,
            description,
            icon,
            link,
            channelname,
            tutorial_category
        });

        if (!tutorial) {
            return res.status(500).json({ message: "tutorial not created", success: false })
        }
        return res.status(201).json({ message: "tutorial created", success: true, tutorial: tutorial })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
module.exports.all_tutorials = async function (req, res, next) {
    try {
        const alltutorial = await tutorialmodel.find().sort({ _id: -1 });
        if (!alltutorial) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        return res.status(200).json({ success: true, alltutorial: alltutorial })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
module.exports.tutorial_update = async function (req, res, next) {
    try {
        const { title, icon, channelname, link, tutorial_category, description } = req.body;
        const { tutorialId } = req.params;

        const tutorialheak = await tutorialmodel.findById(tutorialId);

        if (!tutorialheak) return res.status(404).json({ message: "tutorial not found", success: false });


        const updatetutorial = await tutorialmodel.findByIdAndUpdate(tutorialId, { $set: { title, icon, link, description, tutorial_category, channelname } }, { new: true, runValidators: true })

        if (!updatetutorial) return res.status(500).json({ message: "tutorial updating error", success: false });

        const alltutorial = await tutorialmodel.find().sort({ _id: -1 });
        if (!alltutorial) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        return res.status(200).json({ message: "tutorial updated", success: true, alltutorial: alltutorial });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });

    }
}
module.exports.tutorial_delete = async function (req, res, next) {

    try {
        const { tutorialId } = req.params;
        const tutorial = await tutorialmodel.findByIdAndDelete(tutorialId);
        if (!tutorial) {
            return res.status(404).json({ success: false, message: "tutorial not found" })
        }
        return res.status(200).json({ success: true, tutorial: tutorial, message: "Tutorial deleted successfully!" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.roadmap_create = async function (req, res, next) {
    try {
        const { title, description, icon, link, roadmap_category } = req.body;
        if (!title || !description || !icon || !link || !roadmap_category) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }
        const newroadmap = await roadmapmodel.create({
            title,
            description,
            icon,
            link,
            roadmap_category
        })

        if (!newroadmap) {
            return res.status(500).json({ success: false, message: "roadmap create error" })
        }
        return res.status(201).json({ success: true, message: "roadmap created", roadmap: newroadmap })



    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}
module.exports.all_roadmaps = async function (req, res, next) {
    try {
        const allroadmap = await roadmapmodel.find().sort({ _id: -1 });
        if (!allroadmap) {
            return res.status(404).json({ success: false, message: "roadmap not found" })
        }
        return res.status(200).json({ success: true, allroadmaps: allroadmap })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
module.exports.roadmap_update = async function (req, res, next) {
    try {
        const { title, icon, link, roadmap_category, description } = req.body;
        const { roadmapId } = req.params;

        const roadmapcheak = await roadmapmodel.findById(roadmapId);

        if (!roadmapcheak) return res.status(404).json({ message: "roadmap not found", success: false });


        const updateroadmap = await roadmapmodel.findByIdAndUpdate(roadmapId, { $set: { title, icon, link, roadmap_category, description } }, { new: true, runValidators: true })

        if (!updateroadmap) return res.status(500).json({ message: "roadmap updating error", success: false });

        const allroadmap = await roadmapmodel.find().sort({ _id: -1 });
        if (!allroadmap) {
            return res.status(404).json({ success: false, message: "roadmap not found" })
        }

        return res.status(200).json({ message: "roadmap updated", success: true, allroadmap: allroadmap });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });

    }
}
module.exports.roadmap_delete = async function (req, res, next) {
    try {
        const { roadmapId } = req.params;

        const roadmap = await roadmapmodel.findByIdAndDelete(roadmapId)
        if (!roadmap) {
            return res.status(404).json({ success: false, message: "roadmap not found" })
        }
        return res.status(200).json({ success: true, message: "roadmap deleted successfully!" })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}