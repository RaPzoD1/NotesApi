const express = require('express')
const app = express()
const cors = require('cors')




let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

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

const unknownEndpoint = (req,res) =>{
  res.status(404).send({error: 'unknown endpoint'})
}


app.get('/', (request, response) =>{
    response.send('<h1> Hello World </h1>')
})

app.get('/api/notes',(req, res) =>{
    res.json(notes)
})

app.get('/api/notes/:id', (req, res) => {

  const id = Number(req.params.id)  
  const note = notes.find(note => note.id === id)

  note 
    ? res.json(note) 
    : res.status(404).end()

})

app.put('/api/notes/:id',(req,res) =>{
  const id = Number(req.params.id)
  notes = notes.filter(note => note.id !== id)  
  notes = notes.concat(req.body)
  console.log(notes);
  res.send(req.body).status(200)
})

app.delete('/api/notes/:id',(req,res) =>{
  const id = Number(req.params.id)
  notes = notes.filter(note => note.id !==id)
  res.status(204).end()
})

const generateId = () =>{
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n=>n.id))
    :0
  
    return maxId + 1
}

app.post('/api/notes',(req, res) => {  

    
  if(!req.body.content) {
    console.log(req.body.content);
    return res.status(400).json({
      error: 'content missing'
    })
  }
const note = {
  content: req.body.content,
  important: Boolean(req.body.important) || false,
  id: generateId()
}
  notes = notes.concat(note)
  console.log(note)
  res.json(note)
})


app.use(unknownEndpoint)






const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
})