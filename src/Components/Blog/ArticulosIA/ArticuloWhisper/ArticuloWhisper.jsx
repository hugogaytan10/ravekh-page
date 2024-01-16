import React from 'react';
import { Link } from 'react-scroll';
import './ArticuloWhisper.css';
import whisper from './imgs/whisper.jpg';
import whisperBanner from './imgs/whisperBanner.jpg';

export const ArticuloWhisper = () => {
  // Contenido de cada sección
  const secciones = [
    {
      id: 'seccion-ia',
      titulo: '¿Qué es la Inteligencia Artificial (IA)?',
      contenido: [
        'La Inteligencia Artificial es un fascinante campo de la informática que busca replicar la inteligencia humana en máquinas.',
        'Está compuesta por diversas disciplinas, como el aprendizaje automático, el procesamiento del lenguaje natural y la visión por computadora.',
        'En la práctica, la IA se despliega en una variedad de aplicaciones, desde sistemas de recomendación en plataformas de streaming hasta la automatización de procesos en la industria.',
        'Uno de los objetivos clave de la IA es permitir a las máquinas aprender y adaptarse a partir de datos, mejorando su rendimiento con el tiempo.',
        'Este emocionante campo está en constante evolución, abriendo nuevas posibilidades para la resolución de problemas complejos y la creación de tecnologías innovadoras.'
      ]
    },
    {
      id: 'seccion-whisper',
      titulo: '¿Qué es Whisper?',
      contenido: [
        'Whisper, desarrollado por OpenAI, es una poderosa librería que se encuentra en la vanguardia del procesamiento del lenguaje natural.',
        'A diferencia de otras soluciones, Whisper no solo procesa texto, sino que comprende y genera contenido de manera contextualmente coherente.',
        'Esto significa que puede entender el contexto de una conversación y responder de manera más natural y significativa.',
        'Utilizando modelos de lenguaje avanzados, Whisper ha demostrado ser invaluable en la creación de asistentes virtuales más inteligentes, enriqueciendo la interacción humano-máquina y elevando la calidad de las aplicaciones basadas en texto a nuevas alturas.'
      ]
    },
    {
      id: 'seccion-django',
      titulo: '¿Qué es Django?',
      contenido: [
        'Django es un marco de desarrollo web de alto nivel, diseñado para facilitar la creación rápida y sencilla de aplicaciones web robustas.',
        'Desarrollado en Python, Django sigue el principio de "baterías incluidas", proporcionando un conjunto de herramientas y características esenciales para el desarrollo web sin tener que reinventar la rueda.',
        'Con su sistema de administración integrado, un potente ORM para interactuar con bases de datos y una estructura de enrutamiento clara, Django simplifica el desarrollo, permitiéndote enfocarte en la lógica de la aplicación en lugar de tareas repetitivas.',
        'Es ideal para proyectos de todos los tamaños, desde pequeñas aplicaciones hasta sitios web empresariales a gran escala.',
        <div key="codigo-django" className="rounded-lg p-4 bg-gray-800 text-white my-4">
          <p className="text-gray-300 mb-2"># Instala Django utilizando pip</p>
          <code className="text-green-300">$ pip install Django</code>
        </div>
      ]
    },
    {
      id: 'seccion-drf',
      titulo: 'Cómo usar Django Rest Framework',
      contenido: [
        'Django Rest Framework (DRF) amplía las capacidades de Django para construir potentes API REST.',
        'Después de instalar DRF, puedes comenzar a definir modelos de datos, serializadores y vistas para crear tu API.',
        'DRF simplifica tareas comunes, como la autenticación de usuarios, autorización y validación de datos, lo que acelera el desarrollo y garantiza la seguridad de tu API.',
        'Además, DRF ofrece navegación interactiva, facilitando la exploración y prueba de tu API.',
        'Ya sea que estés construyendo una API para tu aplicación web o creando un backend independiente, Django Rest Framework se destaca como una herramienta esencial para facilitar el desarrollo de servicios web potentes y escalables.'
      ]
    },
    {
      id: 'seccion-imp',
      titulo: 'Implementación de Whisper en Django',
      contenido: [
        'Primeramente, necesitamos trabajar en un entorno virtual. Para ello, ejecutamos el siguiente comando en la terminal:',
        <div key="codigo-venv" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Crea un entorno virtual (el nombre puede ser cualquiera, en este caso sera venv)</p>
          <code className="text-green-300">$ python -m venv venv</code>
        </div>,
        'Luego, activamos el entorno virtual:',
        <div key="codigo-venv-act" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Activa el entorno virtual</p>
          <code className="text-green-300">$ source venv/scripts/activate</code>
        </div>,
        'Ahora, instalamos Django y DRF:',
        <div key="codigo-drf" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Instala Django y DRF</p>
          <code className="text-green-300">$ pip install Django djangorestframework</code>
        </div>,
        'Ocupamos instalar las siguientes librerías:',
        <div key="codigo-librerias" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Instala las librerías</p>
          <code className="text-green-300">$ pip install django-cors-headers coreapi moviepy openai tiktoken pytube</code>
        </div>,
        'Las librerías que acabamos de instalar son las siguientes:',
        <ul key="librerias" className="menu w-full rounded-box">
          <li><a href='https://pypi.org/project/django-cors-headers/' target='_blank'>django-cors-headers: para permitir solicitudes de origen cruzado</a></li>
          <li><a href='https://www.coreapi.org/' target='_blank'>coreapi: para generar documentación de API</a></li>
          <li><a href='https://pypi.org/project/moviepy/' target='_blank'>moviepy: para procesar videos</a></li>
          <li><a href='https://pypi.org/project/openai/' target='_blank'>openai: para usar Whisper</a></li>
          <li><a href='https://pypi.org/project/tiktoken/' target='_blank'>tiktoken: para obtener los tokens de la solicitud</a></li>
          <li><a href='https://pytube.io/en/latest/' target='_blank'>pytube: para descargar videos de YouTube</a></li>
        </ul>,
        'Luego, creamos un proyecto de Django:',
        <div key="codigo-proyecto" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Crea un proyecto de Django</p>
          <code className="text-green-300">$ django-admin startproject whisper .</code>
        </div>,
        'El punto al final del comando anterior indica que el proyecto se creará en el directorio actual.',
        'Ahora, creamos una aplicación llamada api:',
        <div key="codigo-app" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Crea una aplicación llamada api</p>
          <code className="text-green-300">$ django-admin startap api</code>
        </div>,
        'Luego, agregamos api a INSTALLED_APPS en settings.py:',
        <div key="codigo-installed-apps" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Agrega api a INSTALLED_APPS</p>
          <code className="text-green-300">INSTALLED_APPS = [<br />...<br />'api',<br />]</code>
        </div>,
        'Agrgamos las demas apps a INSTALLED_APPS:',
        <div key="codigo-installed-apps2" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Agrega las demas apps a INSTALLED_APPS</p>
          <code className="text-green-300">INSTALLED_APPS = [<br />...<br />'rest_framework',<br />'corsheaders',<br />'coreapi',<br />'openai',<br />'tiktoken',<br />'pytube',<br />'moviepy',<br /> ]</code>
        </div>,
        'Agregamos corsheaders.middleware.CorsMiddleware a MIDDLEWARE:',
        <div key="codigo-middleware" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Agrega corsheaders.middleware.CorsMiddleware a MIDDLEWARE</p>
          <code className="text-green-300">MIDDLEWARE = [<br />...<br />'corsheaders.middleware.CorsMiddleware',<br />]</code>
        </div>,
        'Agregamos CORS_ORIGIN_ALLOW_ALL = True a settings.py:',
        <div key="codigo-cors" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Agrega CORS_ORIGIN_ALLOW_ALL = True</p>
          <code className="text-green-300">CORS_ORIGIN_ALLOW_ALL = True</code>
        </div>,
        'Agregamos lo siguiente a settings.py para que funcione la documentación del api:',
        <div key="codigo-rest" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <code className="text-green-300">REST_FRAMEWORK = &#123;<br />&nbsp;&nbsp;"DEFAULT_SCHEMA_CLASS": "rest_framework.schemas.coreapi.AutoSchema"<br />&#125;</code>
        </div>,
        'Whitelist de CORS:',
        <div key="codigo-whitelist" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <code className="text-green-300">CORS_ORIGIN_WHITELIST = [<br />&nbsp;&nbsp;"http://localhost:3000",<br />]</code>
        </div>,
        'Aqui agrega la dirección IP de tu frontend',
        <br />,
        'Como no tenemos un modelo como tal, dependiendo de la API que quieras hacer, puedes crear un modelo o no.',
        'En este caso, no crearemos un modelo, ya que solo usaremos la API de Whisper.',
        'Lo mismo con las serializaciones, dependiendo de la API que quieras hacer, puedes crear una serialización o no.',
        'Un modelo es una clase que define la estructura de los datos, mientras que una serialización es una clase que convierte los datos en un formato que se puede almacenar o transmitir.',
        'En views.py, importamos las librerías que vamos a usar:',
        <div key="codigo-importaciones" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Importa las librerías</p>
          <code className="text-green-300">
            from rest_framework import viewsets<br />
            from rest_framework.response import Response<br />
            from rest_framework.decorators import action<br />
            from openai import OpenAI<br />
            import tiktoken<br />
            from moviepy.editor import VideoFileClip<br />
            from pytube import YouTube<br />
            import os
          </code>
        </div>,
        'Agrega tu token de OpenAI:',
        <div key="codigo-token" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Agrega tu token de OpenAI</p>
          <code className="text-green-300">client = OpenAI( <br />
            &nbsp;&nbsp;api_key="YOUR_API_KEY",<br />
            )<br />
          </code>
        </div>,
        'Agrega los path para el video y audio:',
        <div key="codigo-path" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Agrega los path para el video y audio</p>
          <code className="text-green-300">video_path = os.path.abspath("video.mp4")<br />
            audio_path = os.path.abspath("audio.mp3")<br />
          </code>
        </div>,
        'Crea una funcion para extraer el audio del video:',
        <div key="codigo-audio" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Crea una funcion para extraer el audio del video</p>
          <code className="text-green-300">def extraer_audio(video_path, audio_path):<br />
            &nbsp;&nbsp;video_clip = VideoFileClip(video_path)<br />
            &nbsp;&nbsp;audio_clip = video_clip.audio<br />
            &nbsp;&nbsp;audio_clip.write_audiofile(audio_path, codec='mp3', bitrate='16k')<br />
            &nbsp;&nbsp;audio_clip.close()<br />
            &nbsp;&nbsp;video_clip.close()<br />
          </code>
        </div>,
        'Ahora es momento de crear las vistas, una vista es una función que recibe una solicitud y devuelve una respuesta.',
        'Primero, creamos una clase llamada TranscriptionViewSet, que hereda de viewsets.ViewSet:',
        <div key="codigo-viewset" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Crea una clase llamada TranscriptionViewSet</p>
          <code className="text-green-300">class TranscriptionViewSet(viewsets.ViewSet):<br />
          </code>
        </div>,
        'Luego creamos una accion de tipo POST:',
        <div key="codigo-post" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Crea una accion de tipo POST</p>
          <code className="text-green-300">&nbsp;&nbsp;@action(detail=False, methods=["post"])<br />
          </code>
        </div>,
        'Agregamos la funcion de la accion:',
        <div key="codigo-funcion" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Agrega la funcion de la accion</p>
          <code className="text-green-300">&nbsp;&nbsp;def transcription(self, request):<br />
          </code>
        </div>,
        'Obtenemos el id del video y un lenguaje de la solicitud, es recomendable hacer esto dentro de un try, por si no se encuentran los parametros en el cuerpo de la solicitud:',
        <div key="codigo-try" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Obten el id del video y un lenguaje de la solicitud</p>
          <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;try:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;id_video = request.data.get('id_video')<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;language = request.data.get('language')<br />
            &nbsp;&nbsp;&nbsp;&nbsp;except KeyError:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return Response(<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'mensaje': 'Parámetros incorrectos'<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;, status=400<br />
            &nbsp;&nbsp;&nbsp;&nbsp;)<br />
          </code>
        </div>,
        'Despues de obtener el id del video, descargamos el video de YouTube, dentro de un try, por si no se encuentra el video o surge otro error:',
        <div key="codigo-youtube" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Crea el objeto YouTube con el id del video</p>
          <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;try:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url = 'https://www.youtube.com/watch?v='+id_video<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;youtube = YouTube(url)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;video = youtube.streams.get_lowest_resolution()<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;video.download(filename="video.mp4")<br />
          </code>
        </div>,
        'Extraemos el audio del video:',
        <div key="codigo-extract" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Extrae el audio del video</p>
          <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;extraer_audio(video_path, audio_path)<br />
          </code>
        </div>,
        'Ahora, creamos una variable llamada result, que es igual a la respuesta de la API de Whisper:',
        <div key="codigo-whisper" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Crea una variable llamada result</p>
          <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;result = client.audio.transcriptions.create(<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;model="whisper-1",<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;file=open("audio.mp3", "rb")<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br />
          </code>
        </div>,
        'Obtenemos el texto de la variable result:',
        <div key="codigo-texto" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Obten el texto de la variable result</p>
          <code className="text-green-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;texto_transcrito = result.text<br />
          </code>
        </div>,
        'Generamos un prompt, que es el texto que le pasaremos a OpenAI para que genere el texto y lo traduzca:',
        <div key="codigo-prompt" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Genera un prompt</p>
          <code className="text-green-300">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prompt = f""" Translate the following text to {'{language}'}, ensuring<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;that the translation accurately conveys the original meaning.<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Pay attention to nuances and context, and provide a clear and<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;coherent {'{language}'} rendition of the content. """<br />
          </code>
        </div>,
        'El prompt es escrito en inglés para que sea más fácil para OpenAI traducirlo.',
        <br />,
        'Generamos una variable llamada request, que incluye el prompt y el texto transcrito:',
        <div key="codigo-request" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Genera una variable llamada request</p>
          <code className="text-green-300">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;request = prompt + texto_transcrito<br />
          </code>
        </div>,
        'Ya que los modelos de chatGpt no miden por palabras o longitud, sino por tokens, usaremos la biblioteca de TikToken para obtener el número de tokens del texto transcrito y así poder saber que modelo usar:',
        <div key="codigo-tokens" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Usa la biblioteca de TikToken para obtener el número de tokens del texto transcrito</p>
          <code className="text-green-300">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;modelTokens = ''<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;enc = tiktoken.encoding_for_model('gpt-3.5-turbo')<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if len(enc.encode(request)) {'<'} 4097:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;modelTokens = 'gpt-3.5-turbo'<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;modelTokens = 'gpt-3.5-turbo-16k'<br />
          </code>
        </div>,
        'Llamamos a chat_completition de OpenAI, para que genere la respuesta:',
        <div key="codigo-chat" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Llama a chat_completition de OpenAI</p>
          <code className="text-green-300">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;chat_completion = client.chat_completions.create(<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;messages=[<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role": 'user',<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"content": request<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;model=modelTokens,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;stream=true,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br />
          </code>
        </div>,
        'El stream es para recuperar la respuesta más fácilmente.',
        <br />,
        'Se genera una variable response vacia para rescatar la respuesta de los streams, un objeto JSON llamado datos_transcripcion, removemos el archivo de audio y video, y retornamos la respuesta de la API de Whisper:',
        <div key="codigo-response" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Genera una variable response vacia</p>
          <code className="text-green-300">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;response = ''<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for chunk in chat_completion:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;response += chunk.choices[0].delta.content<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;datos_transcripcion = {'{'}<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"transcripcion": response<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.remove(audio_path)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.remove(video_path)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return Response(datos_transcripcion)<br />
          </code>
        </div>,
        'Si ocurre un error, se remueven los archivos de audio y video, y se retorna un mensaje de error:',
        <div key="codigo-error" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <p className="text-gray-300 mb-2"># Si ocurre un error, remueve los archivos de audio y video</p>
          <code className="text-green-300">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;except Exception as e:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if os.path.exists(video_path):<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.remove(video_path)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if os.path.exists(audio_path):<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.remove(audio_path)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return Response(<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'mensaje': f'Problemas al generar transcripción - {'{str(e)}'}'<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;, status=400<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br />
          </code>
        </div>,
        'El código completo se vería así de momento:',
        <br />,
        <div className="collapse collapse-plus bg-base-200">
          <input type="checkbox" name="my-accordion-1" />
          <div className="collapse-title text-xl font-medium blanco">
            Presiona aqui para ver el código
          </div>
          <div className="collapse-content">
            <div key="codigo-viewset-completo" className="rounded-lg w-full bg-gray-800 text-white">
              <code className="text-green-300">
                from rest_framework import viewsets<br />
                from rest_framework.response import Response<br />
                from rest_framework.decorators import action<br />
                from openai import OpenAI<br />
                import tiktoken<br />
                from moviepy.editor import VideoFileClip<br />
                from pytube import YouTube<br />
                import os<br />
                client = OpenAI( <br />
                &nbsp;&nbsp;api_key="YOUR_API_KEY",<br />
                )<br />
                video_path = os.path.abspath("video.mp4")<br />
                audio_path = os.path.abspath("audio.mp3")<br />
                def extraer_audio(video_path, audio_path):<br />
                &nbsp;&nbsp;video_clip = VideoFileClip(video_path)<br />
                &nbsp;&nbsp;audio_clip = video_clip.audio<br />
                &nbsp;&nbsp;audio_clip.write_audiofile(audio_path, codec='mp3', bitrate='16k')<br />
                &nbsp;&nbsp;audio_clip.close()<br />
                &nbsp;&nbsp;video_clip.close()<br />
                class TranscriptionViewSet(viewsets.ViewSet):<br />
                &nbsp;&nbsp;@action(detail=False, methods=["post"])<br />
                &nbsp;&nbsp;def transcription(self, request):<br />
                &nbsp;&nbsp;&nbsp;&nbsp;try:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;id_video = request.data.get('id_video')<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;language = request.data.get('language')<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;try:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url = 'https://www.youtube.com/watch?v='+id_video<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;youtube = YouTube(url)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;video = youtube.streams.get_lowest_resolution()<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;video.download(filename="video.mp4")<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;extraer_audio(video_path, audio_path)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;result = client.audio.transcriptions.create(<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;model="whisper-1",<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;file=open("audio.mp3", "rb")<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;texto_transcrito = result.text<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prompt = f""" Translate the following text to {'{language}'}, ensuring<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;that the translation accurately conveys the original meaning.<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Pay attention to nuances and context, and provide a clear and<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;coherent {'{language}'} rendition of the content. """<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;request = prompt + texto_transcrito<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;modelTokens = ''<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;enc = tiktoken.encoding_for_model('gpt-3.5-turbo')<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if len(enc.encode(request)) {'<'} 4097:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;modelTokens = 'gpt-3.5-turbo'<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;modelTokens = 'gpt-3.5-turbo-16k'<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;chat_completion = client.chat_completions.create(<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;messages=[<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role": 'user',<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"content": request<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;model=modelTokens,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;stream=true,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;response = ''<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for chunk in chat_completion:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;response += chunk.choices[0].delta.content<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;datos_transcripcion = {'{'}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"transcripcion": response<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.remove(audio_path)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.remove(video_path)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return Response(datos_transcripcion)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;except Exception as e:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if os.path.exists(video_path):<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.remove(video_path)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if os.path.exists(audio_path):<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.remove(audio_path)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return Response(<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'mensaje': f'Problemas al generar transcripción - {'{str(e)}'}'<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;, status=400<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;except KeyError:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return Response(<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'mensaje': 'Parámetros incorrectos'<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;, status=400<br />
                &nbsp;&nbsp;&nbsp;&nbsp;)<br />
              </code>
            </div>
          </div>
        </div>,
        <br />,
        'Te recomendamos revises la identación del código, ya que en el artículo no se muestra correctamente.',
        <br />,
        'Ahora, dentro de api, creamos un archivo llamado urls.py, y agregamos las siguientes rutas e importaciones:',
        <div key="codigo-urls" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <code className="text-green-300">
            from django.urls import path, include<br />
            from rest_framework import routers<br />
            from api import views<br />
            <br />
            router = routers.DefaultRouter()<br />
            <br />
            urlpatterns = [<br />
            &nbsp;&nbsp;path('', include(router.urls)),<br />
            &nbsp;&nbsp;path(<br />
            &nbsp;&nbsp;&nbsp;&nbsp;'whisper/transcripcion/', <br />
            &nbsp;&nbsp;&nbsp;&nbsp;views.TranscriptionViewSet.as_view{"({'post': 'transcription'})"}, <br />
            &nbsp;&nbsp;&nbsp;&nbsp;name='transcription'<br />
            &nbsp;&nbsp;),<br />
            ]<br />
          </code>
        </div>,
        'Este codigo es para que podamos acceder a la API de Whisper desde el frontend, el name es para poder acceder a la ruta desde el frontend mientras que el as_view es para que podamos acceder a la vista.',
        <br />,
        'Ahora pasamos a urls.py, pero en la carpeta whisper, y agregamos la ruta de la API de Whisper:',
        <div key="codigo-urls2" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <code className="text-green-300">
            from django.contrib import admin<br />
            from django.urls import path, include<br />
            from rest_framework.documentation import include_docs_urls<br />
            <br />
            urlpatterns = [<br />
            &nbsp;&nbsp;path('admin/', admin.site.urls),<br />
            &nbsp;&nbsp;path('api/', include('api.urls'))<br />
            &nbsp;&nbsp;path('docs/', include_docs_urls(title='DOCUMENTACION API')),<br />
            ]<br />
          </code>
        </div>,
        'Cada ruta tiene una función, la ruta de admin es para acceder al administrador de Django, la ruta de api es para acceder a la API de Whisper, y la ruta de docs es para acceder a la documentación de la API.',
        <br />,
        'Si se tienen modelos, se registrarian las migraciones, creando una base de datos, pero como no tenemos modelos, no es necesario.',
        <br />,
        'Si queremos versionar nuestra API, podemos hacerlo con Git, para ello, creamos un archivo llamado .gitignore, y agregamos las siguientes lineas:',
        <div key="codigo-gitignore" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <code className="text-green-300">
            # Virtual environment<br />
            venv/<br />
            <br />
            # Byte-compiled / optimized / DLL files<br />
            __pycache__/<br />
            *.pyc<br />
            *.pyo<br />
            *.pyd<br />
            <br />
            # Django<br />
            *.log<br />
            db.sqlite3<br />
            <br />
            # API<br />
            api/__pycache__/<br />
            api/migrations/<br />
            <br />
            # DRF<br />
            drf/__pycache__/<br />
            drf/migrations/<br />
          </code>
        </div>,
        'Esto es para que no se suban archivos innecesarios a nuestro repositorio.',
        <br />,
        'Para recuperar las dependencias de nuestro proyecto, ejecutamos el siguiente comando:',
        <div key="codigo-dependencias" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <code className="text-green-300">
            $ pip freeze {">"} requirements.txt<br />
          </code>
        </div>,
        'Esto creara un archivo llamado requirements.txt, que contiene las dependencias de nuestro proyecto.',
        <br />,
        'Ahora para iniciar el servidor, ejecutamos el siguiente comando:',
        <div key="codigo-servidor" className="rounded-lg p-4 bg-gray-800 text-white my-4 overflow-x-auto">
          <code className="text-green-300">
            $ python manage.py runserver<br />
          </code>
        </div>,
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="hero min-h-screen blanco" style={{ backgroundImage: `url(${whisperBanner})`, maxWidth: '100%', overflowX: 'hidden' }}>
        <div className="hero-overlay bg-opacity-90"></div>
        <div className="hero-content flex-col lg:flex-row-reverse max-w-3xl mx-auto">
          <img src={whisper} className="max-w-sm rounded-lg shadow-2xl" alt="Whisper Library" />
          <div className="max-w-full">
            <h1 className="text-5xl font-bold p-6 ">Descubriendo Whisper: La Revolucionaria Librería de OpenAI</h1>
            <p className="p-6 justo">
              En este artículo, nos sumergiremos en el fascinante mundo de Whisper de OpenAI. Descubrirás de cerca cómo esta innovadora biblioteca funciona y, lo que es aún más emocionante, aprenderás a integrarla fácilmente en tus proyectos de programación, sin importar su naturaleza o complejidad.
            </p>
            <p className='p-6 justo'>
              Whisper va más allá de ser simplemente una librería; es una herramienta que puede potenciar de manera significativa tus desarrollos. Únete a nosotros en este fascinante recorrido mientras desvelamos los secretos de Whisper y exploramos cómo puede elevar la calidad y eficiencia de tus proyectos hacia nuevos horizontes. Prepárate para descubrir y aprovechar todo el potencial de esta notable incorporación a la familia de OpenAI. ¡El futuro de tus proyectos está a punto de dar un salto cuántico!
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 p-6 max-w-3xl mx-auto">
        <ul className="menu bg-neutral w-56 rounded-box space-y-4 my-6">
          <li>
            <h2 className="menu-title blanco">Contenido</h2>
            <ul>
              {secciones.map((seccion) => (
                <li key={seccion.id}>
                  <Link to={seccion.id} smooth={true} duration={500} className="link link-hover blanco">{seccion.titulo}</Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>

        {secciones.map((seccion) => (
          <section key={seccion.id} id={seccion.id} className="mb-8">
            <h2 className="text-3xl font-semibold mb-4">{seccion.titulo}</h2>
            {seccion.contenido.map((parrafo, index) => (
              <p key={index} className="text-gray-700">{parrafo}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

