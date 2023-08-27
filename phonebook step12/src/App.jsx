import { useState, useEffect } from 'react'
import server from "./services/server"


const Filter = (props) => {
  const handleChangeFilter = (event) => {
    props.setNewInput(event.target.value)
  }

  return (
    <div>
        filter shown with <input onChange={handleChangeFilter}/>
    </div>
  )
}

const PersonForm = (props) => {

  const handleChangeInput = (event) => {
    props.setNewName(event.target.value)
  }

  const handleChangeNumber = (event) => {
    props.setNewNum(event.target.value)
  }

  return (
    <div>
      <form>
        <div>
          name: <input onChange={handleChangeInput} value={props.newName}/>
        </div>
        <div>
          number: <input onChange={handleChangeNumber} value={props.newNum}/>
        </div>
        <div>
          <button type="submit" onClick={props.handleSubmit}>add</button>
        </div>
      </form>
    </div>
  )
}

const Persons = (props) => {


  const handleDelete = (id) => {

    const personToDelete = props.persons.find((person) => {
      if(person.id === id) return true
    })

    console.log(id)

    if(confirm(`Delete ${personToDelete.name} ?`)) {
      server.deletePerson(id)
      .then(() => { })
      .catch(() => {
        props.setMessage({message: `Information of ${personToDelete.name} has already been removed from server`, success: false})})
        server.get()
        .then(response => {
        props.setPersons(response.data)
      })
    } else {
      return;
    }
  
    
   
  }

  return (
    <div>
        {props.personsToShow.map((person) => {
           return (
            <div key={person.id}>
              <>{person.name} {person.number}</>
              <button onClick={() => {handleDelete(person.id)}} id={person.id}>delete</button>
            </div>
           )
        })}
    </div>
  )
}

const Notification = (props) => {

  const successStyle = {
    color: "green",
    fontSize: 20,
    padding: "20px 5px"
  }

  const errorStyle = {
    color: "red",
    fontSize: 20,
    padding: "20px 5px"
  }

  if(!props.message) {
    return
  }

  if(props.message.success) {
    return  (
      <div style={successStyle}>
        {`${props.message.message}`}    
      </div>
    )
  } else {
    return (
      <div style={errorStyle}>
       {`${props.message.message}`}        
      </div>
    )
  }

  
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNum, setNewNum] = useState('')
  const [newInput, setNewInput] = useState('')
  const [message, setMessage] = useState(null)


  useEffect(() => {
    server.get()
    .then(response => {
      setPersons(response.data)
    })
  }, [])


  const handleSubmit = (event) => {
    event.preventDefault()
    let isTwice = false;

    persons.find((ele) => {
      if (ele.name === newName) {
        isTwice = true;
        return true;
      } else {
        return false;
      }
    })

    if(isTwice) {
      if(confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const personToUpdate = persons.find(person => {
          if(person.name === newName) {
            return true
          } else {
            return false
          }
        })
        console.log(personToUpdate)
        
        const updatedPerson = {...personToUpdate, number: newNum}
        server.update(updatedPerson.id, updatedPerson).then((res) => {
          setMessage({message: `Changed Number from ${updatedPerson.name}`, success: true})
          setTimeout(() => {
            setMessage(null)
          }, 3000)
          server.get().then((res) => {
            setPersons(res.data)
            setNewName("")
            setNewNum("")
          })
        })

      } else {
        return;
      }
    } else {
      server.create({name : newName, number: newNum})
      .then((res) => {
        setMessage({message: `Added ${newName}`, success: true})
        setTimeout(() => {
          setMessage(null)
        }, 3000)
        setPersons(persons.concat({name : newName, number: newNum, id:res.data.id}))
        setNewName("")
        setNewNum("")
      })
      .catch(err => {
        console.log(err.response.data.error)
        setMessage({message: err.response.data.error, success: false  })
        setTimeout(() => {
          setMessage(null)
        }, 3000)
      })

    }
  }

  const personsToShow = !newInput ? persons : persons.filter(person => person.name.toLowerCase().includes(newInput.toLowerCase()));
 
  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={message} setMessage={setMessage}/>

      <Filter setNewInput={setNewInput} />

      <h3>Add a new</h3>

      <PersonForm setNewNum={setNewNum} setNewName={setNewName} newName={newName} newNum={newNum} handleSubmit={handleSubmit}/>

      <h3>Numbers</h3>

      <Persons message={message} setMessage={setMessage} persons={persons} setPersons={setPersons} personsToShow={personsToShow}/>
    </div>
  )
}

export default App