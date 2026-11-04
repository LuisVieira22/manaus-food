-- Rode este arquivo no Supabase: SQL Editor > New query > cole tudo > Run

CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  senha_hash  TEXT NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lojas (
  id            SERIAL PRIMARY KEY,
  nome          TEXT NOT NULL,
  categoria     TEXT NOT NULL,         -- Restaurantes, Mercados, Farmácias, Pet shops, Bebidas...
  emoji         TEXT NOT NULL DEFAULT '🍽️',
  tempo_min     INT  NOT NULL DEFAULT 30,
  tempo_max     INT  NOT NULL DEFAULT 45,
  taxa_entrega  NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS produtos (
  id          SERIAL PRIMARY KEY,
  loja_id     INT NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  descricao   TEXT,
  preco       NUMERIC(10,2) NOT NULL,
  disponivel  BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS pedidos (
  id            SERIAL PRIMARY KEY,
  usuario_id    INT NOT NULL REFERENCES usuarios(id),
  loja_id       INT NOT NULL REFERENCES lojas(id),
  endereco      TEXT NOT NULL,
  subtotal      NUMERIC(10,2) NOT NULL,
  taxa_entrega  NUMERIC(10,2) NOT NULL,
  total         NUMERIC(10,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'recebido',
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id              SERIAL PRIMARY KEY,
  pedido_id       INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id      INT NOT NULL REFERENCES produtos(id),
  quantidade      INT NOT NULL CHECK (quantidade > 0),
  preco_unitario  NUMERIC(10,2) NOT NULL
);

-- Dados de exemplo
INSERT INTO lojas (nome, categoria, emoji, tempo_min, tempo_max, taxa_entrega) VALUES
  ('X Burguer',          'Restaurantes', '🍔', 41, 51, 0),
  ('Salgados da Tia',    'Restaurantes', '🥟', 42, 52, 0),
  ('Mercado Amazonas',   'Mercados',     '🛒', 30, 50, 4.99),
  ('Farmácia Vida',      'Farmácias',    '💊', 20, 35, 3.50),
  ('Pet Selva',          'Pet shops',    '🐶', 35, 55, 5.00),
  ('Adega do Rio',       'Bebidas',      '🍺', 25, 40, 2.99);

INSERT INTO produtos (loja_id, nome, descricao, preco) VALUES
  (1, 'X Burguer',           'Pão, hambúrguer, queijo e salada', 18.90),
  (1, 'X Bacon',             'Pão, hambúrguer, queijo e bacon',  22.90),
  (1, 'Batata Frita',        'Porção individual',                12.00),
  (2, 'Mini Salgados (50 un)', 'Coxinha, bolinha de queijo e kibe', 12.99),
  (2, 'Pastel de Carne',     'Pastel grande',                     6.50),
  (3, 'Arroz 5kg',           'Arroz tipo 1',                     28.90),
  (3, 'Leite Integral 1L',   'Caixa',                             5.49),
  (3, 'Café 500g',           'Torrado e moído',                  17.90),
  (4, 'Dipirona 500mg',      '10 comprimidos',                    7.90),
  (4, 'Protetor Solar FPS 50','120ml',                           39.90),
  (5, 'Ração Cães 10kg',     'Adultos',                          89.90),
  (5, 'Petisco Dental',      'Pacote com 7',                     14.90),
  (6, 'Água de Coco 1L',     'Gelada',                            8.00),
  (6, 'Guaraná Antarctica 2L','Garrafa',                          9.50);
