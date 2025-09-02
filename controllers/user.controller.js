const User = require('../models/user.model');
const { createOneTimeInviteLink, sendMessage } = require('../utils/telegram');

// Create and Save a new User
exports.create = async (req, res) => {
    // Validate request
    if( !req.body.telegram_id || !req.body.full_name || !req.body.phone_number || !req.body.nickname || !req.body.direction) {
        return res.status(400).send({
            message: "Content can not be empty"
        });
    }

    // Create a User
    const user = new User({
        telegram_id: req.body.telegram_id,
        full_name: req.body.full_name,
        phone_number: req.body.phone_number,
        nickname: req.body.nickname,
        direction: req.body.direction,
        checked: req.body.checked || false
    });

    // Save User in the database
    try {
        const data = await user.save();
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the User."
        });
    }
};

// Retrieve all Users from the database.
exports.findAll = async (req, res) => {
    try {
        const data = await User.find();
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    }
};

// Find a single User with a userId
exports.findOne = async (req, res) => {
    const id = req.params.userId;

    try {
        const data = await User.findById(id);
        if(!data) {
            return res.status(404).send({
                message: "User not found with id " + id
            });            
        }
        res.send(data);
    } catch (err) {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + id
            });                
        }
        return res.status(500).send({
            message: "Error retrieving user with id " + id
        });
    }
};

// Update a User identified by the userId in the request
exports.update = async (req, res) => {
    // Validate Request
    if( !req.body.telegram_id || !req.body.full_name || !req.body.phone_number || !req.body.nickname || !req.body.direction) {
        return res.status(400).send({
            message: "Content can not be empty"
        });
    }

    const id = req.params.userId;

    try {
        const data = await User.findByIdAndUpdate(id, {
            telegram_id: req.body.telegram_id,
            full_name: req.body.full_name,
            phone_number: req.body.phone_number,
            nickname: req.body.nickname,
            direction: req.body.direction,
            checked: req.body.checked || false
        }, { new: true });
        
        if(!data) {
            return res.status(404).send({
                message: "User not found with id " + id
            });
        }
        res.send(data);
    } catch (err) {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + id
            });                
        }
        return res.status(500).send({
            message: "Error updating user with id " + id
        });
    }
};

// Delete a User with the specified userId in the request
exports.delete = async (req, res) => {
    const id = req.params.userId;

    try {
        const data = await User.findByIdAndRemove(id);
        if(!data) {
            return res.status(404).send({
                message: "User not found with id " + id
            });
        }
        res.send({message: "User deleted successfully!"});
    } catch (err) {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "User not found with id " + id
            });                
        }
        return res.status(500).send({
            message: "Could not delete user with id " + id
        });
    }
};

// Delete all Users from the database.
exports.deleteAll = async (req, res) => {
    try {
        const data = await User.deleteMany({});
        res.send({
            message: `${data.deletedCount} users were deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while removing all users."
        });
    }
};

// Find all checked Users
exports.findAllChecked = async (req, res) => {
    try {
        const data = await User.find({ checked: true });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    }
};

// Find all unchecked Users
exports.findAllUnchecked = async (req, res) => {
    try {
        const data = await User.find({ checked: false });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    }
};

// Update the checked status of a User identified by the userId in the request
exports.updateCheckedStatus = async (req, res) => {
    if (req.body.checked === undefined) {
        return res.status(400).send({
            message: "Content can not be empty"
        });
    }

    const id = req.params.userId;

    try {
        const data = await User.findByIdAndUpdate(
            id,
            { checked: req.body.checked },
            { new: true }
        );

        if (!data) {
            return res.status(404).send({
                message: "User not found with id " + id
            });
        }

        // ✅ checked true bo‘lsa → userga message yuboramiz
        if (req.body.checked === true) {
            const inviteLink = await createOneTimeInviteLink();

            // Uzbekcha matn
            const uzMessage = `
Assalomu alaykum, ${data.full_name}! ✅
Sizning arizangiz qabul qilindi.

👉 Guruhga qo‘shilish havolasi:
${inviteLink}
            `;

            // Ruscha matn
            const ruMessage = `
Здравствуйте, ${data.full_name}! ✅
Ваша заявка принята.

👉 Ссылка для вступления в группу:
${inviteLink}
            `;

            await sendMessage(process.env.CHAT_ID, uzMessage);
            await sendMessage(process.env.CHAT_ID, ruMessage);
        }

        res.send(data);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + id
            });
        }
        return res.status(500).send({
            message: "Error updating user with id " + id
        });
    }
};