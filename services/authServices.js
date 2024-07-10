import createHttpError from 'http-errors';
import registerUser from '../models/registerUser.js';
import { Session } from '../models/Session.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret';
const JWT_ACCESS_EXPIRATION = '15m';
const JWT_REFRESH_EXPIRATION = '30d';

export const registerUserService = async ({ name, email, password }) => {
  try {
    const existingUser = await registerUser.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new registerUser({ name, email, password: hashedPassword });
    await newUser.save();

    const userData = newUser.toObject ? newUser.toObject() : newUser;
    delete userData.__v;

    delete userData.password;

    return userData;
  } catch (error) {
    throw error; // Прокидуємо помилку, щоб обробити її в контролері
  }
};

export const loginUserService = async ({ email, password }) => {
  try {
    const user = await registerUser.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw createHttpError(401, 'Invalid email or password');
    }

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRATION });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });

    const session = new Session({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await session.save();

    return { accessToken };
  } catch (error) {
    throw error; // Прокидуємо помилку, щоб обробити її в контролері
  }
};
