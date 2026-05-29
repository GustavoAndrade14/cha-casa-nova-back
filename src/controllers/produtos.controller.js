// produtos.controller.js
import { supabase } from '../config/supabase.js';

// ==================== FUNÇÕES GET ====================
export const listarProdutos = async (req, res) => {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

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

export const listarProdutosDisponiveis = async (req, res) => {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('unavailable', false)
            .order('id', { ascending: true });

        if (error) throw error;

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

export const listarProdutosIndisponiveis = async (req, res) => {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('unavailable', true)
            .order('id', { ascending: true });

        if (error) throw error;

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

// ==================== FUNÇÕES POST/PUT/PATCH ====================
export const criarProduto = async (req, res) => {
    try {
        const { name, price, image, link, pix_key, unavailable } = req.body;

        if (!name || !price || !link || !pix_key) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: name, price, link, pix_key'
            });
        }

        const { data: novoProduto, error } = await supabase
            .from('produtos')
            .insert([{
                name,
                price,
                image: image || null,
                link,
                pix_key,
                unavailable: unavailable || false
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Produto criado com sucesso',
            data: novoProduto
        });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar produto',
            error: error.message
        });
    }
};

export const atualizarProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, image, link, pix_key, unavailable } = req.body;

        const { data: produtoExistente, error: findError } = await supabase
            .from('produtos')
            .select('id')
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

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (price !== undefined) updates.price = price;
        if (image !== undefined) updates.image = image;
        if (link !== undefined) updates.link = link;
        if (pix_key !== undefined) updates.pix_key = pix_key;
        if (unavailable !== undefined) updates.unavailable = unavailable;

        const { data: produtoAtualizado, error: updateError } = await supabase
            .from('produtos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.status(200).json({
            success: true,
            message: 'Produto atualizado com sucesso',
            data: produtoAtualizado
        });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar produto',
            error: error.message
        });
    }
};

export const atualizarStatusProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const { unavailable } = req.body;

        if (typeof unavailable !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'O campo "unavailable" deve ser um valor booleano'
            });
        }

        const { data: produtoAtualizado, error: updateError } = await supabase
            .from('produtos')
            .update({ unavailable })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

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

export const alternarStatusProduto = async (req, res) => {
    try {
        const { id } = req.params;

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

        const novoStatus = !produtoExistente.unavailable;

        const { data: produtoAtualizado, error: updateError } = await supabase
            .from('produtos')
            .update({ unavailable: novoStatus })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

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

// ==================== FUNÇÕES DELETE ====================
export const deletarProduto = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: produtoExistente, error: findError } = await supabase
            .from('produtos')
            .select('id')
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

        const { error: deleteError } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.status(200).json({
            success: true,
            message: 'Produto deletado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar produto',
            error: error.message
        });
    }
};