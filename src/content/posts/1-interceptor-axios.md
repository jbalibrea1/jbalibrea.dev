---
title: "Interceptor con Axios"
pubDate: 2024-06-18
description: "En este post exploraremos cómo modificar una petición HTTP antes de enviarla o al recibir la respuesta utilizando Axios. Utilizaremos interceptores y exploraremos casos prácticos, incluyendo autenticación."
author: "Jorge Balibrea"
image:
  url: "/blog/blog-1-axios-interceptor.png"
  alt: "Interceptor con Axios"
tags: ["axios", "interceptor", "http", "api", "autenticación"]
---

Estoy muy emocionado de compartir con ustedes mi primera entrada de blog. ¡Espero que les guste!.

**Tabla de contenidos:**

- [Interceptor con Axios](#interceptor-con-axios)
- [Caso práctico con autenticación](#caso-práctico-con-autenticación)

# Interceptor con Axios

Vamos a hablar de como establecer un interceptor con [axios](https://axios-http.com/).

Para aquellos que no lo sepan, un interceptor es un patrón de diseño que se utiliza para encapsular la lógica de la petición y la respuesta de una petición HTTP. En el caso de axios, podemos utilizar los interceptores para añadir lógica a las peticiones antes de que se envíen y a las respuestas antes de que se reciban.

Para empezar deberemos instalar axios en nuestro proyecto:

```bash
pnpm install axios
```

Para establecer un interceptor en axios, podemos utilizar el método `interceptors` de la instancia de axios.

Como buena práctica se recomienda crear un archivo api.js donde se configure la instancia de axios y se añadan los interceptores. A continuación procedemos a crear una instancia de axios y añadir los interceptores que necesitemos.

```jsx
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.example.com",
});

api.interceptors.request.use(
  (config) => {
    // Código a ejecutar antes de enviar la petición
    return config;
  },
  (error) => {
    // Código a ejecutar en caso de error
    return Promise.reject(error);
  },
);

export default api;
```

Si la petición se envía correctamente, el primer argumento de la función `use` se ejecutará y se pasará la configuración de la petición como argumento. En caso de error, se ejecutará el segundo argumento de la función `use`.

# Caso práctico con autenticación

Un caso muy habitual y práctico es el uso de interceptores en la autenticación. Podemos añadir un interceptor que añada el token de autorización a la cabecera de la petición antes de que se envíe.

```jsx
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.example.com",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // Si existe un token, añadirlo a la cabecera de la petición
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Código a ejecutar en caso de error
    return Promise.reject(error);
  },
);

export default api;
```

_En este ejemplo, estamos haciendo uso del localStorage para almacenar el token de autorización y añadirlo a la cabecera de la petición. Como buena práctica y más segura, se recomienda almacenar el token en una cookie._

Ya solo nos queda importar la instancia de axios en los servicios o componentes donde necesitemos hacer peticiones a la API.

```jsx
import api from "@utils/api";

const fetchData = async () => {
  try {
    const res = await api.get("https://api.route.com/private_data");
    console.log(res.data);
  } catch (error) {
    console.error(error);
  }
};
```

Con este ejemplo si el token de autorización está presente en el localStorage, se añadirá a la cabecera de la petición y se enviará a la API. Como resultado, la API devolverá los datos "privados" del usuario. En caso de error, se mostrará un mensaje de error en la consola.

Personalmente, me parece muy útil y práctico el uso de interceptores, ya que nos permite añadir lógica a las peticiones y respuestas de forma centralizada, reutilizable y muy limpia.

Espero que les haya gustado este post. ¡Hasta la próxima!
