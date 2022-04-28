import express from 'express';


import fetch from 'node-fetch';

const app = express();


let movies = []


const loadMovies = async () => {

   const response = await fetch('https://ghibliapi.herokuapp.com/films')
   const data = await response.json()

   if (data) {
        movies = data
   }
}

const loadSpecies = async (speciesUrls) => {
    const speciesCallbacks = speciesUrls.map((specie) => fetch(specie).then(r => r.json()))   
    return await Promise.all(speciesCallbacks)
}

const loadMovie = async (id) => {

    const response = await fetch(`https://ghibliapi.herokuapp.com/films/${id}`)
    const movie = await response.json()
 
    const species = await loadSpecies(movie.species)

    const { locations, vehicles, url, people, ...details} = movie
   

    return {
      ...details,
      species: species?.map?.(speciesItem => speciesItem.name)
    }

 }

 const objectToFields = (dataObject) => {
  const keys = Object.keys(dataObject)

  const fields = keys.map(key => ({
    name: key,
    value: dataObject[key]
  }))
    return fields
 }

 const Detail = (fields) => `<div><ul>${fields.map(field => `<li  style="padding:0.5em">${field.name}: ${field.value}`)}</ul></div>`

const DetailPage = (title, fields) => `<div><h2>${title}</h2>${Detail(fields)}</div>`


 const HelloPage = (endpoints) => `<div><h2>Hello</h2><p>Endpoints</p><ul>${endpoints.map(endpoint => `<li><b>${endpoint.method}: ${endpoint.path}</b></li>`)}</ul></div>`


 app.get('/', (req, res) => {

    let endpoints = []

    app._router.stack.forEach(function(r){
        if (r.route && r.route.path && r.route.methods){
         endpoints.push({
             method: Object.keys(r.route.methods)?.[0]?.toUpperCase(),
             path: r.route.path
         })   
        }
      })

  return res.send(HelloPage(endpoints));
});





app.get('/films/:name', async (req, res) => {
    let data = {}

    const movie = movies.find(movie => {
      return movie?.title == req.params?.name
    })

 

    if (movie) {
      try {
        data = await loadMovie(movie.id)

      
      } catch (error) {
        res.status(500).send({ error  })
      }

    } else {
      res.status(500).send({ error: 'Something failed!' })
    }

  return res.send(DetailPage(movie.title, objectToFields(data)));
});



app.listen(8000, () => {

    loadMovies();
  return console.log(`Example app listening on port 8000!`)
});