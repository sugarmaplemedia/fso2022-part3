import { useEffect, useState } from 'react'
import './index.css'
import phonebookService from './services/phonebook'

const Notification = ({ message, good = false }) => {
    if (message === null || message === "") {
        return null
    }
    
    return (
        <div className={good ? 'good' : 'error'}>
            {message}
        </div>
    )
}

const Filter = ({ handleFunction }) => (
    <div>
        <label htmlFor="filter">filter shown with </label>
        <input id="filter" onChange={handleFunction} />
    </div>
)

const AddNewPerson = ({ handleSubmit, handleName, handleNumber, personText }) => (
    <div>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">name: </label>
                <input id="name" value={personText.name} onChange={handleName} />
            </div>
            <div>
                <label htmlFor="number">number: </label>
                <input id="number" value={personText.number} onChange={handleNumber} />
            </div>
            <div>
                <button type="submit">add</button>
            </div>
        </form>
    </div>
)

const List = ({list, handleClick}) => (
    <div>
        {list.map(item => (
            <div key={item.id} style={{"display": "flex"}}>
                <p>{item.name}: {item.number}</p>
                <button onClick={() => handleClick(item.id)}>Remove</button>
            </div>
        ))}
    </div>
)

const App = () => {
    // Initializing phonebook array and filling it from db
    const [persons, setPersons] = useState([])
    useEffect(() => {
        phonebookService.getAll()
            .then(fetchedPersons =>
                setPersons(fetchedPersons)    
            )
    },[])

    // Initializing visible persons after filter
    const [personsToShow, setPersonsToShow] = useState([])
    useEffect(() => {
        filterText()
    // eslint-disable-next-line
    }, [persons])

    // Initializing the add person inputs with an empty person
    const emptyPerson = {
        name: '',
        number: ''
    }
    const [newPerson, setNewPerson] = useState(emptyPerson)

    //Notification state
    const [notification, setNotification] = useState(["", false])

    const addPerson = (e) => {
        e.preventDefault();
        const thisPerson = persons.find(person => person.name === newPerson.name)
        if (!thisPerson) {
            // setPersons(persons.concat({...newPerson}))
            phonebookService.create(newPerson)
                .then(fetchedPerson => {
                    setPersons(persons.concat(fetchedPerson))
                    setNotification([`${fetchedPerson.name} has been added to the phonebook.`, true])
                })
        } else {
            if (window.confirm(`Update ${thisPerson.name}'s number from ${thisPerson.number} to ${newPerson.number}?`)) {
                phonebookService.update(thisPerson.id, newPerson)
                    .then((fetchedPerson) => {
                        setPersons(persons.map(person => person.id !== fetchedPerson.id ? person : fetchedPerson))
                        setNotification([`${fetchedPerson.name}'s phonebook entry has been updated`, true])
                    })
                    .catch((error) =>  setNotification([`${JSON.parse(error.config.data).name}'s entry has already been removed`, false]) )
            }
        }
        setNewPerson(emptyPerson)
    }

    const deletePerson = (id) => {
        if (window.confirm(`Remove ${persons.find(person => person.id === id).name} from the phonebook?`)) {
            phonebookService.remove(id)
                .then(() => {
                    setNotification([`${persons.filter(person => person.id === id)[0].name}'s phonebook entry has been removed`, true])
                    setPersons(persons.filter(person => person.id !== id) )
                })
        }
    }

    const filterText = (e) => {
        // Allows for visible list to update when adding new person 
        if (e === undefined || e.target.value === "") {
            setPersonsToShow(persons)
        } else {
            setPersonsToShow(persons.filter(person => person.name.toLowerCase().includes(e.target.value.toLowerCase())))
        }
    }

    const updateTempName = (e) => setNewPerson({...newPerson, name: e.target.value})
    const updateTempNumber = (e) => setNewPerson({...newPerson, number: e.target.value})

    return (
        <div>
            <h1>Phonebook</h1>
            <Notification message={notification[0]} good={notification[1]} />
            <Filter handleFunction={filterText} />
            <h2>Add new</h2>
            <AddNewPerson
                handleSubmit={addPerson}
                handleName={updateTempName}
                handleNumber={updateTempNumber}
                personText={{
                    name: newPerson.name,
                    number: newPerson.number
                }}
            />
            <h2>Numbers</h2>
            <List list={personsToShow} handleClick={deletePerson} />
        </div>
    )
}

export default App