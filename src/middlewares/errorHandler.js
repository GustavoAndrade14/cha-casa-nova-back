export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

// Middleware para validar ID
export const validateId = (req, res, next) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({
            success: false,
            message: 'ID inválido. Deve ser um número'
        });
    }

    next();
};