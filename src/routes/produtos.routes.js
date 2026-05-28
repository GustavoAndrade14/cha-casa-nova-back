import express from 'express';
import {
    listarProdutos,
    listarProdutosDisponiveis,
    listarProdutosIndisponiveis,
    buscarProdutoPorId,
    atualizarStatusProduto,
    alternarStatusProduto,
    atualizarMultiplosProdutos
} from '../controllers/produtos.controller.js';

const router = express.Router();

// Rotas GET
router.get('/', listarProdutos);
router.get('/disponiveis', listarProdutosDisponiveis);
router.get('/indisponiveis', listarProdutosIndisponiveis);
router.get('/:id', buscarProdutoPorId);

// Rotas PUT/PATCH
router.patch('/:id/status', atualizarStatusProduto);
router.patch('/:id/toggle', alternarStatusProduto);
router.patch('/batch/atualizar', atualizarMultiplosProdutos);

export default router;