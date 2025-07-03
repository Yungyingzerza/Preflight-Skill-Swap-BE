import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
//import type
import { Request, Response } from "express";
import { decodedType } from "../types/decodedType";
dotenv.config();

async function register(req: Request, res: Response) {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields!" });
    }

    // Check if the email already exists
    const userExists = await User.findOne({
      where: { email },
    });

    if (userExists) {
      return res.status(409).json({ message: "User or email already exists!" });
    }

    const user = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
      firstname,
      lastname,
    });

    if (user) {
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1y" }
      );
      return res
        .cookie("whoami", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 1000 * 60 * 60 * 24 * 365,
        })
        .status(201)
        .json({
          message: "User created successfully!",
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          picture_url: user.picture_url,
        });
    } else {
      return res.status(400).json({ message: "Failed to create user!" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!" });
  }
}

async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields!" });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET as string,
          {
            expiresIn: "1y",
          }
        );
        return res
          .cookie("whoami", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 365,
          })
          .json({
            message: "Login successfully!",
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            picture_url: user.picture_url,
          });
      } else {
        return res.status(401).json({ message: "Invalid credentials!" });
      }
    } else {
      return res.status(404).json({ message: "User not found!" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!" });
  }
}

async function logout(req: Request, res: Response) {
  try {
    return res.clearCookie("whoami").json({ message: "Logout successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!" });
  }
}

async function isAuth(req: Request, res: Response) {
  try {
    const token = req.cookies.whoami;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = await User.findByPk((decoded as decodedType).id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      picture_url: user.picture_url,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!" });
  }
}

export { register, login, logout, isAuth };
