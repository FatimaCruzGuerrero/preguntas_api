const API_KEY = "AIzaSyBOQsQ7pvjPmTymvQ1e7adlmjn-0LiSGcU";
const MODEL = "gemini-2.5-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

let correctas = 0;
let incorrectas = 0;

function cargarContadores() {
    correctas = parseInt(localStorage.getItem("correctas")) || 0;
    incorrectas = parseInt(localStorage.getItem("incorrectas")) || 0;
    document.getElementById("correctas").textContent = correctas;
    document.getElementById("incorrectas").textContent = incorrectas;
}

function guardarContadores() {
    localStorage.setItem("correctas", correctas);
    localStorage.setItem("incorrectas", incorrectas);
}

async function generaPregunta() {
    const temas = [
        "concepto de arreglo y operaciones sobre arreglos",
        "concepto de diccionarios y funciones básicas",
        "operadores lógicos, aritméticos, de comparación, ternario",
        "uso de la consola para debuggear",
        "funciones con parámetros por default"
    ];

    const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];

    const prompt = `En el contexto de JavaScript, CSS y HTML. Genera una pregunta de opción múltiple sobre el siguiente tema ${temaAleatorio}. Proporciona cuatro opciones de respuesta y señala cuál es la correcta.    
        Genera la pregunta y sus posibles respuestas en formato JSON como el siguiente ejemplo, asegurándote de que el resultado SÓLO contenga el objeto JSON y no texto adicional enseguida te doy dos ejemplos:  
        1. Sobre arreglos en JavaScript:
        {
            "question": "¿Cuál de los siguientes métodos agrega un elemento al final de un arreglo en JavaScript?",
            "options": [
            "a) shift()",
            "b) pop()",
            "c) push()",
            "d) unshift()",
            ],
            "correct_answer": "c) push()",
            "explanation": "El método push() agrega uno o más elementos al final de un arreglo y devuelve la nueva longitud del arreglo."
        }
            2. Sobre eventos en JavaScript:
        {
            "question": "¿Cuál de los siguientes eventos se dispara cuando un usuario hace clic en un elemento HTML?",
            "options": [
            "a) onmouseover",
            "b) onclick",
            "c) onload",
            "d) onsubmit"
            ],
            "correct_answer": "b) onclick",
            "explanation": "El evento 'onclick' se dispara cuando un usuario hace clic en un elemento HTML, permitiendo ejecutar funciones en respuesta a ese clic."
        }
            
    `;

    try {
        const response = await fetch(
            url,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    // Opcional: añadir la configuración de generación
                    generationConfig: {
                        temperature: 0.25,
                        responseMimeType: "application/json"
                    },
                }),
            }
        );

        // Manejo de errores de HTTP
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log("Respuesta transformada a json:", data);


        // Extracción simple del texto de la respuesta, asumiendo que la respuesta tiene al menos una 'candidate' y 'part'     
        const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        const textResultTrimmed = textResult.trim();
        const firstBraceIndex = textResultTrimmed.indexOf('{');
        const lastBraceIndex = textResultTrimmed.lastIndexOf('}');
        const jsonString = textResultTrimmed.substring(firstBraceIndex, lastBraceIndex + 1);


        if (jsonString) {            
            const questionData = JSON.parse(jsonString);
            console.log(questionData);
            return questionData;
        } else {
            console.log("No se pudo extraer el texto de la respuesta.");
        }

    } catch (error) {
        console.error("Hubo un error en la petición:", error);
        document.getElementById('question').textContent = 'Error al cargar la pregunta. Por favor, revisa la clave API o la consola.';
        return null;
    }
}

function desplegarPregunta(datos) {
    const questionElem = document.getElementById("question");
    const optionsElem = document.getElementById("options");
    const explanationElem = document.getElementById("explanation");

    questionElem.textContent = datos.question;
    optionsElem.innerHTML = "";
    explanationElem.innerHTML = "";

    datos.options.forEach((opcion) => {
        const card = document.createElement("div");
        card.className = "card border-secondary text-dark fw-semibold shadow-sm";
        card.style.cursor = "pointer";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body py-2";
        cardBody.textContent = opcion;
        cardBody.onclick = () => verificarRespuesta(card, opcion, datos.correct_answer, datos.explanation);

        card.appendChild(cardBody);
        optionsElem.appendChild(card);
    });
}


function verificarRespuesta(cardSeleccionada, seleccion, correcta, explicacion) {
    const cards = document.querySelectorAll("#options .card");
    const explanationElem = document.getElementById("explanation");

    cards.forEach((card) => {
        card.style.pointerEvents = "none"; // desactivar clics
        const texto = card.textContent.trim();
        if (texto === correcta.trim()) {
            card.classList.remove("border-secondary");
            card.classList.add("border-success", "bg-success", "text-white");
        }
    });

    if (seleccion.trim() === correcta.trim()) {
        correctas++;
    } else {
        incorrectas++;
        cardSeleccionada.classList.remove("border-secondary");
        cardSeleccionada.classList.add("border-danger", "bg-danger", "text-white");
    }

    guardarContadores();
    document.getElementById("correctas").textContent = correctas;
    document.getElementById("incorrectas").textContent = incorrectas;

    // Mostrar explicación debajo
    explanationElem.innerHTML = `
        <div class="alert alert-info mt-3" role="alert">
        <strong>Explicación:</strong> ${explicacion}
        </div>
    `;

    // Cargar siguiente pregunta automáticamente
    setTimeout(cargarPregunta, 3000);
}


async function cargarPregunta() {
    // Mostrar mensaje de carga
    document.getElementById('question').className = 'text-warning';
    document.getElementById('question').textContent = 'Cargando pregunta de Gemini...';
    document.getElementById('options').innerHTML = '';

    const datosPregunta = await generaPregunta();
    console.log(datosPregunta);

    if (datosPregunta) {
        document.getElementById('question').className = 'text-success';
        console.log("Datos de la pregunta recibidos:", datosPregunta);
        desplegarPregunta(datosPregunta);
    }
}

window.onload = () => {
    console.log("Página cargada y función inicial ejecutada.");
    cargarContadores();
    cargarPregunta();    
};
