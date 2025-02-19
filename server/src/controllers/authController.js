const { User, Staff, Patient } = require("../mongo_schema.js");
const { v4: uuidv4 } = require("uuid");
const ExpressError = require("../utils/ExpressError");
const { generateToken } = require("../utils/handleJWT.js");

// @desc     User Signup
// route     POST /api/auth/signup
// @access   Public
const signup = async (req, res, next) => {
  try {
    const { email, role, name } = req.body;

    // Check if the user already exists
    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists && userAlreadyExists.status === "ACTIVE") {
      throw new ExpressError("User already exists.", 409);
    }

    let newUser;
    if (userAlreadyExists && userAlreadyExists.status === "INACTIVE") {
      // Restore user
      userAlreadyExists.status = "ACTIVE";
      userAlreadyExists.role = role;
      userAlreadyExists.name = name;
      newUser = await userAlreadyExists.save();
    }

    if (!userAlreadyExists) {
      // Create a new user
      const user = new User({
        id: uuidv4(),
        email,
        role,
        name,
        status: "ACTIVE",
      });
      newUser = await user.save();
    }

    if (newUser) {
      const token = generateToken(
        {
          email: newUser.email,
        },
        "2h"
      );

      res.cookie("token", token, {
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });
      res.cookie("role", role, {
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });
      res.cookie("name", newUser.name, {
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });

      return res.status(201).json({
        ok: true,
        message: "User registered successfully.",
        data: {
          user: {
            email: newUser.email,
            role: newUser.role,
            name: newUser.name,
            profileComplete: false,
          },
        },
      });
    }

    throw new ExpressError("User Registration failed.", 400);
  } catch (err) {
    throw new ExpressError(err.message, 500);
  }
};

// @desc     User Login
// route     POST /api/auth/login
// @access   Public
const login = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user || user.status === "INACTIVE") {
      throw new ExpressError("User does not exist", 400);
    }

    // Checking complete profile assertion
    let profileIsComplete = true;
    if (user.role === "DOCTOR" || user.role === "PARAMEDICAL") {
      const staffExists = await Staff.findOne({ email });

      if (!staffExists || staffExists.status === "INACTIVE") {
        profileIsComplete = false;
      }
    } else if (user.role === "PATIENT") {
      const patientExists = await Patient.findOne({ email });

      if (!patientExists || patientExists.status === "INACTIVE") {
        profileIsComplete = false;
      }
    }

    const token = generateToken(
      {
        email: user.email,
      },
      "2h"
    );

    res.cookie("token", token, {
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    });
    res.cookie("role", user.role, {
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    });
    res.cookie("name", user.name, {
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    });

    return res.status(200).json({
      ok: true,
      message: `Logged in successfully as ${user.role}`,
      data: {
        user: {
          email: user.email,
          role: user.role,
          name: user.name,
          profileComplete: profileIsComplete,
        },
      },
    });
  } catch (err) {
    throw new ExpressError(err.message, 500);
  }
};

// @desc     User Logout
// route     POST /api/auth/logout
// @access   Public
const logout = async (req, res, next) => {
  try {
    console.log("Logging out...");

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
    });
    res.clearCookie("role", {
      httpOnly: true,
      secure: true,
    });
    res.clearCookie("name", {
      httpOnly: true,
      secure: true,
    });

    return res.status(200).json({
      ok: true,
      message: "User logged out successfully.",
      data: {},
    });
  } catch (err) {
    throw new ExpressError(err.message, 500);
  }
};

module.exports = {
  signup,
  login,
  logout,
};
