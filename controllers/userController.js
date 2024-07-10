import User from '../models/User.js';
import { saveFile } from '../cloudinary/saveFile.js';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

// Отримання інформації про поточного користувача
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return next(createHttpError(404, 'User not found'));
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        next(createHttpError(500, 'Server Error'));
    }
};

// Оновлення даних авторизованого користувача
export const updateUser = async (req, res, next) => {
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

    let avatarUrl = req.body.avatar;

    if (req.file) {
        try {
            avatarUrl = await saveFile(req.file);
            userFields.avatar = avatarUrl; // Додаємо посилання на аватар до userFields
        } catch (err) {
            console.error('Error saving file:', err.message);
            return next(createHttpError(500, 'Error saving avatar'));
        }
    }

    try {
        let user = await User.findById(req.user.id);

        if (!user) {
            return next(createHttpError(404, 'User not found'));
        }

        // Оновлення користувача
        user = await User.findByIdAndUpdate(req.user.id, { $set: userFields }, { new: true });

        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        next(createHttpError(500, 'Server Error'));
    }
};

// Видача нової пари токенів (доступу та оновлення)
export const refreshTokens = (req, res, next) => {
    if (!req.user) {
        return next(createHttpError(401, 'Unauthorized'));
    }

    const payload = {
        user: {
            id: req.user.id
        }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
            console.error(err.message);
            return next(createHttpError(500, 'Error generating token'));
        }
        res.status(200).json({ token: `Bearer ${token}` });
    });
};

// Логаут користувача
export const logoutUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(createHttpError(401, 'Unauthorized'));
        }

       
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error(err.message);
        next(createHttpError(500, 'Server Error'));
    }
};
