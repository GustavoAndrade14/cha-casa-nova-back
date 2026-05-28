import app from './src/app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📦 Endpoints disponíveis:`);
    console.log(`   GET    /api/produtos`);
    console.log(`   GET    /api/produtos/disponiveis`);
    console.log(`   GET    /api/produtos/indisponiveis`);
    console.log(`   GET    /api/produtos/:id`);
    console.log(`   PATCH  /api/produtos/:id/status`);
    console.log(`   PATCH  /api/produtos/:id/toggle`);
    console.log(`   PATCH  /api/produtos/batch/atualizar`);
});