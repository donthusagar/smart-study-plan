import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DB } from '../models/index';
import { JWT_SECRET, AuthenticatedRequest } from '../middleware/auth';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await DB.User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await DB.User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      dailyStudyGoal: 4,
      preferredStudyTime: 'Morning',
      createdAt: new Date()
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userClean = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      dailyStudyGoal: user.dailyStudyGoal,
      preferredStudyTime: user.preferredStudyTime,
      createdAt: user.createdAt
    };

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: userClean
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await DB.User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userClean = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      dailyStudyGoal: user.dailyStudyGoal,
      preferredStudyTime: user.preferredStudyTime,
      createdAt: user.createdAt
    };

    return res.json({
      message: 'Logged in successfully',
      token,
      user: userClean
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await DB.User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userClean = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      dailyStudyGoal: user.dailyStudyGoal || 4,
      preferredStudyTime: user.preferredStudyTime || 'Morning',
      createdAt: user.createdAt
    };

    return res.json({ user: userClean });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to retrieve profile', error: err.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, dailyStudyGoal, preferredStudyTime, profileImage } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (dailyStudyGoal !== undefined) updateData.dailyStudyGoal = Number(dailyStudyGoal);
    if (preferredStudyTime !== undefined) updateData.preferredStudyTime = preferredStudyTime;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const updated = await DB.User.findByIdAndUpdate(userId, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userClean = {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      profileImage: updated.profileImage,
      dailyStudyGoal: updated.dailyStudyGoal,
      preferredStudyTime: updated.preferredStudyTime,
      createdAt: updated.createdAt
    };

    return res.json({ message: 'Profile updated successfully', user: userClean });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
}
