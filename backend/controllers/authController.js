const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const resetIfNewDay = require('../utils/resetIfNewDay');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const upgradeToPro = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { plan: 'pro' }, { new: true });
    res.json({ message: 'Upgraded to Pro!', user: { id: user._id, plan: user.plan } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    resetIfNewDay(user);
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      questionsToday: user.questionsToday,
      uploadsToday: user.uploadsToday
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...(name && { name }), ...(email && { email }) },
      { new: true }
    );

    res.json({
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const Document = require('../models/Document');
    const Chunk = require('../models/Chunk');
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');

    const conversations = await Conversation.find({ owner: req.userId }).select('_id');
    const conversationIds = conversations.map((c) => c._id);

    await Message.deleteMany({ conversation: { $in: conversationIds } });
    await Conversation.deleteMany({ owner: req.userId });
    await Chunk.deleteMany({ owner: req.userId });
    await Document.deleteMany({ owner: req.userId });
    await User.findByIdAndDelete(req.userId);

    res.json({ message: 'Account and all associated data deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports = { register, login, upgradeToPro, getMe, updateProfile, changePassword, deleteAccount };
