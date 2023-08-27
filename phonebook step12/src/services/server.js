import axios from "axios";
const baseUrl = "/api/persons"

const create = newPerson => axios.post(baseUrl, newPerson)
const update = (id, changedPerson) => axios.put(`${baseUrl}/${id}`, changedPerson)
const get = () => axios.get(baseUrl)
const deletePerson = id => axios.delete(`${baseUrl}/${id}`)

export default { create, get, deletePerson, update }
