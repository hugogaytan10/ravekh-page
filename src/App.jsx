import './App.css'
import { Banner } from './Components/Banner/Banner'
import { BannerSecundario } from './Components/BannerSecundario/BannerSecundario'
import { Contacto } from './Components/Contacto/Contacto'
import { Productos } from './Components/Producto/Productos'
import { Caracteristicas } from './Components/Caracteristicas/Caracteristicas'
import { Footer } from './Components/Footer/Footer'
import { Muestra } from './Components/Muestra/Muestra'
import logoWhasa from './assets/logo-whatsapp.svg'
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
    <div className='flex overflow-hidden flex-wrap'>
      <Banner />
      <BannerSecundario />
      <Caracteristicas />
      <Productos />
      <Muestra />
      <Contacto />
      <Footer />
      <div className='bg-color-whats rounded-full p-1 fixed right-2 bottom-4'>
        <a
          href='https://api.whatsapp.com/send?phone=524451113370'
        >
          <img src={logoWhasa} alt="WS" />
        </a>
      </div>
    </div>
  )
}

export default App
