import './App.css'
import { Banner } from './Components/Banner'
import { BannerSecundario } from './Components/BannerSecundario'
import { Contacto } from './Components/Contacto'
import { Productos } from './Components/Productos'
import { Caracteristicas } from './Components/Caracteristicas'
import { Footer } from './Components/Footer'
window.addEventListener('scroll', function () {
  let elements = document.getElementsByClassName('scroll-content');
  let screenSize = window.innerHeight;
  
  for (const item of elements) {
    let element = item;

    if (element.getBoundingClientRect().top < screenSize - 200) {
      element.classList.add('visible');
    } else {
      element.classList.remove('visible');
    }
  }

});
function App() {

  return (
    <>
      <Banner />
      <BannerSecundario/>
      <Caracteristicas/>
      <Productos/>
      <Contacto/>
      <Footer/>
    </>
  )
}

export default App
