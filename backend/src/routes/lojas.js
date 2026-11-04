const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /lojas?categoria=Restaurantes
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    const { rows } = categoria
      ? await pool.query('SELECT * FROM lojas WHERE categoria = $1 ORDER BY nome', [categoria])
      : await pool.query('SELECT * FROM lojas ORDER BY nome');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao listar lojas' });
  }
});

// GET /lojas/:id  (loja + produtos)
router.get('/:id', async (req, res) => {
  try {
    const loja = await pool.query('SELECT * FROM lojas WHERE id = $1', [req.params.id]);
    if (!loja.rows[0]) return res.status(404).json({ erro: 'Loja não encontrada' });

    const produtos = await pool.query(
      'SELECT * FROM produtos WHERE loja_id = $1 AND disponivel = true ORDER BY nome',
      [req.params.id]
    );
    res.json({ ...loja.rows[0], produtos: produtos.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar loja' });
  }
});

module.exports = router;
