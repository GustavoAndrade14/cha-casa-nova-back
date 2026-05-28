import { supabase } from '../config/supabase.js';

// Listar todos os produtos
export const listarProdutos = async (req, res) => {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            count: produtos.length,
            data: produtos
        });
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produtos',
            error: error.message
        });
    }
};

// Listar apenas produtos disponíveis (unavailable = false)
export const listarProdutosDisponiveis = async (req, res) => {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('unavailable', false)
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            count: produtos.length,
            data: produtos
        });
    } catch (error) {
        console.error('Erro ao listar produtos disponíveis:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produtos disponíveis',
            error: error.message
        });
    }
};

// Listar apenas produtos indisponíveis (unavailable = true)
export const listarProdutosIndisponiveis = async (req, res) => {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('unavailable', true)
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            count: produtos.length,
            data: produtos
        });
    } catch (error) {
        console.error('Erro ao listar produtos indisponíveis:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produtos indisponíveis',
            error: error.message
        });
    }
};

// Buscar produto por ID
export const buscarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: produto, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }
            throw error;
        }

        res.status(200).json({
            success: true,
            data: produto
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produto',
            error: error.message
        });
    }
};

// Atualizar status unavailable
export const atualizarStatusProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const { unavailable } = req.body;

        // Validar se unavailable é booleano
        if (typeof unavailable !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'O campo "unavailable" deve ser um valor booleano (true ou false)'
            });
        }

        // Buscar produto atual primeiro
        const { data: produtoExistente, error: findError } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', id)
            .single();

        if (findError) {
            if (findError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }
            throw findError;
        }

        // Atualizar o status
        const { data: produtoAtualizado, error: updateError } = await supabase
            .from('produtos')
            .update({ unavailable: unavailable })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        res.status(200).json({
            success: true,
            message: `Produto ${unavailable ? 'indisponível' : 'disponível'} com sucesso`,
            data: produtoAtualizado
        });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar status do produto',
            error: error.message
        });
    }
};

// Alternar status (toggle) - muda de true para false ou vice-versa
export const alternarStatusProduto = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar produto atual
        const { data: produtoExistente, error: findError } = await supabase
            .from('produtos')
            .select('unavailable')
            .eq('id', id)
            .single();

        if (findError) {
            if (findError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }
            throw findError;
        }

        // Alternar o status
        const novoStatus = !produtoExistente.unavailable;

        const { data: produtoAtualizado, error: updateError } = await supabase
            .from('produtos')
            .update({ unavailable: novoStatus })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        res.status(200).json({
            success: true,
            message: `Status alterado para ${novoStatus ? 'indisponível' : 'disponível'}`,
            data: produtoAtualizado
        });
    } catch (error) {
        console.error('Erro ao alternar status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao alternar status do produto',
            error: error.message
        });
    }
};

// Atualizar múltiplos produtos (batch update)
export const atualizarMultiplosProdutos = async (req, res) => {
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Envie um array de updates com id e unavailable'
            });
        }

        const results = [];
        const errors = [];

        for (const update of updates) {
            if (!update.id || typeof update.unavailable !== 'boolean') {
                errors.push({
                    id: update.id,
                    error: 'Campos inválidos: necessário id e unavailable (boolean)'
                });
                continue;
            }

            const { data, error } = await supabase
                .from('produtos')
                .update({ unavailable: update.unavailable })
                .eq('id', update.id)
                .select()
                .single();

            if (error) {
                errors.push({ id: update.id, error: error.message });
            } else {
                results.push(data);
            }
        }

        res.status(200).json({
            success: true,
            message: `${results.length} produtos atualizados, ${errors.length} erros`,
            data: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Erro ao atualizar múltiplos produtos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar produtos',
            error: error.message
        });
    }
};