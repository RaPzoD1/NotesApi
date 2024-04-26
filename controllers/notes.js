const notesRouter = require('express').Router()
const Note = require('../models/note')



notesRouter.get('/',async (req, res) =>{

  const notes = await Note.find({})
  res.json(notes)

})

notesRouter.get('/:id',  async (req, res, next) => {
  
    const note = await Note.findById(req.params.id)    
    if(note) {
      res.json(note)
    }else {
      res.status(404).end()
    } 
  
})

notesRouter.put('/:id', async (req,res) =>{

  const {content, important} = req.body

  const note = {
    content,
    important,
  }
  
  const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, 
                                                      {new: true, runValidators:true, 
                                                      context: 'query'})
  res.json(updatedNote)
  
})

notesRouter.delete('/:id',async (req,res,next) =>{

    await Note.findByIdAndDelete(req.params.id)
    res.status(204).end()
 
})

notesRouter.post('/',async (req, res, next) => {

  const body = req.body
    
  if(body.content === undefined) {

    return res.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note ({
    content: body.content,
    important: Boolean(body.important) || false,
  })

  const savedNote = await note.save()
  res.status(201).json(savedNote)
    
})

module.exports = notesRouter