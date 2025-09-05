const mognoose = require('mongoose');
const Schema = mognoose.Schema;

const Message = new Schema(
    {
        message: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

module.exports = mognoose.model('Message', Message)