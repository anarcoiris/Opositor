import os
import json
import re

def parse_test(content):
    parts = content.split('### Soluciones:')
    body = parts[0]
    sol_line = parts[1].strip() if len(parts) > 1 else ""
    
    soluciones = {}
    tokens = re.split(r'[, ]+', sol_line)
    for t in tokens:
        if '-' in t:
            q, a = t.split('-')
            soluciones[q.strip()] = a.strip().upper()

    questions = []
    blocks = re.split(r'\n\*\*(\d+)\.\s*', body)
    for i in range(1, len(blocks), 2):
        num = blocks[i]
        text_full = blocks[i+1].strip()
        lines = text_full.split('\n')
        question_text = lines[0]
        options = []
        for l in lines[1:]:
            l = l.strip()
            if l.startswith(('A)', 'B)', 'C)', 'D)')):
                options.append(l)
        
        questions.append({
            'id': num,
            'text': question_text,
            'options': options,
            'answer': soluciones.get(num, '')
        })
    return questions

def consolidate():
    base_dir = r'c:\Users\soyko\Documents\Opositor'
    data = {
        'topics': []
    }
    
    # Define topics based on files
    topic_map = {
        "1": {"title": "Constitución y Género", "summary": "resumen_tema_1.md", "test": "test_tema_1.md"},
        "2": {"title": "Organización del Estado", "summary": "resumen_tema_2.md", "test": "test_tema_2.md"},
        "3": {"title": "AGE (Ley 40/2015)", "summary": "resumen_tema_3.md", "test": "test_tema_3.md"},
        "4": {"title": "Gobernanza y Datos", "summary": "resumen_tema_4.md", "test": "test_tema_4.md"},
        "5": {"title": "Procedimiento (Ley 39/2015)", "summary": "resumen_tema_5.md", "test": "test_tema_5.md"},
        "6": {"title": "Contratos (LCSP)", "summary": "resumen_tema_6.md", "test": "test_tema_6.md"},
        "7": {"title": "Personal (TREBEP)", "summary": "resumen_tema_7.md", "test": "test_tema_7.md"},
        "8": {"title": "Presupuestos (LGP)", "summary": "resumen_tema_8.md", "test": "test_tema_8.md"},
        "9": {"title": "Ley de la Ciencia", "summary": "resumen_tema_9.md", "test": "test_tema_9.md"},
        "10-12": {"title": "Gobernanza SECTI e Instituciones", "summary": "resumen_temas_10_12.md", "test": "test_temas_10_12.md"},
        "13-15": {"title": "Europa e I+D", "summary": "resumen_temas_13_15.md", "test": "test_temas_13_15.md"}
    }
    
    for id, info in topic_map.items():
        summary_path = os.path.join(base_dir, 'resumenes', info['summary'])
        test_path = os.path.join(base_dir, 'cuestionarios', info['test'])
        
        summary_content = ""
        if os.path.exists(summary_path):
            with open(summary_path, 'r', encoding='utf-8') as f:
                summary_content = f.read()
        
        test_questions = []
        if os.path.exists(test_path):
            with open(test_path, 'r', encoding='utf-8') as f:
                test_questions = parse_test(f.read())
                
        data['topics'].append({
            'id': id,
            'title': info['title'],
            'content': summary_content,
            'quiz': test_questions
        })
        
    with open(os.path.join(base_dir, 'webapp', 'src', 'data.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Data consolidated successfully.")

if __name__ == "__main__":
    consolidate()
