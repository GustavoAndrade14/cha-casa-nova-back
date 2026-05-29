import express from 'express';
import cors from 'cors';
import produtosRoutes from './routes/produtos.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rotas
app.use('/api/produtos', produtosRoutes);

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'API de Produtos - Chá Casa Nova',
        version: '1.0.0',
        endpoints: {
            // GET
            listar: 'GET /api/produtos',
            disponiveis: 'GET /api/produtos/disponiveis',
            indisponiveis: 'GET /api/produtos/indisponiveis',
            buscar: 'GET /api/produtos/:id',

            // POST (criar)
            criar: 'POST /api/produtos',

            // PUT (atualizar completo)
            atualizarCompleto: 'PUT /api/produtos/:id',

            // PATCH (atualizações parciais)
            atualizarStatus: 'PATCH /api/produtos/:id/status',
            alternarStatus: 'PATCH /api/produtos/:id/toggle',
            atualizarBatch: 'PATCH /api/produtos/batch/atualizar',

            // DELETE (remover)
            deletar: 'DELETE /api/produtos/:id'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;