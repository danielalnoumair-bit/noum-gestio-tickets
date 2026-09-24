const express = require('express');
const session = require('express-session');
const path = require('node:path');

const requireAuth = require('./src/middleware/requireAuth');
const authRoutes = require('./src/routes/auth');
const aulasRoutes = require('./src/routes/aulas');
const ticketsRoutes = require('./src/routes/tickets');
const exportRoutes = require('./src/routes/export');
require('./src/seedAdmin');

const app = express();
const PORT = process.env.PORT || 3000;

// Necesario en Railway/Render (y cualquier hosting detras de un proxy) para
// que req.protocol refleje https real y las cookies "secure" funcionen.
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'cambia-este-secreto-en-produccion',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 8 * 60 * 60 * 1000, secure: 'auto' },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/aulas', aulasRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/export', exportRoutes);

// Paginas de admin protegidas (los assets estaticos como css/js no lo estan,
// los datos reales solo se sirven a traves de las rutas /api protegidas)
app.get('/admin/', requireAuth, (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'))
);
app.get('/admin/ticket.html', requireAuth, (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'admin', 'ticket.html'))
);
app.get('/admin/aulas.html', requireAuth, (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'admin', 'aulas.html'))
);

app.get('/logo-color-2-1.jpg', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'logo-color-2-1.jpg'))
);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/nuevo/'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
