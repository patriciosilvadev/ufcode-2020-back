import express from 'express'
import auth from '../middleware/auth'
import Visit from '../models/visit'

/**
 * Local router to be used by the main router
 */
const router = new express.Router()

router.post('/visits', async (req, res) => {
    const visit = new Visit(req.body)

    try {
        await visit.save()
        res.status(200).send(visit)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/visits/:id', auth, async (req, res) => {
    const { id: _id } = req.params

    try {
        const visit = await Visit.findOne({ _id })

        if (!visit) {
            return res.status(404).send()
        }

        res.send(visit)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/visits/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['store', 'date']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const visit = await Visit.findOne({ _id: req.params.id})

        if (!visit) {
            // If we didn't find anything, let's return a not found
            return res.status(404).send()
        }

        updates.forEach((update) => visit[update] = req.body[update])
        await visit.save()
        res.send(visit)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/visits/:id', auth, async (req, res) => {
    try {
        const visit = await Visit.findOneAndDelete({ _id: req.params.id })

        if (!visit) {
            // If we didn't find anything, let's return a not found
            res.status(404).send()
        }

        res.send(visit)
    } catch (e) {
        res.status(500).send()
    }
})

export default router
