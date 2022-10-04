const express = require('express')
const {
    getAllRoles,
    createRole,
    getRole,
    updateRole,
    deleteRole,
} = require('../controllers/roleController')
const router = express.Router()

router.route('/').get(getAllRoles).post(createRole)
router.route('/:slug').get(getRole).patch(updateRole)
router.route('/:id').delete(deleteRole)

module.exports = router
