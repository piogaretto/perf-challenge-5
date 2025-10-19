# Prueba de rendimiento dockerizada

## Introducción
Este repositorio orquesta un pipeline de testing de performance sobre la api [httpbin](http://httpbin.org/). Configurado para realizar todo de manera realista, verificando si pasa o no gates de calidad (P95 < 500ms y error % < 1%) y generando los resultados (.jtl e informe HTML).

### Se prueban los siguientes endpoints en este pipeline.
  - /get
  - /post
  - /patch
  - /put
  - /base64

---

### SLAs


- Latencia P95 < 500 ms
- Rate de error	< 1 %
- *Si falla al menos 1 criterio, el pipeline fallará.*
---


## Ejecución local en Windows
- Asegurate de tener jmeter en tu PATH
### Ejecutar el plan de pruebas

`jmeter -n -t "plan-de-pruebas\main.jmx" -p "conf.properties"  -l "results\results.jtl" -f`

- *Esto hace que genere los resultados en results\results.jtl.*

### Generar el reporte HTML (Crea el dashboard a partir del archivo .jtl):


`jmeter -g .\results\results.jtl -o .\results\html-report\`

Ahora abre `results\html-report\index.html`

## Ejecución con Docker Compose
- Asegurate de tener Docker instalado.
- Usa el comando `docker compose run --rm -e THRESHOLD_P95=500 -e THRESHOLD_ERROR_RATE=1.0 jmeter-run`
- Aparecerá en terminal si se cumplen o no los gates de calidad.


## Ejecución automática (mediante GitHub Actions)
También se incluye un workflow de GitHub Actions, que se dispara cada vez que se hace un push o pull request. Este pipeline ejecuta las pruebas de JMeter y valida los resultados según los gates de calidad.