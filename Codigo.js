onst express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de log
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

app.use(express.json());
app.use(logger);

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Modelo de usuário
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true }
});
const User = mongoose.model('User', userSchema);

// Endpoints CRUD

// GET all users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// GET user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('Usuário não encontrado');
    res.json(user);
  } catch (err) {
    res.status(400).send('ID inválido');
  }
});

// POST create user
app.post('/api/users', async (req, res) => {
  const { name, email, age } = req.body;
  if (!name || !email || !age) {
    return res.status(400).send('Todos os campos são obrigatórios');
  }
  try {
    const newUser = new User({ name, email, age });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).send('Erro ao criar usuário: ' + err.message);
  }
});

// PUT update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('Usuário não encontrado');
    res.json(updatedUser);
  } catch (err) {
    res.status(400).send('Erro ao atualizar usuário');
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).send('Usuário não encontrado');
    res.send('Usuário deletado com sucesso');
  } catch (err) {
    res.status(400).send('Erro ao deletar usuário');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
