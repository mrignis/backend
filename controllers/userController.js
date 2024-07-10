import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Отримання інформації про поточного користувача
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Оновлення даних авторизованого користувача
export const updateUser = async (req, res) => {
    const { name, email, gender, weight, activeSportsTime, dailyWaterIntake, avatar } = req.body;

    // Створення об'єкта користувача
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (gender) userFields.gender = gender;
    if (weight) userFields.weight = weight;
    if (activeSportsTime) userFields.activeSportsTime = activeSportsTime;
    if (dailyWaterIntake) userFields.dailyWaterIntake = dailyWaterIntake;
    if (avatar) userFields.avatar = avatar;

    try {
        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Оновлення користувача
        user = await User.findByIdAndUpdate(req.user.id, { $set: userFields }, { new: true });

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Видача нової пари токенів (доступу та оновлення)
export const refreshTokens = (req, res) => {
    const payload = {
        user: {
            id: req.user.id
        }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
    });
};

// Логаут користувача
export const logoutUser = async (req, res) => {
    try {
        // Тут можна реалізувати логіку валідації токенів, якщо потрібно
        res.json({ message: 'Logout successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
