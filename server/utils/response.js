const success = (res, data = {}, msg = 'Success') => {
    res.status(200).json({
        code: 200,
        data,
        msg
    });
};

const error = (res, msg = 'Error', code = 500) => {
    res.status(code).json({
        code,
        data: {},
        msg
    });
};

module.exports = { success, error };
