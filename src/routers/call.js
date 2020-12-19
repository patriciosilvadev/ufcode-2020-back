const express = require('express')
const auth = require('../middleware/auth')
const Call = require('../models/call')
const router = new express.Router()

router.post('/calls', async (req, res) => {
    const call = new Call({
        ...req.body,
    })

    try {
        await call.save()
        res.status(200).send(call)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /calls?cpf=<user_id>
router.get('/calls', auth, async (req, res) => {
    const { cpf } = req.query

    try {
        const calls = await Call.find({ cpf })

        res.send(calls)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/calls/:id', auth, async (req, res) => {
    const { id: _id } = req.params

    try {
        const call = await Call.findOne({ _id })

        if (!call) {
            return res.status(404).send()
        }

        res.send(call)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/calls/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['address', 'date']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const call = await Call.findOne({ _id: req.params.id})

        if (!call) {
            return res.status(404).send()
        }

        updates.forEach((update) => call[update] = req.body[update])
        await call.save()
        res.send(call)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/calls/:id', auth, async (req, res) => {
    try {
        const call = await Call.findOneAndDelete({ _id: req.params.id })

        if (!call) {
            res.status(404).send()
        }

        res.send(call)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router