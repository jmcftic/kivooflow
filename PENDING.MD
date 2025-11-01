Modulo de red

1. Al iniciar sesión o recuepear contraseña, aunque el usuario escriba el email con mayusculas, se debe enviar en minuscula al endpoint. así que has el lower case cuando envias la petición

2. La paginación, Actualmente hay un bug, necesito que el select solo muestre el numero por pagina. Quitamos el Showing y el out of x number, solo quedará el la opción del select. Y las opciones serán fijas empezando por 10,20, 50, esas siempre serán, entonces si solo hay 5 en una pagina, igual se seguiran mostrando el 10 en el select. El usuario intuirá que si hay más paginas por ver, significa que hay más registros. Recuerda esta paginación con los botones



3. Cuando vemos la red de alguien con "ver arbol", no estás mostrando el input de busqueda tambien, entonces pasa que si yo en la vista inicial ingreso "james" y luego le doy ver arbol a un registro, cuando vea su red, el input de busqueda ya no aparece pero del arbol solo muestra aquellos que tengan "james" en su nombre, entonces es como si el filtro siguiera activo. Debes dejar el input y cuando se de click en ver arbol, borrar lo que haya en el filtro y no tenerlo en cuenta en el arbol.

4. el texto "Ver arbol" se cambiará por "Ver red"

4. Cuando estoy en un nivel y doy click en cargar más, cuando no trae más registros, el cargar más sigue ahí. Entonces pareciera un error, pero si detectas que no llegaron registros. Deja un texto como, "No hay más usuarios en este nivel"


5. Cuando estoy en una red de nivel 3 por ejemplo y doy click en el botón del navegador de volver hacia atrás, me lleva a la pestañana de dashboard, en realidad debería llevarme a la red de nivel 2 donde vengo, y si estoy en el nivel 2, me debería llevar al nivel 1. El botón de pagina atrás del navegador debe estar sincronizado con el historial en esta sección de red

6. Cuando vea la red de uno de mis usuarios, el nivel se está mostrando desde la perspectiva del padre, 2 sea si yo juan, veo la red de mi hijo pedro, al ver a su hijo tom, tom es nivel 2 para mi, pero se está mostrando como nivel 1 (porque es nivel 1 para pedro) pero mejor manten el nivel en base al usuario autenticado, sería mostrarle un nivel más al nivel que viene en el json.



7. Si vas a usar subtree , y sabes que el usuario es nivel 3 respecto al autenticado, no le dejes usar la opción ver arbol o ver red, porque te dará error o no traerá nada.

8. No hay endpoint para cerrar sesión, solo destruye la sesión y el token guardado. 

9. Cuando den click en Nivel 1, Nivel 2 y Nivel 3, si el usuario tiene decendientes, manten la funcionalidad del dropdown para desplegar su nivel hijo, ya que no podemos ver sus hijos, claro que el nivel 3 no será necesario mostrarle la flecha para desplegar ya que no puede ver los hijos de un usuario nivel 3. Basicamente solo funcionaría para Nivel 1 y Nivel 2


10.  Cuaando estoy en una lista de nivel 2 y doy en cargar más obtengo {
    "message": "No tienes permiso para ver la red del usuario 46",
    "error": "Forbidden",
    "statusCode": 403
}  