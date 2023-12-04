import './App.css'
import { Banner } from './Components/Banner'
import { BannerSecundario } from './Components/BannerSecundario'
import { Contacto } from './Components/Contacto'
import { Productos } from './Components/Productos'
import { Caracteristicas } from './Components/Caracteristicas'

function App() {

  return (
    <>
      <Banner />
      <BannerSecundario/>
      <Caracteristicas/>
      <Productos/>
      <Contacto/>
    </>
  )
}

export default App
