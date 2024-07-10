import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import User from '../models/User.js'; // Змініть шлях до моделі користувача на свій

const JWT_SECRET = 'your_jwt_secret';

// Функція для аутентифікації користувача за токеном
export const authenticate = async (req, res, next) => {
  // Отримуємо токен з заголовка Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Перевіряємо чи токен існує
  if (!token) {
    return next(createHttpError(401, 'Access token is missing'));
  }

  try {
    // Перевіряємо та декодуємо токен
    const decoded = jwt.verify(token, JWT_SECRET);

    // Отримуємо користувача за ID, який міститься у токені
    const user = await User.findById(decoded.userId);

    // Перевіряємо чи користувач знайдений
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    // Додаємо користувача до об'єкту запиту
    req.user = user;

    // Продовжуємо обробку запиту
    next();
  } catch (error) {
    // Перехоплюємо помилки від jwt.verify
    if (error.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Access token expired'));
    } else {
      return next(createHttpError(401, 'Invalid access token'));
    }
  }
};

export default authenticate;
