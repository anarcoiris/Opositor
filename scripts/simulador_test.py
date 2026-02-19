import os
import re

def cargar_test(archivo):
    with open(archivo, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Extraer preguntas y soluciones
    partes = contenido.split('### Soluciones:')
    cuerpo = partes[0]
    linea_soluciones = partes[1].strip() if len(partes) > 1 else ""
    
    # Mapear soluciones
    soluciones = {}
    tokens = re.split(r'[, ]+', linea_soluciones)
    for t in tokens:
        if '-' in t:
            q, a = t.split('-')
            soluciones[q.strip()] = a.strip().upper()

    # Parsear preguntas
    # Formato esperado: **1. ¿Pregunta?**\nA) ...\nB) ...
    bloques = re.split(r'\n\*\*(\d+)\.\s*', cuerpo)
    preguntas = []
    
    # El primer elemento está vacío o es el título, los pares son el número, los impares el texto
    for i in range(1, len(bloques), 2):
        num = bloques[i]
        texto_completo = bloques[i+1].strip()
        lineas = texto_completo.split('\n')
        pregunta_texto = lineas[0]
        opciones = [l.strip() for l in lineas[1:] if l.strip()]
        
        preguntas.append({
            'num': num,
            'pregunta': pregunta_texto,
            'opciones': opciones,
            'correcta': soluciones.get(num, '')
        })
    
    return preguntas

def ejecutar_test():
    directorio = 'cuestionarios'
    tests = [f for f in os.listdir(directorio) if f.endswith('.md')]
    
    print("=== SIMULADOR DE EXAMEN OPI ===")
    for i, t in enumerate(tests):
        print(f"{i+1}. {t}")
    
    try:
        opcion = int(input("\nSelecciona un test para practicar: ")) - 1
        archivo_seleccionado = os.path.join(directorio, tests[opcion])
    except:
        print("Opción no válida.")
        return

    preguntas = cargar_test(archivo_seleccionado)
    aciertos = 0
    
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"--- Practicando: {tests[opcion]} ---\n")

    for p in preguntas:
        print(f"Pregunta {p['num']}: {p['pregunta']}")
        for opt in p['opciones']:
            print(opt)
        
        respuesta = input("\nTu respuesta (A, B, C, D): ").strip().upper()
        
        if respuesta == p['correcta']:
            print("✅ ¡CORRECTO!")
            aciertos += 1
        else:
            print(f"❌ INCORRECTO. La respuesta correcta era la {p['correcta']}.")
        
        input("\nPresiona Enter para continuar...")
        os.system('cls' if os.name == 'nt' else 'clear')

    print(f"=== RESULTADO FINAL ===")
    print(f"Has acertado {aciertos} de {len(preguntas)} preguntas.")
    nota = (aciertos / len(preguntas)) * 10
    print(f"Nota: {nota:.2f}/10")
    if nota >= 5:
        print("🎉 ¡APROBADO!")
    else:
        print("📚 Sigue estudiando, ¡tú puedes!")

if __name__ == "__main__":
    # Asegurar que estamos en el directorio correcto
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    os.chdir('..')
    ejecutar_test()
