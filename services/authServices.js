import { HttpError } from '../middleware/HttpError.js';
import registerUser from '../models/registerUser.js';
import { Session } from '../models/Session.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const {
  ACCESS_SECRET,
  REFRESH_SECRET,
  JWT_ACC_EXPIRES_IN,
  JWT_REF_EXPIRES_IN,
} = process.env;

export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await registerUser.findOne({ email });
  if (existingUser) {
    throw new HttpError(409, 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new registerUser({ name, email, password: hashedPassword });
  await newUser.save();

  const userData = newUser.toObject ? newUser.toObject() : newUser;
  delete userData.__v;
  delete userData.password;

  return userData;
};

export const loginUserService = async ({ email, password }) => {
  const user = await registerUser.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const accessToken = jwt.sign({ userId: user._id }, ACCESS_SECRET, { expiresIn: JWT_ACC_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, { expiresIn: JWT_REF_EXPIRES_IN });

  // Перевірка існуючої сесії
  let session = await Session.findOne({ userId: user._id });
  if (session) {
    // Оновлення існуючої сесії
    session.accessToken = accessToken;
    session.refreshToken = refreshToken;
    session.accessTokenValidUntil = new Date(Date.now() + parseInt(JWT_ACC_EXPIRES_IN) * 1000);
    session.refreshTokenValidUntil = new Date(Date.now() + parseInt(JWT_REF_EXPIRES_IN) * 1000);
  } else {
    // Видалення старої сесії, якщо вона існує
    await Session.findOneAndDelete({ userId: user._id });

    // Створення нової сесії
    session = new Session({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + parseInt(JWT_ACC_EXPIRES_IN) * 1000),
      refreshTokenValidUntil: new Date(Date.now() + parseInt(JWT_REF_EXPIRES_IN) * 1000),
    });
  }

  await session.save();

  return { accessToken, refreshToken };
};
