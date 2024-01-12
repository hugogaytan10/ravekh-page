const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');


const app = express();
app.use(cors());

const PORT = 3001; // Puedes cambiar el puerto según tus preferencias

app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
    const RESEND_API_KEY = 're_RyLYLXHN_L43ptRJBzPog9fFDhCqFqGHF';

    try {
        const apiRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(req.body),
        });

        const data = await apiRes.json();

        // Devuelve la respuesta del servidor de la API pública
        res.json(data);
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor intermedio escuchando en el puerto ${PORT}`);
});
