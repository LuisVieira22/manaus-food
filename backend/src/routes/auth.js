const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

function gerarToken(u) {
  return jwt.sign({ id: u.id, email: u.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha nome, email e senha' });

  try {
    const hash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email.toLowerCase(), hash]
    );
    res.status(201).json({ usuario: rows[0], token: gerarToken(rows[0]) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ erro: 'Email já cadastrado' });
    console.error(e);
    res.status(500).json({ erro: 'Erro ao cadastrar' });
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Informe email e senha' });

  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(senha, u.senha_hash))) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
    res.json({ usuario: { id: u.id, nome: u.nome, email: u.email }, token: gerarToken(u) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

module.exports = router;
