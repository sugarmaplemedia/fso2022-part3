const express = require("express")
const path = require('path')
const morgan = require("morgan")

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

morgan.token("body", (req, res) => req.method === "POST" ? `- ${JSON.stringify(req.body)}` : " ")
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))


let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

app.get("/info", (req, res) => {
    res.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${Date()}
    `)
})

app.get("/api/persons", (req, res) => {
    res.json(persons)
})

app.get("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id)
    
    const person = persons.find(person => person.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id)
    
    if (persons.find(person => person.id === id)) {
        persons = persons.filter(person => person.id !== id)
        res.status(204).end()
    } else {
        res.status(404).end()
    }
})

app.post("/api/persons/", (req, res) => {
    const body = req.body
    
    if (!body.name || !body.number) {
        let errorMsg = `${!body.name ? "body is missing" : ""} ${!body.number ? "number is missing" : ""}`
        return res.status(400).json({ 
            error: errorMsg
        })
    } else if (persons.find(person => person.name === body.name || person.number === body.number)) {
        return res.status(400).json({ 
            error: 'duplicate entry information' 
        })
    }
    
    let newPerson = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random()*10000)
    }
    persons = persons.concat(newPerson)
    
    res
    .status(201)
    .json(newPerson)
    .end()
})


const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})