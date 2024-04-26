const { test, after, beforeEach, describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Note = require('../models/note')

describe('when there is initially some notes saved', ()=>{
  
  beforeEach(async () =>{
        await Note.deleteMany({})
        
        /* Solucion 1 cuando no se require que las promesas se ejecuten en un orden en particular
        console.log('cleared')
  
        const noteObjects = helper.initialNotes
                              .map(note => new Note(note))
        const promiseArray = noteObjects.map(note => note.save())
  
        await Promise.all(promiseArray)
        
        console.log('done');
        */
  
        //Cuando se require que se ejecueten en un orden especifico
        /*
        for(let note of helper.initialNotes) {
          let noteObject = new Note(note)
          await noteObject.save()
        }*/
        await Note.insertMany(helper.initialNotes)
    })
    
    test('notes are returned as json' , async ()=> {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test('all notes are returned', async ()=> {
      const response = await api.get('/api/notes')
      assert.strictEqual(response.body.length, helper.initialNotes.length)
    })
    test('a specific note is within the returned notes', async ()=> {
      const response = await api.get('/api/notes')
      const contents = response.body.map(r=>r.content)
    
      assert(contents.includes('Browser can execute only JavaScript'))
    })
})

describe('viewing a specific note', ()=>{

  test('a specific note can be viewed', async () =>{
    const notesAtStart = await helper.notesInDb()
  
    const noteToView = notesAtStart[0]
  
    const resultNote = await api
                          .get(`/api/notes/${noteToView.id}`)
                          .expect(200)
                          .expect('Content-Type', /application\/json/)
    
    assert.deepStrictEqual(resultNote.body, noteToView)
  })

  test('fails with statuscode 404 if note does not exist', async ()=>{
    const validNonexistingId = await helper.nonExistingId()

    await api.get(`/api/notes/${validNonexistingId}`)
            .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async ()=>{
    const invalidId = '5a3d5da59070081a82a3445'

    await api.get(`/api/notes/${invalidId}`)
            .expect(400)
  })
})

describe('addition of new note', ()=>{
  
  test('fails with status code 400 if data invalid', async () => {
      const newNote = {
        important: true
      }
      await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)
      
      const notesAtEnd = await helper.notesInDb()
      
      
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
    })
  
    
    test('succeeds with valid data', async () =>{
      const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }
    
    await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    
    
    const notesAtEnd = await helper.notesInDb()
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length +1)
    
    const contents = notesAtEnd.map(n => n.content)
    assert(contents.includes('async/await simplifies making async calls'))
    
  })
})


describe('deletion of a note', ()=>{

  test('succeeds with status 204 if id is valid', async () =>{

    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]
  
    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)
    
    const notesAtEnd = await helper.notesInDb()

    assert.strictEqual(notesAtEnd.length, notesAtStart.length - 1)
  
    const contents = notesAtEnd.map(r=>r.content)
    assert(!contents.includes(noteToDelete.content))  
  
  })
  
})


after( async () => {
    await mongoose.connection.close()
})