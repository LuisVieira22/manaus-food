const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// POST /pedidos  { loja_id, endereco, itens: [{ produto_id, quantidade }] }
router.post('/', async (req, res) => {
  const { loja_id, endereco, itens } = req.body;
  if (!loja_id || !endereco || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Informe loja_id, endereco e itens' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const loja = await client.query('SELECT taxa_entrega FROM lojas WHERE id = $1', [loja_id]);
    if (!loja.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: 'Loja não encontrada' });
    }

    // O preço vem sempre do banco, nunca do cliente.
    let subtotal = 0;
    const linhas = [];
    for (const it of itens) {
      const qtd = parseInt(it.quantidade, 10);
      if (!qtd || qtd < 1) throw new Error('Quantidade inválida');
      const p = await client.query(
        'SELECT id, preco FROM produtos WHERE id = $1 AND loja_id = $2 AND disponivel = true',
        [it.produto_id, loja_id]
      );
      if (!p.rows[0]) throw new Error('Produto inválido: ' + it.produto_id);
      const preco = Number(p.rows[0].preco);
      subtotal += preco * qtd;
      linhas.push({ produto_id: p.rows[0].id, quantidade: qtd, preco });
    }

    const taxa = Number(loja.rows[0].taxa_entrega);
    const total = subtotal + taxa;

    const pedido = await client.query(
      `INSERT INTO pedidos (usuario_id, loja_id, endereco, subtotal, taxa_entrega, total)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.usuario.id, loja_id, endereco, subtotal, taxa, total]
    );

    for (const l of linhas) {
      await client.query(
        'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
        [pedido.rows[0].id, l.produto_id, l.quantidade, l.preco]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(pedido.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(400).json({ erro: e.message || 'Erro ao criar pedido' });
  } finally {
    client.release();
  }
});

// GET /pedidos  (pedidos do usuário logado)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, l.nome AS loja_nome,
        COALESCE(json_agg(json_build_object(
          'nome', pr.nome, 'quantidade', ip.quantidade, 'preco_unitario', ip.preco_unitario
        )) FILTER (WHERE ip.id IS NOT NULL), '[]') AS itens
       FROM pedidos p
       JOIN lojas l ON l.id = p.loja_id
       LEFT JOIN itens_pedido ip ON ip.pedido_id = p.id
       LEFT JOIN produtos pr ON pr.id = ip.produto_id
       WHERE p.usuario_id = $1
       GROUP BY p.id, l.nome
       ORDER BY p.criado_em DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao listar pedidos' });
  }
});

module.exports = router;
