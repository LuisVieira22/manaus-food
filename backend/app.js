require('dotenv').config(); // precisa ser a primeira linha executada

const express = require('express');
const cors = require('cors');

const missing = ['DATABASE_URL', 'JWT_SECRET'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Variáveis faltando no .env:', missing.join(', '));
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, app: 'Manaus Food API' }));
app.use('/auth', require('./src/routes/auth'));
app.use('/lojas', require('./src/routes/lojas'));
app.use('/pedidos', require('./src/routes/pedidos'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`API rodando na porta ${PORT}`));
