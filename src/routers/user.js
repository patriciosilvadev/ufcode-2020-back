import express from 'express'
import User from '../models/user'
import Call from '../models/call'
import Visit from '../models/visit'
import auth from '../middleware/auth'

/**
 * Local router to be used by the main router
 */
const router = new express.Router()

/**
 * This request is going to be made when the user has finished filling the pre signup form
 */
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save()
        res.status(201).send({user: user})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id)
    for (var propName in req.body) {
        user[propName] = req.body[propName]
    }

    /* The frontend will make one request to us. If this request is made, then the user is not a lead anymore, they've filled the
    whole form */
    user.isLead = false

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(200).send({user: user, token: token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.cpf, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

// GET /users/check-cpf?cpf=<cpf_user>
router.get('/users/check-cpf', async (req, res) => {
    const { cpf } = req.query

    try {
        const user = await User.findOne({ cpf })
        const isLead = (user || {}).isLead

        res.status(200).send({ ok: Boolean(user), isLead })
    } catch (e) {
        res.status(400).send(e)
    }
})

/**
 * Relationships
 */
router.get('/users/:id/calls', async (req, res) => {
    const user_id = req.params.id

    try {
        const calls = await Call.find({ user: user_id })

        res.send(calls)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:id/visits', async (req, res) => {
    const user_id = req.params.id

    try {
        const visits = await Visit.find({ user: user_id })

        res.send(visits)
    } catch (e) {
        res.status(500).send()
    }
})

export default router
