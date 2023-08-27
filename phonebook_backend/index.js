// importing files
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require("./models/mongo")

// express
const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
morgan.token('body', (req) => JSON.stringify(req.body))

const persons = []


function errorHandler (error, request, response, next) {
  console.log("hey du")
  console.error(error.message)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  
  next()
}


// GET
app.get('/api/persons', (request, response, next) => {
  Person.find({})
  .then(persons => {
    response.json(persons)
  })
  .catch(err => {
    return next(err)
  })
})

// GET Info Page
app.get('/api/info', (request, response) => {
  console.log(Person.length)
  const info = `<p>Phonebook has info for ${Person.length} people</p><p> ` + new Date() + " </p>"
  response.send(info)
})

// GET by ID
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person)
    } else {
      console.log("hey")
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

// DELETE by ID
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

// PUT / Update by ID
app.put('/api/persons/:id', (request, response, next) => {
  console.log(request.body)
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }
  
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
})

// POST / add person
app.post('/api/persons', (request, response, next) => {
  
  const personData = request.body
  const names = persons.map(person => person.name)
  
  if (!personData.name || !personData.number) {
    return response.status(400).json({
      error: "content missing"
    })
  } else if (names.includes(personData.name)) {
    return response.status(400).json({
      error: "name must be unique"
    })
  }
  
  const person = new Person({
    name: personData.name,
    number: personData.number
  })
  
  person.save()
  .then(savedPerson => {
    response.json(savedPerson)
  })
  .catch((err) => {
    return next(err)
  })
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})