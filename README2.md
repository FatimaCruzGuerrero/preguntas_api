

# Paso 1: Generar un prompt para indicar una lista de temas

```javascript
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

```


## Generar una lista de temas que puedan seleccionarse de manera aleatoria

```javascript
const temas = [
        "concepto de arreglo y operaciones sobre arreglos",
        "concepto de diccionarios y funciones básicas",
        "operadores lógicos, aritméticos, de comparación, ternario",
        "uso de la consola para debuggear",
        "funciones con parámetros por default"];
```

## Utilizar el prompt combinado con la selección del tema para obtener un prompt con tema aleatorio.

```javascript
    const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];
```

## definit url para llamada

```javascript
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
```

## Completar la función respuestaAPI()

```javascript
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

```

# Cargar pregunta


```javascript

async function cargarPregunta() {
    // Mostrar mensaje de carga
    document.getElementById('question').className = 'text-warning';
    document.getElementById('question').textContent = 'Cargando pregunta de Gemini...';
    document.getElementById('options').innerHTML = '';

    const datosPregunta = await respuestaAPI();
    console.log(datosPregunta);

    if (datosPregunta) {
        document.getElementById('question').className = 'text-success';
        console.log("Datos de la pregunta recibidos:", datosPregunta);
        //desplegarPregunta(datosPregunta);
    }
}

```


# Cargar contadores y la primera pregunta al iniciar
```javascript
window.onload = () => {
    console.log("Página cargada y función inicial ejecutada.");
    //desplegarContadores();
    cargarPregunta();    
};
```

