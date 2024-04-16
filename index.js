require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/note')


// let notes = [
//   {
//     id: 1,
//     content: "HTML is easy",
//     important: true
//   },
//   {
//     id: 2,
//     content: "Browser can execute only JavaScript",
//     important: false
//   },
//   {
//     id: 3,
//     content: "GET and POST are the most important methods of HTTP protocol",
//     important: true
//   }
// ]

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(express.static('dist'))



app.get('/', (request, response) =>{
    response.send('<h1> Hello World </h1>')
})

app.get('/api/notes',(req, res) =>{

  Note.find({}).then(notes => {
    res.json(notes)
  })   
})

app.get('/api/notes/:id', (req, res, next) => {

  Note.findById(req.params.id)
    .then(note =>{
      if(note) {
        res.json(note)
      }else {
        res.status(404).end()
      }     
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id',(req,res) =>{

  const {content, important} = req.body

  const note = {
    content,
    important,
  }

  Note.findByIdAndUpdate(req.params.id, note, {new: true, runValidators:true, context: 'query'})
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id',(req,res,next) =>{

  Note.findByIdAndDelete(req.params.id)
    .then(result =>{
      res.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () =>{
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n=>n.id))
    :0
  
    return maxId + 1
}

app.post('/api/notes',(req, res, next) => {

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

  note.save()
    .then(savedNote => {
      res.json(savedNote)
    })
    .catch(error => next(error))  
})

const unknownEndpoint = (req,res) =>{
  res.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) =>{
  console.log(error.message);

  if(error.name === 'CastError'){
    return res.status(400).send({error: 'malformatted id'})
  } else if(error.name === 'ValidationError'){
    return res.status(400).json({error: error.message})
  }
  next(error)
}

//errorhandler debe ser el ultimo middleware cargado, !tambien todas las 
//rutas deben ser registradas antes que esto!
app.use(errorHandler)




const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
})