import express from 'express';
import mongoose from 'mongoose';
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validation/validation.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';

import { UserControllers, PostControllers } from './controllers/index.js';

import multer from 'multer';

mongoose
  .connect(
    'mongodb+srv://admin:ynmZl2wWOFvlT1Za@cluster0.kopyekm.mongodb.net/blog?retryWrites=true&w=majority',
  )
  .then(() => console.log('db ok'))
  .catch((err) => console.log('DB error', err));
// 92.240.218.247
// ynmZl2wWOFvlT1Za

const app = express();

// создаем хранилище
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// включаем в экспресе json
app.use(express.json());
// любые запросы на каталог uploads будут переадресованы на папку uploads
app.use('/uploads', express.static('uploads'));
// ответ от сервера при первом запуске
app.get('/', (req, res) => {
  res.send('привет');
});

// указываем на каком порту будет подниматься сервер
app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});

// post запрос на сервер на авторизацию

app.post('/auth/login', loginValidation, handleValidationErrors, UserControllers.login);

// post запрос на сервер на регистрацию
app.post('/auth/register', registerValidation, handleValidationErrors, UserControllers.register);

// запрос на получение информации о пользователе
app.get('/auth/me', checkAuth, UserControllers.getMe);
// запрос на загрузку файлов(картинок)
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

// Запрос на создание статьи
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostControllers.create);
// Запрос на получение всех статей
app.get('/posts', PostControllers.getAll);
// Запрос на получение одной статьи
app.get('/posts/:id', PostControllers.getOne);
// Запрос на удаление статьи
app.delete('/posts/:id', checkAuth, PostControllers.remove);
// Запрос на обновлени статьи
app.patch('/posts/:id', checkAuth, postCreateValidation, PostControllers.update);
